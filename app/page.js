import Link from "next/link";
import { overview } from "../lib/bmm.mjs";
import { config } from "../lib/config.mjs";
import Earnings from "./earnings";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const messages = {
  connected: "BMM connected.",
  disconnected: "BMM disconnected.",
  denied: "Connection cancelled. Try again whenever you’re ready.",
  state: "This attempt expired or belongs to another session. Connect again.",
  issuer: "Check BMM_ORIGIN in your configuration, then reconnect.",
  session: "Sign in to your platform, then connect again.",
  reconnect: "Access ended. Connect again.",
  rate_limit: "Too many requests. Try again shortly.",
  origin: "Use the address configured in APP_ORIGIN.",
  unavailable:
    "Couldn’t complete the request. Check your credentials and try again.",
};
export default async function Page({ searchParams }) {
  let data = null,
    problem = "",
    bmmOrigin = "";
  try {
    bmmOrigin = config().bmm;
    data = await overview();
  } catch (error) {
    problem = messages[error.message] || messages.unavailable;
  }
  const notice = problem || messages[(await searchParams).status];
  return (
    <main>
      <p className="eyebrow">BMM Connect · Example</p>
      <h1>{data ? "You’re connected." : "Good work deserves a malt."}</h1>
      <p className="intro">
        {data
          ? "Your support link is ready to share."
          : "Connect BMM to receive support from your community."}
      </p>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {data ? (
        <>
          <section>
            <span className="badge">{data.creator.environment || "Live"}</span>
            <h2>{data.creator.display_name || data.creator.username}</h2>
            <p>@{data.creator.username}</p>
            <div className="actions">
              {data.creator.support_url && (
                <Link
                  className="button"
                  href="/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Buy me a malt (opens in a new tab)"
                >
                  Buy me a malt ↗
                </Link>
              )}
              <form action="/api/bmm/disconnect" method="post">
                <button className="secondary" type="submit">
                  Disconnect BMM
                </button>
              </form>
            </div>
            <p className="hint">
              {data.creator.support_url
                ? "Opens in a new tab. Support is attributed to this application."
                : "Connected for testing. A payment link isn’t available in this environment."}
            </p>
          </section>
          <Earnings support={data.support} />
        </>
      ) : (
        <section>
          <h2>Connect your BMM account</h2>
          <p>Sign in on BMM and choose what to share.</p>
          <form action="/api/bmm/connect" method="post">
            <button type="submit">Connect BMM →</button>
          </form>
          <p className="hint">Read-only access. Disconnect anytime.</p>
        </section>
      )}
      <footer className="example-footer">
        <Link href="/preview">Sample data preview →</Link>
        {bmmOrigin && (
          <a
            href={`${bmmOrigin}/dashboard/developers?view=connections`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Manage connections ↗
          </a>
        )}
      </footer>
      <details className="example-note">
        <summary>About this example</summary>
        <p className="hint">
          This demo uses a browser identity. Use your platform’s signed-in user
          for production. See README.md for setup.
        </p>
      </details>
    </main>
  );
}
