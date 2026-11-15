// Consultas de rede feitas direto do navegador, só em fontes públicas com CORS e sem chave.
export type Dns = { Status: number; Answer?: { name: string; type: number; data: string }[] };
export async function dns(nome: string, tipo: string): Promise<Dns | null> {
  try {
    const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(nome)}&type=${tipo}`, { headers: { accept: 'application/dns-json' }, signal: AbortSignal.timeout(8000) });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}
export const respostas = (d: Dns | null, tipo: number) => (d?.Answer ?? []).filter(a => a.type === tipo).map(a => a.data);

export async function sha256(t: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
