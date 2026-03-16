export async function sharePlace(place: { name: string; address: string }): Promise<'shared' | 'copied' | 'failed'> {
  const shareData = {
    title: place.name,
    text: `${place.name} - ${place.address}`,
    url: window.location.href,
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return 'shared';
    } catch {
      return 'failed';
    }
  } else {
    try {
      await navigator.clipboard.writeText(`${place.name}\n${place.address}\n${window.location.href}`);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
}
