#!/usr/bin/env python3
"""
Convert CSV files from 'datas in map' to places-data.json format.

Usage:
  python scripts/convert-csv-to-json.py

CSV 폴더 경로는 프로젝트 루트의 'datas in map/26.03.20-merged-category/' 입니다.
생성된 JSON은 scripts/places-data.json 에 저장됩니다.
"""

import csv
import json
import os
import re
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
BASE_DIR = os.path.join(PROJECT_ROOT, 'datas in map', '26.03.20-merged-category')
OUTPUT = os.path.join(SCRIPT_DIR, 'places-data.json')

# Category Korean name → English ID mapping
CATEGORY_MAP = {
    '식음료': 'food_beverage',
    '의료및건강': 'medical_health',
    '숙박및여행': 'accommodation_travel',
    '반려동물서비스': 'pet_service',
    '놀이및쇼핑': 'play_shopping',
    '기타': 'etc',
}

# Subcategory Korean name → English ID mapping
SUB_CATEGORY_MAP = {
    '음식점': 'restaurant',
    '주점': 'bar',
    '카페': 'cafe',
    '동물병원': 'vet',
    '동물약국': 'pharmacy',
    '숙박': 'accommodation',
    '여행': 'travel',
    '캠핑': 'camping',
    '동물장묘업': 'funeral',
    '미용': 'grooming',
    '호텔링및위탁관리': 'hotel_care',
    '용품판매': 'supplies',
    '쇼핑': 'shopping',
    '펫용품': 'pet_supplies',
    '운동장': 'playground',
    '입력대기': 'pending',
}


def parse_pet_size(size_str: str) -> dict:
    """Parse '입장가능동물크기' string into small_dog/medium_dog/large_dog booleans."""
    if not size_str or size_str.strip() == '':
        return {'small_dog': True, 'medium_dog': True, 'large_dog': True}

    s = size_str.strip().lower()

    if s in ('모두 가능', '해당없음'):
        return {'small_dog': True, 'medium_dog': True, 'large_dog': True}

    if s in ('대형',):
        return {'small_dog': True, 'medium_dog': True, 'large_dog': True}

    if '중형/대형' in s:
        return {'small_dog': True, 'medium_dog': True, 'large_dog': True}

    if '소형/대형' in s:
        return {'small_dog': True, 'medium_dog': False, 'large_dog': True}

    # Extract weight limit
    weight_match = re.search(r'(\d+)\s*kg', s, re.IGNORECASE)
    if weight_match:
        weight = int(weight_match.group(1))
        if weight <= 5:
            return {'small_dog': True, 'medium_dog': False, 'large_dog': False}
        elif weight <= 15:
            return {'small_dog': True, 'medium_dog': True, 'large_dog': False}
        else:
            return {'small_dog': True, 'medium_dog': True, 'large_dog': True}

    if '소형' in s and '중형' not in s and '대형' not in s:
        return {'small_dog': True, 'medium_dog': False, 'large_dog': False}

    if '소형/중형' in s or ('소형' in s and '중형' in s):
        return {'small_dog': True, 'medium_dog': True, 'large_dog': False}

    # Default: allow all
    return {'small_dog': True, 'medium_dog': True, 'large_dog': True}


def parse_business_hours(hours_str: str, closed_str: str) -> dict:
    """Parse business hours and closed days into the expected format."""
    result = {}
    if hours_str and hours_str.strip():
        result['hours'] = hours_str.strip()
    if closed_str and closed_str.strip():
        result['closedDays'] = closed_str.strip()
    return result


def generate_tags(row: dict) -> list:
    """Generate tags based on category and subcategory."""
    tags = []
    subcat = row.get('통합소분류', '')

    if subcat:
        tags.append(subcat)

    tag_map = {
        '식음료': ['실내'],
        '의료및건강': ['실내'],
        '숙박및여행': [],
        '반려동물서비스': ['실내'],
        '놀이및쇼핑': [],
        '기타': [],
    }
    cat = row.get('통합카테고리', '')
    tags.extend(tag_map.get(cat, []))

    return tags


def convert_row(row: dict) -> dict:
    """Convert a CSV row to the places-data.json format."""
    now = datetime.now(timezone.utc).isoformat()

    cat_ko = row.get('통합카테고리', '').strip()
    subcat_ko = row.get('통합소분류', '').strip()

    category = CATEGORY_MAP.get(cat_ko, cat_ko)
    sub_category = SUB_CATEGORY_MAP.get(subcat_ko, subcat_ko)

    lat = None
    lng = None
    try:
        lat = float(row.get('위도', '')) if row.get('위도', '').strip() else None
    except (ValueError, TypeError):
        lat = None
    try:
        lng = float(row.get('경도', '')) if row.get('경도', '').strip() else None
    except (ValueError, TypeError):
        lng = None

    pet_size = parse_pet_size(row.get('입장가능동물크기', ''))
    biz_hours = parse_business_hours(
        row.get('운영시간', ''),
        row.get('휴무일', '')
    )

    phone = row.get('전화번호', '').strip()
    if phone == '미집계':
        phone = ''

    return {
        'name': row.get('장소명', '').strip(),
        'category': category,
        'sub_category': sub_category,
        'address': row.get('도로명주소', '').strip(),
        'address_jibun': row.get('지번주소', '').strip(),
        'phone': phone,
        'lat': lat,
        'lng': lng,
        'thumbnail': '',
        'images': [],
        'tags': generate_tags(row),
        'business_hours': biz_hours,
        'access_method': '',
        'small_dog': pet_size['small_dog'],
        'medium_dog': pet_size['medium_dog'],
        'large_dog': pet_size['large_dog'],
        'indoor_allowed': True,
        'pet_etiquette': [],
        'caution': '',
        'created_at': now,
        'updated_at': now,
    }


def main():
    if not os.path.isdir(BASE_DIR):
        print(f'Error: CSV directory not found: {BASE_DIR}')
        return

    all_places = []

    for filename in sorted(os.listdir(BASE_DIR)):
        if not filename.endswith('.csv'):
            continue

        filepath = os.path.join(BASE_DIR, filename)
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                name = row.get('장소명', '').strip()
                if not name:
                    continue
                place = convert_row(row)
                all_places.append(place)
                count += 1
            print(f'{filename}: {count} records')

    all_places.sort(key=lambda x: x['name'])

    print(f'\nTotal: {len(all_places)} records')

    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(all_places, f, ensure_ascii=False)

    print(f'Written to {OUTPUT}')
    print(f'File size: {os.path.getsize(OUTPUT) / 1024 / 1024:.2f} MB')


if __name__ == '__main__':
    main()
