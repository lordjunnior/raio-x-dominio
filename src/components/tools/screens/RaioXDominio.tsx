import { useState } from 'react';
import { SuiteHero, Stat, Faq } from './SovereignKit';
import { classificarAlvo, ipPrivado } from '@/components/tools/lib/investigacao';
import { dns, respostas } from '@/components/tools/lib/investigacao-rede';

type Ficha = { alvo: string; ips: string[]; mx: string[]; ns: string[]; ip?: any; rdap?: { registrado?: string | undefined; expira?: string | undefined; atualizado?: string | undefined; registrar?: string | undefined } | undefined; cdn?: string | undefined; at: string };
const CDNS: [RegExp, string][] = [[/cloudflare/i, 'Cloudflare'], [/amazon|aws/i, 'Amazon AWS'], [/google/i, 'Google Cloud'], [/microsoft|azure/i, 'Microsoft Azure'], [/akamai/i, 'Akamai'], [/fastly/i, 'Fastly'], [/vercel/i, 'Vercel'], [/netlify/i, 'Netlify']];
const data = (s?: string) => s ? new Date(s).toLocaleDateString('pt-BR') : '-';

export default function RaioXDominio() {
  const [v, setV] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [f, setF] = useState<Ficha | null>(null);

  const rodar = async () => {
    const a = classificarAlvo(v);
    if (!a) { setErr('Digite um domínio (exemplo.com.br) ou um IP válido.'); return; }
    if (a.tipo !== 'dominio' && ipPrivado(a.valor)) { setErr('Esse IP é de rede privada e não tem dados públicos.'); return; }
    setBusy(true); setErr(''); setF(null);
    try {
      let ips: string[] = [], mx: string[] = [], ns: string[] = [], rdap: Ficha['rdap'];
      if (a.tipo === 'dominio') {
        const [d4, d6, dm, dn, rd] = await Promise.all([dns(a.valor, 'A'), dns(a.valor, 'AAAA'), dns(a.valor, 'MX'), dns(a.valor, 'NS'), fetch(`https://rdap.org/domain/${a.valor}`, { signal: AbortSignal.timeout(9000) }).then(r => r.ok ? r.json() : null).catch(() => null)]);
        ips = [...respostas(d4, 1), ...respostas(d6, 28)];
        mx = respostas(dm, 15).map(x => x.replace(/^\d+\s+/, '').replace(/\.$/, ''));
        ns = respostas(dn, 2).map(x => x.replace(/\.$/, ''));
        if (rd) {
          const ev = (n: string) => rd.events?.find((e: any) => e.eventAction === n)?.eventDate;
          rdap = { registrado: ev('registration'), expira: ev('expiration'), atualizado: ev('last changed'), registrar: rd.entities?.find((e: any) => e.roles?.includes('registrar'))?.vcardArray?.[1]?.find((x: any) => x[0] === 'fn')?.[3] };
        }
        if (!ips.length && !mx.length && !ns.length) { setErr('Esse domínio não respondeu. Confira se ele existe.'); setBusy(false); return; }
      } else ips = [a.valor];
      const alvoIp = ips.find(i => !i.includes(':')) ?? ips[0];
      const ip = alvoIp ? await fetch(`https://ipwho.is/${alvoIp}`, { signal: AbortSignal.timeout(8000) }).then(r => r.json()).catch(() => null) : null;
      const texto = `${ip?.connection?.org ?? ''} ${ip?.connection?.isp ?? ''}`;
      setF({ alvo: a.valor, ips, mx, ns, ip: ip?.success ? ip : undefined, rdap, cdn: CDNS.find(([re]) => re.test(texto))?.[1], at: new Date().toLocaleString('pt-BR') });
    } catch { setErr('As fontes públicas não responderam agora. Tente de novo em instantes.'); }
    setBusy(false);
  };

  const L = ({ t, items }: { t: string; items: string[] }) => <div style={{ marginTop: 14 }}><span className="ss-label" style={{ margin: '0 0 6px' }}>{t}</span>{items.length ? <ul style={{ display: 'grid', gap: 4, fontSize: 13, wordBreak: 'break-all' }}>{items.map(i => <li key={i}>{i}</li>)}</ul> : <p className="ss-sub">Nenhum registro público.</p>}</div>;

  return <div className="ss-root">
    <SuiteHero kicker="Investigação digital · Infraestrutura" title="Raio-X" accent="de Domínio e IP" repo="https://rdap.org" repoLabel="RDAP, DNS PÚBLICO E IPWHO.IS" prefix="FONTES PÚBLICAS:"
      note="CONSULTAS FEITAS DO SEU NAVEGADOR"
      lead="Digite um site ou um IP e veja onde ele mora: provedor, país do servidor, servidores de e-mail, servidores de nome e datas do registro do domínio." />
    <div className="ss-wrap">
      <section className="ss-plate">
        <span className="ss-tag">01 · FICHA TÉCNICA</span>
        <h2>O que investigar</h2>
        <label className="ss-label" htmlFor="rd-v">Domínio ou IP</label>
        <div className="ss-row" style={{ marginTop: 0 }}>
          <input id="rd-v" className="ss-input" style={{ flex: 1 }} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="exemplo.com.br ou 8.8.8.8" value={v} onChange={e => { setV(e.target.value); setF(null); }} onKeyDown={e => e.key === 'Enter' && rodar()} />
          <button type="button" className="ss-btn" disabled={!v || busy} onClick={rodar}>{busy ? 'Consultando…' : 'Radiografar'}</button>
        </div>
        <p className="ss-sub" style={{ marginTop: 10 }}>O domínio digitado é enviado para os serviços públicos de DNS (Cloudflare), de registro (RDAP) e de localização de IP (ipwho.is). Este site não guarda nada.</p>
        {err && <p className="ss-warn" style={{ marginTop: 16 }}>{err}</p>}
        {f && <div style={{ marginTop: 22 }} aria-live="polite">
          <div className="ss-stats">
            <Stat value={f.ip?.country ?? '-'} label="País do servidor" />
            <Stat value={f.ip?.connection?.org ?? f.ip?.connection?.isp ?? '-'} label="Provedor" />
            <Stat value={f.cdn ?? 'Não detectado'} label="Proteção ou CDN" tone={f.cdn ? 'hot' : undefined} />
          </div>
          {f.ip && <p className="ss-sub" style={{ marginTop: 12 }}>{[f.ip.city, f.ip.region, f.ip.country].filter(Boolean).join(', ')} · AS{f.ip.connection?.asn} · fuso {f.ip.timezone?.id}</p>}
          <L t="Endereços IP" items={f.ips} />
          {f.alvo && classificarAlvo(f.alvo)?.tipo === 'dominio' && <>
            <L t="Servidores de e-mail (MX)" items={f.mx} />
            <L t="Servidores de nome (NS)" items={f.ns} />
            <div style={{ marginTop: 14 }}><span className="ss-label" style={{ margin: '0 0 6px' }}>Registro do domínio</span>
              {f.rdap ? <ul style={{ display: 'grid', gap: 4, fontSize: 13 }}><li>Registrado em: {data(f.rdap.registrado)}</li><li>Expira em: {data(f.rdap.expira)}</li><li>Última alteração: {data(f.rdap.atualizado)}</li>{f.rdap.registrar && <li>Registrador: {f.rdap.registrar}</li>}</ul> : <p className="ss-sub">Esse tipo de domínio não publica dados de registro neste formato.</p>}
            </div>
          </>}
          <p className="ss-sub" style={{ marginTop: 14 }}>Consultado em {f.at}. Limitação: a localização de um IP é aproximada e mostra onde está o servidor, não quem é o dono. Sites atrás de CDN mostram o IP da CDN, não o do servidor real.</p>
        </div>}
      </section>
      <Faq items={[
        { q: 'Isso mostra o dono do site?', a: 'Não. A maioria dos registros de domínio é protegida por privacidade. A ferramenta mostra a infraestrutura pública: onde o site está hospedado, quem cuida do e-mail e quando o domínio foi registrado.' },
        { q: 'Para que serve na prática?', a: 'Para checar se um site novo é recente (golpes costumam usar domínios registrados há poucos dias), ver onde ele está hospedado e entender se o e-mail dele passa por um provedor conhecido.' },
      ]} />
    </div>
  </div>;
}
