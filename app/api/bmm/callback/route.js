import { bmm } from "../../../../lib/bmm.mjs";
export const runtime = "nodejs";
export async function GET(request) {
  return bmm().handlers.callback(request);
}
