// Local UI fixtures only. Never used by the connection or payment flows.
export const sampleOverview = {
  creator: {
    id: "sample_creator",
    username: "sample_creator",
    display_name: "Sample Creator",
    image: null,
    earnings_shared: true,
    profile_url: null,
    support_url: null,
  },
  support: [
    {
      currency: "NGN",
      settled_earnings_minor: 1250000,
      verified_payment_count: 25,
    },
    {
      currency: "USD",
      settled_earnings_minor: 4500,
      verified_payment_count: 9,
    },
  ],
};
