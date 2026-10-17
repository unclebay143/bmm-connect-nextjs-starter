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
      <p className="eyebrow">BMM Connect</p>
      <h1>{data ? "You’re connected." : "Good work deserves a malt."}</h1>
      <p className="intro">
        {data
          ? "Your Buy Me a Malt page is connected to this platform."
          : "Connect BMM to receive support from your community."}
      </p>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {data ? (
        <section className="connection-card">
          <div className="connection-heading">
            <div className="creator-identity">
              <span className="creator-avatar" aria-hidden="true">
                {(data.creator.display_name || data.creator.username)
                  .slice(0, 1)
                  .toUpperCase()}
              </span>
              <div>
                <h2>{data.creator.display_name || data.creator.username}</h2>
                <p className="hint">@{data.creator.username}</p>
              </div>
            </div>
            <div className="connection-badges">
              <span className="badge">Connected</span>
              {data.creator.environment === "sandbox" && (
                <span className="badge sandbox-badge">Sandbox</span>
              )}
            </div>
          </div>
          <div className="actions">
            {data.creator.support_url && (
              <a
                className="button"
                href={data.creator.support_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Buy me a malt (opens in a new tab)"
              >
                Buy me a malt ↗
              </a>
            )}
            <form action="/api/bmm/disconnect" method="post">
              <button className="secondary" type="submit">
                Disconnect BMM
              </button>
            </form>
          </div>
          <p className="hint">
            {data.creator.support_url
              ? "Opens your BMM page in a new tab. Support is attributed to this app."
              : "Connected for testing. A payment link isn’t available in this environment."}
          </p>
          <Earnings support={data.support} />
        </section>
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
        {bmmOrigin && (
          <a
            href={`${bmmOrigin}/dashboard/share?tab=connected-apps`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Manage connections ↗
          </a>
        )}
      </footer>
    </main>
  );
}
