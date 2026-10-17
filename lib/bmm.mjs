import { createBmmConnect } from "buymeamalt/next";
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
