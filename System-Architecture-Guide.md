# System Architecture & Integration Guide
**Project:** Full-Stack Authentication System (Angular + Node.js)
**Author:** Aldrie Abais

This document serves as the knowledge base for the current system architecture, cloud hosting environments, authentication flow, and API configurations. It is designed to provide AI Copilots and developers with the complete context needed to maintain, debug, and scale the application.

---

## 1. Cloud Hosting & Infrastructure

The application is deployed across three separate cloud environments, utilizing a decoupled frontend and backend architecture.

* **Frontend Hosting:** Vercel
    * **Live URL:** `https://abais-lab7-activity-angular.vercel.app`
    * **Tech Stack:** Angular (v15+)
* **Backend API Hosting:** Render
    * **Live URL:** `https://aldrie-auth-api.onrender.com`
    * **Tech Stack:** Node.js, Express.js, Sequelize ORM
* **Database Hosting:** TiDB Cloud
    * **Dialect:** MySQL
    * **Tables:** `accounts`, `refreshTokens`

---

## 2. Authentication & Integration Flow

The system uses a dual-token authentication mechanism (JWT Bearer Token + HTTP-Only Refresh Cookie). Because the frontend and backend are hosted on different domains, strict Cross-Origin Resource Sharing (CORS) and Cookie policies are enforced.

### Backend Security Configuration (Node.js/Render)
* **CORS:** Explicitly allows requests from the Vercel URL with `credentials: true`.
* **Cookie Policy:** The Refresh Token is sent as a cookie. Because it is cross-site, it is strictly configured with:
    * `httpOnly: true` (Protects against XSS)
    * `secure: true` (Requires HTTPS)
    * `sameSite: 'none'` (Required for cross-domain cookie transmission between Vercel and Render)
* **Authorization Middleware:** Located in `_middleware/authorize.ts`. Uses `express-jwt` to validate the Bearer token algorithms (e.g., `HS256`) and signatures via `process.env.JWT_SECRET`.
* **Error Handling:** Located in `_middleware/error-handler.ts`. Intercepts `UnauthorizedError` to catch malformed or expired JWTs.

### Frontend Security Configuration (Angular/Vercel)
* **Local Storage:** The authenticated user profile and the active `jwtToken` are saved in `localStorage` under the key `"user"`.
* **JWT Interceptor:** Located in `src/app/_helpers/jwt.interceptor.ts`. It manually bypasses the service layer, retrieves the `"user"` object from `localStorage`, and explicitly attaches the `Authorization: Bearer <token>` header to all outgoing API requests.
* **Credentials:** All API calls responsible for authentication (Login, Refresh, Revoke) must include `{ withCredentials: true }` in the HTTP options so the browser attaches the secure refresh cookie.

---

### 3. Core API Endpoints

The backend handles the following authentication, registration, and account management routes. Endpoints marked with a lock icon in Swagger require a valid JWT Bearer token.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/accounts/authenticate` | Authenticate account credentials and return a JWT token and a cookie with a refresh token. | No |
| **POST** | `/accounts/refresh-token` | Use a refresh token to generate a new JWT token and a new refresh token. | Cookie |
| **POST** | `/accounts/revoke-token` | Revoke a refresh token. | Yes (Bearer) |
| **POST** | `/accounts/register` | Register a new user account and send a verification email. | No |
| **POST** | `/accounts/verify-email` | Verify a new account with a verification token received by email after registration. | No |
| **POST** | `/accounts/forgot-password` | Submit email address to reset the password on an account. | No |
| **POST** | `/accounts/validate-reset-token`| Validate the reset password token received by email. | No |
| **POST** | `/accounts/reset-password` | Reset the password for an account. | No |
| **GET** | `/accounts` | Get a list of all accounts. | Yes (Bearer/Admin) |
| **POST** | `/accounts` | Create a new account. | Yes (Bearer/Admin) |
| **GET** | `/accounts/{id}` | Get a single account by id. | Yes (Bearer) |
| **PUT** | `/accounts/{id}` | Update an account. | Yes (Bearer) |
| **DELETE** | `/accounts/{id}` | Delete an account. | Yes (Bearer) |

---

## 4. Copilot Instructions & System Rules

**AI Copilots assisting in this repository MUST adhere to the following rules:**

1.  **Strict Storage Keys:** Always read from and write to `localStorage.getItem('user')`. Do not use alternative keys like `account` or `session`.
2.  **Cross-Origin Compliance:** Never remove `{ withCredentials: true }` from auth-related HTTP requests in the Angular services.
3.  **Interceptor Logic:** Do not rely on environment URL checks (`isApiUrl`) if it risks blocking the token attachment in production. The interceptor is configured to explicitly inject the token if it exists in local storage.
4.  **Cookie Maintenance:** Any updates to backend cookie settings must retain `sameSite: 'none'` and `secure: true`.
5.  **Logging:** When debugging backend 401s, immediately check the Render logs via global error handlers. Do not rely solely on the browser console, as JWT validation errors are shielded from the client.
6.  **Database ORM:** Recognize that the database queries are handled by Sequelize (generating standard MySQL queries for TiDB). Avoid N+1 query patterns.
