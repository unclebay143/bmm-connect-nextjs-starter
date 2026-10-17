const money = {
  NGN: new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    currencyDisplay: "narrowSymbol",
  }),
  USD: new Intl.NumberFormat("en", { style: "currency", currency: "USD" }),
};
export default function Earnings({ support }) {
  if (!support) return null;
  return (
    <div className="connection-earnings">
      <h3>Support through this app</h3>
      <p className="hint">
        Settled earnings, after fees and refunds. Not a withdrawable balance.
      </p>

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
    </div>
  );
}
