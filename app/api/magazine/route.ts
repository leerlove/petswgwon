import { NextResponse } from 'next/server';
import { getActiveThemes, matchesTheme } from '@/data/magazineThemes';
import { createClient } from '@/lib/supabase/server';
import { transformPlace } from '@/lib/supabase/transformPlace';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { themes, periodLabel, nextRotation } = getActiveThemes('biweekly', 3);

  const supabase = await createClient();
  const { data: allPlaces } = await supabase
    .from('places')
    .select('*')
    .limit(5000);

  const places = (allPlaces ?? []).map(transformPlace);

  const issues = themes.map((theme) => {
    const matched = places.filter((place) => matchesTheme(place, theme));
    return {
      theme,
      places: matched.slice(0, 20),
      placeCount: matched.length,
    };
  });

  return NextResponse.json({
    periodLabel,
    nextRotation,
    mode: 'biweekly',
    issues,
  });
}
