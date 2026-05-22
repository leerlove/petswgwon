import { describe, it, expect } from 'vitest';
import { canAccessAdminPath } from './adminRole';

describe('canAccessAdminPath', () => {
  it('super_admin/admin은 모든 admin 경로에 접근 가능', () => {
    for (const role of ['admin', 'super_admin'] as const) {
      expect(canAccessAdminPath(role, '/admin')).toBe(true);
      expect(canAccessAdminPath(role, '/admin/places')).toBe(true);
      expect(canAccessAdminPath(role, '/admin/playgrounds/123')).toBe(true);
      expect(canAccessAdminPath(role, '/admin/magazine')).toBe(true);
    }
  });

  it('playground은 대시보드(/admin)에 접근 가능', () => {
    expect(canAccessAdminPath('playground', '/admin')).toBe(true);
  });

  it('playground은 놀이터 관리 경로에 접근 가능', () => {
    expect(canAccessAdminPath('playground', '/admin/playgrounds')).toBe(true);
    expect(canAccessAdminPath('playground', '/admin/playgrounds/new')).toBe(true);
    expect(canAccessAdminPath('playground', '/admin/playgrounds/abc-123')).toBe(true);
  });

  it('playground은 그 외 admin 경로에 접근 불가', () => {
    expect(canAccessAdminPath('playground', '/admin/places')).toBe(false);
    expect(canAccessAdminPath('playground', '/admin/places/123')).toBe(false);
    expect(canAccessAdminPath('playground', '/admin/magazine')).toBe(false);
    expect(canAccessAdminPath('playground', '/admin/quality')).toBe(false);
    expect(canAccessAdminPath('playground', '/admin/stats')).toBe(false);
    expect(canAccessAdminPath('playground', '/admin/data')).toBe(false);
    expect(canAccessAdminPath('playground', '/admin/reviews')).toBe(false);
  });

  it('playground 경로 prefix 오탐 방지(/admin/playgrounds-foo 같은 건 불가)', () => {
    expect(canAccessAdminPath('playground', '/admin/playgroundsX')).toBe(false);
    expect(canAccessAdminPath('playground', '/admin/places-playgrounds')).toBe(false);
  });
});
