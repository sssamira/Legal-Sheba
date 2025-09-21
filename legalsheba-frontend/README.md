# Legal-Sheba Frontend (React + Vite + Tailwind)

This frontend implements the Legal-Sheba portal in React (JSX only) with Tailwind CSS and integrates with a Spring Boot backend for auth, lawyer profiles, and appointments.

## Quick start

1. Install dependencies

```powershell
npm install
```

2. Configure backend base URL

Create a file named `.env.local` at the project root with:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Adjust the value to match your backend. Vite dev server runs on `http://localhost:5173` by default.

3. Start the dev server

```powershell
npm run dev
```

Open the shown URL (usually `http://localhost:5173`).

## Backend integration

The API client lives in `src/lib/api.js` and uses `VITE_API_BASE_URL` as the base (defaults to `http://localhost:8080/api`). It exposes:

- `registerUser({ name, email, password, role })`
- `loginUser({ email, password })`
- `createLawyerProfile({ user_id, experience, location, court_of_practice, availability_details, v_hour })`
- `createAppointment({ client_id, lawyer_id, appointment_date, status, problem_description, notes })`

Auth tokens (if provided by the backend) are stored in `localStorage` and automatically attached as `Authorization: Bearer <token>` for authenticated requests.

### Expected responses

- Register: `{ token, user: { id, role, name, email } }` or at least `{ id }`. If your backend returns different fields, update the mapping in `src/components/Auth.jsx` and `src/lib/api.js`.
- Login: `{ token, user: { id, role, ... } }`

### CORS

Ensure your Spring Boot CORS config allows the Vite origin (dev):

- Origin: `http://localhost:5173`
- Methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization`
- Credentials: allow if your backend uses cookies/sessions

Example (conceptual):

```java
// Allow http://localhost:5173 in your CORS configuration
```

If your backend path prefix is different (e.g., not `/api`), update `VITE_API_BASE_URL` accordingly.

## Features wired to backend

- Auth (login/signup) via `src/components/Auth.jsx`
  - On signup: registers user, stores token/user; if role = `lawyer`, creates lawyer profile with extra fields
  - On login: stores token/user
- Appointment booking via `src/components/LawyerProfile.jsx`
  - Submits appointment with `client_id` from logged-in user and `lawyer_id` from the selected profile

## Troubleshooting

- 401/403 errors: Verify token returned by backend and that it is saved in `localStorage` under `token`. Check CORS allows `http://localhost:5173` and includes `Authorization` in allowed headers.
- Network errors: Confirm `VITE_API_BASE_URL` is correct and backend is running.
- Appointment lawyer_id/client_id null: Ensure your backend returns `user.id` on login/register and that `LawyerDirectory` data includes a stable `id` for the lawyer. Adjust `LawyerProfile.jsx` id mapping if needed.

## Notes

- The app uses simple state-based navigation in `src/App.jsx` (no router).
- Session persists across reloads using `localStorage` and is restored on app load.
