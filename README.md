# Research Pal Backend

Research Pal is a mobile-first field research notebook for agricultural and experimental workflows. The backend provides account authentication, project and plot management, dated field notes, quick ideas, and photo metadata lookup for one isolated workspace per account.

## Product Model

Each authenticated user owns their own data. The current product does not include collaboration, RBAC, organizations, or shared workspaces.

Core data flow:

```text
User -> Projects -> Plots -> Notes -> Photos
```

Domain rules:

- `plotIndex` represents the fixed physical position of a plot.
- `replication` and `treatment` are editable plot metadata.
- Plots should not move once created; only their properties change.
- Notes belong to a specific user, project, and plot.
- Photo files are stored by the mobile app; the API stores and resolves photo IDs attached to notes.

## Architecture

- Express API with route groups for `auth`, `projects`, `ideas`, and `photos`.
- MongoDB persistence through Mongoose models.
- Yup request validation at route boundaries.
- JWT access tokens for short-lived request authentication.
- Rotating refresh tokens stored server-side only as bcrypt hashes.
- Stateless signed email-verification and password-reset tokens.
- Lightweight Express rate limits on sensitive auth endpoints.
- Protected resource ownership is derived from `req.user.id` after JWT verification.

The API must never trust `userId` from request body, query, or params for protected resources. Client-supplied IDs may exist for backward compatibility, but ownership checks use the verified access token identity.

## Auth Flow

- `POST /auth/login`: verifies email/password and returns an access token plus refresh token.
- `POST /auth/refresh`: verifies the refresh token, rotates it, and returns a new access token plus refresh token.
- `POST /auth/logout`: invalidates the submitted refresh token. Use `?fromAll=yes` to remove all refresh tokens for the account.
- `POST /auth/verify-email`: verifies a short-lived signed verification token plus the emailed code.
- `POST /auth/forgot-password`: emails a short-lived signed reset token link without exposing it in the API response.

Access tokens are stateless and short-lived. Refresh tokens are hashed before storage in `User.refreshTokens`.
Email verification and password reset do not use database token collections.

## Error Handling

API errors use a consistent envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": []
  },
  "requestId": "..."
}
```

New async controllers should use `asyncHandler`, throw `AppError` for expected failures, and let `globalErrorHandler` normalize validation, JWT, Mongoose, database, and server errors. Logs redact sensitive fields such as passwords and tokens.

## Environment

Required variables:

- `MONGO_URI`
- `TOKEN_KEY`
- `GMAIL_USER`
- `GMAIL_PASS`

Optional variables:

- `ADMIN_MAIL`
- `PASSWORD_RESET_LINK`

## Development

```sh
npm install
npm run dev
```

## Verification

```sh
npm run ts.check
npm run build
npm audit
```

Do not run automated package updates during audit review. Report findings first, then decide upgrades separately.
