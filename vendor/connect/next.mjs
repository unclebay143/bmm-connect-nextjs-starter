import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { createBmmConnect as createCore, BmmError } from "./index.mjs";
export { BmmError };
export function createBmmConnect(options) {
  const core = createCore(options),
    callback = new URL(options.callbackUrl);
  const cookieName = `bmm_pending_${createHash("sha256")
    .update(options.clientId + callback.href)
    .digest("hex")
    .slice(0, 16)}`;
  const cookieOptions = {
    httpOnly: true,
    secure: callback.protocol === "https:",
    sameSite: "lax",
    path: callback.pathname,
    maxAge: 600,
  };
  function home(status) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: new URL(
          `/?status=${encodeURIComponent(status)}`,
          callback.origin,
        ).href,
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  }
  function checkOrigin(req) {
    if (req.headers.get("origin") !== callback.origin)
      throw new BmmError(403, "origin");
  }
  return {
    ...core,
    handlers: {
      async connect(req) {
        try {
          checkOrigin(req);
          const { url, cookie } = await core.begin();
          (await cookies()).set(cookieName, cookie, cookieOptions);
          return new Response(null, {
            status: 303,
            headers: {
              Location: url,
              "Cache-Control": "no-store",
              "Referrer-Policy": "no-referrer",
            },
          });
        } catch (error) {
          return home(
            error instanceof BmmError ? error.message : "unavailable",
          );
        }
      },
      async callback(req) {
        try {
          const jar = await cookies();
          const cookie = jar.get(cookieName)?.value;
          // Consume locally even on failure. BMM atomically consumes the code too.
          jar.set(cookieName, "", { ...cookieOptions, maxAge: 0 });
          await core.complete(req.url, cookie);
          return home("connected");
        } catch (error) {
          return home(
            error instanceof BmmError ? error.message : "unavailable",
          );
        }
      },
      async disconnect(req) {
        try {
          checkOrigin(req);
          await core.disconnect();
          (await cookies()).set(cookieName, "", {
            ...cookieOptions,
            maxAge: 0,
          });
          return home("disconnected");
        } catch (error) {
          return home(
            error instanceof BmmError ? error.message : "unavailable",
          );
        }
      },
    },
  };
}
