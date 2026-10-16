import { createBmmConnect, BmmError } from "@buymeamalt/connect/next";
import { config } from "./config.mjs";
import { getPartnerUserId } from "./session.mjs";
export function bmm() {
  const c = config();
  return createBmmConnect({
    origin: c.bmm,
    clientId: c.clientId,
    apiKey: c.key,
    callbackUrl: c.callback,
    getUserId: getPartnerUserId,
  });
}
export async function overview() {
  if (!(await getPartnerUserId())) return null;
  const client = bmm(),
    creator = await client.getConnection();
  if (!creator) return null;
  let support = null;
  if (creator.earnings_shared) {
    try {
      support = await client.getEarnings();
    } catch (error) {
      if (error.status !== 403) throw error;
      creator.earnings_shared = false;
    }
  }
  return { creator, support };
}
export async function demoOverview() {
  const c = config();
  if (!c.demoToken) throw Error("demo_missing");
  async function api(path) {
    const response = await fetch(`${c.bmm}/api/connect/v1/${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${c.demoToken}`,
        "X-BMM-Client-ID": c.clientId,
        "X-BMM-API-Key": c.key,
      },
    });
    if (!response.ok) {
      if (response.status === 401) throw Error("demo_expired");
      throw new BmmError(response.status);
    }
    return response.json();
  }
  const { creator } = await api("me");
  if (creator.id !== "demo_creator") throw Error("demo_invalid");
  return { creator, support: (await api("me/support")).support };
}
