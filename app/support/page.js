import Link from "next/link";
import { overview } from "../../lib/bmm.mjs";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function Support() {
  let data;
  try {
    data = await overview();
  } catch {
    data = null;
  }
  return (
    <main>
      <Link href="/">← Your connection</Link>
      {data?.creator.support_url ? (
        <section>
          <p className="eyebrow">
            {data.creator.environment === "sandbox"
              ? "Sandbox support"
              : "Live support"}
          </p>
          <h1>
            Buy {data.creator.display_name || data.creator.username} a malt.
          </h1>
          <p>
            You’ll continue to their BMM page. Verified payments are attributed
            to this application; the creator receives the support.
          </p>
          <a
            className="button"
            href={data.creator.support_url}
            rel="noreferrer"
          >
            Continue to BMM ↗
          </a>
          <p className="hint">Your game stays open in its original tab.</p>
        </section>
      ) : (
        <section>
          <h1>{data ? "No payment link yet." : "Connect BMM first."}</h1>
          <p>
            {data
              ? "This connection is for testing in a different payment environment."
              : "Connect an account to get its support link."}
          </p>
          <Link className="button" href="/">
            Back to your connection
          </Link>
        </section>
      )}
    </main>
  );
}
