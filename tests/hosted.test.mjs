import { test } from "node:test";
import assert from "node:assert/strict";
import { createBmmConnect } from "@buymeamalt/connect";
const options = {
  origin: "https://bmm.example",
  clientId: "app",
  apiKey: "secret",
  callbackUrl: "https://game.example/api/bmm/callback",
};
test("SDK validates browser, authenticated user, issuer and callback before exchange", async () => {
  let user = "user-1",
    start,
    completed = 0;
  const original = globalThis.fetch;
  globalThis.fetch = async (url, req) => {
    assert.equal(req.headers["X-BMM-API-Key"], "secret");
    if (url.endsWith("/start")) {
      start = JSON.parse(req.body);
      return Response.json({
        authorization_url: "https://bmm.example/connect/login?hosted=opaque",
      });
    }
    completed++;
    return Response.json({ connected: true });
  };
  try {
    const sdk = createBmmConnect({ ...options, getUserId: async () => user });
    const attempt = await sdk.begin();
    const url = new URL(options.callbackUrl);
    url.search = new URLSearchParams({
      state: start.state,
      iss: "https://bmm.example/api/connect/hosted",
      code: "a".repeat(43),
    });
    for (const bad of [undefined, attempt.cookie + "x"])
      await assert.rejects(() => sdk.complete(url, bad));
    user = "user-2";
    await assert.rejects(() => sdk.complete(url, attempt.cookie));
    user = "user-1";
    for (const [key, value] of [
      ["state", "wrong"],
      ["iss", "https://evil.example"],
    ]) {
      const altered = new URL(url);
      altered.searchParams.set(key, value);
      await assert.rejects(() => sdk.complete(altered, attempt.cookie));
    }
    const duplicate = new URL(url);
    duplicate.searchParams.append("code", "b".repeat(43));
    await assert.rejects(() => sdk.complete(duplicate, attempt.cookie));
    const wrongPath = new URL(url);
    wrongPath.pathname = "/other";
    await assert.rejects(() => sdk.complete(wrongPath, attempt.cookie));
    assert.equal(completed, 0);
    await sdk.complete(url, attempt.cookie);
    assert.equal(completed, 1);
    user = null;
    await assert.rejects(() => sdk.begin(), { message: "session" });
  } finally {
    globalThis.fetch = original;
  }
});
test("SDK handles denial only after state validation and reads identity from server session", async () => {
  const original = globalThis.fetch;
  let start;
  globalThis.fetch = async (url, req) => {
    assert.equal(req.headers["X-BMM-User-ID"], "server-user");
    if (url.endsWith("/start")) {
      start = JSON.parse(req.body);
      return Response.json({
        authorization_url: "https://bmm.example/connect/login?hosted=opaque",
      });
    }
    return new Response(null, { status: 404 });
  };
  try {
    const sdk = createBmmConnect({
      ...options,
      getUserId: async () => "server-user",
    });
    assert.equal(await sdk.getConnection({ userId: "attacker" }), null);
    const pending = await sdk.begin(),
      url = new URL(options.callbackUrl);
    url.search = new URLSearchParams({
      state: start.state,
      iss: "https://bmm.example/api/connect/hosted",
      error: "access_denied",
    });
    await assert.rejects(() => sdk.complete(url, pending.cookie), {
      message: "denied",
    });
    url.searchParams.set("state", "wrong");
    await assert.rejects(() => sdk.complete(url, pending.cookie), {
      message: "state",
    });
  } finally {
    globalThis.fetch = original;
  }
});

test("SDK rejects expired attempts and rotated keys without exchanging codes", async () => {
  const originalFetch = globalThis.fetch,
    originalNow = Date.now;
  let now = originalNow(),
    start,
    exchanges = 0;
  Date.now = () => now;
  globalThis.fetch = async (url, req) => {
    if (url.endsWith("/start")) {
      start = JSON.parse(req.body);
      return Response.json({
        authorization_url: "https://bmm.example/connect/login?hosted=opaque",
      });
    }
    exchanges++;
    return Response.json({ connected: true });
  };
  try {
    const sdk = createBmmConnect({ ...options, getUserId: async () => "user" });
    const pending = await sdk.begin();
    const url = new URL(options.callbackUrl);
    url.search = new URLSearchParams({
      state: start.state,
      iss: "https://bmm.example/api/connect/hosted",
      code: "a".repeat(43),
    });
    const rotated = createBmmConnect({
      ...options,
      apiKey: "rotated",
      getUserId: async () => "user",
    });
    await assert.rejects(() => rotated.complete(url, pending.cookie), {
      message: "state",
    });
    now += 600001;
    await assert.rejects(() => sdk.complete(url, pending.cookie), {
      message: "state",
    });
    assert.equal(exchanges, 0);
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
  }
});

test("SDK never requests BMM data without an authenticated partner user", async () => {
  const original = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    throw Error("unexpected request");
  };
  try {
    const sdk = createBmmConnect({ ...options, getUserId: async () => null });
    for (const op of [
      () => sdk.begin(),
      () => sdk.getConnection(),
      () => sdk.getEarnings(),
      () => sdk.disconnect(),
    ])
      await assert.rejects(op, { message: "session" });
    assert.equal(requests, 0);
  } finally {
    globalThis.fetch = original;
  }
});
