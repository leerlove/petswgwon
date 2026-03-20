#!/usr/bin/env python3
"""
카카오 로컬 API로 좌표 없는 장소의 위도/경도를 채워넣는 스크립트.

사용법:
  pip install requests
  python scripts/normalize-coords.py

※ 먼저 python scripts/convert-csv-to-json.py 로 places-data.json을 생성해야 합니다.
"""

import json
import os
import time
import requests

KAKAO_API_KEY = '8e2bc992d17e337a8881ea9165d867b7'

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(SCRIPT_DIR, 'places-data.json')

HEADERS = {'Authorization': f'KakaoAK {KAKAO_API_KEY}'}
API_URL = 'https://dapi.kakao.com/v2/local/search/address.json'

BATCH_DELAY = 0.05


def search_coords(query: str) -> tuple:
    """카카오 주소 검색으로 좌표 반환 (lat, lng)"""
    try:
        resp = requests.get(API_URL, headers=HEADERS, params={'query': query}, timeout=5)
        if resp.status_code == 200:
            docs = resp.json().get('documents', [])
            if docs:
                return float(docs[0]['y']), float(docs[0]['x'])
        elif resp.status_code == 429:
            print('\n⚠️ Rate limit hit, waiting 5s...')
            time.sleep(5)
            return search_coords(query)
    except Exception as e:
        print(f'\n❌ API error: {e}')
    return None, None


def main():
    if not os.path.exists(JSON_PATH):
        print(f'❌ {JSON_PATH} 파일이 없습니다.')
        print('   먼저 python scripts/convert-csv-to-json.py 를 실행하세요.')
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    need_coords = [i for i, p in enumerate(data) if p['lat'] is None or p['lng'] is None]

    print(f'📊 좌표 보정 대상: {len(need_coords)}건')
    print(f'📊 약 {len(need_coords) * BATCH_DELAY / 60:.1f}분 소요 예정')
    print()

    converted = 0
    failed = 0

    for idx, i in enumerate(need_coords):
        p = data[i]
        query = p['address'] or p['address_jibun']
        if not query:
            failed += 1
            continue

        lat, lng = search_coords(query)
        if lat and lng:
            data[i]['lat'] = lat
            data[i]['lng'] = lng
            converted += 1
        else:
            failed += 1

        done = idx + 1
        pct = done / len(need_coords) * 100
        print(f'\r🔄 좌표 보정: {done}/{len(need_coords)} ({pct:.1f}%) | 성공: {converted} | 실패: {failed}', end='', flush=True)
        time.sleep(BATCH_DELAY)

    print()
    print()
    print('━' * 40)
    print(f'✅ 좌표 보정 완료!')
    print(f'   성공: {converted}건')
    print(f'   실패: {failed}건')
    print('━' * 40)

    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)
    print(f'💾 저장 완료: {JSON_PATH}')


if __name__ == '__main__':
    main()
