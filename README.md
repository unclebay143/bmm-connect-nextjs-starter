# BMM Connect: Next.js starter

Connect a creator's BMM account to your platform, display their attributed support link, and optionally show earnings generated through your application. BMM handles sign-in, registration, consent, payments and withdrawals.

**Next.js is an example, not a BMM Connect requirement.** BMM Connect is a platform-agnostic HTTP API that you can call from PHP, Python, Go, Node.js or another backend. Use `API.md` to integrate with your existing stack. The Node.js/Next.js requirements below apply only to this runnable example; the core JavaScript SDK also works without the Next.js adapter.

The starter uses BMM-hosted connections. **No database, encryption key, access-token storage or refresh-token handling is required.** It includes the local, unpublished SDK in `vendor/connect`; `npm install` installs it from there.

## Get the starter

Download and extract the starter from **BMM → Developers → Integration guide**, or clone the same example from [GitHub](https://github.com/unclebay143/bmm-connect-nextjs-starter):

```sh
git clone https://github.com/unclebay143/bmm-connect-nextjs-starter.git
cd bmm-connect-nextjs-starter
```

**The repository is private for now.** Authenticate Git with a GitHub account that has repository access. BMM developer approval does not automatically grant GitHub access. If your account has not been granted access, use the dashboard download instead. Both options include the SDK source and the runnable example; no npm publication is required.

## Run locally

### 1. Register your application

In **BMM → Developers → Sandbox**, register these URLs:

```text
Website: http://localhost:3090
Callback: http://localhost:3090/api/bmm/callback
```

Wait for approval, then generate your application API key. Live applications require HTTPS.

### 2. Configure the starter

Use Node.js 22.13 or later. In the starter folder, create your local configuration:

```sh
cp .env.example .env.local
```

Copy the approved environment configuration from **Developers → Manage** into `.env.local`. Replace the API-key placeholder with your generated key:

```dotenv
# Use the BMM origin shown in Developers.
BMM_ORIGIN=https://your-bmm-origin.example
BMM_CLIENT_ID=your-approved-client-id
BMM_API_KEY=your-generated-api-key
APP_ORIGIN=http://localhost:3090
BMM_REDIRECT_URI=http://localhost:3090/api/bmm/callback
```

All five settings are required. Keep credentials server-side and never prefix them with `NEXT_PUBLIC_`. You do not need to request a separate sandbox origin.

`BMM_DEMO_TOKEN` is obsolete and is not read by this starter. Remove it from older configurations. No command or extra secret is needed to generate it.

### 3. Install and run

```sh
npm install
npm run dev
```

Open [http://localhost:3090](http://localhost:3090) using the exact host registered above.

### 4. Try the connection

1. Click **Connect BMM**.
2. Sign in or register on BMM, then approve access and choose whether to share earnings.
3. Return to the starter to see the connected profile.
4. Click **Buy me a malt** when a support link is available. It opens the support notice and attributed BMM profile in a new tab, keeping your platform open.
5. Disconnect in the starter or in **BMM → Share → Connected apps**. Further authorised reads stop immediately.

The starter uses real connections only. Test with a Sandbox application; it does not include a fictional preview page.

## Connect your own user session

The standalone example uses a signed HttpOnly browser identity in `lib/session.mjs` so you can try the complete journey without adding a login system. It is **not a production login**: another browser gets a different demo identity, clearing cookies loses the identity, and key rotation invalidates this demonstration identity. Revoke orphaned demo connections in BMM → Share → Connected apps.

Replace `getPartnerUserId` with your platform's existing authenticated session:

```js
export async function getPartnerUserId() {
  return (await auth())?.user.id ?? null;
}
```

Remove the demo identity creation in `app/api/bmm/connect/route.js` and export the SDK connect handler. Do not take this ID from form data, search parameters, browser headers or a fixed shared user. Keep IDs stable and do not reuse a deleted user's ID for someone else. Unauthenticated users must log in to your platform before connecting.

`lib/bmm.mjs` configures the SDK. The three small route files expose connect, callback and disconnect. The SDK reads the authenticated user for every operation; you do not pass a user ID to `getConnection()`, `getEarnings()` or `disconnect()`.

## Host the example on your chosen provider

Host this example on a service that supports its Node.js/Next.js runtime, and set the environment variables in that service’s server configuration. BMM Connect itself does not require that runtime or any specific host. Register your exact HTTPS website and callback in BMM Developers (up to ten callbacks per application). Use a stable deployment domain; wildcard callbacks are not supported. Configure your test and production environments with the intended Sandbox or Live application's separate credentials. Set the project root to this starter if deploying from a monorepo.

No filesystem persistence or database add-on is needed for BMM connections. Your own authentication system still manages its existing users/sessions. The SDK uses a short-lived HttpOnly cookie for callback verification; BMM stores the persistent connection. Keep your server-rendered user data private and uncached. This repository does not deploy automatically.

## Security and behaviour

The SDK checks the authenticated user, browser state, exact callback and issuer (`BMM_ORIGIN/api/connect/hosted`), and exchanges a single-use code with PKCE. A changed user/browser, stale tab, duplicate parameters or expired attempt fails closed. Starting again invalidates previous unfinished attempts. Callback attempts expire in ten minutes. Key rotation invalidates unfinished handshakes; active connections remain on BMM.

A creator can have one active hosted account mapping per application. Completing a new mapping replaces the old hosted mapping, with fresh consent. OAuth integrations remain supported separately; their issuer is still `BMM_ORIGIN/api/auth`.

The API key authenticates your application. BMM's saved consent authorises profile access and optional earnings. Your server is trusted to identify the partner user; never expose credentials or an unauthenticated arbitrary-user lookup. Earnings 403 means not shared, not zero. Amounts are integer minor units and each currency is displayed separately. Refund deductions are already included by BMM. Withdrawals do not reduce these lifetime integration-specific earnings.

Sandbox connections cannot open live checkout on a live-payment BMM deployment; in that case support URLs are null. No payment or withdrawal code runs in this starter.

## Validate

```sh
npm test
npm run build
```

Manually verify connect, denial, optional earnings, disconnect from both sides, stale callbacks and a changed partner login. Read `API.md` for copyable hosted requests and the backwards-compatible OAuth reference.
