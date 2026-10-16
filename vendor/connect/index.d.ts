export interface ConnectOptions {
  origin: string;
  clientId: string;
  apiKey: string;
  callbackUrl: string;
  getUserId: () => Promise<string | null | undefined>;
}
export interface Creator {
  id: string;
  username: string;
  display_name: string;
  profile_image: string;
  environment: "live" | "sandbox";
  profile_url: string | null;
  support_url: string | null;
  earnings_shared: boolean;
}
export interface Earnings {
  currency: string;
  settled_earnings_minor: number;
  verified_payment_count: number;
}
export class BmmError extends Error {
  status: number;
  constructor(status: number, message?: string);
}
export interface BmmConnect {
  begin(): Promise<{ url: string; cookie: string }>;
  complete(
    url: string | URL,
    cookie: string | undefined,
  ): Promise<{ connected: true }>;
  getConnection(): Promise<Creator | null>;
  getEarnings(): Promise<Earnings[]>;
  disconnect(): Promise<{ disconnected: true }>;
}
export function createBmmConnect(options: ConnectOptions): BmmConnect;
