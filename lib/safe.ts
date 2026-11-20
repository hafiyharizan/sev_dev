/** Awaits a data read; on failure logs and returns `fallback` so one outage does not blank the whole page. */
export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    console.error(JSON.stringify({ event: 'data_read_failed', error: String(e) }));
    return fallback;
  }
}
