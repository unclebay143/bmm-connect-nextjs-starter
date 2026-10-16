export function config() {
  const origin = (name) => {
    const value = process.env[name];
    if (!value) throw Error(`Set ${name} in .env.local`);
    let url;
    try {
      url = new URL(value);
    } catch {
      throw Error(`${name} must be a valid URL origin`);
    }
    if (
      url.origin !== value.replace(/\/$/, "") ||
      url.username ||
      url.password ||
      !(
        url.protocol === "https:" ||
        (url.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(url.hostname))
      )
    )
      throw Error(
        `${name} must be an HTTPS origin (HTTP localhost is allowed)`,
      );
    return url.origin;
  };
  const app = origin("APP_ORIGIN");
  const bmm = origin("BMM_ORIGIN");
  if (process.env.BMM_REDIRECT_URI !== `${app}/api/bmm/callback`)
    throw Error(
      "BMM_REDIRECT_URI must exactly match APP_ORIGIN/api/bmm/callback",
    );
  if (!process.env.BMM_CLIENT_ID || !process.env.BMM_API_KEY)
    throw Error(
      "Set the approved BMM application ID and API key in .env.local",
    );
  return {
    app,
    bmm,
    clientId: process.env.BMM_CLIENT_ID,
    key: process.env.BMM_API_KEY,
    callback: process.env.BMM_REDIRECT_URI,
    demoToken: process.env.BMM_DEMO_TOKEN?.trim() || "",
  };
}
