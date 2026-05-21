let loaded = false;
let loading: Promise<void> | null = null;

// 카카오맵 라이브러리(t1.daumcdn.net) 응답이 없을 때 무한 대기 방지용 타임아웃
const LOAD_TIMEOUT_MS = 7000;

export function loadKakaoMapSDK(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    let retryCount = 0;
    let settled = false;

    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      fn();
    };

    // kakao.maps.load() 콜백이 끝내 오지 않는 경우(CDN 도달 불가 등) 폴백 전환
    const timeoutId = setTimeout(() => {
      settle(() => {
        loading = null;
        reject(new Error('카카오맵 라이브러리 로드 시간 초과 (CDN 응답 없음)'));
      });
    }, LOAD_TIMEOUT_MS);

    const check = () => {
      if (settled) return;
      if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          settle(() => {
            loaded = true;
            resolve();
          });
        });
      } else {
        retryCount++;
        if (retryCount > 20) {
          settle(() => {
            loading = null;
            reject(new Error('카카오맵 SDK 로드 시간 초과'));
          });
          return;
        }
        setTimeout(check, 100);
      }
    };
    check();
  });

  return loading;
}
