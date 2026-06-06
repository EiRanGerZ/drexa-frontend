"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TradingLayout } from '@/features/core/presentation/components/trading_layout';
import {
  TIcon, CoinBadge, Panel, Pill,
  btnBrand, btnGhost, thL, thR, tdL, tdR,
} from '@/features/core/presentation/components/primitives';
import { COINS, OPEN_ORDERS, ORDER_HISTORY, FILLS } from '@/features/core/domain/data/mock_data';
import { fmtUSD, fmtNum } from '@/features/core/domain/data/trading_utils';
import type { OpenOrder, HistoryOrder, Fill } from '@/features/core/domain/model';

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'Filled' ? 'up' : (status === 'Cancelled' || status === 'Expired') ? 'neutral' : 'warn';
  return <Pill tone={tone}>{status}</Pill>;
}

const selStyle: React.CSSProperties = { background: 'none', border: 'none', outline: 'none', color: 'var(--fg)', font: 'var(--small)', cursor: 'pointer' };

function FilterBar({ pair, setPair, side, setSide, extra }: {
  pair: string; setPair: (v: string) => void;
  side: string; setSide: (v: string) => void;
  extra?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 12px', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)' }}>
        <span style={{ font: 'var(--micro)', color: 'var(--fg-4)' }}>Pair</span>
        <select value={pair} onChange={e => setPair(e.target.value)} style={selStyle}>
          <option value="all">All</option>
          {COINS.map(c => <option key={c.sym} value={c.sym}>{c.sym}/USDT</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--surface-input)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)' }}>
        {([['all', 'All'], ['buy', 'Buy'], ['sell', 'Sell']] as [string, string][]).map(([id, l]) => (
          <button key={id} onClick={() => setSide(id)} style={{
            padding: '6px 13px', borderRadius: 'var(--r-xs)', border: 'none', cursor: 'pointer', font: 'var(--micro)',
            background: side === id ? 'var(--surface-raised)' : 'transparent',
            color: side === id ? (id === 'buy' ? 'var(--up)' : id === 'sell' ? 'var(--down)' : 'var(--fg)') : 'var(--fg-3)',
          }}>{l}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: '0 13px', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)', color: 'var(--fg-3)', cursor: 'pointer' }}>
        <TIcon name="calendar" size={15} /><span style={{ font: 'var(--micro)' }}>Last 30 days</span>
      </div>
      <div style={{ flex: 1 }} />
      {extra}
    </div>
  );
}

function EmptyRow({ span, text }: { span: number; text: string }) {
  return <tr><td colSpan={span} style={{ padding: 44, textAlign: 'center', font: 'var(--small)', color: 'var(--fg-3)' }}>{text}</td></tr>;
}

