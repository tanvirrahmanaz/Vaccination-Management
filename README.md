Vaccination Management System — Frontend Integration Guide (React)
0) Base URLs

API base (dev): http://127.0.0.1:8000/api

Schema/Docs:

Swagger UI: /schema/swagger-ui/

OpenAPI JSON/YAML: /schema/

1) Auth Flow (JWT)

POST /auth/token/ → { username, password } ⇒ { access, refresh }

সব প্রাইভেট রিকোয়েস্টে হেডার দিন: Authorization: Bearer <access>

401 হলে POST /auth/token/refresh/ দিয়ে নতুন access নিন।

প্রোফাইল: GET /auth/profile/

প্রোফাইল আপডেট: PUT|PATCH /auth/profile/

পাসওয়ার্ড চেঞ্জ: PUT|PATCH /auth/change-password/

নোট: /auth/users/login/ ও /auth/users/register/ আছে, তবে SPA থেকে সাধারণত SimpleJWT pair (/auth/token/) ব্যবহার করাই সোজা।

2) Endpoints (exact)
Auth & Users

POST /auth/token/
Body

{ "username": "string", "password": "string" }


200

{ "access": "string", "refresh": "string" }


POST /auth/token/refresh/
Body

{ "refresh": "string" }


200

{ "access": "string" }


GET /auth/profile/ → 200

{
  "id": 0,
  "username": "string",
  "email": "user@example.com",
  "role": "PATIENT",
  "nid": "string",
  "medical_history": "string",
  "specialization": "string",
  "contact_details": "string",
  "profile_picture": "string"
}


PUT|PATCH /auth/profile/
Body

{ "nid":"string","medical_history":"string","specialization":"string","contact_details":"string","profile_picture":"string" }


200 → একই শেপ যেমন GET /auth/profile/।

PUT|PATCH /auth/change-password/
Body

{ "old_password":"string","new_password":"string","confirm_new_password":"string" }


200 → {}

GET /auth/users/ → 200

[
  {
    "username": "string",
    "email": "user@example.com",
    "role": "PATIENT",
    "nid": "string",
    "medical_history": "string",
    "specialization": "string",
    "contact_details": "string",
    "profile_picture": "string"
  }
]


POST /auth/users/
Body

{
  "username":"string","email":"user@example.com","password":"string",
  "role":"PATIENT","nid":"string","medical_history":"string",
  "specialization":"string","contact_details":"string","profile_picture":"string"
}


201 → user (without password)

GET|PUT|PATCH|DELETE /auth/users/{id}/ → user CRUD

POST /auth/users/login/ / POST /auth/users/register/ → প্রোজেক্ট কনভেনশন অনুযায়ী (তবে SPA-এ POST /auth/token/ বেস্ট)

Campaigns

GET /campaigns/ → 200

[
  {
    "id":0,"name":"string","description":"string",
    "doses_required":2147483647,"dose_interval_days":2147483647,"created_by":0
  }
]


POST /campaigns/ (Doctor/Admin)

{
  "name":"string","description":"string",
  "doses_required":2147483647,"dose_interval_days":2147483647,"created_by":0
}


201 → created object

GET|PUT|PATCH|DELETE /campaigns/{id}/

Bookings

Enums

Dose1StatusEnum: BOOKED | COMPLETED | PENDING

Dose2StatusEnum: BOOKED | COMPLETED | PENDING

GET /bookings/ → 200

[
  {
    "id":0,
    "dose1_date":"YYYY-MM-DD",
    "dose2_date":"YYYY-MM-DD",
    "dose1_status":"BOOKED",
    "dose2_status":"BOOKED",
    "patient":0,
    "campaign":0
  }
]


POST /bookings/

{
  "dose1_date":"YYYY-MM-DD",
  "dose1_status":"BOOKED",
  "dose2_status":"BOOKED",
  "campaign":0
}


201 → created booking

GET|PUT|PATCH|DELETE /bookings/{id}/

Reviews

GET /reviews/ → 200

[
  {"id":0,"rating":5,"comment":"string","created_at":"ISOdatetime","patient":0,"campaign":0}
]


POST /reviews/

{"rating":5,"comment":"string","campaign":0}


GET|PUT|PATCH|DELETE /reviews/{id}/

Schema

GET /schema/ → OpenAPI (json/yaml via ?format=)

3) Schemas (from Swagger)
// Enums
type RoleEnum = "PATIENT" | "DOCTOR";
type DoseStatus = "BOOKED" | "COMPLETED" | "PENDING";

