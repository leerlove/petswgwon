#!/usr/bin/env python3
"""
카카오 로컬 API를 사용하여 주소 변환:
- 도로명주소만 있는 경우 → 지번주소 채우기
- 지번주소만 있는 경우 → 도로명주소 채우기

사용법:
  1. pip install requests
  2. python scripts/normalize-addresses.py

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

BATCH_DELAY = 0.05  # 초당 약 20건


def search_address(query: str) -> dict | None:
    """카카오 주소 검색 API 호출"""
    try:
        resp = requests.get(API_URL, headers=HEADERS, params={'query': query}, timeout=5)
        if resp.status_code == 200:
            docs = resp.json().get('documents', [])
            if docs:
                return docs[0]
        elif resp.status_code == 429:
            print('\n⚠️ Rate limit hit, waiting 5s...')
            time.sleep(5)
            return search_address(query)
    except Exception as e:
        print(f'\n❌ API error: {e}')
    return None


def extract_jibun(doc: dict) -> str:
    addr = doc.get('address')
    if addr:
        return addr.get('address_name', '')
    return ''


def extract_road(doc: dict) -> str:
    road = doc.get('road_address')
    if road:
        return road.get('address_name', '')
    return ''


def main():
    if not os.path.exists(JSON_PATH):
        print(f'❌ {JSON_PATH} 파일이 없습니다.')
        print('   먼저 python scripts/convert-csv-to-json.py 를 실행하세요.')
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    need_jibun = []
    need_road = []

    for i, p in enumerate(data):
        has_road = bool(p['address'].strip())
        has_jibun = bool(p['address_jibun'].strip())
        if has_road and not has_jibun:
            need_jibun.append(i)
        elif not has_road and has_jibun:
            need_road.append(i)

    total = len(need_jibun) + len(need_road)
    print(f'📊 변환 대상: 도로명→지번 {len(need_jibun)}건, 지번→도로명 {len(need_road)}건')
    print(f'📊 총 {total}건 API 호출 예정 (약 {total * BATCH_DELAY / 60:.1f}분 소요)')
    print()

    converted = 0
    failed = 0

    for idx, i in enumerate(need_jibun):
        p = data[i]
        doc = search_address(p['address'])
        if doc:
            jibun = extract_jibun(doc)
            if jibun:
                data[i]['address_jibun'] = jibun
                converted += 1
            else:
                failed += 1
        else:
            failed += 1

        done = idx + 1
        pct = done / len(need_jibun) * 100
        print(f'\r🔄 도로명→지번: {done}/{len(need_jibun)} ({pct:.1f}%) | 성공: {converted} | 실패: {failed}', end='', flush=True)
        time.sleep(BATCH_DELAY)

    print()

    for idx, i in enumerate(need_road):
        p = data[i]
        doc = search_address(p['address_jibun'])
        if doc:
            road = extract_road(doc)
            if road:
                data[i]['address'] = road
                converted += 1
            else:
                failed += 1
        else:
            failed += 1

        print(f'\r🔄 지번→도로명: {idx+1}/{len(need_road)} | 성공: {converted} | 실패: {failed}', end='', flush=True)
        time.sleep(BATCH_DELAY)

    print()
    print()
    print('━' * 40)
    print(f'✅ 변환 완료!')
    print(f'   성공: {converted}건')
    print(f'   실패: {failed}건')
    print('━' * 40)

    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)
    print(f'💾 저장 완료: {JSON_PATH}')


if __name__ == '__main__':
    main()
