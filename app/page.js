import Link from "next/link";
import { overview } from "../lib/bmm.mjs";
import { config } from "../lib/config.mjs";
import Earnings from "./earnings";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const messages = {
  setup:
    "Check your approved application credentials and callback URL in .env.local.",
  demo_expired:
    "Sample data access was rejected. Check your application credentials, or generate a new preview token in BMM → Developers and update BMM_DEMO_TOKEN.",
  demo_invalid: "BMM_DEMO_TOKEN must be a preview token from BMM → Developers.",
  connected: "Your BMM account is connected.",
  disconnected: "Your BMM connection has been revoked.",
  denied: "You chose not to connect. You can try again whenever you’re ready.",
  state:
    "This connection attempt expired or belongs to another browser. Start again from this page.",
  issuer:
    "The callback issuer did not match the configured BMM server. Check BMM_ORIGIN and start again.",
  session: "This browser session expired. Start a new connection.",
  reconnect:
    "Access has expired or been revoked. Connect again. If this persists, check your application’s API key and approval status.",
  busy: "Another request is updating this connection. Reload in a moment.",
  rate_limit: "BMM is receiving too many requests. Wait a minute, then reload.",
  already_connected: "Disconnect this account before connecting another.",
  origin:
    "The request origin did not match APP_ORIGIN. Use the configured address.",
  unavailable:
    "We couldn’t complete the request. Check your server configuration and try again. If disconnect failed, you can revoke access in BMM → Connected Apps.",
};
export default async function Page({ searchParams }) {
  let data = null,
    problem = "",
    bmmOrigin = "";
  try {
    bmmOrigin = config().bmm;
    data = await overview();
  } catch (error) {
    problem = false
      ? messages.setup
      : messages[error.message] || messages.unavailable;
  }
  const notice = problem || messages[(await searchParams).status];
  return (
    <main>
      <p className="eyebrow">Your platform · BMM Connect starter</p>
      <h1>Good work deserves a malt.</h1>
      <p className="hint">
        This example identifies your browser for testing. In your own app, use
        your signed-in user’s session.
      </p>
      <p className="intro">
        Connect your BMM account to this platform. Your Buy me a malt button
        opens your BMM profile with this platform’s attribution.
      </p>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {data ? (
        <>
          <section>
            <span className="badge">
              Connected · {data.creator.environment || "Live"}
            </span>
            <h2>{data.creator.display_name || data.creator.username}</h2>
            <p>@{data.creator.username}</p>
            {data.creator.support_url ? (
              <Link
                className="button"
                href="/support"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Buy me a malt (opens in a new tab)"
              >
                Buy me a malt ↗
              </Link>
            ) : (
              <p className="notice">
                Your {data.creator.environment || "BMM"} connection is working.
                Its environment does not match this deployment’s payment
                environment, so no payable support link is exposed.
              </p>
            )}
            <p className="hint">
              {data.creator.support_url
                ? "Opens the support flow in a new tab so your game or platform stays open. Completed payments through that link are attributed to this application."
                : "Use Sample data preview to explore example earnings. Live applications have separate credentials and connections."}
            </p>
          </section>
          <Earnings support={data.support} />
          <section>
            <h2>You’re in control</h2>
            <p>
              Disconnecting revokes this application’s access and attributed
              link. Your BMM account and payment history stay intact.
            </p>
            <form action="/api/bmm/disconnect" method="post">
              <button className="secondary" type="submit">
                Disconnect BMM
              </button>
            </form>
          </section>
        </>
      ) : (
        <section>
          <h2>Connect BMM to your platform</h2>
          <ol>
            <li>Sign in or create your BMM account.</li>
            <li>
              Approve profile access and choose whether to share earnings.
            </li>
            <li>Return here with your attributed BMM profile link.</li>
          </ol>
          <form action="/api/bmm/connect" method="post">
            <button type="submit">Connect BMM →</button>
          </form>
          <p className="hint">
            BMM handles authentication, treats, payments and withdrawals.
          </p>
        </section>
      )}
      <section>
        <h2>Just exploring?</h2>
        <p>
          Preview a fictional profile and sample earnings without connecting an
          account. Your real connection stays unchanged.
        </p>
        <Link className="secondary button" href="/preview">
          Preview sample data →
        </Link>
      </section>
      {bmmOrigin && (
        <a
          className="footer"
          href={`${bmmOrigin}/dashboard/connected-apps`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Manage connections on BMM ↗
        </a>
      )}
    </main>
  );
}
