import { Sidebar } from '@/components/ui/sidebar';

export default function AssignmentsPage() {
  return (
    <div className="flex pt-16 min-h-screen">
      {/* SIDEBAR */}
      <Sidebar activeSubject="History" />

      {/* MAIN */}
      <main className="flex-1 overflow-x-hidden">
        <div className="px-10 py-10">
          {/* Header + progress */}
          <div className="mb-7">
            <h1 className="qs font-bold text-[36px] text-[#0b1c30] mb-4">Assignment Tracker</h1>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 bg-[#e5eeff] rounded-full overflow-hidden" style={{ maxWidth: '600px' }}>
                <div className="h-full rounded-full" style={{ width: '65%', background: 'linear-gradient(90deg,#006e2f,#22c55e)' }}></div>
              </div>
              <span className="text-sm font-bold text-[#006e2f] whitespace-nowrap">65% Term Complete</span>
            </div>
          </div>

          {/* Calendar + Deadlines */}
          <div className="grid grid-cols-5 gap-6 mb-7">
            {/* CALENDAR */}
            <div className="col-span-3 card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="qs font-bold text-xl text-[#0b1c30]">November 2024</h2>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 rounded hover:bg-[#eff4ff] flex items-center justify-center text-[#3d4a3d]">
                    <span className="mat">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 rounded hover:bg-[#eff4ff] flex items-center justify-center text-[#3d4a3d]">
                    <span className="mat">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="p-2 text-[#6d7b6c] font-semibold">{day}</div>
                ))}
                {Array.from({ length: 42 }).map((_, idx) => {
                  const day = idx - 3;
                  const isToday = day === 15;
                  const hasEvent = [8, 15, 22, 28].includes(day);
                  
                  return (
                    <div
                      key={idx}
                      className={`cal-cell p-3 text-xs ${isToday ? 'cal-cell today' : ''} ${day < 1 || day > 30 ? 'cal-cell other-month' : ''}`}
                    >
                      <div className="font-semibold text-[#0b1c30]">{day > 0 && day <= 30 ? day : ''}</div>
                      {hasEvent && day > 0 && day <= 30 && (
                        <span className="event-tag bg-[#ff8e4d] text-white">Due</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DEADLINES */}
            <div className="col-span-2 card p-6">
              <h2 className="qs font-bold text-lg text-[#0b1c30] mb-4">Upcoming Deadlines</h2>
              <div className="space-y-3">
                <div className="rounded-lg border border-[#e5eeff] p-3 hover:bg-[#f8f9ff] transition">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-[#0b1c30] text-sm">History Essay</p>
                    <span className="text-[10px] font-bold text-[#ff8e4d]">2 days</span>
                  </div>
                  <p className="text-xs text-[#6d7b6c]">Due Nov 8, 5:00 PM</p>
                </div>
                <div className="rounded-lg border border-[#e5eeff] p-3 hover:bg-[#f8f9ff] transition">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-[#0b1c30] text-sm">Math Assignment</p>
                    <span className="text-[10px] font-bold text-[#006e2f]">5 days</span>
                  </div>
                  <p className="text-xs text-[#6d7b6c]">Due Nov 11, 8:00 PM</p>
                </div>
                <div className="rounded-lg border border-[#e5eeff] p-3 hover:bg-[#f8f9ff] transition">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-[#0b1c30] text-sm">Science Project</p>
                    <span className="text-[10px] font-bold text-[#0058be]">7 days</span>
                  </div>
                  <p className="text-xs text-[#6d7b6c]">Due Nov 13, 3:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* SUBMISSIONS TABLE */}
          <div className="card p-6">
            <h2 className="qs font-bold text-lg text-[#0b1c30] mb-5">Your Submissions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5eeff]">
                    <th className="text-left p-3 text-[#6d7b6c] font-semibold">Assignment</th>
                    <th className="text-left p-3 text-[#6d7b6c] font-semibold">Subject</th>
                    <th className="text-left p-3 text-[#6d7b6c] font-semibold">Status</th>
                    <th className="text-left p-3 text-[#6d7b6c] font-semibold">Submitted</th>
                    <th className="text-left p-3 text-[#6d7b6c] font-semibold">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Chapter 1 Summary', subject: 'History', status: 'Graded', submitted: 'Nov 3', grade: 'A' },
                    { name: 'Quadratic Equations', subject: 'Mathematics', status: 'Submitted', submitted: 'Nov 4', grade: '—' },
                    { name: 'Lab Report', subject: 'Science', status: 'Under Review', submitted: 'Nov 5', grade: '—' }
                  ].map((item) => (
                    <tr key={item.name} className="tr border-b border-[#e5eeff] hover:bg-[#f8f9ff]">
                      <td className="p-3 font-semibold text-[#0b1c30]">{item.name}</td>
                      <td className="p-3 text-[#3d4a3d]">{item.subject}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'Graded' ? 'bg-[#22c55e]/15 text-[#006e2f]' :
                          item.status === 'Submitted' ? 'bg-[#0058be]/15 text-[#0058be]' :
                          'bg-[#ff8e4d]/15 text-[#ff8e4d]'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-[#6d7b6c]">{item.submitted}</td>
                      <td className="p-3 font-semibold text-[#0b1c30]">{item.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
