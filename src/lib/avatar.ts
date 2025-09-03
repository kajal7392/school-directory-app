// src/lib/avatar.ts

// Changed return type from any to string for generateAvatar
export function generateAvatar(name: string, size: number = 100): string {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

// Get avatar URL or fallback initial letter
export function getAvatar(user: { avatar?: string; username?: string; email?: string } | null | undefined): string {
  if (user?.avatar) {
    return user.avatar;
  }
  const base = user?.username || user?.email || '?';
  return base.charAt(0).toUpperCase();
}

// Get consistent avatar color based on user ID
export function getAvatarColor(userId: number): string {
  const colors = [
    '#3B82F6', // blue-500
    '#EF4444', // red-500
    '#10B981', // green-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
  ];
  return colors[userId % colors.length];
}
