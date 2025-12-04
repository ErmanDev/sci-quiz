// Helper utilities for resolving avatar image URLs so they work in production builds.
// This uses Vite's import.meta.glob to bundle all avatar images under Image/AVATAR.

const avatarModules = (() => {
  try {
    // Typed as `any` so this file works in both TS-aware and JS builds without
    // extending the ImportMeta type just for `glob`.
    const mods = (import.meta as any).glob('/Image/AVATAR/*.{png,jpg,jpeg,webp,svg,gif}', {
      eager: true,
      import: 'default',
    }) as Record<string, string>;

    const map: Record<string, string> = {};
    for (const [abs, url] of Object.entries(mods)) {
      const filename = abs.split('/').pop()!;
      map[filename] = url as string;
    }
    return map;
  } catch {
    return {} as Record<string, string>;
  }
})();

const DEFAULT_AVATAR_FILENAME = 'Cel-L.png';

/** Resolve any stored avatar value (filename, `/Image/AVATAR/...`, or full URL) to a usable src. */
export function resolveAvatar(avatar: string | null | undefined): string | undefined {
  if (!avatar) return undefined;

  // Preserve absolute/http/data URLs as‑is
  if (/^https?:\/\//i.test(avatar) || avatar.startsWith('data:')) {
    return avatar;
  }

  // If a full `/Image/AVATAR/...` path was stored, derive the filename from it.
  const filename = avatar.split('/').pop() || avatar;

  // Prefer bundled asset URL when available (so it works from `dist/`)
  if (avatarModules[filename]) {
    return avatarModules[filename];
  }

  // Fallback to a public path – works if the `Image` folder is copied alongside `index.html`
  if (avatar.startsWith('/Image/AVATAR/')) {
    return avatar;
  }

  return `/Image/AVATAR/${filename}`;
}

/** Default avatar (used when no custom avatar is provided). */
export function defaultAvatar(): string | undefined {
  return resolveAvatar(DEFAULT_AVATAR_FILENAME);
}


