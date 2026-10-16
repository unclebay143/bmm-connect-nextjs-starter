import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
const random = () => randomBytes(32).toString("base64url");
const equal = (a, b) =>
  typeof a === "string" &&
  typeof b === "string" &&
  Buffer.byteLength(a) === Buffer.byteLength(b) &&
  timingSafeEqual(Buffer.from(a), Buffer.from(b));
export class BmmError extends Error {
  constructor(status, message = "unavailable") {
    super(message);
    this.status = status;
  }
}
export function createBmmConnect(options) {
  if (typeof window !== "undefined")
    throw Error("BMM credentials must stay server-side.");
  const { apiKey, clientId, getUserId, callbackUrl, origin } = options;
  if (!apiKey || !clientId || typeof getUserId !== "function")
    throw Error("BMM application credentials and getUserId are required.");
  const base = new URL(origin),
    callback = new URL(callbackUrl);
  for (const url of [base, callback]) {
    if (
      url.username ||
      url.password ||
      url.hash ||
      !(
        url.protocol === "https:" ||
        (url.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(url.hostname))
      )
    )
      throw Error("Use HTTPS (HTTP localhost is supported).");
  }
  if (base.pathname !== "/" || base.search || callback.search)
    throw Error("Invalid BMM origin or callback URL.");
  const signingKey = createHmac("sha256", apiKey)
    .update(`bmm-hosted-v1:${clientId}:${callback.href}`)
    .digest();
  const sign = (value) =>
    createHmac("sha256", signingKey).update(value).digest("base64url");
  async function user() {
    const id = await getUserId();
    if (typeof id !== "string" || !id || id.length > 256)
      throw new BmmError(401, "session");
    return id;
  }
  async function api(path, method, userId, body) {
    const response = await fetch(`${base.origin}/api/connect/hosted/${path}`, {
      method,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        "Content-Type": "application/json",
        "X-BMM-Client-ID": clientId,
        "X-BMM-API-Key": apiKey,
        "X-BMM-User-ID": userId,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok)
      throw new BmmError(
        response.status,
        response.status === 429 ? "rate_limit" : "unavailable",
      );
    return response.json();
  }
  function unpack(cookie) {
    if (typeof cookie !== "string" || cookie.length > 4000)
      throw new BmmError(400, "state");
    const parts = cookie.split(".");
    if (parts.length !== 2 || !equal(sign(parts[0]), parts[1]))
      throw new BmmError(400, "state");
    let value;
    try {
      value = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    } catch {
      throw new BmmError(400, "state");
    }
    if (!Number.isFinite(value.expiresAt) || value.expiresAt <= Date.now())
      throw new BmmError(400, "state");
    return value;
  }
  return {
    async begin() {
      const id = await user(),
        state = random(),
        verifier = random();
      const result = await api("start", "POST", id, {
        partner_user_id: id,
        redirect_uri: callback.href,
        state,
        code_challenge: createHash("sha256")
          .update(verifier)
          .digest("base64url"),
      });
      const url = new URL(result.authorization_url);
      if (url.origin !== base.origin || url.pathname !== "/connect/login")
        throw new BmmError(502);
      const payload = Buffer.from(
        JSON.stringify({
          userId: id,
          state,
          verifier,
          expiresAt: Date.now() + 600000,
        }),
      ).toString("base64url");
      return { url: url.href, cookie: `${payload}.${sign(payload)}` };
    },
    async complete(url, cookie) {
      const id = await user(),
        pending = unpack(cookie),
        received = new URL(url);
      if (
        received.origin !== callback.origin ||
        received.pathname !== callback.pathname ||
        received.hash ||
        pending.userId !== id
      )
        throw new BmmError(400, "state");
      const q = received.searchParams;
      for (const key of ["state", "iss"])
        if (q.getAll(key).length !== 1) throw new BmmError(400, "state");
      if (!equal(q.get("state"), pending.state))
        throw new BmmError(400, "state");
      if (q.get("iss") !== `${base.origin}/api/connect/hosted`)
        throw new BmmError(400, "issuer");
      if (q.has("error")) {
        if (q.getAll("error").length !== 1 || q.has("code"))
          throw new BmmError(400, "state");
        throw new BmmError(
          400,
          q.get("error") === "access_denied" ? "denied" : "unavailable",
        );
      }
      if (
        q.getAll("code").length !== 1 ||
        !/^[A-Za-z0-9_-]{43}$/.test(q.get("code"))
      )
        throw new BmmError(400, "state");
      return api("complete", "POST", id, {
        partner_user_id: id,
        redirect_uri: callback.href,
        code: q.get("code"),
        code_verifier: pending.verifier,
      });
    },
    async getConnection() {
      let result;
      try {
        result = await api("me", "GET", await user());
      } catch (error) {
        if (error.status === 404) return null;
        throw error;
      }
      return result.creator;
    },
    async getEarnings() {
      return (await api("me/support", "GET", await user())).support;
    },
    async disconnect() {
      return api("me", "DELETE", await user());
    },
  };
}
