# Better-Auth Implementation Plan

## Overview
Implement authentication in `@packages/frontend` using better-auth with Google OAuth and email/password credentials.

## Configuration Requirements

### User Preferences (from clarification)
- ✓ Landing page (/) will render sign-in form directly
- ✓ No email verification required for signups
- ✓ Include password reset (forgot password) functionality
- ✓ Post-login redirect to `/search`

## Implementation Steps

### 1. Install Dependencies
- [ ] Install `better-auth` in `@packages/frontend`
- [ ] Install `@better-auth/drizzle-orm` in `@packages/frontend`

### 2. Environment Configuration
- [ ] Add to `/packages/frontend/.env`:
  - `BETTER_AUTH_SECRET` (generate with: `openssl rand -base64 32`)
  - `BETTER_AUTH_URL=http://localhost:3000`
  - `NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000`
  - `GOOGLE_CLIENT_ID=<your-google-oauth-client-id>`
  - `GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>`

### 3. Server-Side Auth Setup
- [ ] Create `src/lib/auth.ts`
  - Configure better-auth with Drizzle adapter
  - Use existing schema from `@linkinvests/db/schema/auth.schema.ts`
  - Enable email/password authentication (no verification)
  - Configure Google OAuth provider
  - Set session expiration (7 days)
  - Export Session and User types

- [ ] Create `src/app/api/auth/[...all]/route.ts`
  - Import auth instance
  - Export GET and POST handlers using `toNextJsHandler`

### 4. Client-Side Auth Setup
- [ ] Create `src/lib/auth-client.ts`
  - Create auth client with better-auth/react
  - Export `useSession`, `signIn`, `signUp`, `signOut` hooks
  - Export Session and User types

- [ ] Create `src/components/providers/auth-provider.tsx`
  - Wrap children with SessionProvider

- [ ] Update `src/app/layout.tsx`
  - Import and wrap with AuthProvider

### 5. Auth UI Components

#### Sign In Form
- [ ] Create `src/components/auth/SignInForm.tsx`
  - Email/password input fields with validation (zod + react-hook-form)
  - Sign-in button
  - Google OAuth button
  - Link to forgot password page
  - Link to sign-up page
  - Error handling and display
  - Loading states

#### Sign Up Form
- [ ] Create `src/components/auth/SignUpForm.tsx`
  - Name, email, password, confirm password fields
  - Validation (min 8 chars, uppercase, lowercase, number)
  - Sign-up button
  - Link back to sign-in
  - Error handling
  - Success state (account created message)

#### Password Reset
- [ ] Create `src/components/auth/ForgotPasswordForm.tsx`
  - Email input field
  - Send reset link button
  - Success message
  - Link back to sign-in

- [ ] Create `src/components/auth/ResetPasswordForm.tsx`
  - New password field
  - Confirm password field
  - Reset button
  - Error handling

#### Sign Out
- [ ] Create `src/components/auth/SignOutButton.tsx`
  - Button component
  - Call signOut from auth-client
  - Redirect to / after sign-out

### 6. Auth Pages

- [ ] Replace `src/app/page.tsx`
  - Remove current landing page content
  - Render SignInForm directly
  - Center layout with branding

- [ ] Create `src/app/sign-up/page.tsx`
  - Render SignUpForm
  - Center layout

- [ ] Create `src/app/forgot-password/page.tsx`
  - Render ForgotPasswordForm
  - Center layout

- [ ] Create `src/app/reset-password/page.tsx`
  - Render ResetPasswordForm
  - Handle token from URL params
  - Center layout

### 7. Protected Routes & Session Management

- [x] Create `src/middleware.ts`
  - Check session for protected routes (`/search`)
  - Redirect unauthenticated users to `/`
  - Redirect authenticated users from `/` to `/search`
  - Configure matcher for auth and protected routes

- [x] Create `src/lib/get-session.ts`
  - Server-side session helper
  - Export `getSession()` function for use in server components/actions

- [x] Update `src/app/search/page.tsx`
  - Add session check (redirect if not authenticated)
  - Display user info in header with avatar dropdown
  - Avatar displays user image or initials
  - Dropdown menu with user details and sign-out option

- [x] Create UI components for user menu
  - `src/components/ui/dropdown-menu.tsx` - Dropdown menu component
  - `src/components/ui/avatar.tsx` - Avatar component
  - `src/app/search/components/UserInfo.tsx` - User avatar with dropdown

### 8. Database Schema Review
- [ ] Verify existing schema at `/packages/db/src/schema/auth.schema.ts`
  - **Already compatible** - users, sessions, accounts, verifications tables present
  - No migrations needed

### 9. Integration with Server Actions
- [ ] Create `src/app/_actions/shared/auth.ts`
  - `requireAuth()` - get session or redirect to sign-in
  - `getOptionalSession()` - get session without redirecting
  - Use in existing server actions that need user context

### 10. Testing & Verification
- [ ] Run `pnpm typecheck` - verify no TypeScript errors
- [ ] Run `pnpm lint:fix` - fix linting issues
- [ ] Test auth flows:
  - [ ] Sign up with email/password
  - [ ] Sign in with email/password
  - [ ] Sign in with Google OAuth
  - [ ] Forgot password flow
  - [ ] Reset password
  - [ ] Access protected route when not authenticated
  - [ ] Access auth pages when authenticated
  - [ ] Sign out

## Technical Details

### UI Components Available
- Button (`~/components/ui/button`)
- Input (`~/components/ui/input`)
- Card (`~/components/ui/card`)

### Dependencies Already Installed
- `react-hook-form` ✓
- `@hookform/resolvers` ✓
- `zod` ✓
- `@tanstack/react-query` ✓
- `drizzle-orm` ✓

### New Dependencies Needed
- `better-auth`
- `@better-auth/drizzle-orm`

### Auth Endpoints (auto-generated by better-auth)
- `/api/auth/sign-in/email` - Email/password sign-in
- `/api/auth/sign-up/email` - Email/password sign-up
- `/api/auth/sign-in/google` - Google OAuth
- `/api/auth/sign-out` - Sign out
- `/api/auth/session` - Get current session
- `/api/auth/forget-password` - Request password reset
- `/api/auth/reset-password` - Reset password with token

## Key Features
✓ Google OAuth authentication
✓ Email/password authentication
✓ Password reset flow
✓ No email verification (as requested)
✓ Protected search route
✓ Landing page = sign-in page
✓ Post-login redirect to /search
✓ Uses existing database schema
✓ Type-safe with TypeScript
✓ Integration with existing architecture
