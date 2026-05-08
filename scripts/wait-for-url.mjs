const url = process.argv[2];
const timeoutMs = Number(process.argv[3] ?? 30_000);
const startedAt = Date.now();

if (!url) {
  throw new Error("Usage: node scripts/wait-for-url.mjs <url> [timeout_ms]");
}

while (Date.now() - startedAt < timeoutMs) {
  try {
    const response = await fetch(url, { cache: "no-store" });

    if (response.ok) {
      process.exit(0);
    }
  } catch {
    // Keep polling until the server is ready or the timeout expires.
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
}

throw new Error(`Timed out waiting for ${url}`);
