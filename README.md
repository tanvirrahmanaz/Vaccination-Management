# Vaccination Management Dashboard (React)

A Vite + React single-page application for administering vaccination campaigns, patient bookings, and feedback. The UI is optimized for authenticated operators and consumes the Vaccination Management System REST API.

## Features
- Secure login / registration flow with JWT session handling (Simple JWT compatible)
- Dashboard insights with dose status breakdowns and pending booking highlights
- Campaign CRUD with dose interval controls
- Patient booking creation and inline status updates for both doses
- Review feed with campaign + patient context
- Tailwind CSS driven layout and responsive design

## Tech Stack
- **React 19** with **React Router** for client-side routing
- **Vite 7** toolchain
- **Tailwind CSS 3** for styling
- **Zustand** for lightweight global state (auth store)
- **Axios** API client with automatic token refresh

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Environment variables** – copy `.env.example` (or edit `.env`) and set the values listed below.
3. **Run the dev server**
   ```bash
   npm run dev
   ```
4. Navigate to the printed URL (default `http://127.0.0.1:5173`).

## Environment Variables
| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE` | Backend base URL (without trailing `/api`). | `https://vaccination-management-system-two.vercel.app` |
| `VITE_REQUIRE_AUTH` | `true` to enforce login flow, `false` to skip auth while developing. | `false` |
| `VITE_DEV_SERVER_HOST` | Host binding for `vite dev`. | `127.0.0.1` |
| `VITE_DEV_SERVER_PORT` | Port for `vite dev`. | `5173` |
| `VITE_PREVIEW_PORT` | Port for `vite preview`. | `4173` |

## Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server with hot reload. |
| `npm run build` | Create production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint across the project. |

## Project Structure (key folders)
```
src/
  api/          # Axios clients for auth, campaigns, bookings, reviews
  components/   # Layout + route guards
  pages/        # Dashboard, Campaigns, Bookings, Reviews, Auth screens
  store/        # Zustand auth store
  constants/    # Shared enums and labels
  App.jsx       # Router definition
  index.css     # Tailwind entry point
```

## Authentication Flow
1. `POST /auth/token/` with `{ username, password }` to receive `{ access, refresh }`.
2. Include `Authorization: Bearer <access>` on protected requests.
3. On `401`, the client automatically calls `POST /auth/token/refresh/` using the stored `refresh` token.
4. User profile endpoints:
   - `GET /auth/profile/`
   - `PATCH /auth/profile/`
   - `PUT /auth/change-password/`

Zustand’s `authStore` persists tokens in `localStorage` (`vms_tokens`) and refreshes them through Axios interceptors.

## API Quick Reference
- **Campaigns**
  - `GET /campaigns/`
  - `POST /campaigns/`
  - `PATCH /campaigns/{id}/`
  - `DELETE /campaigns/{id}/`
- **Bookings**
  - `GET /bookings/`
  - `POST /bookings/`
  - `PATCH /bookings/{id}/`
  - Fields include `dose1_date`, `dose2_date`, `dose1_status`, `dose2_status`, `patient`, `campaign`
  - Status enums: `BOOKED`, `COMPLETED`, `PENDING`
- **Reviews**
  - `GET /reviews/`
  - `POST /reviews/`
  - Payload: `campaign`, `rating (1-5)`, `comment`
- **Users**
  - `POST /auth/users/register/`
  - `GET /auth/users/` (used for resolving patient names in UI)

For the full schema, open `/schema/swagger-ui/` on the backend service.

## Styling Notes
Tailwind is configured via `tailwind.config.js` with content scanning across `index.html` and all `src/**/*.{js,jsx,ts,tsx}` files. Custom classnames (e.g., `.card`, `.chip`) are defined in `src/App.css` using `@apply` to bundle Tailwind utilities.

## Development Tips
- Toggle `VITE_REQUIRE_AUTH` to `true` before shipping so the dashboard enforces login.
- When adding new API calls, place shared Axios logic in `src/api/client.js` to inherit the refresh handling.
- Keep enums in `src/constants/enums.js` synced with backend values to avoid mismatched labels.

---
Need backend setup guidance or additional endpoints documented? Open an issue or add notes here so future contributors can extend the guide.
