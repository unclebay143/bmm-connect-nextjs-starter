const money = {
  NGN: new Intl.NumberFormat("en", { style: "currency", currency: "NGN" }),
  USD: new Intl.NumberFormat("en", { style: "currency", currency: "USD" }),
};
export default function Earnings({ support }) {
  return (
    <section>
      <h2>Support through this app</h2>
      <p className="hint">
        Settled earnings, after fees and refunds. Not a withdrawable balance.
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
                {row.verified_payment_count} verified{" "}
                {row.verified_payment_count === 1 ? "payment" : "payments"}
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
