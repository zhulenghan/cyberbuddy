interface WeeklyActivityDotsProps {
  weekData: number[] // 7 days, 1 = active, 0 = inactive
  startDate?: string
  endDate?: string
}

export function WeeklyActivityDots({ weekData, startDate, endDate }: WeeklyActivityDotsProps) {
  const activeDays = weekData.filter(Boolean).length

  return (
    <div className="bg-vibe-gray-500 rounded p-4 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[8px] font-bold">{startDate || '10/03'}</span>
        <span className="text-[8px] font-bold">{endDate || '10/09'}</span>
      </div>
      <div className="flex justify-center gap-2 mb-2">
        {weekData.map((active, i) => (
          <div
            key={i}
            className={`w-[10px] h-[10px] rounded-full transition-all duration-300 ${
              active ? 'bg-vibe-dark scale-110' : 'bg-vibe-gray-700'
            }`}
          />
        ))}
      </div>
      <p className="text-[8px] font-bold text-center">
        Days active {activeDays}/{weekData.length}
      </p>
    </div>
  )
}
