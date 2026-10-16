# BMM Connect — Next.js starter

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

1. In BMM Developers → Sandbox, register an application with website `http://localhost:3090` and callback `http://localhost:3090/api/bmm/callback`. Live apps require HTTPS. Wait for approval, then generate your application API key.
2. Download and extract the starter, or clone it as shown above. Copy the approved environment configuration from Developers into `.env.local`, replacing the API-key placeholder. There is no need to ask BMM for a separate sandbox origin.
3. With Node.js 22.13 or later, run `npm install` and `npm run dev`. Open `http://localhost:3090` (use the exact host you registered).
4. Click **Connect BMM**, sign in/register on BMM and choose permissions. Return to your connected profile. Click **Buy me a malt** to open a new tab with the notice, then continue to the attributed BMM support page in that tab. The original game/platform tab stays open; checkout keeps its existing BMM return flow.
5. Disconnect here or in BMM → Developers (Connected badge). Later reads stop working immediately after revocation.

`BMM_ORIGIN`, `BMM_CLIENT_ID`, `BMM_API_KEY`, `APP_ORIGIN` and `BMM_REDIRECT_URI` are required. All secrets are server-only; never use `NEXT_PUBLIC_`.

## Optional: local sample data

Run `npm install` and `npm run dev`, then open `http://localhost:3090/preview` or choose **Sample data preview** on the homepage. The preview works without `.env.local`, application approval, an API key or a token. Real connections still require the configuration above.

Edit `lib/sample-data.mjs` to try different fictional profiles and earnings. This page makes no BMM API requests, changes no connection records and has no payment link. It does not test authentication, consent, attribution or settlement; use Sandbox for the real connection flow. Any old `BMM_DEMO_TOKEN` setting can be removed.

## Connect your own user session

The standalone example uses a signed HttpOnly browser identity in `lib/session.mjs` so you can try the complete journey without adding a login system. It is **not a production login**: another browser gets a different demo identity, clearing cookies loses the identity, and key rotation invalidates this demonstration identity. Revoke orphaned demo connections in BMM → Developers (Connected badge).

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

Sandbox connections cannot open live checkout on a live-payment BMM deployment; in that case support URLs are null. Sample data preview is separate, contains fixed fictional earnings, and cannot take payments. No payment or withdrawal code runs in this starter.

## Validate

Run `npm test` and `npm run build`. Manually verify connect, denial, optional earnings, disconnect from both sides, stale callbacks and a changed partner login. Read `API.md` for copyable hosted requests and the backwards-compatible OAuth reference.
