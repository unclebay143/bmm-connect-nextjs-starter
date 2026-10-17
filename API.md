# Integrate Buy Me a Malt Connect

Let creators connect their BMM account, receive support through your platform, and optionally see the support your platform generates. Start with a **Connect BMM** button; BMM handles authentication, treats, payments and withdrawals.

Your platform handles its own user sessions, starts the connection, stores credentials securely, displays the returned support link, and respects the creator’s earnings choice. It never needs banking details or payment-processing logic.

## Works with your platform

**BMM Connect is a platform-agnostic HTTP API. Next.js, the JavaScript SDK and any particular hosting provider are optional.** Use your existing backend language and framework, including PHP, Python, Go or Node.js, to make the same authenticated HTTPS requests.

Your integration needs approved application credentials, an exact registered callback URL, and a trusted server that identifies the signed-in user and completes the secure connection handshake. Keep the API key on that server. BMM stores hosted connections; you do not need a BMM token database or refresh-token logic. Your existing authentication system remains responsible for your own users.

Choose the entry point that suits your stack:

- **Any backend:** follow the Hosted Connect HTTP reference below. It includes requests, responses, permissions and callback security requirements.
- **Node.js:** optionally use the core JavaScript SDK to handle the protocol. The core does not require Next.js.
- **Next.js:** optionally use the Next.js adapter and runnable starter as a reference integration. Their Node.js and framework requirements apply only to that example.

Register your application in Developers, obtain its credentials after approval, and configure the callback on your chosen backend. The same protocol works on persistent servers or serverless hosting; no particular provider is required.

## What your users experience

1. Click **Connect BMM** on your platform.
2. Sign in on BMM, or verify their email and choose a unique username. BMM supplies a default Malt profile for new creators.
3. Approve read-only profile access. Sharing settled earnings is optional and initially unchecked.
4. Return to your platform with their attributed support link ready to use.

Creators can disconnect at any time, either on your platform or in BMM → Share → Connected apps.

## Optional quick start: run the Next.js example

1. Open **Developers** on Buy Me a Malt and request access with your website, purpose and exact callback URLs. Live applications require HTTPS; applications in the Sandbox tab also accept localhost HTTP.
2. Once approved, generate your API key and copy **Next.js starter configuration** into `.env.local`. Use your approved callback and matching app origin. No BMM token database or encryption key is required.
3. Download and extract the starter, or clone the GitHub repository below. Run `npm install` and `npm run dev`, serving it at the registered origin.
4. Click **Connect BMM**, authenticate and approve access, then return to your connected creator profile.
5. Click **Buy me a malt**. The example opens the support flow in a new tab, keeping the original game/platform tab open. Continue to BMM within that new tab; no custom post-payment return URL is required. A notice explains that you will open the live BMM profile and that successfully verified payments through its link are attributed to your application. The support belongs to the creator.


