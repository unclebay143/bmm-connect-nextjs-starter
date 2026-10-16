import { bmm } from "../../../../lib/bmm.mjs";
export const runtime = "nodejs";
export async function POST(request) {
  return bmm().handlers.disconnect(request);
}
