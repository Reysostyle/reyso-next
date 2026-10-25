// No "server-only" here: Payload hooks use this too, and they also run in
// the payload CLI, where that import throws.

/** Sends one message through a Kavenegar verify/lookup template. `token`
 *  may not contain spaces; `token20` may hold up to 8. */
export async function kavenegarLookup(
  receptor: string,
  template: string,
  tokens: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  const key = encodeURIComponent(process.env.KAVENEGAR_API_KEY ?? "");
  const params = new URLSearchParams({ receptor, template, ...tokens });
  const base = process.env.KAVENEGAR_API_BASE || "https://api.kavenegar.com";
  try {
    const res = await fetch(`${base}/v1/${key}/verify/lookup.json?${params}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return { ok: true };
    const body = await res.text().catch(() => "");
    console.error("Kavenegar error", res.status, body);
    return { ok: false, error: `${res.status} ${body}`.slice(0, 300) };
  } catch (err) {
    console.error("Kavenegar request failed", err);
    return { ok: false, error: String(err).slice(0, 300) };
  }
}
