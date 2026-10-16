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
      <Link href="/">← Back to your connection</Link>
      {data?.creator.support_url ? (
        <section>
          <h1>
            Open the{" "}
            {data.creator.environment === "sandbox" ? "sandbox" : "live"} BMM
            support page?
          </h1>
          <p>
            You’re about to open{" "}
            {data.creator.display_name || data.creator.username}’s BMM profile
            to buy them a malt.
          </p>
          <p>
            When a payment through this link is successfully verified, BMM
            attributes it to this partner application. The creator receives the
            support; attribution does not transfer their earnings to the
            partner.
          </p>
          <p className="hint">
            BMM handles checkout and payments. Opening the page does not charge
            you. You can switch back to your game or platform tab at any time.
          </p>
          <a
            className="button"
            href={data.creator.support_url}
            rel="noreferrer"
          >
            Continue to BMM ↗
          </a>
        </section>
      ) : data ? (
        <section>
          <h1>No payment link for this connection</h1>
          <p>
            Your connection is active, but its environment does not match this
            BMM deployment’s payment environment. Sandbox connections cannot
            open live checkout.
          </p>
          <Link className="button" href="/">
            Back to your connection
          </Link>
        </section>
      ) : (
        <section>
          <h1>Connect BMM first</h1>
          <p>
            A current creator connection is required to open an attributed
            support page.
          </p>
          <Link className="button" href="/">
            Back to Connect BMM
          </Link>
        </section>
      )}
    </main>
  );
}
