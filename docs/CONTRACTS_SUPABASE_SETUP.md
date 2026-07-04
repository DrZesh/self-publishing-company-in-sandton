# Contracts and Adobe Sign on Supabase

The legacy Contracts workflow now uses Supabase for contract records, native electronic signing, signed-file storage, audit tracking, and Adobe Acrobat Sign status synchronization.

## 1. Apply migrations

Apply migrations through:

```text
202607040019_contract_postsign_upload.sql
```

The Contracts phase adds:

- `public.contracts`
- admin-only RLS for Contract CRUD
- atomic native signing and decline RPCs
- linked Document and E-signature record creation
- project Contract Signed stage synchronization
- short post-sign upload support for the browser-generated final PDF

## 2. Deploy Edge Functions

Deploy:

```bash
supabase functions deploy contract-actions
supabase functions deploy contract-file-actions
supabase functions deploy adobe-sign-actions
supabase functions deploy adobe-sign-webhook
```

`contract-actions` and `contract-file-actions` include public token-scoped actions, so JWT verification is disabled at the gateway and authorization is enforced inside the functions.

`adobe-sign-actions` requires a Supabase JWT and also checks the caller profile for `super_admin` or `admin` role.

`adobe-sign-webhook` is public because Acrobat Sign calls it directly. It validates `X-AdobeSign-ClientId` against the configured Acrobat Sign application client ID and echoes the verified value in successful responses.

## 3. Native signing secrets

Configure:

```bash
supabase secrets set RESEND_API_KEY="..."
supabase secrets set CONTRACT_FROM_EMAIL="Creative Books SA <info@creativebooks.co.za>"
supabase secrets set CONTRACT_ADMIN_EMAIL="info@creativebooks.co.za"
supabase secrets set SITE_URL="https://creativebooks.co.za"
supabase secrets set CONTRACT_AUDIT_SALT="use-a-long-random-secret"
```

`CAPTURE_IP_SALT` may be reused instead of `CONTRACT_AUDIT_SALT` when it is already configured. Raw signer IP addresses are not stored. The Contract audit workflow stores a SHA-256 audit fingerprint derived from the server-observed address and the configured secret salt.

## 4. Adobe Acrobat Sign secrets

Configure:

```bash
supabase secrets set ADOBE_SIGN_CLIENT_ID="..."
supabase secrets set ADOBE_SIGN_CLIENT_SECRET="..."
supabase secrets set ADOBE_SIGN_REFRESH_TOKEN="..."
supabase secrets set ADOBE_SIGN_API_BASE="https://api.na1.adobesign.com"
```

Use the API base for the Acrobat Sign shard assigned to the account.

The admin Contracts screen now displays and registers this webhook URL:

```text
<VITE_SUPABASE_URL>/functions/v1/adobe-sign-webhook
```

Acrobat Sign verifies webhook intent by sending `X-AdobeSign-ClientId`. The webhook only accepts the configured application client ID.

## 5. Storage

The workflow reuses the existing private buckets:

- `document-files`
- `signature-artifacts`

Admin contract documents are uploaded to private storage and persisted as `supabase://` storage references. The compatibility bridge hydrates those references to short-lived signed URLs when the UI needs to view or process a file.

Native public signing uses token-scoped signed upload grants:

- signature images before signing
- final signed PDF after signing

The post-sign PDF upload updates the Contract, the linked signed Document record, and the linked E-signature request record.

Adobe Sign completed agreements are downloaded from the Acrobat Sign combined document endpoint and stored in `document-files`.

## 6. Functional verification

Test the native signing path:

1. Create a Contract from `/admin/contracts`.
2. Upload a PDF.
3. Prepare admin fields and admin signature where required.
4. Send the Contract for signature.
5. Open the public signing link in a separate browser session.
6. Confirm Opened, Viewed and Signing Started audit events.
7. Sign and submit consent.
8. Confirm the Contract status is Signed or Fully Signed.
9. Confirm the final signed PDF opens from the admin Contracts screen.
10. Confirm a signed Document record and E-signature record exist.
11. Confirm the linked Project moves to Contract Signed.
12. Test decline and resend flows.

Test the Adobe Sign path:

1. Open a Contract and choose Send via Adobe Sign.
2. Confirm a PDF upload can be sent to the signer.
3. Register or verify the Supabase webhook URL.
4. Confirm Viewed and completion webhook events update the same Contract record.
5. Complete the agreement in Acrobat Sign.
6. Confirm the signed combined PDF is downloaded into Supabase Storage.
7. Confirm the linked Project moves to Contract Signed.

## Security notes

- Native signing links are random, expiring tokens.
- Public file uploads are constrained by token, contract state, MIME type, bucket and path prefix.
- Admin Contract actions require Supabase authentication and role checks.
- Adobe webhook calls require the expected Acrobat Sign application client ID header.
- Signer network identifiers are stored as salted hashes, not raw IP addresses.
