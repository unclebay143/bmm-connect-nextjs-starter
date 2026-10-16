import Link from "next/link";
import { sampleOverview } from "../../lib/sample-data.mjs";
import Earnings from "../earnings";
export default function Preview() {
  return (
    <main>
      <Link href="/">← Back to Connect BMM</Link>
      <p className="eyebrow">Optional preview · Local sample data</p>
      <h1>Sample data preview</h1>
      <p className="intro">
        A fictional profile and earnings. No credentials, API requests or
        payments.
      </p>
      <section>
        <span className="badge">Fictional creator</span>
        <h2>{sampleOverview.creator.display_name}</h2>
        <p>@{sampleOverview.creator.username}</p>
      </section>
      <Earnings support={sampleOverview.support} preview />
      <p className="hint">Your real BMM connection stays unchanged.</p>
      <Link className="button" href="/">
        Connect your BMM account →
      </Link>
    </main>
  );
}
