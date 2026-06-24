// Runs once on server startup (Next.js instrumentation hook).
//
// Forces the Node resolver to return IPv4 addresses first. The web container
// reaches the API over an internal hop; when ETHITORIAL_API_URL resolves to a
// dual-stack (A + AAAA) name without a working IPv6 egress, Node's fetch tries
// IPv6 first and stalls on a ~5s connect timeout before falling back to IPv4 —
// the latency signature behind the slow votes/views/comments proxy in prod.
// ipv4first removes that stall. No-op on the edge runtime (no node:dns there);
// harmless when the path is already IPv4-only. Mirrors
// NODE_OPTIONS=--dns-result-order=ipv4first as a code-level default.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { setDefaultResultOrder } = await import("node:dns");
    setDefaultResultOrder("ipv4first");
  }
}
