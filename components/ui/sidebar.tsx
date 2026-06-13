import Link from 'next/link';

interface SidebarProps {
  activeSubject?: string;
}

export function Sidebar({ activeSubject = 'Mathematics' }: SidebarProps) {
  const subjects = [
    { id: 'mathematics', label: 'Mathematics', icon: 'grid_on', color: '#006e2f' },
    { id: 'science', label: 'Science', icon: 'science', color: '#0058be' },
    { id: 'english', label: 'English', icon: 'menu_book', color: '#9d4300' },
    { id: 'history', label: 'History', icon: 'history_edu', color: '#6d7b6c' },
    { id: 'arts', label: 'Arts', icon: 'palette', color: '#9d4300' },
  ];

  return (
    <aside className="w-52 shrink-0 bg-white border-r border-[#e5eeff] sticky top-16 h-[calc(100vh-64px)] flex flex-col py-5 px-3 overflow-y-auto">
      <div className="mb-5 px-2">
        <p className="text-[#0058be] font-semibold text-sm">Welcome back!</p>
        <p className="text-[#3d4a3d] text-xs mt-0.5 flex items-center gap-1">
          Current Streak: 5 Days <span className="mat-fill text-[#ff8e4d] text-sm">local_fire_department</span>
        </p>
      </div>
      <nav className="flex flex-col gap-0.5 flex-1">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/dashboard/${subject.id}`}
            className={`sub-link ${subject.id === activeSubject?.toLowerCase() ? 'active' : ''}`}
          >
            <span className="mat" style={{ color: subject.color }}>
              {subject.icon}
            </span>
            {subject.label}
          </Link>
        ))}
      </nav>
      <button className="mt-4 w-full btn-3d-green bg-[#ff8e4d] text-white rounded-xl py-3 text-sm font-bold qs hover:bg-[#f07030] transition-colors flex items-center justify-center gap-1.5">
        <span className="mat text-lg">bolt</span>Start Daily Quest
      </button>
    </aside>
  );
}
