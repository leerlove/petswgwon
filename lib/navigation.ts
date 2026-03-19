export function openNavigation(app: 'kakao' | 'tmap' | 'naver', place: { lat: number; lng: number; name: string }) {
  const { lat, lng, name } = place;
  const encodedName = encodeURIComponent(name);
  let url = '';
  if (app === 'kakao') {
    url = `https://map.kakao.com/link/to/${encodedName},${lat},${lng}`;
  } else if (app === 'tmap') {
    url = `tmap://route?goalname=${encodedName}&goalx=${lng}&goaly=${lat}`;
  } else {
    url = `nmap://route/walk?dlat=${lat}&dlng=${lng}&dname=${encodedName}`;
  }
  if (url.startsWith('http')) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = url;
  }
}
