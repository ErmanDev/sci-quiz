export const REQUIRE_VERIFICATION =
  process.env.REQUIRE_VERIFICATION === 'true';

export const API_URL = process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:4000';