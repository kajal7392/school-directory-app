// src/lib/avatar.ts - This is a pure utility function
export function getAvatar(user: any): string {
  if (user?.avatar) {
    return user.avatar;
  }
  const base = user?.username || user?.email || '?';
  return base.charAt(0).toUpperCase();
}

export function getAvatarColor(userId: number): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];
  return colors[userId % colors.length];
}