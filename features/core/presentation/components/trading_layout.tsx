"use client"

import React from 'react';
import { TopNav } from './top_nav';

export function TradingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', position: 'relative' }}>
      {/* ambient glow */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: 720, height: 480, left: '-200px', top: '-240px',
          background: 'var(--glow-blue)', borderRadius: '50%', filter: 'blur(90px)',
        }} />
        <div style={{
          position: 'absolute', width: 560, height: 420, right: '-160px', bottom: '-220px',
          background: 'var(--glow-mint)', borderRadius: '50%', filter: 'blur(100px)',
        }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <TopNav />
        <main>{children}</main>
      </div>
    </div>
  );
}
