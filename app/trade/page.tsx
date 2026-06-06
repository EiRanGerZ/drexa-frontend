import { TradePage } from '@/features/trade/presentation/pages/trade_page';

export default async function Page({ searchParams }: { searchParams: Promise<{ sym?: string }> }) {
  const { sym } = await searchParams;
  return <TradePage sym={sym ?? 'BTC'} />;
}
