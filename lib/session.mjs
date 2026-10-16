// Demo identity only. Replace getPartnerUserId with your existing auth session.
import { cookies } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { config } from "./config.mjs";
const name = "bmm_example_identity";
function signature(value) {
  return createHmac("sha256", config().key)
    .update(`example-identity:${value}`)
    .digest("base64url");
}
export async function getPartnerUserId(create = false) {
  const jar = await cookies(),
    raw = jar.get(name)?.value;
  if (raw && raw.length < 300) {
    const [id, expiry, mac, ...extra] = raw.split(".");
    const expected = signature(`${id}.${expiry}`);
    if (
      extra.length === 0 &&
      /^[a-f0-9-]{36}$/.test(id) &&
      Number(expiry) > Date.now() &&
      mac?.length === expected.length &&
      timingSafeEqual(Buffer.from(mac), Buffer.from(expected))
    )
      return `example:${id}`;
  }
  if (!create) return null;
  const id = randomUUID(),
    value = `${id}.${Date.now() + 30 * 86400000}`;
  jar.set(name, `${value}.${signature(value)}`, {
    httpOnly: true,
    secure: config().app.startsWith("https:"),
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 86400,
  });
  return `example:${id}`;
}
