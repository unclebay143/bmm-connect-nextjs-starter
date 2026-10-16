const money = {
  NGN: new Intl.NumberFormat("en", { style: "currency", currency: "NGN" }),
  USD: new Intl.NumberFormat("en", { style: "currency", currency: "USD" }),
};
export default function Earnings({ support, preview = false }) {
  return (
    <section>
      <h2>
        {preview
          ? "Sample settled earnings"
          : "Support received through this application"}
      </h2>
      <p className="hint">
        {preview
          ? "Fictional amounts, separate from real earnings and payments."
          : "Settled earnings after fees and refund deductions. This is not a withdrawable balance."}
      </p>
      {support ? (
        <div className="currencies">
          {support.map((row) => (
            <div key={row.currency}>
              <p>{row.currency}</p>
              <strong>
                {money[row.currency]?.format(row.settled_earnings_minor / 100)}
              </strong>
              <p className="hint">
                {row.verified_payment_count}{" "}
                {preview ? "sample payments" : "verified payments"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>
          Earnings are private. Disconnect and reconnect to change your sharing
          choice.
        </p>
      )}
    </section>
  );
}
