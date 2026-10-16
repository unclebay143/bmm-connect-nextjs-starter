import Link from "next/link";
import { demoOverview } from "../../lib/bmm.mjs";
import { config } from "../../lib/config.mjs";
import Earnings from "../earnings";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function Preview() {
  let data = null,
    message = "";
  try {
    if (!config().demoToken)
      message =
        "Optional: generate a preview token in BMM Developers and set BMM_DEMO_TOKEN in .env.local to load sample data.";
    else data = await demoOverview();
  } catch {
    message =
      "Sample data couldn’t be loaded. Check your API key and preview token in .env.local. Expired preview tokens can be replaced in BMM Developers.";
  }
  return (
    <main>
      <Link href="/">← Back to Connect BMM</Link>
      <p className="eyebrow">Optional preview · Sample data</p>
      <h1>Explore the API responses</h1>
      <p className="intro">
        This fictional creator has no live profile or payment link. Connect your
        own account to try the real support journey.
      </p>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {data && (
        <>
          <section>
            <span className="badge">Fictional creator</span>
            <h2>{data.creator.display_name}</h2>
            <p>@{data.creator.username}</p>
          </section>
          <Earnings support={data.support} preview />
        </>
      )}
      <Link className="button" href="/">
        Connect your BMM account →
      </Link>
    </main>
  );
}
