interface StatCardProps {
  label: string
  value: string
  color?: string
}

export function StatCard({ label, value, color = 'text-gray-700' }: StatCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-base font-semibold ${color}`}>{value}</p>
    </div>
  )
}
