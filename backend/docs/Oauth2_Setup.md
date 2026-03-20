# Google OAuth2 Login - Frontend Guide (SmartBiz)

## Overview
OAuth2 login is not a "call API -> receive JSON" flow.
Frontend must use a browser redirect to the backend, then handle a redirect back from the backend.

Backend implementation notes (from code):
- Start endpoint: `GET /oauth2/authorization/google`
- Google callback handled by Spring: `GET /login/oauth2/code/google` (pattern: `/login/oauth2/code/*`)
- After success/failure, backend redirects to `app.oauth2.authorized-redirect-uri` and appends query params.

## Required Config
### 1) Backend (`application.properties`)
- `spring.security.oauth2.client.registration.google.client-id`
- `spring.security.oauth2.client.registration.google.client-secret`
- `spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}`
- `app.oauth2.authorized-redirect-uri=<FRONTEND_CALLBACK_URL>`

Recommendation (makes frontend simpler):
- Set `app.oauth2.authorized-redirect-uri` to a dedicated callback route, not a real dashboard page.
Example:
- `app.oauth2.authorized-redirect-uri=http://localhost:3000/oauth2/callback`

### 2) Google Cloud Console (OAuth client)
Authorized redirect URI must include the backend callback URL:
- `http://localhost:8080/login/oauth2/code/google`

In production, replace `localhost` with your real backend domain (HTTPS recommended).

## Full Flow
### Step 1: Frontend redirects to backend
Frontend should do a full page redirect (do not use `fetch/axios`):

```js
window.location.href = "http://localhost:8080/oauth2/authorization/google";
```

### Step 2: User logs in with Google
Backend redirects to Google automatically. Frontend does not handle anything here.

### Step 3: Backend redirects back to frontend (success or failure)
Backend will redirect to:
- `app.oauth2.authorized-redirect-uri` (configured in backend)
And append query parameters.

Success example:
`http://localhost:3000/oauth2/callback?token=...&role=...&email=...&userId=...&fullName=...&storeId=...`

Failure example:
`http://localhost:3000/oauth2/callback?error=...`

## Query Parameters (exact names from backend)
On success:
- `token`: JWT token string
- `role`: role name (example: `BUSINESS_OWNER`, `ADMIN`, ...)
- `email`: user email
- `userId`: user UUID
- `fullName`: display name
- `storeId`: store id

Note:
- `storeId` can be missing/empty/`null` depending on user data.

On failure:
- `error`: error message (backend uses exception message)

## Frontend Handling
Frontend should:
1. Read query params from `window.location.search`
2. If `token` exists: store token, optionally store user fields, then navigate to the correct route
3. If `error` exists: show message and navigate to `/login`
4. Clean the URL (remove token from the address bar) as soon as possible

### Example (React + react-router)
```js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuth2CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const role = params.get("role");
    const error = params.get("error");

    if (token) {
      localStorage.setItem("token", token);

      // Clean URL to remove sensitive query params
      window.history.replaceState({}, document.title, "/oauth2/callback");

      if (role === "BUSINESS_OWNER") navigate("/owner/dashboard");
      else navigate("/");
      return;
    }

    if (error) {
      console.error("OAuth2 Error:", error);
      window.history.replaceState({}, document.title, "/oauth2/callback");
      navigate("/login");
    }
  }, [navigate]);

  return <div>Logging in...</div>;
}
```

## Calling Protected APIs After Login
Attach JWT for protected APIs:
- `Authorization: Bearer <token>`

## Important Notes
- This backend currently sends JWT via query param in the redirect URL.
Handle it immediately and clean the URL to reduce leakage via browser history/logs.
- Backend creates an account automatically for first-time Google users and sets default role to `BUSINESS_OWNER`.
If an email already exists, backend will keep that user's existing role.

## Suggested Upgrade (not implemented yet)
Current flow:
- Backend redirects to frontend and puts JWT in URL query params.

A safer approach:
1. Backend redirects to frontend with a short-lived one-time code (not JWT)
2. Frontend calls a backend API to exchange code -> JWT (JSON response)
3. Backend returns JWT in JSON (or sets HttpOnly cookie)

