# Supabase authentication migration

## Status

Code is prepared for review, not deployed. The existing Supabase project `sqyneynrlbfczdtmjtjv` is inactive. Restore was refused because the account has reached the two-active-free-project limit. Its publishable key could not be retrieved, so live login, password email delivery, backend authorization, and deployment remain unverified.

Supabase replaces the identity provider. Base44 continues to store the existing business data and run integrations/functions. No business records or passwords are copied or deleted by this change. This is not a migration of the database away from Base44.

## Configuration and rollout

1. Make an active Supabase project available, either by freeing a free-project slot and restoring the existing project, or by selecting an active project. The existing URL is `https://sqyneynrlbfczdtmjtjv.supabase.co`.
2. Enable the email provider in Supabase Auth. Configure production SMTP, confirmation emails, password requirements and rate limits. Public sign-up never grants admin access.
3. Set Supabase Auth's Site URL to the real production origin. Add the exact login URLs to the redirect allow list: `https://<production-host>/admin/login` and `https://<production-host>/admin/login?recovery=1`. Add `http://localhost:5173/admin/login` and its recovery variant only for development. Do not use broad production wildcard redirects.
4. Copy `.env.example` to `.env.local` and provide the URL and publishable key. Configure the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the frontend build environment. Keep the existing Base44 data-backend settings. Never put a secret/service-role key in a `VITE_` variable.
5. In the Base44 backend's secret settings, set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` to the same project's values. These are used for server-to-server calls to Supabase Auth's `/auth/v1/user`. A Supabase service-role key is not required.
6. Create or invite the intended Supabase user, verify ownership of the email address, then assign `app_metadata.role = "admin"` through a trusted Supabase admin workflow. Do not set `user_metadata.role`. The frontend cannot grant roles. Sign in again after assignment. Existing Base44 users must establish a Supabase account; their old password is not automatically transferred.
7. Four previously permissive jobs now fail closed: `appointmentReminders`, `checkOverdueInvoices`, `sendFollowUpReminders`, and `weeklySeoDigest`. Configure a random `AUTH_JOB_SECRET` of at least 32 characters in backend secrets, and configure a trusted job runner to send it in `x-auth-job-secret`. A caller-supplied `x-scheduled` flag no longer authenticates jobs. Native schedules which cannot attach this secret must be moved to an authenticated runner before rollout. An invalid user token cannot fall back to job authorization.
8. Deploy the changed Base44 functions and the new `supabaseAdminGateway` as a coordinated cutover with the frontend. Each function includes its own `supabase-auth.ts` so the bundle does not depend on sibling-directory imports. Regenerate copies with `npm run auth:sync-helpers` after editing the template. Do not publish the frontend alone: the old backend will not understand Supabase sessions.
9. Verify Base44 entity permissions continue denying anonymous reads/writes of private CRM data. Public website data and existing token-link workflows retain their existing access models. The admin gateway checks Supabase identity and admin role before obtaining service-role access and exposes only an explicit entity/method/integration allow list. It cannot modify Base44 User records.
10. Test the checks below on a staging URL, then publish the coordinated release. Retire legacy Base44 login entry points and revoke remaining Base44 user sessions through the Base44 admin settings after confirming the cutover. Old Base44 browser credentials are discarded by the new frontend. Roll back both frontend and backend together if needed.

## Behavior

- `/admin/login` implements email/password sign-in, account creation, password reset and recovery.
- Admin pages require a verified Supabase user with server-managed admin metadata. The previously unguarded `/admin/email-preview` is now protected too.
- Denied users see an access-denied screen; signed-out users return to their original local admin URL after successful sign-in.
- Auth events trigger fresh user validation, clear cached data on sign-out/account changes, and unsubscribe on unmount. Password-recovery sessions are kept out of admin pages until recovery completes.
- Browser route checks are a UI convenience. Backend functions and the admin data gateway independently ask Supabase Auth to verify the access token and current role on every privileged request.
- The existing frontend's Base44 data calls go through a Supabase-verified backend gateway for admin sessions. Public requests remain anonymous and rely on the existing Base44 entity permissions. No Supabase token is treated as a Base44 credential.
- Submission notifications use authenticated polling at 15-second intervals, bounded to the latest 500 records, instead of a Base44 user-authenticated WebSocket. This changes notification latency and can omit older records outside that window.
- Existing client portal and signing links remain token-link workflows. They have not been converted into Supabase account ownership or new client-access rules.

## Verification

Automated checks:

```sh
npm ci
npm run auth:sync-helpers
npm run test:auth
npm run build
```

Tests cover user-editable metadata escalation, redirect safety, missing/invalid tokens, anonymous and non-admin users, scheduled-job bypass attempts, auth outages, route denial, gateway allow lists and gateway authorization before service-role access. Backend TypeScript files were also syntax checked. These tests use mocks and do not establish that a live Supabase or Base44 deployment is configured correctly.

Required live checks after configuration:

- Signed-out direct access to `/admin/dashboard`, `/admin/invoices` and `/admin/email-preview` redirects to sign-in without fetching private data.
- An ordinary confirmed account cannot view admin screens or call private backend endpoints. Setting `user_metadata.role` to admin does not change this.
- The intended administrator can sign in, navigate directly to protected URLs, refresh, use dashboard/CRM data, upload a file and invoke an existing administrative function.
- Logout clears the Supabase session and cached data; another tab loses access. Expired and invalid access tokens fail at the backend. Access tokens can remain valid until expiry after session revocation; use a short expiry and add a server-side session check if immediate revocation is required.
- Recovery links work on the actual allow-listed production origin, passwords update, and no recovery loop bypasses route guards.
- Each scheduled job succeeds only with the configured secret or a verified admin request. Check that existing job schedules have been updated.
- Public enquiry forms, website content, client portal links and signing links still work with the intended Base44 entity permissions.
- Check Supabase security advisors when the project is active. No Supabase tables, RLS policies or schema changes are introduced by this auth-only migration.

References: [Supabase React Auth](https://supabase.com/docs/guides/auth/quickstarts/react), [Auth events](https://supabase.com/docs/reference/javascript/auth-onauthstatechange), [User validation](https://supabase.com/docs/reference/javascript/auth-getuser).
