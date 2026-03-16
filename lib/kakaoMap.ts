let loaded = false;
let loading: Promise<void> | null = null;

export function loadKakaoMapSDK(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    let retryCount = 0;
    let cancelled = false;

    const check = () => {
      if (cancelled) return;
      if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (!cancelled) {
            loaded = true;
            resolve();
          }
        });
      } else {
        retryCount++;
        if (retryCount > 20) {
          cancelled = true;
          loading = null;
          reject(new Error('카카오맵 SDK 로드 시간 초과'));
          return;
        }
        setTimeout(check, 100);
      }
    };
    check();
  });

  return loading;
}