// Auth
interface TokenObtainPair { username: string; password: string; }
interface TokenPair { access: string; refresh: string; }
interface TokenRefresh { refresh: string; }
interface UserProfile {
  id: number; username: string; email: string; role: RoleEnum;
  nid?: string; medical_history?: string; specialization?: string;
  contact_details?: string; profile_picture?: string;
}
interface ChangePassword { old_password: string; new_password: string; confirm_new_password: string; }

// Campaigns
interface VaccineCampaign {
  id: number; name: string; description?: string;
  doses_required?: number; dose_interval_days: number; created_by: number;
}

// Bookings
interface Booking {
  id: number;
  dose1_date: string;   // YYYY-MM-DD
  dose2_date?: string;  // optional
  dose1_status?: DoseStatus;
  dose2_status?: DoseStatus;
  patient: number;      // FK User
  campaign: number;     // FK Campaign
}

// Reviews
interface Review {
  id: number; rating: number; comment?: string;
  created_at: string; patient: number; campaign: number;
}

4) React App — File Structure (suggested)
vms-client/
├── .env                      # VITE_API_BASE=http://127.0.0.1:8000
├── src/
│   ├── api/
│   │   ├── client.js         # axios base + JWT refresh
│   │   ├── auth.js
│   │   ├── campaigns.js
│   │   ├── bookings.js
│   │   └── reviews.js
│   ├── store/
│   │   └── authStore.js      # zustand
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Campaigns.jsx
│   │   ├── Bookings.jsx
│   │   └── Reviews.jsx
│   ├── components/
│   │   └── ProtectedRoute.jsx
│   ├── App.jsx
│   └── main.jsx
└── index.html


.env

VITE_API_BASE=http://127.0.0.1:8000

5) Axios Client + JWT Refresh

src/api/client.js

import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export const api = axios.create({ baseURL: `${API_BASE}/api` });

const TOKENS = "vms_tokens";
export const saveTokens = (t) => localStorage.setItem(TOKENS, JSON.stringify(t));
export const getTokens  = () => JSON.parse(localStorage.getItem(TOKENS) || "{}");
export const clearTokens= () => localStorage.removeItem(TOKENS);

// attach access
api.interceptors.request.use((cfg)=>{
  const { access } = getTokens();
  if (access) cfg.headers.Authorization = `Bearer ${access}`;
  return cfg;
});

// refresh on 401
let refreshing = false, waiters = [];
api.interceptors.response.use(r=>r, async err=>{
  const orig = err.config;
  if (err.response?.status === 401 && !orig._retry) {
    orig._retry = true;
    if (refreshing) await new Promise(r=>waiters.push(r));
    else {
      refreshing = true;
      try {
        const { refresh } = getTokens();
        if (!refresh) throw new Error("No refresh");
        const res = await axios.post(`${API_BASE}/api/auth/token/refresh/`, { refresh });
        saveTokens({ access: res.data.access, refresh });
        waiters.forEach(r=>r()); waiters=[];
      } catch (e) {
        clearTokens(); refreshing=false; waiters.forEach(r=>r()); waiters=[];
        return Promise.reject(err);
      }
      refreshing = false;
    }
    const { access } = getTokens();
    orig.headers.Authorization = `Bearer ${access}`;
    return api(orig);
  }
  return Promise.reject(err);
});

6) Services (API calls)

src/api/auth.js

import { api, saveTokens, clearTokens } from "./client";

export async function login({ username, password }) {
  const r = await api.post("/auth/token/", { username, password });
  saveTokens({ access: r.data.access, refresh: r.data.refresh });
  return r.data;
}
export const getProfile     = () => api.get("/auth/profile/").then(r=>r.data);
export const updateProfile  = (p) => api.patch("/auth/profile/", p).then(r=>r.data);
export const changePassword = (p) => api.put("/auth/change-password/", p).then(r=>r.data);
export const logout         = () => clearTokens();


src/api/campaigns.js

import { api } from "./client";
export const listCampaigns  = (p={})   => api.get("/campaigns/", { params:p }).then(r=>r.data);
export const getCampaign    = (id)     => api.get(`/campaigns/${id}/`).then(r=>r.data);
export const createCampaign = (payload)=> api.post("/campaigns/", payload).then(r=>r.data);
export const updateCampaign = (id,p)   => api.patch(`/campaigns/${id}/`, p).then(r=>r.data);
export const deleteCampaign = (id)     => api.delete(`/campaigns/${id}/`).then(r=>r.data);


src/api/bookings.js