function OpenTable({ rows }: { rows: OpenOrder[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><tr>
        <th style={thL}>Order ID</th><th style={thL}>Pair</th><th style={thL}>Side · Type</th>
        <th style={thR}>Price</th><th style={thR}>Amount</th><th style={thR}>Filled</th>
        <th style={thR}>Time</th><th style={{ ...thR, width: 100 }}></th>
      </tr></thead>
      <tbody>
        {rows.map((o, i) => (
          <tr key={i} style={{ borderTop: '1px solid var(--border-hairline)', font: '500 13px var(--font-num)', fontVariantNumeric: 'tabular-nums' }}>
            <td style={{ ...tdL, color: 'var(--fg-3)', font: '500 12px var(--font-num)' }}>{o.id}</td>
            <td style={tdL}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <CoinBadge sym={o.sym} size={26} />
                <span style={{ fontWeight: 700, color: 'var(--fg)', font: 'var(--small)' }}>{o.sym}/USDT</span>
              </div>
            </td>
            <td style={{ ...tdL, color: o.side === 'buy' ? 'var(--up)' : 'var(--down)', textTransform: 'capitalize', fontWeight: 700 }}>{o.side} · {o.type}</td>
            <td style={{ ...tdR, color: 'var(--fg)' }}>{fmtNum(o.price, o.price < 1 ? 4 : 2)}</td>
            <td style={{ ...tdR, color: 'var(--fg-2)' }}>{o.amt} {o.sym}</td>
            <td style={tdR}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                <div style={{ width: 50, height: 5, borderRadius: 3, background: 'var(--surface-input)', overflow: 'hidden' }}>
                  <div style={{ width: o.filled + '%', height: '100%', background: 'var(--brand-mint)' }} />
                </div>
                <span style={{ color: 'var(--fg-3)', width: 34 }}>{o.filled}%</span>
              </div>
            </td>
            <td style={{ ...tdR, color: 'var(--fg-3)' }}>{o.time.replace('Today · ', '')}</td>
            <td style={tdR}><button style={{ border: '1px solid var(--border-subtle)', background: 'none', color: 'var(--fg-2)', borderRadius: 'var(--r-xs)', padding: '5px 13px', cursor: 'pointer', font: 'var(--nano)' }}>Cancel</button></td>
          </tr>
        ))}
        {rows.length === 0 && <EmptyRow span={8} text="No open orders match your filters." />}
      </tbody>
    </table>
  );
}

function HistoryTable({ rows }: { rows: HistoryOrder[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><tr>
        <th style={thL}>Order ID</th><th style={thL}>Pair</th><th style={thL}>Side · Type</th>
        <th style={thR}>Price</th><th style={thR}>Amount</th><th style={thR}>Total</th>
        <th style={thR}>Status</th><th style={thR}>Time</th>
      </tr></thead>
      <tbody>
        {rows.map((o, i) => (
          <tr key={i} style={{ borderTop: '1px solid var(--border-hairline)', font: '500 13px var(--font-num)', fontVariantNumeric: 'tabular-nums' }}>
            <td style={{ ...tdL, color: 'var(--fg-3)', font: '500 12px var(--font-num)' }}>{o.id}</td>
            <td style={tdL}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <CoinBadge sym={o.sym} size={26} />
                <span style={{ fontWeight: 700, color: 'var(--fg)', font: 'var(--small)' }}>{o.sym}/USDT</span>
              </div>
            </td>
            <td style={{ ...tdL, color: o.side === 'buy' ? 'var(--up)' : 'var(--down)', textTransform: 'capitalize', fontWeight: 700 }}>{o.side} · {o.type}</td>
            <td style={{ ...tdR, color: 'var(--fg)' }}>{fmtNum(o.price, o.price < 1 ? 4 : 2)}</td>
            <td style={{ ...tdR, color: 'var(--fg-2)' }}>{o.amt} {o.sym}</td>
            <td style={{ ...tdR, color: 'var(--fg-2)' }}>{fmtUSD(o.price * o.amt)}</td>
            <td style={tdR}><StatusBadge status={o.status} /></td>
            <td style={{ ...tdR, color: 'var(--fg-3)' }}>{o.time.replace('Today · ', 'Today ')}</td>
          </tr>
        ))}
        {rows.length === 0 && <EmptyRow span={8} text="No orders in this period." />}
      </tbody>
    </table>
  );
}

function TradesTable({ rows }: { rows: Fill[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><tr>
        <th style={thL}>Pair</th><th style={thL}>Side</th>
        <th style={thR}>Fill price</th><th style={thR}>Amount</th>
        <th style={thR}>Total</th><th style={thR}>Fee</th>
        <th style={thR}>Role</th><th style={thR}>Time</th>
      </tr></thead>
      <tbody>
        {rows.map((o, i) => (
          <tr key={i} style={{ borderTop: '1px solid var(--border-hairline)', font: '500 13px var(--font-num)', fontVariantNumeric: 'tabular-nums' }}>
            <td style={tdL}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <CoinBadge sym={o.sym} size={26} />
                <span style={{ fontWeight: 700, color: 'var(--fg)', font: 'var(--small)' }}>{o.sym}/USDT</span>
              </div>
            </td>
            <td style={{ ...tdL, color: o.side === 'buy' ? 'var(--up)' : 'var(--down)', textTransform: 'capitalize', fontWeight: 700 }}>{o.side}</td>
            <td style={{ ...tdR, color: 'var(--fg)' }}>{fmtNum(o.price, o.price < 1 ? 4 : 2)}</td>
            <td style={{ ...tdR, color: 'var(--fg-2)' }}>{o.amt} {o.sym}</td>
            <td style={{ ...tdR, color: 'var(--fg-2)' }}>{fmtUSD(o.price * o.amt)}</td>
            <td style={{ ...tdR, color: 'var(--fg-3)' }}>{fmtUSD(o.fee)}</td>
            <td style={tdR}><Pill tone={o.role === 'Maker' ? 'info' : 'neutral'}>{o.role}</Pill></td>
            <td style={{ ...tdR, color: 'var(--fg-3)' }}>{o.time.replace('Today · ', 'Today ')}</td>
          </tr>
        ))}
        {rows.length === 0 && <EmptyRow span={8} text="No fills in this period." />}
      </tbody>
    </table>
  );
}

/* ── OrdersPage ─────────────────────────────────────────────────── */
export function OrdersPage() {
  const router = useRouter();
  const [tab, setTab] = useState('open');
  const [pair, setPair] = useState('all');
  const [side, setSide] = useState('all');

  const tabs: [string, string, number][] = [
    ['open',    'Open orders',    OPEN_ORDERS.length],
    ['history', 'Order history',  ORDER_HISTORY.length],
    ['trades',  'Trade history',  FILLS.length],
  ];

  function flt<T extends { sym: string; side: string }>(arr: T[]): T[] {
    return arr.filter(o => (pair === 'all' || o.sym === pair) && (side === 'all' || o.side === side));
  }

  return (
    <TradingLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ font: 'var(--h1)', color: 'var(--fg)', letterSpacing: '-.01em' }}>Orders</h1>
            <p style={{ font: 'var(--small)', color: 'var(--fg-3)', marginTop: 4 }}>Manage open orders, review history and individual fills</p>
          </div>
          <button onClick={() => router.push('/trade?sym=BTC')} style={btnBrand}>
            <TIcon name="plus" size={16} color="#0b1020" />New order
          </button>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--border-hairline)' }}>
          {tabs.map(([id, l, n]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', border: 'none', background: 'none',
              cursor: 'pointer', font: 'var(--small)',
              color: tab === id ? 'var(--fg)' : 'var(--fg-3)',
              borderBottom: tab === id ? '2px solid var(--brand-mint)' : '2px solid transparent',
              marginBottom: -1,
            }}>
              {l}
              <span style={{ font: 'var(--nano)', color: tab === id ? 'var(--brand-mint)' : 'var(--fg-4)', background: tab === id ? 'rgba(0,255,163,.12)' : 'rgba(255,255,255,.06)', padding: '2px 7px', borderRadius: 'var(--r-pill)' }}>{n}</span>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <FilterBar pair={pair} setPair={setPair} side={side} setSide={setSide}
            extra={tab === 'open' && (
              <button style={{ ...btnGhost, height: 38, color: 'var(--down)', borderColor: 'rgba(255,77,77,.3)' }}>
                <TIcon name="x" size={14} color="var(--down)" />Cancel all
              </button>
            )} />
        </div>

        <Panel pad={0} style={{ overflow: 'hidden' }}>
          {tab === 'open'    && <OpenTable    rows={flt(OPEN_ORDERS)} />}
          {tab === 'history' && <HistoryTable rows={flt(ORDER_HISTORY)} />}
          {tab === 'trades'  && <TradesTable  rows={flt(FILLS)} />}
        </Panel>
      </div>
    </TradingLayout>
  );
}