The [Next.js starter repository](https://github.com/unclebay143/bmm-connect-nextjs-starter) provides the same example as the dashboard download:

```sh
git clone https://github.com/unclebay143/bmm-connect-nextjs-starter.git
cd bmm-connect-nextjs-starter
```

Next.js is an optional example, not an API requirement. Download or clone the starter to follow along.

Use Sandbox to test the complete account connection and consent flow.

The example includes the hosted Connect SDK, secure callback verification, earnings permissions, disconnect and error states. BMM stores connections; partners do not manage access or refresh tokens. It is a standalone Next.js app, not a mock. Its browser session represents the demo user; bind it to your existing platform identity before real multi-user use.

## Sandbox first

Sandbox applications, creator connections and earnings are isolated from live integrations by BMM’s configured environment. HTTP callbacks are allowed only for localhost/127.0.0.1 in sandbox. Use the exact host consistently; `localhost` and `127.0.0.1` are different callback addresses.

The BMM origin is public; credentials and demo access require application approval. Sample-data queries use the same BMM instance as your approved application. Payment testing remains separate: it requires a configured Bachs sandbox and its test payment instructions. Preview tokens never initiate payments.

## Hosted Connect (recommended for new integrations)

Use the HTTP API directly from your backend, or use the optional JavaScript SDK. Supply your application ID, server-side API key, registered callback URL and the authenticated partner user ID derived from your server session. BMM stores connections. No database adapter, token encryption key or refresh logic is needed. Your own login system continues to identify your users.

Every hosted request uses `X-BMM-Client-ID` and `X-BMM-API-Key`. Profile, earnings and disconnect also require `X-BMM-User-ID`, derived from your authenticated server session. These endpoints do not accept OAuth bearer tokens as a substitute for application credentials. An API key can access only that application's active, consented connections. Never expose an arbitrary-user lookup in an unauthenticated browser API.

### Start and complete

The SDK manages the browser cookie and PKCE. For custom server integrations, generate cryptographically random 32-byte base64url state and verifier, retain them in an authenticated HttpOnly browser cookie bound to the current partner user, and calculate the base64url SHA-256 verifier challenge.

```sh
curl "$BMM_ORIGIN/api/connect/hosted/start" -X POST \
  -H "X-BMM-Client-ID: $CLIENT_ID" -H "X-BMM-API-Key: $API_KEY" \
  -H 'Content-Type: application/json' \
  --data '{"partner_user_id":"player_123","redirect_uri":"https://game.example/api/bmm/callback","state":"REPLACE_WITH_43_CHARACTER_RANDOM_STATE","code_challenge":"REPLACE_WITH_43_CHARACTER_S256_CHALLENGE"}'
```

```json
{"authorization_url":"https://buymeamalt.com/connect/login?hosted=OPAQUE_REQUEST","expires_in":600}
```

Redirect the browser to `authorization_url`. Existing BMM sign-in, registration and explicit consent are unchanged. Approval returns `code`, `state` and `iss` to the exact registered callback; denial returns `error=access_denied`, `state` and `iss`. The hosted issuer is **`BMM_ORIGIN/api/connect/hosted`**. Validate the unique parameters, browser state, issuer and the same authenticated partner user before completing. Never accept the partner user ID from the callback query.

```sh
curl "$BMM_ORIGIN/api/connect/hosted/complete" -X POST \
  -H "X-BMM-Client-ID: $CLIENT_ID" -H "X-BMM-API-Key: $API_KEY" \
  -H 'Content-Type: application/json' \
  --data '{"partner_user_id":"player_123","redirect_uri":"https://game.example/api/bmm/callback","code":"REPLACE_WITH_ONE_USE_CODE","code_verifier":"REPLACE_WITH_ORIGINAL_VERIFIER"}'
```

```json
{"connected":true}
```

No access/refresh tokens are issued. Requests and codes expire with the ten-minute attempt; completion is single-use. A new start invalidates older unfinished attempts for this application/user. Connections become accessible only after completion. If completion's network outcome is unknown, read the connection; restart if needed, never blindly replay the code. Completing another hosted mapping for the same creator/application replaces the previous hosted mapping. Existing OAuth grants remain separate.

### Profile, earnings and disconnect

```sh
curl "$BMM_ORIGIN/api/connect/hosted/me" \
  -H "X-BMM-Client-ID: $CLIENT_ID" -H "X-BMM-API-Key: $API_KEY" \
  -H "X-BMM-User-ID: $AUTHENTICATED_PARTNER_USER_ID"
curl "$BMM_ORIGIN/api/connect/hosted/me/support" \
  -H "X-BMM-Client-ID: $CLIENT_ID" -H "X-BMM-API-Key: $API_KEY" \
  -H "X-BMM-User-ID: $AUTHENTICATED_PARTNER_USER_ID"
curl "$BMM_ORIGIN/api/connect/hosted/me" -X DELETE \
  -H "X-BMM-Client-ID: $CLIENT_ID" -H "X-BMM-API-Key: $API_KEY" \
  -H "X-BMM-User-ID: $AUTHENTICATED_PARTNER_USER_ID"
```

Responses, in the same order:

```json
{"creator":{"id":"creator_456","username":"builder","display_name":"Builder","profile_image":"","environment":"live","profile_url":"https://buymeamalt.com/@builder","support_url":"https://buymeamalt.com/@builder?bmm-partner=OPAQUE_REFERENCE","earnings_shared":true}}
```

```json
{"support":[{"currency":"NGN","settled_earnings_minor":100000,"verified_payment_count":2},{"currency":"USD","settled_earnings_minor":0,"verified_payment_count":0}]}
```

```json
{"disconnected":true}
```

Earnings remain the creator's verified support attributed to this application, with existing refund deductions, separated by currency in minor units. They are not a withdrawable balance. Consent is required; 403 is not zero. Profile/support URLs can be null when the connection environment does not match BMM's payment deployment. Revocation prevents subsequent authorised reads and disables the attributed link. Disconnect is idempotent and also invalidates unfinished attempts for that user/application.

### Hosted errors

Errors use `{"error":"message"}`. Invalid fields or changed/unregistered callbacks return 400; invalid credentials return 401; unapproved apps or missing earnings consent return 403; absent/revoked connections return 404; revoked pending approval returns 410; rate limiting returns 429. Disabled applications are unavailable (400 or 401 depending on credential validation). Treat 5xx/network failures as temporary and retry reads with backoff. Do not cache private responses. API key rotation leaves active hosted connections intact but requires the new key and restarting any unfinished SDK handshake.

## OAuth compatibility: credentials and permissions

| Value | Meaning | Where it belongs |
| --- | --- | --- |
| Application ID (`client_id`) | Identifies your approved application | Server configuration; public in authorization URLs |
| API key (`client_secret`) | Authenticates your application | Server secret storage only |
| Creator access token | Represents this creator’s approved connection and scopes | Server storage only |
| Refresh token | Renews access, subject to session validity and revocation | Server storage only; replace after refresh |
| `support_url` | Public BMM profile URL with attribution | Safe to render as a public support button |

Authenticated profile, earnings and disconnect requests require **all three headers**: `Authorization: Bearer ACCESS_TOKEN`, `X-BMM-Client-ID`, and `X-BMM-API-Key`. The key authenticates the partner; the token represents the creator’s authorization. This is an intentional requirement of BMM Connect. Browser code must call your own server rather than these endpoints directly.

Scopes are `profile:read`, optional `support:read`, and `offline_access`. The authorization wrapper requests these; BMM consent determines which are actually granted. An approved developer application does not grant access to any creator by itself. Rotating your API key immediately invalidates the previous key; update your server configuration. Website/callback changes require admin review.

## OAuth API reference (existing integrations)

All paths below are relative to `BMM_ORIGIN`. Replace example placeholders with your approved application credentials on your server. Example payload values are illustrative, not usable credentials. Do not paste real secrets into shared terminals, logs or tickets. The five public operations below are the partner API; BMM’s `/api/connect/profile`, `/consent`, `/connections`, and admin/developer management routes are first-party UI endpoints, not partner APIs.

### 1. GET /api/connect/authorize: connect an account

Generate a random state and PKCE verifier for every attempt, save them against the initiating user **and browser session** on your server, and redirect the browser to BMM. The S256 challenge is the base64url-encoded SHA-256 digest of the verifier.

```js
import { randomBytes, createHash } from 'node:crypto';
const state = randomBytes(32).toString('base64url');
const verifier = randomBytes(32).toString('base64url');
const challenge = createHash('sha256').update(verifier).digest('base64url');
const url = new URL('/api/connect/authorize', process.env.BMM_ORIGIN);
url.search = new URLSearchParams({
  client_id: process.env.BMM_CLIENT_ID,
  redirect_uri: process.env.BMM_REDIRECT_URI,
  state, code_challenge: challenge, code_challenge_method: 'S256'
}).toString();
// Persist state/verifier in your server session before redirecting to url.
// The runnable starter implements persistence and redirect handling.
```

Successful browser authorization returns to the exact registered callback:

```text
http://localhost:3090/api/bmm/callback?code=ONE_TIME_CODE&state=ORIGINAL_STATE&iss=http%3A%2F%2Flocalhost%3A3080%2Fapi%2Fauth
```

Denial returns the callback with `error=access_denied` and the original `state`. Validate state before treating denial as a valid outcome. Before exchanging a successful code, require the exact issuer **`BMM_ORIGIN/api/auth`**, not just the origin. Atomically consume the pending request. Codes expire after ten minutes and can be redeemed only once. Exact callback matching and S256 PKCE are mandatory. Never bypass state if the user changed browser/device; ask them to restart.

### 2. POST /api/connect/token: exchange or refresh

Use `application/x-www-form-urlencoded`, not JSON. Exchange on your server:

```sh
curl "$BMM_ORIGIN/api/connect/token" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'grant_type=authorization_code' \
  --data-urlencode "client_id=$BMM_CLIENT_ID" \
  --data-urlencode "client_secret=$BMM_API_KEY" \
  --data-urlencode "redirect_uri=$BMM_REDIRECT_URI" \
  --data-urlencode "code=$CODE" \
  --data-urlencode "code_verifier=$CODE_VERIFIER"
```

```json
{
  "access_token": "OPAQUE_ACCESS_TOKEN",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "OPAQUE_REFRESH_TOKEN",
  "scope": "profile:read support:read offline_access"
}
```

`support:read` is absent when the creator declines earnings sharing. Additional OAuth fields may be returned; do not require an exact set of response keys. Store credentials encrypted, and compute expiry from `expires_in`. Access tokens last one hour. Refresh credentials have a configured 30-day lifetime, subject to underlying BMM session checks and revocation; access is not guaranteed for 30 days.

```sh
curl "$BMM_ORIGIN/api/connect/token" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'grant_type=refresh_token' \
  --data-urlencode "client_id=$BMM_CLIENT_ID" \
  --data-urlencode "client_secret=$BMM_API_KEY" \
  --data-urlencode "refresh_token=$REFRESH_TOKEN"
```

Refresh returns the token response shape above. Serialize refreshes per connection and atomically store the replacement access **and refresh** tokens. Replaying an old code or refresh token can invalidate associated credentials. After an uncertain refresh outcome (timeout/crash after sending), reconnect rather than blindly replaying the old refresh token.

### 3. GET /api/connect/v1/me: profile and attributed support link

```sh
curl "$BMM_ORIGIN/api/connect/v1/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-BMM-Client-ID: $BMM_CLIENT_ID" \
  -H "X-BMM-API-Key: $BMM_API_KEY"
```

```json
{
  "creator": {
    "id": "stable-bmm-creator-id",
    "username": "builder",
    "display_name": "Builder",
    "profile_image": "",
    "profile_url": "https://buymeamalt.com/@builder",
    "support_url": "https://buymeamalt.com/@builder?bmm-partner=OPAQUE_REFERENCE",
    "earnings_shared": false
  }
}
```

Use `id` as the BMM identity; usernames can change. Render the returned `support_url` without rebuilding it or replacing `source` with your application ID. The opaque public source identifies this approved partner/creator connection, cannot read data, and is checked again at checkout. Shared copies retain attribution; direct profile visits are unattributed. Username redirects retain the source. Group checkout attribution is outside Connect’s current scope.

### 4. GET /api/connect/v1/me/support: optional earnings

```sh
curl "$BMM_ORIGIN/api/connect/v1/me/support" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-BMM-Client-ID: $BMM_CLIENT_ID" \
  -H "X-BMM-API-Key: $BMM_API_KEY"
```

```json
{
  "support": [
    { "currency": "NGN", "settled_earnings_minor": 1000000, "verified_payment_count": 8 },
    { "currency": "USD", "settled_earnings_minor": 2500, "verified_payment_count": 2 }
  ]
}
```

> Label this **Support received through [your platform]**, with **Settled earnings** as the amount description. This is lifetime net credited earnings minus refunds and protective refund deductions, **not an available or withdrawable balance**. Withdrawals do not reduce these totals.

Amounts are integer minor units: `1000000` NGN means ₦10,000; `2500` USD means $25. Display each currency separately; never add them together without a separate, explicit conversion. Both supported currencies are returned, with zero values when there is no matching activity.

BMM uses existing verified credit after fees, minus its refund deductions. Pending refund holds reduce the figure conservatively until reconciliation resolves them. Verified payment counts include payments subsequently refunded, but not pending attempts. Only this creator’s earnings attributed to **your application in this environment** are included, including earlier connections to the same application. Other partners and direct contributions are excluded.

The endpoint requires both `support:read` and current earnings consent, including for payment counts. A 403 means hide earnings/counts, not “zero earnings”. Keep the profile and support button available.

### 5. DELETE /api/connect/v1/me: disconnect

```sh
curl -X DELETE "$BMM_ORIGIN/api/connect/v1/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-BMM-Client-ID: $BMM_CLIENT_ID" \
  -H "X-BMM-API-Key: $BMM_API_KEY"
```

```json
{ "disconnected": true }
```

Revoke remotely before deleting local credentials. Retry transient failures; do not show a successful remote disconnect merely because you cleared your database. Creators can always revoke through BMM → Share → Connected apps. A revoked connection invalidates its API access and attributed support link; it does not delete the account or financial history. Reconnecting creates a new grant and source; old credentials never reactivate. Existing provider checkouts may settle after disconnection and retain their original attribution. Recovery checkouts require an active connection.

## Errors and recovery

BMM wrapper/resource errors have this shape:

```json
{ "error": "This creator has not shared their settled earnings." }
```

Provider OAuth errors can instead use an OAuth code plus description, for example:

```json
{ "error": "invalid_grant", "error_description": "The authorization grant is invalid." }
```

Descriptions are diagnostic and may change; use status and OAuth error code rather than matching text. Invalid grants do not all have the same HTTP status.

| Status | Meaning / action |
| --- | --- |
| 400 | Invalid callback, unavailable application, expired/invalid authorization or grant. Check configuration or restart Connect. |
| 401 | Wrong/rotated API key, expired access, or revoked connection. Refresh before known expiry; otherwise check credentials and reconnect. Do not loop. |
| 403 on support | Earnings not shared. Hide earnings and counts. |
| 404 | Connect disabled or resource unavailable. Check the correct BMM environment. |
| 410 at checkout | Source revoked or does not belong to the creator. Offer the ordinary profile URL. |
| 413 | Request too large. Correct the request. |
| 429 | Back off; current limits use minute windows. Avoid refresh/reconnect loops. |
| 500 / 503 / network error | Temporary failure or server configuration problem. Retry reads with backoff. Treat code/refresh exchanges as potentially consumed if the outcome is uncertain. |

Read responses must not be publicly cached. Keep credentials out of URLs, browser storage and logs. Authorization callbacks necessarily contain a short-lived code; redact callback query strings in access logs. Never log token endpoint responses.

## Operator setup and validation

Apply all committed migrations and use a stable `BETTER_AUTH_SECRET`. BMM Connect is available to all signed-in users; applications still require admin approval. Production requires HTTPS. New partner access should use the Developers request/approval dashboard. The legacy admin-only `/api/admin/connect` management API remains available for manually provisioned clients; it is not a public registration endpoint.

Maintainers can follow `docs/bmm-connect-testing.md` for exact local setup commands.

For a safe local walkthrough, use a dedicated BMM process and **`buymeamalt_test`** database, sandbox environment, and no Bachs key. The repository's `scripts/setup-connect-starter.ts` provisions only that test database, creates local-only login fixtures without sending email, and writes test credentials to the starter’s ignored `.env.local`. It refuses non-test databases and non-loopback origins. Do not run destructive integration suites against this database while a walkthrough is active.

Run the starter’s SDK tests and production build, the BMM integration suite, and `scripts/test-connect-starter.mjs` against the two local test servers. Hosted tests cover consent, account binding, callback tampering, replay, isolation, permissions and revocation without payments. Payment settlement testing remains separate. No deployment is authorized by these checks.

## Update your website or callback

Approved, active applications can use **Developers → Edit website & callback** to submit new URLs for admin review. Your existing URLs, API key and creator connections remain active while the request is pending. Only one URL request can be pending at a time.

Approval updates the existing application, keeping that application’s ID and credentials. The approved callback list replaces the previous list for new authorization requests; update your platform configuration and restart any in-progress connection attempts. Your copyable starter configuration reflects the approved callback. Rejection keeps the existing URLs and lets you submit another request. HTTPS and exact callback matching still apply; localhost HTTP is allowed only in sandbox.


## Multiple applications, Live and Sandbox

Use the **Live** and **Sandbox** tabs in Developers, then **Add application** for each game or website. Names must be unique within your account and environment. The same game can have separate Live and Sandbox applications. Each application is independently reviewed and has its own client ID, API key, callback list, creator approvals and earnings attribution. Rotating, suspending or revoking one application does not affect another.

Register up to **10 exact callback URLs**, one per line. Live URLs require HTTPS. Sandbox additionally allows HTTP on `localhost` and `127.0.0.1`. Wildcards, URL fragments, embedded credentials and duplicate callbacks are rejected. Choose one approved callback in the copyable starter configuration; authorization requests must match it exactly. Callback changes use the existing admin review workflow.

Both tabs use the displayed BMM origin. The client ID determines the Connect environment; do not add an environment override to API requests. Approval and token exchange work for both environments on the same deployment. Creators see the environment during consent and can revoke either environment in Share → Connected apps.

The real creator response includes `environment: "live"` or `"sandbox"`. Earnings queries return only payments attributed to that exact application and environment, never another game's or environment's records. `profile_url` and `support_url` are `null` when the connection environment does not match the deployment's payment environment. In particular, Sandbox applications on a live-payment deployment cannot open live checkout, even if someone constructs a URL using their attribution reference. Sandbox connection testing is available immediately after approval; simulated payments still require a deployment configured with Bachs sandbox credentials. Empty sandbox earnings are not populated with fictional payment records.

## Archive an application

In Developers, select the application's Live or Sandbox tab, choose the application, and select **Archive application**. Confirm the displayed name and environment. Archiving immediately disables its credentials and sample access, revokes its OAuth and hosted creator connections, invalidates unfinished connection attempts and stops its attributed support links. Other applications are unaffected.

Archived applications remain visible as inactive rows with an Archived badge. Open View archived and confirm Unarchive application to restore the previous approval state. Prior admin suspensions remain in force. Older archives without saved suspension state remain disabled until an admin reviews them. Creators must reconnect; revoked permissions, old support links and unfinished attempts are never restored.

Existing payments and earnings attribution records remain intact; archiving does not change creator balances or withdrawals. The application, credentials and connection records are retained for history. If another active application uses the same name in the same environment, archive that application before restoring the original.
