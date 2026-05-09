// ============================================================
// Auth Types — Math Battle Offline
// Không cần email, không cần password, không Supabase
// ============================================================

export interface UserProfile {
  name: string;
  avatar: string;       // emoji avatar: '🧙‍♂️', '🐼', '🦊', ...
  joinedAt: string;     // ISO string
  hasCompletedTutorial: boolean;
}

export const AVATAR_OPTIONS = [
  '🧙‍♂️', '🐼', '🦊', '🐝', '🦁', '🐸', '🤖', '👾',
];
