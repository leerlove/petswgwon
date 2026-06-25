/**
 * Telecom output regression tests.
 *
 * Ensures that the telecom-facing routes (subdomain rewrites to
 * /petzone, /hotplace, /playground) remain structurally unchanged
 * after adding the app-exclusive /m/* routes.
 */
import { describe, it, expect } from 'vitest';
import { config as middlewareConfig } from '@/middleware';

// ────────────────────────────────────────────
// 1. Middleware matcher — structural invariant
// ────────────────────────────────────────────
describe('middleware matcher config', () => {
  it('matches only "/" and "/admin/:path*" — /m/* is never touched', () => {
    expect(middlewareConfig.matcher).toEqual(['/', '/admin/:path*']);
  });

  it('/m/* paths are not matched by the middleware', () => {
    const matchers = middlewareConfig.matcher;
    const mPaths = ['/m/petzone', '/m/hotplace', '/m/playground'];
    for (const p of mPaths) {
      const matched = matchers.some((pattern: string) => {
        if (pattern === '/') return p === '/';
        // Simple :path* wildcard check
        const prefix = pattern.replace('/:path*', '');
        return p === prefix || p.startsWith(prefix + '/');
      });
      expect(matched, `${p} should NOT be matched by middleware`).toBe(false);
    }
  });
});

// ────────────────────────────────────────────
// 2. Subdomain rewrite map — content invariant
// ────────────────────────────────────────────
describe('subdomain rewrite map', () => {
  it('maps exactly petzone/hotplace/playground subdomains to their routes', async () => {
    // Read the actual middleware source and verify the SUBDOMAIN_ROUTES constant
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const src = readFileSync(resolve(__dirname, '..', 'middleware.ts'), 'utf-8');

    // Extract the SUBDOMAIN_ROUTES object literal
    const match = src.match(
      new RegExp('const SUBDOMAIN_ROUTES[^=]*=\\s*(\\{[^}]+\\})', 's')
    );
    expect(match).not.toBeNull();
    const routeBlock = match![1];

    expect(routeBlock).toContain("petzone: '/petzone'");
    expect(routeBlock).toContain("hotplace: '/hotplace'");
    expect(routeBlock).toContain("playground: '/playground'");

    // No /m/ routes should appear in the rewrite map
    expect(routeBlock).not.toContain('/m/');
  });

  it('subdomain rewrite only triggers on pathname === "/"', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const src = readFileSync(resolve(__dirname, '..', 'middleware.ts'), 'utf-8');

    // The guard condition must check pathname === '/'
    expect(src).toContain("request.nextUrl.pathname === '/'");
  });
});

// ────────────────────────────────────────────
// 3. Telecom route files — existence & default export
// ────────────────────────────────────────────
describe('telecom route file integrity', () => {
  it.each([
    ['petzone', '@/app/(tabs)/petzone/page'],
    ['hotplace', '@/app/(tabs)/hotplace/page'],
    ['playground', '@/app/(tabs)/playground/page'],
  ])('%s page exports a default component', async (_name, modulePath) => {
    const mod = await import(modulePath);
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('tabs layout exports a default component', async () => {
    const mod = await import('@/app/(tabs)/layout');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });
});

// ────────────────────────────────────────────
// 4. hotplace ?post deep link — additive-only regression
// ────────────────────────────────────────────
describe('hotplace ?post deep link is additive-only', () => {
  it('hotplace page does NOT import bookmark tab bar or /m/ layout references', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const src = readFileSync(
      resolve(__dirname, '..', 'app', '(tabs)', 'hotplace', 'page.tsx'),
      'utf-8'
    );
    expect(src).not.toContain('/m/');
    expect(src).not.toContain('22C5CE');
    expect(src).not.toContain('BookmarkTab');
    expect(src).not.toContain('AppLayout');
  });

  it('?post handling only fires when searchParams has "post" key', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const src = readFileSync(
      resolve(__dirname, '..', 'app', '(tabs)', 'hotplace', 'page.tsx'),
      'utf-8'
    );
    // The ?post effect must guard on postParam being truthy
    expect(src).toContain("searchParams.get('post')");
    expect(src).toMatch(/if\s*\(\s*!postParam/);
  });

  it('hotplace page still exports the same default component shape', async () => {
    const mod = await import('@/app/(tabs)/hotplace/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
    expect(mod.default.name).toBe('HotPlacePage');
  });
});

// ────────────────────────────────────────────
// 5. /m/* layout — app-only bookmark tab isolation
// ────────────────────────────────────────────
describe('/m/ layout isolation', () => {
  it('exports a default component', async () => {
    const mod = await import('@/app/m/layout');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('tabs layout does NOT reference /m/ paths', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const src = readFileSync(
      resolve(__dirname, '..', 'app', '(tabs)', 'layout.tsx'),
      'utf-8'
    );
    expect(src).not.toContain('/m/');
  });
});
