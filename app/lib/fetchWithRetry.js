export async function fetchJsonWithRetry(
  url,
  { signal, attempts = 5, retryDelay = 300, ...options } = {}
) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { ...options, signal });
      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.error) {
        throw new Error(payload?.error || `Request failed with status ${response.status}.`);
      }

      return payload;
    } catch (error) {
      if (error.name === "AbortError" || attempt === attempts - 1) {
        throw error;
      }

      lastError = error;
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, retryDelay * 2 ** attempt);
        signal?.addEventListener(
          "abort",
          () => {
            clearTimeout(timeout);
            reject(signal.reason || new DOMException("Aborted", "AbortError"));
          },
          { once: true }
        );
      });
    }
  }

  throw lastError;
}
