#!/usr/bin/env python3
"""
SQLite → Supabase 마이그레이션 스크립트

기존 petswgwon-prto-temp의 SQLite 데이터(12,608건)를
새 프로젝트의 Supabase PostgreSQL로 이관합니다.

사용법:
  python3 scripts/migrate-sqlite-to-supabase.py
"""

import sqlite3
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

# ── 경로 설정 ──
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
SQLITE_PATH = PROJECT_ROOT / "docs" / "petswgwon-prto-temp" / "prisma" / "dev.db"

# ── .env.local에서 환경변수 읽기 ──
def load_env():
    env_path = PROJECT_ROOT / ".env.local"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, val = line.partition("=")
                os.environ.setdefault(key.strip(), val.strip())

load_env()

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ SUPABASE_URL 또는 KEY가 설정되지 않았습니다.")
    sys.exit(1)

# ── ENUM 유효값 ──
VALID_CATEGORIES = {
    "food_beverage", "medical_health", "accommodation_travel",
    "pet_service", "play_shopping",
}
VALID_SUB_CATEGORIES = {
    "restaurant", "bar", "cafe",
    "vet", "pharmacy",
    "accommodation", "travel", "camping",
    "funeral", "grooming", "hotel_care",
    "supplies", "playground",
}

BATCH_SIZE = 200  # Supabase REST API 배치 크기


def safe_json(text, fallback):
    """JSON 문자열을 안전하게 파싱"""
    if not text or text.strip() == "":
        return fallback
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return fallback


def ms_to_iso(ms):
    """밀리초 타임스탬프 → ISO 8601 문자열"""
    if not ms or ms <= 0:
        return datetime.now(timezone.utc).isoformat()
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).isoformat()


def transform_place(row):
    """SQLite 행 → Supabase insert용 dict"""
    cols = [
        "id", "name", "category", "sub_category", "address", "address_jibun",
        "phone", "lat", "lng", "thumbnail", "images", "tags", "business_hours",
        "access_method", "small_dog", "medium_dog", "large_dog", "indoor_allowed",
        "pet_etiquette", "caution", "updated_at", "created_at",
    ]
    d = dict(zip(cols, row))

    # ENUM 유효성 확인
    if d["category"] not in VALID_CATEGORIES:
        return None
    if d["sub_category"] not in VALID_SUB_CATEGORIES:
        return None

    return {
        "name": d["name"] or "",
        "category": d["category"],
        "sub_category": d["sub_category"],
        "address": d["address"] or "",
        "address_jibun": d["address_jibun"] or "",
        "phone": d["phone"] or "",
        "lat": float(d["lat"]),
        "lng": float(d["lng"]),
        "thumbnail": d["thumbnail"] or "",
        "images": safe_json(d["images"], []),
        "tags": safe_json(d["tags"], []),
        "business_hours": safe_json(d["business_hours"], {}),
        "access_method": d["access_method"] or "",
        "small_dog": bool(d["small_dog"]),
        "medium_dog": bool(d["medium_dog"]),
        "large_dog": bool(d["large_dog"]),
        "indoor_allowed": bool(d["indoor_allowed"]),
        "pet_etiquette": safe_json(d["pet_etiquette"], []),
        "caution": d["caution"] or "",
        "created_at": ms_to_iso(d["created_at"]),
        "updated_at": ms_to_iso(d["updated_at"]),
    }


def supabase_insert(records):
    """Supabase REST API로 배치 insert"""
    url = f"{SUPABASE_URL}/rest/v1/places"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    body = json.dumps(records).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, None
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        return e.code, error_body
    except Exception as e:
        return 0, str(e)


def main():
    print("🚀 SQLite → Supabase 마이그레이션")
    print(f"   SQLite: {SQLITE_PATH}")
    print(f"   Supabase: {SUPABASE_URL}")
    print()

    if not SQLITE_PATH.exists():
        print(f"❌ SQLite 파일을 찾을 수 없습니다: {SQLITE_PATH}")
        sys.exit(1)

    # 1. SQLite에서 읽기
    conn = sqlite3.connect(str(SQLITE_PATH))
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM places")
    total = cursor.fetchone()[0]
    print(f"📊 SQLite places: {total:,}건")

    cursor.execute("SELECT * FROM places")
    rows = cursor.fetchall()
    conn.close()

    # 2. 변환
    transformed = []
    skipped = 0
    for row in rows:
        place = transform_place(row)
        if place:
            transformed.append(place)
        else:
            skipped += 1

    print(f"✅ 변환 완료: {len(transformed):,}건")
    if skipped:
        print(f"⚠️  스킵 (유효하지 않은 카테고리): {skipped}건")
    print()

    # 3. Supabase에 기존 데이터 확인
    check_url = f"{SUPABASE_URL}/rest/v1/places?select=id&limit=1"
    check_headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    try:
        check_req = urllib.request.Request(check_url, headers=check_headers)
        with urllib.request.urlopen(check_req, timeout=10) as resp:
            existing = json.loads(resp.read())
            if existing:
                print(f"⚠️  Supabase places 테이블에 이미 데이터가 있습니다.")
                answer = input("   계속 진행하시겠습니까? (y/N): ").strip().lower()
                if answer != "y":
                    print("   마이그레이션을 취소합니다.")
                    sys.exit(0)
                print()
    except Exception:
        pass  # 테이블이 비어있거나 접근 불가 → 진행

    # 4. 배치 삽입
    inserted = 0
    errors = 0
    total_batches = (len(transformed) + BATCH_SIZE - 1) // BATCH_SIZE

    for i in range(0, len(transformed), BATCH_SIZE):
        batch = transformed[i : i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1

        status, err = supabase_insert(batch)

        if status == 201 or status == 200:
            inserted += len(batch)
        else:
            print(f"\n❌ 배치 {batch_num}/{total_batches} 실패 (HTTP {status})")
            if err:
                print(f"   {err[:200]}")

            # 개별 삽입 재시도
            for item in batch:
                s, e = supabase_insert([item])
                if s in (200, 201):
                    inserted += 1
                else:
                    errors += 1
                    if errors <= 5:
                        print(f"   실패: {item['name']} - {e[:100] if e else 'unknown'}")

        progress = min(100, round((i + len(batch)) / len(transformed) * 100))
        sys.stdout.write(
            f"\r📤 업로드 중... {progress}% ({inserted:,}건 완료)"
        )
        sys.stdout.flush()

    print("\n")
    print("━" * 36)
    print(f"✅ 마이그레이션 완료!")
    print(f"   성공: {inserted:,}건")
    if errors:
        print(f"   실패: {errors}건")
    print("━" * 36)


if __name__ == "__main__":
    main()
