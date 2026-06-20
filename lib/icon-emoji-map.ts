// Mapping of Material Icon names to emoji representations
export const iconEmojiMap: Record<string, string> = {
  'notifications': '🔔',
  'settings': '⚙️',
  'search': '🔍',
  'grid_on': '📊',
  'science': '🔬',
  'menu_book': '📚',
  'history_edu': '📜',
  'palette': '🎨',
  'school': '🏫',
  'assignment': '📋',
  'check_circle': '✅',
  'trending_up': '📈',
  'local_fire_department': '🔥',
  'chevron_left': '◀',
  'chevron_right': '▶',
  'bolt': '⚡',
  'admin_panel_settings': '🔧',
  'family_restroom': '👨‍👩‍👧‍👦',
  'logout': '🚪',
  'arrow_forward': '➡️',
  'add_chart': '📊',
  'manage_accounts': '👥',
  'library_books': '📚',
  'payments': '💳',
  'task_alt': '✔️',
  'group': '👥',
  'calendar_month': '📅',
};

export function getEmojiForIcon(iconName: string): string {
  return iconEmojiMap[iconName] || '•';
}