import { api } from "./client";
export const listBookings   = (p={})   => api.get("/bookings/", { params:p }).then(r=>r.data);
export const getBooking     = (id)     => api.get(`/bookings/${id}/`).then(r=>r.data);
export const createBooking  = (payload)=> api.post("/bookings/", payload).then(r=>r.data);
export const updateBooking  = (id,p)   => api.patch(`/bookings/${id}/`, p).then(r=>r.data);
export const deleteBooking  = (id)     => api.delete(`/bookings/${id}/`).then(r=>r.data);


src/api/reviews.js

import { api } from "./client";
export const listReviews  = (p={})   => api.get("/reviews/", { params:p }).then(r=>r.data);
export const createReview = (payload)=> api.post("/reviews/", payload).then(r=>r.data);
export const updateReview = (id,p)   => api.patch(`/reviews/${id}/`, p).then(r=>r.data);
export const deleteReview = (id)     => api.delete(`/reviews/${id}/`).then(r=>r.data);

7) Routing & Pages

src/components/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
const isAuthed = () => !!localStorage.getItem("vms_tokens");
export default function ProtectedRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}


src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import Bookings from "./pages/Bookings";
import Reviews from "./pages/Reviews";

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path="/campaigns" element={<ProtectedRoute><Campaigns/></ProtectedRoute>}/>
        <Route path="/bookings" element={<ProtectedRoute><Bookings/></ProtectedRoute>}/>
        <Route path="/reviews" element={<ProtectedRoute><Reviews/></ProtectedRoute>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </BrowserRouter>
  );
}


src/pages/Login.jsx

import { useState } from "react";
import { login } from "../api/auth";

export default function Login(){
  const [username,setU]=useState(""); const [password,setP]=useState(""); const [err,setErr]=useState("");
  async function onSubmit(e){e.preventDefault();
    try{ await login({username,password}); window.location.replace("/"); }
    catch(e){ setErr(e.response?.data?.detail || "Login failed"); }
  }
  return (
    <form onSubmit={onSubmit} style={{maxWidth:360,margin:"80px auto",display:"grid",gap:12}}>
      <h2>Login</h2>
      <input value={username} onChange={e=>setU(e.target.value)} placeholder="username"/>
      <input type="password" value={password} onChange={e=>setP(e.target.value)} placeholder="password"/>
      {err && <div style={{color:"crimson"}}>{err}</div>}
      <button>Sign in</button>
    </form>
  );
}


src/pages/Campaigns.jsx

import { useEffect, useState } from "react";
import { listCampaigns, createCampaign } from "../api/campaigns";

