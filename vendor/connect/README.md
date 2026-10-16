# BMM Connect SDK (local, unpublished)

Optional server-only JavaScript SDK for BMM-hosted connections. BMM Connect itself is a platform-agnostic HTTP API: other languages and frameworks can call it directly without this package. The core SDK does not require Next.js; only the optional Next adapter does. No database adapter or persistent BMM tokens. Node.js 22+, Next.js 16+ for the Next adapter. The starter bundles this package; no npm publication is implied.

```js
import { createBmmConnect } from "@buymeamalt/connect/next";
export const bmm = createBmmConnect({
  origin: process.env.BMM_ORIGIN,
  clientId: process.env.BMM_CLIENT_ID,
  apiKey: process.env.BMM_API_KEY,
  callbackUrl: process.env.BMM_REDIRECT_URI,
  getUserId: async () => (await auth())?.user.id,
});
```

Export `bmm.handlers.connect` as POST at /api/bmm/connect, `.callback` as GET at your registered callback, and `.disconnect` as POST at /api/bmm/disconnect. Use a POST form with a Connect BMM button. Server components call `bmm.getConnection()` and optionally `bmm.getEarnings()`. No method accepts a browser-selected user ID. `getConnection()` returns null for an unconnected user; earnings without consent throws BmmError with status 403. Missing partner login throws status 401/message session. API failures include status for handling; no response body or credentials are exposed in errors.

The Next adapter supplies HttpOnly callback cookies and same-origin POST checks. The core API exposes begin/complete for other server frameworks; those frameworks must store the returned pending cookie HttpOnly/SameSite=Lax/Secure on HTTPS, clear it at callback, enforce same-origin starts/disconnects, and keep the same authenticated user. Never send application credentials to browsers. Key rotation invalidates pending cookies, not active hosted connections. Restart an interrupted handshake.

Callbacks return to the application's root with a status query for UI feedback. A connection is activated only after the callback validates state, issuer, browser, current partner user and PKCE. Starting again invalidates earlier unfinished attempts. For multiple apps create separate instances with the matching credentials/callbacks.
