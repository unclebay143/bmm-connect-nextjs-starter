import { bmm } from "../../../../lib/bmm.mjs";
import { getPartnerUserId } from "../../../../lib/session.mjs";
import { config } from "../../../../lib/config.mjs";
export const runtime = "nodejs";
export async function POST(request) {
  if (request.headers.get("origin") !== config().app)
    return new Response("Invalid origin", { status: 403 });
  // The standalone example creates a browser identity. Real apps use their login.
  await getPartnerUserId(true);
  return bmm().handlers.connect(request);
}
