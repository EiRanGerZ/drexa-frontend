import { AssetPage } from '@/features/markets/presentation/pages/asset_page';

export default async function Page({ params }: { params: Promise<{ sym: string }> }) {
  const { sym } = await params;
  return <AssetPage sym={sym} />;
}
