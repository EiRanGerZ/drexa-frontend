"use client"

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TradingLayout } from '@/features/core/presentation/components/trading_layout';
import {
  TIcon, CoinBadge, Panel,
  btnBrand, thL, thR, tdL, tdR,
} from '@/features/core/presentation/components/primitives';
import { NETWORKS, holdingRows } from '@/features/core/domain/data/mock_data';
import { fmtUSD, fmtNum } from '@/features/core/domain/data/trading_utils';

/* ── Fiat on-ramp data ──────────────────────────────────────────── */
const FIAT: Record<string, { sym: string; rate: number }> = {
  USD: { sym: '$', rate: 0.999 },
  EUR: { sym: '€', rate: 1.072 },
  GBP: { sym: '£', rate: 1.262 },
};
const PAY_METHODS = [
  { id: 'card',  icon: 'card'  as const, label: 'Debit / Credit Card',    desc: 'Visa · Mastercard · instant',       fee: 0.018 },
  { id: 'apple', icon: 'phone' as const, label: 'Apple Pay / Google Pay', desc: 'Instant',                           fee: 0.018 },
  { id: 'bank',  icon: 'bank'  as const, label: 'Bank Transfer',          desc: 'ACH · SEPA · 1–2 business days',   fee: 0     },
];
const PRESETS: Record<string, number[]> = {
  USD: [100, 500, 1000], EUR: [100, 500, 1000], GBP: [100, 500, 1000],
};

/* ── Locked USDT asset display ──────────────────────────────────── */
function LockedAsset({ label }: { label: string }) {
  return (
    <div style={{ display: 'block' }}>
      <span style={{ font: 'var(--nano)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', height: 52, marginTop: 6, padding: '0 14px', gap: 10,
        background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)' }}>
        <CoinBadge sym="USDT" size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '700 15px var(--font-sans)', color: 'var(--fg)' }}>USDT</div>
          <div style={{ font: 'var(--nano)', color: 'var(--fg-3)' }}>Tether</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px',
          borderRadius: 'var(--r-pill)', background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)',
          font: 'var(--nano)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          USDT only
        </span>
      </div>
    </div>
  );
}

/* ── "Sell to USDT first" reminder ─────────────────────────────── */
function SellToUsdtNote({ action }: { action: 'deposit' | 'withdraw' }) {
  const router = useRouter();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
      borderRadius: 'var(--r-sm)', background: 'rgba(59,130,246,.07)', border: '1px solid rgba(59,130,246,.18)' }}>
      <TIcon name="repeat" size={16} color="var(--brand-blue)" style={{ marginTop: 1 }} />
      <span style={{ font: 'var(--micro)', color: 'var(--fg-2)', lineHeight: 1.5 }}>
        Drexa settles in USDT only.{' '}
        {action === 'withdraw'
          ? 'To cash out BTC, ETH or any other holding, sell it to USDT on the Trade screen first, then withdraw the USDT.'
          : 'Buy USDT with cash here, then trade it for BTC, ETH or any other asset on the Trade screen.'
        }{' '}
        <button
          onClick={() => router.push('/trade')}
          style={{ border: 'none', background: 'none', padding: 0, color: 'var(--brand-mint)', font: 'inherit', fontWeight: 700, cursor: 'pointer' }}
        >Open Trade →</button>
      </span>
    </div>
  );
}

/* ── Network selector ───────────────────────────────────────────── */
function NetworkSelector({ networks, network, setNetwork }: { networks: string[]; network: string; setNetwork: (n: string) => void }) {
  return (
    <div>
      <div style={{ font: 'var(--nano)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Network</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {networks.map(nw => (
          <button key={nw} onClick={() => setNetwork(nw)} style={{
            padding: '9px 14px', borderRadius: 'var(--r-sm)', cursor: 'pointer', font: 'var(--small)',
            border: network === nw ? '1px solid var(--brand-mint)' : '1px solid var(--border-subtle)',
            background: network === nw ? 'rgba(0,255,163,.08)' : 'var(--surface-input)',
            color: network === nw ? 'var(--fg)' : 'var(--fg-3)',
          }}>{nw}</button>
        ))}
      </div>
    </div>
  );
}