export default function Campaigns(){
  const [rows,setRows]=useState([]), [name,setName]=useState(""), [description,setDescription]=useState("");
  useEffect(()=>{ listCampaigns().then(setRows).catch(()=>{}); },[]);
  async function onCreate(e){ e.preventDefault();
    await createCampaign({ name, description, dose_interval_days: 21, doses_required: 2, created_by: 1 });
    setName(""); setDescription(""); setRows(await listCampaigns());
  }
  return (
    <div style={{maxWidth:800,margin:"20px auto"}}>
      <h2>Campaigns</h2>
      <ul>{rows.map(r=> <li key={r.id}>{r.name} — interval {r.dose_interval_days} days</li>)}</ul>
      <form onSubmit={onCreate} style={{display:"grid",gap:8,marginTop:12}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="name"/>
        <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="description"/>
        <button>Create</button>
      </form>
    </div>
  );
}


src/pages/Bookings.jsx

import { useEffect, useState } from "react";
import { listBookings, createBooking } from "../api/bookings";

export default function Bookings(){
  const [rows,setRows]=useState([]), [campaign,setCampaign]=useState(""), [dose1Date,setDose1]=useState("");
  useEffect(()=>{ listBookings().then(setRows).catch(()=>{}); },[]);
  async function onCreate(e){ e.preventDefault();
    await createBooking({ campaign: Number(campaign), dose1_date: dose1Date, dose1_status: "BOOKED", dose2_status: "PENDING" });
    setCampaign(""); setDose1(""); setRows(await listBookings());
  }
  return (
    <div style={{maxWidth:800,margin:"20px auto"}}>
      <h2>Bookings</h2>
      <ul>{rows.map(r=> <li key={r.id}>#{r.id} — campaign {r.campaign} — dose1 {r.dose1_date} ({r.dose1_status})</li>)}</ul>
      <form onSubmit={onCreate} style={{display:"grid",gap:8,marginTop:12}}>
        <input value={campaign} onChange={e=>setCampaign(e.target.value)} placeholder="campaign id"/>
        <input type="date" value={dose1Date} onChange={e=>setDose1(e.target.value)} />
        <button>Create</button>
      </form>
    </div>
  );
}


src/pages/Reviews.jsx

import { useEffect, useState } from "react";
import { listReviews, createReview } from "../api/reviews";

export default function Reviews(){
  const [rows,setRows]=useState([]), [rating,setRating]=useState(5), [campaign,setCampaign]=useState(""), [comment,setComment]=useState("");
  useEffect(()=>{ listReviews().then(setRows).catch(()=>{}); },[]);
  async function onCreate(e){ e.preventDefault();
    await createReview({ rating: Number(rating), comment, campaign: Number(campaign) });
    setRating(5); setCampaign(""); setComment(""); setRows(await listReviews());
  }
  return (
    <div style={{maxWidth:800,margin:"20px auto"}}>
      <h2>Reviews</h2>
      <ul>{rows.map(r=> <li key={r.id}>#{r.id} — {r.rating}★ — {r.comment}</li>)}</ul>
      <form onSubmit={onCreate} style={{display:"grid",gap:8,marginTop:12}}>
        <input type="number" min="1" max="5" value={rating} onChange={e=>setRating(e.target.value)} />
        <input value={campaign} onChange={e=>setCampaign(e.target.value)} placeholder="campaign id"/>
        <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="comment"/>
        <button>Create</button>
      </form>
    </div>
  );
}

8) Curl Cheatsheet
# Login → tokens
curl -X POST http://127.0.0.1:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret"}'

# Profile
curl http://127.0.0.1:8000/api/auth/profile/ \
  -H "Authorization: Bearer <ACCESS>"

# Campaigns list
curl http://127.0.0.1:8000/api/campaigns/ \
  -H "Authorization: Bearer <ACCESS>"

# Create booking
curl -X POST http://127.0.0.1:8000/api/bookings/ \
  -H "Authorization: Bearer <ACCESS>" -H "Content-Type: application/json" \
  -d '{"dose1_date":"2025-10-02","dose1_status":"BOOKED","dose2_status":"PENDING","campaign":1}'

9) Database (quick)

Dev: SQLite → db.sqlite3 (migrations পরে রেডি)

Prod: PostgreSQL → .env এ POSTGRES_URL দিন

টেবিলগুলো Django models থেকে জেনারেটেড: User/UserProfile, VaccineCampaign, Booking, Review (+ যদি পেমেন্ট থাকে, Payment/Refund)

10) CORS & Security (Frontend থেকে কলের জন্য)

django-cors-headers সেটআপ করুন; CORS_ALLOWED_ORIGINS এ http://localhost:5173 ও প্রোড ফ্রন্ট ডোমেইন দিন।

JWT টোকেন লোকালস্টোরেজে রাখলে XSS-সেফ কোডিং করতে হবে; বিকল্প হিসেবে HttpOnly কুকি + CSRF সেটআপ লাগবে।



Vaccination Management System
A comprehensive Django-based web application for managing vaccination campaigns, user registrations, bookings, premium services, and integrated payment processing. This system supports both regular vaccination bookings and premium services with SSL Commerz payment gateway integration.

🚀 Features
Core Features
User Management: Role-based authentication (Patients & Doctors) with JWT-based authentication
User Profiles: Comprehensive profile management with medical history and contact details
Vaccination Campaigns: Create and manage vaccination campaigns with multi-dose scheduling
Booking System: Advanced booking system with regular and premium service options
Review System: Campaign and service review system
Payment Integration: SSL Commerz payment gateway for premium services
Premium Services
Priority Booking: Skip queues with priority scheduling
Home Vaccination: Doorstep vaccination services
Express Services: Fast-track vaccination processing
Premium Vaccine Packages: Enhanced vaccine options
VIP Medical Consultations: Personalized medical consultations
Payment Features
SSL Commerz payment gateway integration
Multiple payment methods (Card, Mobile Banking, Net Banking)
Payment tracking and transaction management
Refund processing
Secure payment processing with comprehensive logging
🛠️ Tech Stack
Backend: Python 3.10+, Django 5.2.5
API: Django REST Framework
Authentication: JWT (SimpleJWT)
Documentation: drf-spectacular (OpenAPI 3.0/Swagger)
Database: SQLite (development), PostgreSQL (production)
Payment Gateway: SSL Commerz
File Handling: Pillow for image processing
Static Files: WhiteNoise
Environment: python-dotenv for configuration
📁 Project Structure
Vaccination Management System/
├── Vaccination_Management_System/   # Main Django project settings
│   ├── settings.py                 # Project configuration
│   ├── urls.py                     # Main URL routing
│   └── wsgi.py                     # WSGI configuration
├── api/                            # Core vaccination management APIs
│   ├── models.py                   # Campaign, Booking, PremiumService models
│   ├── views.py                    # API views
│   ├── serializers.py              # Data serialization
│   └── management/commands/        # Custom management commands
├── users/                          # User management and authentication
│   ├── models.py                   # Custom User model with roles
│   ├── views.py                    # Authentication views
│   └── serializers.py              # User serialization
├── payments/                       # Payment processing system
│   ├── models.py                   # Payment and refund models
│   ├── services.py                 # SSL Commerz integration
│   ├── views.py                    # Payment API endpoints
│   └── management/commands/        # Payment-related commands
├── static/                         # Static files
├── staticfiles/                    # Collected static files
├── requirements.txt                # Python dependencies
├── manage.py                       # Django management script
├── db.sqlite3                      # SQLite database (development)
├── PAYMENT_INTEGRATION.md          # Payment integration documentation
└── README.md                       # This file
🚀 Setup Instructions
1. Clone the Repository
git clone <repository-url>
cd "Vaccination Management System"
2. Create Virtual Environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
3. Install Dependencies
pip install -r requirements.txt
4. Environment Configuration
Create a .env file in the project root:

# Django Settings
SECRET_KEY="your-secret-key-here"
DEBUG="True"
ALLOWED_HOSTS="localhost,127.0.0.1"

# Database Settings (optional)
USE_SQLITE="True"
# POSTGRES_URL="postgresql://user:password@localhost:5432/vaccination_db"

# SSL Commerz Payment Gateway
SSLCOMMERZ_STORE_ID="your_store_id"
SSLCOMMERZ_STORE_PASSWORD="your_store_password"
SSLCOMMERZ_IS_SANDBOX="True"  # Set to False for production

# Frontend URL
FRONTEND_URL="http://localhost:3000"
5. Database Setup
# Apply database migrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser

# Populate premium services (optional)
python manage.py migrate_premium_services
6. Run Development Server
python manage.py runserver
7. Access the Application
API Root: http://127.0.0.1:8000/api/
Admin Panel: http://127.0.0.1:8000/admin/
API Documentation: http://127.0.0.1:8000/api/schema/swagger-ui/
OpenAPI Schema: http://127.0.0.1:8000/api/schema/
📡 API Endpoints
Authentication
POST /api/auth/users/register/ - User registration
POST /api/auth/users/login/ - User login
GET /api/auth/profile/ - Get user profile
PUT /api/auth/profile/ - Update user profile
POST /api/auth/change-password/ - Change password
POST /api/auth/token/ - Obtain JWT token
POST /api/auth/token/refresh/ - Refresh JWT token
Vaccination Management
GET /api/campaigns/ - List vaccination campaigns
POST /api/campaigns/ - Create new campaign (Admin/Doctor)
GET /api/campaigns/{id}/ - Get campaign details
GET /api/bookings/ - List user bookings
POST /api/bookings/ - Create new booking
GET /api/bookings/{id}/ - Get booking details
PUT /api/bookings/{id}/ - Update booking
Premium Services & Payments
GET /api/payments/services/ - List premium services
GET /api/payments/services/?service_type=PRIORITY_BOOKING - Filter services
POST /api/payments/bookings/ - Create premium booking
POST /api/payments/initiate/ - Initiate payment
POST /api/payments/success/ - Payment success callback
POST /api/payments/fail/ - Payment failure callback
POST /api/payments/cancel/ - Payment cancellation callback
Reviews
GET /api/reviews/ - List reviews
POST /api/reviews/ - Create review
GET /api/reviews/{id}/ - Get review details
💳 Payment Integration
The system integrates with SSL Commerz payment gateway for processing premium service payments. See PAYMENT_INTEGRATION.md for detailed setup instructions.

Supported Payment Methods
Credit/Debit Cards
Mobile Banking (bKash, Rocket, etc.)
Net Banking
SSL Commerz gateway
🔧 Configuration
Database Configuration
Development: SQLite (default)
Production: PostgreSQL (recommended)
Environment Variables
Variable	Description	Default
SECRET_KEY	Django secret key	Required
DEBUG	Debug mode	False
ALLOWED_HOSTS	Allowed hosts	*
USE_SQLITE	Use SQLite database	True
SSLCOMMERZ_STORE_ID	SSL Commerz store ID	Required for payments
SSLCOMMERZ_STORE_PASSWORD	SSL Commerz password	Required for payments
SSLCOMMERZ_IS_SANDBOX	Use sandbox mode	True
FRONTEND_URL	Frontend application URL	http://localhost:3000
🧪 Testing
Run the test suite:

# Run all tests
python manage.py test

# Run specific app tests
python manage.py test api
python manage.py test users
python manage.py test payments

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
📝 Development Notes
API Documentation: Automatically generated using drf-spectacular
Authentication: JWT-based authentication with refresh tokens
File Uploads: Configured for profile pictures and documents
Logging: Comprehensive logging for payment transactions
Security: CSRF protection and secure payment processing
🚀 Deployment
Production Checklist
Set DEBUG=False in production
Configure proper database (PostgreSQL recommended)
Set up SSL certificates for HTTPS
Configure static file serving
Set proper ALLOWED_HOSTS
Use production SSL Commerz credentials
Set up proper logging and monitoring
Docker Deployment (Optional)
# Example Dockerfile structure
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "Vaccination_Management_System.wsgi:application"]
🤝 Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
Development Guidelines
Follow PEP 8 style guidelines
Write comprehensive tests for new features
Update documentation for API changes
Ensure all tests pass before submitting PR









api




/schema/ Authorize api PUT /api/auth/change-password/ PATCH /api/auth/change-password/ Parameters Try it out No parameters Request body application/json Example Value Schema { "old_password": "string", "new_password": "string", "confirm_new_password": "string" } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema {} No links GET /api/auth/profile/ Parameters Try it out No parameters Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "username": "string", "email": "user@example.com", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } No links PUT /api/auth/profile/ Parameters Try it out No parameters Request body application/json Example Value Schema { "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "username": "string", "email": "user@example.com", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } No links PATCH /api/auth/profile/ Parameters Try it out No parameters Request body application/json Example Value Schema { "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "username": "string", "email": "user@example.com", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } No links POST /api/auth/token/ Takes a set of user credentials and returns an access and refresh JSON web token pair to prove the authentication of those credentials. Parameters Try it out No parameters Request body application/json Example Value Schema { "username": "string", "password": "string" } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "access": "string", "refresh": "string" } No links POST /api/auth/token/refresh/ Takes a refresh type JSON web token and returns an access type JSON web token if the refresh token is valid. Parameters Try it out No parameters Request body application/json Example Value Schema { "refresh": "string" } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "access": "string" } No links GET /api/auth/users/ Parameters Try it out No parameters Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema [ { "username": ".ub6Q@JIa0nU0FmFzo@DSp8Satj1H8CFsR1wJ1nKmovaw5baIj9QoHnY.gP", "email": "user@example.com", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } ] No links POST /api/auth/users/ Parameters Try it out No parameters Request body application/json Example Value Schema { "username": "9m_84ND3pFXFY.i70KO4SQ8tJKIaFS8SReWjF5_nk1T5Bps+riFQBvsbx@1UmLbZ_LuJ1FAAjyLFs@GkKz7uwETwzfctbj", "email": "user@example.com", "password": "string", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } Responses Code Description Links 201 Media type application/json Controls Accept header. Example Value Schema { "username": "2-Fic3yPogrVsMDl@bPzc+j7wgb4ukq.I0FBAI18cv+Lgii.iIqU23Yy_LUlw@jJKaRGZ96-b4TLKh1YFolBdjEAz", "email": "user@example.com", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } No links GET /api/auth/users/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this user. id Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "username": "RWkRC5@h-BLD7UUZLSZGYXKEIayiqEqPaMom", "email": "user@example.com", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } No links PUT /api/auth/users/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this user. id Request body application/json Example Value Schema { "username": "d1Y45EoJbxte@eywOFNX5F16LfvQhvef_7hn24.B+mmceIMN0esHcz-VVJDLsevP0jMxFSA6ta+qdFmbatnSc2wMlXKR", "email": "user@example.com", "password": "string", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "username": "B0v8EYSt53ceFhmVNAC7XB5Xi6kv8mwA7S2LMnn@bF8nnymaGp9ZLupJsGEZ6fQpXRFzfUdKvlQL", "email": "user@example.com", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } No links PATCH /api/auth/users/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this user. id Request body application/json Example Value Schema { "username": "tH-fWJNoyx47tcq07_F7ue0Or5yB3Xn6eFN9kkJ1.@diT6QBA2BfUdkNWVG5QRa2RA", "email": "user@example.com", "password": "string", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "username": "xrGM028jKkb8DEF7.ur_C2APVQoHJ-vt1u", "email": "user@example.com", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } No links DELETE /api/auth/users/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this user. id Responses Code Description Links 204 No response body No links POST /api/auth/users/login/ Parameters Try it out No parameters Request body application/json Example Value Schema { "username": "LBeVdGPR+-TBK+RvfuWMq.B5UbLpmxS0PpMWjRUI0F_.gvthVEB.5ejLET_cp5NWdF8xOr+VUhmAkNQ68q", "email": "user@example.com", "password": "string", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "username": "nRRtoK6g2TJNRL+6SpPdXyyJLoPbF71_zZSrf5_EyRj_AjL_c", "email": "user@example.com", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } No links POST /api/auth/users/register/ Parameters Try it out No parameters Request body application/json Example Value Schema { "username": "8TZ5gKeBr", "email": "user@example.com", "password": "string", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "username": "FupGx4X2sC6bBEc4zqwxtSy", "email": "user@example.com", "role": "PATIENT", "nid": "string", "medical_history": "string", "specialization": "string", "contact_details": "string", "profile_picture": "string" } No links GET /api/bookings/ Parameters Try it out No parameters Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema [ { "id": 0, "dose1_date": "2025-10-02", "dose2_date": "2025-10-02", "dose1_status": "BOOKED", "dose2_status": "BOOKED", "patient": 0, "campaign": 0 } ] No links POST /api/bookings/ Parameters Try it out No parameters Request body application/json Example Value Schema { "dose1_date": "2025-10-02", "dose1_status": "BOOKED", "dose2_status": "BOOKED", "campaign": 0 } Responses Code Description Links 201 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "dose1_date": "2025-10-02", "dose2_date": "2025-10-02", "dose1_status": "BOOKED", "dose2_status": "BOOKED", "patient": 0, "campaign": 0 } No links GET /api/bookings/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this booking. id Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "dose1_date": "2025-10-02", "dose2_date": "2025-10-02", "dose1_status": "BOOKED", "dose2_status": "BOOKED", "patient": 0, "campaign": 0 } No links PUT /api/bookings/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this booking. id Request body application/json Example Value Schema { "dose1_date": "2025-10-02", "dose1_status": "BOOKED", "dose2_status": "BOOKED", "campaign": 0 } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "dose1_date": "2025-10-02", "dose2_date": "2025-10-02", "dose1_status": "BOOKED", "dose2_status": "BOOKED", "patient": 0, "campaign": 0 } No links PATCH /api/bookings/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this booking. id Request body application/json Example Value Schema { "dose1_date": "2025-10-02", "dose1_status": "BOOKED", "dose2_status": "BOOKED", "campaign": 0 } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "dose1_date": "2025-10-02", "dose2_date": "2025-10-02", "dose1_status": "BOOKED", "dose2_status": "BOOKED", "patient": 0, "campaign": 0 } No links DELETE /api/bookings/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this booking. id Responses Code Description Links 204 No response body No links GET /api/campaigns/ Parameters Try it out No parameters Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema [ { "id": 0, "name": "string", "description": "string", "doses_required": 2147483647, "dose_interval_days": 2147483647, "created_by": 0 } ] No links POST /api/campaigns/ Parameters Try it out No parameters Request body application/json Example Value Schema { "name": "string", "description": "string", "doses_required": 2147483647, "dose_interval_days": 2147483647, "created_by": 0 } Responses Code Description Links 201 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "name": "string", "description": "string", "doses_required": 2147483647, "dose_interval_days": 2147483647, "created_by": 0 } No links GET /api/campaigns/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this vaccine campaign. id Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "name": "string", "description": "string", "doses_required": 2147483647, "dose_interval_days": 2147483647, "created_by": 0 } No links PUT /api/campaigns/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this vaccine campaign. id Request body application/json Example Value Schema { "name": "string", "description": "string", "doses_required": 2147483647, "dose_interval_days": 2147483647, "created_by": 0 } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "name": "string", "description": "string", "doses_required": 2147483647, "dose_interval_days": 2147483647, "created_by": 0 } No links PATCH /api/campaigns/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this vaccine campaign. id Request body application/json Example Value Schema { "name": "string", "description": "string", "doses_required": 2147483647, "dose_interval_days": 2147483647, "created_by": 0 } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "name": "string", "description": "string", "doses_required": 2147483647, "dose_interval_days": 2147483647, "created_by": 0 } No links DELETE /api/campaigns/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this vaccine campaign. id Responses Code Description Links 204 No response body No links GET /api/reviews/ Parameters Try it out No parameters Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema [ { "id": 0, "rating": 2147483647, "comment": "string", "created_at": "2025-10-02T06:49:18.795Z", "patient": 0, "campaign": 0 } ] No links POST /api/reviews/ Parameters Try it out No parameters Request body application/json Example Value Schema { "rating": 2147483647, "comment": "string", "campaign": 0 } Responses Code Description Links 201 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "rating": 2147483647, "comment": "string", "created_at": "2025-10-02T06:49:18.797Z", "patient": 0, "campaign": 0 } No links GET /api/reviews/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this review. id Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "rating": 2147483647, "comment": "string", "created_at": "2025-10-02T06:49:18.798Z", "patient": 0, "campaign": 0 } No links PUT /api/reviews/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this review. id Request body application/json Example Value Schema { "rating": 2147483647, "comment": "string", "campaign": 0 } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "rating": 2147483647, "comment": "string", "created_at": "2025-10-02T06:49:18.799Z", "patient": 0, "campaign": 0 } No links PATCH /api/reviews/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this review. id Request body application/json Example Value Schema { "rating": 2147483647, "comment": "string", "campaign": 0 } Responses Code Description Links 200 Media type application/json Controls Accept header. Example Value Schema { "id": 0, "rating": 2147483647, "comment": "string", "created_at": "2025-10-02T06:49:18.801Z", "patient": 0, "campaign": 0 } No links DELETE /api/reviews/{id}/ Parameters Try it out Name Description id * integer (path) A unique integer value identifying this review. id Responses Code Description Links 204 No response body No links schema GET /schema/ OpenApi3 schema for this API. Format can be selected via content negotiation. YAML: application/vnd.oai.openapi JSON: application/vnd.oai.openapi+json Parameters Try it out Name Description format string (query) Available values : json, yaml -- lang string (query) Available values : af, ar, ar-dz, ast, az, be, bg, bn, br, bs, ca, ckb, cs, cy, da, de, dsb, el, en, en-au, en-gb, eo, es, es-ar, es-co, es-mx, es-ni, es-ve, et, eu, fa, fi, fr, fy, ga, gd, gl, he, hi, hr, hsb, hu, hy, ia, id, ig, io, is, it, ja, ka, kab, kk, km, kn, ko, ky, lb, lt, lv, mk, ml, mn, mr, ms, my, nb, ne, nl, nn, os, pa, pl, pt, pt-br, ro, ru, sk, sl, sq, sr, sr-latn, sv, sw, ta, te, tg, th, tk, tr, tt, udm, ug, uk, ur, uz, vi, zh-hans, zh-hant -- Responses Code Description Links 200 Media type application/vnd.oai.openapi Controls Accept header. Example Value Schema { "additionalProp1": "string", "additionalProp2": "string", "additionalProp3": "string" } No links Schemas Booking{ id* [...] dose1_date* [...] dose2_date* [...] dose1_status Dose1StatusEnum[...] dose2_status Dose2StatusEnum[...] patient* [...] campaign* [...] } ChangePassword{ old_password* [...] new_password* [...] confirm_new_password* [...] } Dose1StatusEnumstring BOOKED - Booked COMPLETED - Completed PENDING - Pending Enum: Array [ 3 ] Dose2StatusEnumstring BOOKED - Booked COMPLETED - Completed PENDING - Pending Enum: Array [ 3 ] PatchedBooking{ id [...] dose1_date [...] dose2_date [...] dose1_status Dose1StatusEnum[...] dose2_status Dose2StatusEnum[...] patient [...] campaign [...] } PatchedChangePassword{ old_password [...] new_password [...] confirm_new_password [...] } PatchedReview{ id [...] rating [...] comment [...] created_at [...] patient [...] campaign [...] } PatchedUserProfile{ id [...] username [...] email [...] role [...] nid [...] medical_history [...] specialization [...] contact_details [...] profile_picture [...] } PatchedUserRegistration{ username [...] email [...] password [...] role RoleEnum[...] nid [...] medical_history [...] specialization [...] contact_details [...] profile_picture [...] } PatchedVaccineCampaign{ id [...] name [...] description [...] doses_required [...] dose_interval_days [...] created_by [...] } Review{ id* [...] rating* [...] comment [...] created_at* [...] patient* [...] campaign* [...] } RoleEnumstring PATIENT - Patient DOCTOR - Doctor Enum: Array [ 2 ] TokenObtainPair{ username* [...] password* [...] access* [...] refresh* [...] } TokenRefresh{ access* [...] refresh* [...] } UserProfile{ id* [...] username* [...] email* [...] role* [...] nid [...] medical_history [...] specialization [...] contact_details [...] profile_picture [...] } UserRegistration{ username* [...] email* [...] password* [...] role* RoleEnum[...] nid [...] medical_history [...] specialization [...] contact_details [...] profile_picture [...] } VaccineCampaign{ id* [...] name* [...] description* [...] doses_required [...] dose_interval_days* [...] created_by* [...] }