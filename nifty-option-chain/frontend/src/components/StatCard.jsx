export function StatCard({ label, value, sub, color = 'text-white', size = 'text-2xl' }) {
  return (
    <div className="bg-navy-800 border border-white/5 rounded-lg p-4 flex flex-col gap-1">
      <span className="text-xs text-gray-400 uppercase tracking-widest">{label}</span>
      <span className={`${size} font-bold ${color} leading-none`}>{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  )
}
