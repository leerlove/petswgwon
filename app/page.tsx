import { redirect } from 'next/navigation';

// Forward any query params (e.g. lat/lng/zoom passed by the PetPass app) to the map page,
// since Next.js redirect() would otherwise drop the query string.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === 'string') qs.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
  }
  const query = qs.toString();
  redirect(query ? `/petzone?${query}` : '/petzone');
}