/* ── Deposit panel — fiat on-ramp ───────────────────────────────── */
function DepositPanel() {
  const [cur, setCur] = useState('USD');
  const [amt, setAmt] = useState('500');
  const [method, setMethod] = useState('card');

  const f = FIAT[cur];
  const pm = PAY_METHODS.find(m => m.id === method)!;
  const pay = parseFloat(amt) || 0;
  const feeAmt = pay * pm.fee;
  const net = Math.max(0, pay - feeAmt);
  const receive = net * f.rate;
  const valid = pay >= 10;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>

      {/* ── Left: amount + payment method ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <LockedAsset label="You buy" />

        {/* You pay */}
        <div>
          <span style={{ font: 'var(--nano)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>You pay</span>
          <div style={{ display: 'flex', alignItems: 'center', height: 64, marginTop: 6, padding: '0 14px', gap: 8,
            background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)' }}>
            <span style={{ font: '700 22px var(--font-num)', color: 'var(--fg-3)' }}>{f.sym}</span>
            <input
              value={amt}
              onChange={e => setAmt(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              inputMode="decimal"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--fg)',
                font: '700 24px var(--font-num)', fontVariantNumeric: 'tabular-nums', minWidth: 0 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 11px',
              borderRadius: 'var(--r-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
              <select value={cur} onChange={e => setCur(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--fg)', font: '700 14px var(--font-sans)', cursor: 'pointer' }}>
                {Object.keys(FIAT).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <TIcon name="chevDown" size={14} color="var(--fg-3)" />
            </div>
          </div>
          {/* Quick-amount presets */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {PRESETS[cur].map(v => (
              <button key={v} onClick={() => setAmt(String(v))} style={{
                flex: 1, padding: '8px 0', borderRadius: 'var(--r-sm)', cursor: 'pointer', font: 'var(--small)',
                border: pay === v ? '1px solid var(--brand-mint)' : '1px solid var(--border-subtle)',
                background: pay === v ? 'rgba(0,255,163,.08)' : 'var(--surface-input)',
                color: pay === v ? 'var(--fg)' : 'var(--fg-3)',
              }}>{f.sym}{v.toLocaleString()}</button>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div>
          <span style={{ font: 'var(--nano)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Payment method</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
            {PAY_METHODS.map(m => {
              const on = method === m.id;
              return (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
                  borderRadius: 'var(--r-sm)',
                  border: on ? '1px solid var(--brand-mint)' : '1px solid var(--border-subtle)',
                  background: on ? 'rgba(0,255,163,.06)' : 'var(--surface-input)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38,
                    flex: 'none', borderRadius: 'var(--r-sm)', background: 'var(--bg-base)' }}>
                    <TIcon name={m.icon} size={18} color={on ? 'var(--brand-mint)' : 'var(--fg-2)'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: '700 14px var(--font-sans)', color: 'var(--fg)' }}>{m.label}</div>
                    <div style={{ font: 'var(--nano)', color: 'var(--fg-3)' }}>{m.desc}</div>
                  </div>
                  <span style={{ font: 'var(--nano)', color: 'var(--fg-3)' }}>
                    {m.fee ? `${(m.fee * 100).toFixed(1)}% fee` : 'No fee'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18,
                    flex: 'none', borderRadius: '50%',
                    border: on ? 'none' : '1.5px solid var(--border-strong)',
                    background: on ? 'var(--brand-mint)' : 'transparent' }}>
                    {on && <TIcon name="check" size={12} color="#0b1020" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right: order summary ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 22,
        background: 'var(--surface-input)', borderRadius: 'var(--r-md)', alignSelf: 'start' }}>
        <div style={{ font: 'var(--small)', color: 'var(--fg)', fontWeight: 700 }}>Order summary</div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          padding: '14px 0', borderRadius: 'var(--r-sm)', background: 'var(--bg-base)' }}>
          <span style={{ font: 'var(--nano)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>You receive</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ font: '800 30px var(--font-num)', color: 'var(--up)', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(receive, 2)}</span>
            <span style={{ font: '700 16px var(--font-sans)', color: 'var(--fg-2)' }}>USDT</span>
          </div>
        </div>

        {([
          ['Amount',        `${f.sym}${fmtNum(pay, 2)}`],
          ['Processing fee', pm.fee ? `${f.sym}${fmtNum(feeAmt, 2)}` : 'Free'],
          ['Exchange rate', `1 ${cur} ≈ ${fmtNum(f.rate, 3)} USDT`],
          ['Payment method', pm.label],
        ] as [string, string][]).map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--small)' }}>
            <span style={{ color: 'var(--fg-3)' }}>{k}</span>
            <span style={{ color: 'var(--fg-2)', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
          </div>
        ))}

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ font: 'var(--small)', color: 'var(--fg-2)' }}>Total charged</span>
          <span style={{ font: '700 16px var(--font-num)', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>{f.sym}{fmtNum(pay, 2)}</span>
        </div>

        <button disabled={!valid} style={{ ...btnBrand, width: '100%', height: 48, marginTop: 4, opacity: valid ? 1 : 0.5, cursor: valid ? 'pointer' : 'not-allowed' }}>
          <TIcon name="card" size={16} color="#0b1020" />Buy USDT
        </button>
        {!valid && (
          <div style={{ font: 'var(--nano)', color: 'var(--fg-3)', textAlign: 'center' }}>
            Minimum purchase is {f.sym}10.00
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <TIcon name="shield" size={14} color="var(--fg-4)" style={{ marginTop: 2 }} />
          <span style={{ font: 'var(--nano)', color: 'var(--fg-3)', lineHeight: 1.5 }}>
            Payments are processed securely by our regulated payment partner. USDT is credited to your Drexa balance on confirmation.
          </span>
        </div>

        <SellToUsdtNote action="deposit" />
      </div>
    </div>
  );
}

/* ── Withdraw panel — USDT-only on-chain ────────────────────────── */
function WithdrawPanel() {
  const sym = 'USDT';
  const nets = NETWORKS[sym] ?? ['Default'];
  const [network, setNetwork] = useState(nets[0]);
  const [addr, setAddr] = useState('');
  const [amt, setAmt] = useState('');
  useEffect(() => { setNetwork((NETWORKS[sym] ?? ['Default'])[0]); }, [sym]);
  const hold = holdingRows().find(h => h.sym === sym);
  const avail = hold?.qty ?? 0;
  const fee = 1;
  const n = parseFloat(amt) || 0;
  const receive = Math.max(0, n - fee);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <LockedAsset label="Asset" />
        <NetworkSelector networks={nets} network={network} setNetwork={setNetwork} />

        <label style={{ display: 'block' }}>
          <span style={{ font: 'var(--nano)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Recipient address</span>
          <div style={{ display: 'flex', alignItems: 'center', height: 52, marginTop: 6, padding: '0 14px',
            background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)' }}>
            <input value={addr} onChange={e => setAddr(e.target.value)} placeholder={`Enter ${sym} address`}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--fg)', font: '500 14px var(--font-num)', minWidth: 0 }} />
          </div>
        </label>

        <label style={{ display: 'block' }}>
          <span style={{ font: 'var(--nano)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Amount</span>
          <div style={{ display: 'flex', alignItems: 'center', height: 52, marginTop: 6, padding: '0 14px', gap: 8,
            background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)' }}>
            <input value={amt} onChange={e => setAmt(e.target.value)} placeholder="0.00"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--fg)', font: '600 15px var(--font-num)', fontVariantNumeric: 'tabular-nums', minWidth: 0 }} />
            <button onClick={() => setAmt(String(avail))} style={{ border: 'none', background: 'none', color: 'var(--brand-mint)', font: 'var(--small)', cursor: 'pointer' }}>Max</button>
            <span style={{ font: 'var(--micro)', color: 'var(--fg-4)' }}>{sym}</span>
          </div>
          <div style={{ font: 'var(--micro)', color: 'var(--fg-3)', marginTop: 6 }}>
            Available: <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtNum(avail, avail < 1 ? 4 : 2)} {sym}</span>
          </div>
        </label>

        <SellToUsdtNote action="withdraw" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 22,
        background: 'var(--surface-input)', borderRadius: 'var(--r-md)', alignSelf: 'start' }}>
        <div style={{ font: 'var(--small)', color: 'var(--fg)', fontWeight: 700 }}>Transaction summary</div>
        {([
          ['Amount',      `${n ? fmtNum(n, n < 1 ? 4 : 2) : '0.00'} ${sym}`],
          ['Network fee', `${fee} ${sym}`],
          ['Network',     network],
        ] as [string, string][]).map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--small)' }}>
            <span style={{ color: 'var(--fg-3)' }}>{k}</span>
            <span style={{ color: 'var(--fg-2)', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ font: 'var(--small)', color: 'var(--fg-2)' }}>You will receive</span>
          <span style={{ font: '700 16px var(--font-num)', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(receive, receive < 1 ? 4 : 2)} {sym}</span>
        </div>
        <button disabled={!addr || !n} style={{ ...btnBrand, width: '100%', height: 48, marginTop: 4, opacity: (!addr || !n) ? 0.5 : 1, cursor: (!addr || !n) ? 'not-allowed' : 'pointer' }}>
          <TIcon name="upload" size={16} color="#0b1020" />Withdraw {sym}
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <TIcon name="shield" size={14} color="var(--fg-4)" style={{ marginTop: 2 }} />
          <span style={{ font: 'var(--nano)', color: 'var(--fg-3)', lineHeight: 1.5 }}>
            Withdrawals require email + 2FA confirmation. Double-check the address — on-chain transfers cannot be reversed.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── WalletPage ─────────────────────────────────────────────────── */
const miniBtn: React.CSSProperties = {
  padding: '6px 13px', borderRadius: 'var(--r-xs)', border: '1px solid var(--border-subtle)',
  background: 'transparent', color: 'var(--fg-2)', font: 'var(--micro)', cursor: 'pointer',
};
const miniBtnBrand: React.CSSProperties = {
  padding: '6px 13px', borderRadius: 'var(--r-xs)', border: '1px solid rgba(0,255,163,.35)',
  background: 'rgba(0,255,163,.08)', color: 'var(--brand-mint)', font: 'var(--micro)', fontWeight: 700, cursor: 'pointer',
};

export function WalletPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview');
  const rows = useMemo(holdingRows, []);
  const total = rows.reduce((a, r) => a + r.value, 0);
  const inOrders = total * 0.06;
  const tabs: [string, string][] = [['overview', 'Overview'], ['deposit', 'Deposit'], ['withdraw', 'Withdraw']];

  return (
    <TradingLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 56px' }}>
        <h1 style={{ font: 'var(--h1)', color: 'var(--fg)', letterSpacing: '-.01em', marginBottom: 20 }}>Wallet</h1>

        {/* summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 22 }}>
          {([
            ['Total balance',  total,            'var(--fg)'],
            ['Available',      total - inOrders, 'var(--up)'],
            ['In open orders', inOrders,         'var(--warning)'],
          ] as [string, number, string][]).map(([label, v, c], i) => (
            <Panel key={i} style={{ background: i === 0 ? 'var(--surface-card)' : 'var(--surface)' }}>
              <div style={{ font: 'var(--small)', color: 'var(--fg-3)' }}>{label}</div>
              <div style={{ font: '800 26px var(--font-num)', color: c, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(v)}</div>
            </Panel>
          ))}
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {tabs.map(([id, l]) => (
            <button key={id} onClick={() => setTab(id as typeof tab)} style={{
              padding: '9px 18px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', font: 'var(--small)',
              background: tab === id ? 'var(--surface-raised)' : 'transparent',
              color: tab === id ? 'var(--fg)' : 'var(--fg-3)',
            }}>{l}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <Panel pad={0} style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={thL}>Asset</th><th style={thR}>Total</th><th style={thR}>Available</th>
                <th style={thR}>In orders</th><th style={thR}>Value</th>
                <th style={{ ...thR, width: 200 }}></th>
              </tr></thead>
              <tbody>
                {rows.map(r => {
                  const locked = r.sym === 'BTC' || r.sym === 'ETH' ? r.qty * 0.18 : 0;
                  return (
                    <tr key={r.sym} style={{ borderTop: '1px solid var(--border-hairline)' }}>
                      <td style={tdL}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <CoinBadge sym={r.sym} size={32} />
                          <div>
                            <div style={{ font: '700 14px var(--font-sans)', color: 'var(--fg)' }}>{r.name}</div>
                            <div style={{ font: 'var(--nano)', color: 'var(--fg-3)' }}>{r.sym}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdR, color: 'var(--fg)', fontWeight: 700 }}>{fmtNum(r.qty, r.qty < 1 ? 4 : 2)}</td>
                      <td style={{ ...tdR, color: 'var(--fg-2)' }}>{fmtNum(r.qty - locked, r.qty < 1 ? 4 : 2)}</td>
                      <td style={{ ...tdR, color: locked ? 'var(--warning)' : 'var(--fg-4)' }}>{locked ? fmtNum(locked, 4) : '—'}</td>
                      <td style={{ ...tdR, color: 'var(--fg-2)' }}>{fmtUSD(r.value)}</td>
                      <td style={tdR}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {r.sym === 'USDT' ? (
                            <>
                              <button onClick={() => setTab('deposit')}  style={miniBtn}>Deposit</button>
                              <button onClick={() => setTab('withdraw')} style={miniBtn}>Withdraw</button>
                              <button onClick={() => router.push('/trade')} style={miniBtn}>Trade</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => router.push('/trade?sym=' + r.sym)} style={miniBtnBrand}>Sell to USDT</button>
                              <button onClick={() => router.push('/trade?sym=' + r.sym)} style={miniBtn}>Trade</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        )}

        {tab === 'deposit'  && <Panel pad={24}><DepositPanel /></Panel>}
        {tab === 'withdraw' && <Panel pad={24}><WithdrawPanel /></Panel>}
      </div>
    </TradingLayout>
  );
}
