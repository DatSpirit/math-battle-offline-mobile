// ============================================================
// Auth Types — Math Battle
// Hỗ trợ cả Offline (emoji avatar) và Online (Supabase Auth)
// ============================================================

export interface UserProfile {
  name: string;
  avatar: string;       // emoji avatar: '🧙‍♂️', '🐼', '🦊', ...
  joinedAt: string;     // ISO string
  hasCompletedTutorial: boolean;

  // === Online Mode (Sprint 1 — PvP) ===
  /** Internal DB user ID (cuid) */
  id?: string;
  /** Supabase Auth uid */
  supabaseId?: string;
  /** Email đăng ký (nếu có) */
  email?: string;
  /** ELO xếp hạng (server-managed) */
  elo?: number;
  /** Thứ hạng trên bảng xếp hạng */
  rank?: number;
}

export const AVATAR_OPTIONS = [
  '🧙‍♂️', '🐼', '🦊', '🐝', '🦁', '🐸', '🤖', '👾',
];
