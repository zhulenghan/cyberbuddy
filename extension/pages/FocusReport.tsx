import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MonthlyBarChart } from '@/components/charts/MonthlyBarChart'
import { WeeklyActivityDots } from '@/components/charts/WeeklyActivityDots'
import { useActivityTracker } from '@/hooks/useActivityTracker'

export default function FocusReport() {
  const navigate = useNavigate()
  const { todayStats, getStatsForDate } = useActivityTracker()

  // TODO: Implement proper data fetching from backend
  // For now, use today's stats and provide sensible defaults
  const report = {
    monthlyStats: [],
    weeklyActive: [],
    wordCount: 0,
    topWebpages: [],
    focusPersona: 'Getting Started',
  }

  return (
    <div className="h-[600px] w-[400px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full px-5 py-4 gap-3">
        {/* Header */}
        <div className="flex-shrink-0">
          <Header />
        </div>

        {/* Title and Pet */}
        <div className="flex-shrink-0 flex items-start justify-between">
          <div>
            <h1 className="text-[26px] font-bold mb-1 text-gray-800">FOCUS REPORT</h1>
            <p className="text-[10px] font-bold text-gray-600">
              Congrats! You reached your focus goal!
            </p>
          </div>
          <div className="w-[100px] h-[100px] bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/50">
            <p className="text-[13px] text-center px-2 font-semibold text-gray-700">
              Pet Trophy
            </p>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="flex-shrink-0">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
            <div className="mb-2">
              <p className="text-[10px] font-bold text-gray-700">Monthly Stats</p>
              <p className="text-sm font-bold text-gray-800">October</p>
            </div>

            {/* Bar Chart using Recharts */}
            <MonthlyBarChart
              data={report.monthlyStats}
              currentDay={new Date().getDate().toString().padStart(2, '0')}
            />
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="flex-shrink-0">
          <WeeklyActivityDots
            weekData={report.weeklyActive}
            startDate=""
            endDate=""
          />
        </div>

        {/* Stats and Persona */}
        <div className="flex-shrink-0">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 flex gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-bold mb-1.5 text-gray-700">
                Word count: {report.wordCount}
              </p>
              <p className="text-[10px] font-bold mb-1.5 text-gray-700">
                Webpage used: {report.topWebpages.length > 0 ? report.topWebpages.join(' ') : 'N/A'}
              </p>
              <p className="text-[10px] font-bold text-gray-600">
                Start tracking to see your stats!
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold mb-1 text-gray-700">Your Focus Persona:</p>
              <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">&quot;{report.focusPersona}&quot;</p>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-0"></div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 space-y-2">
          <Button
            onClick={() => navigate('/home')}
            className="w-full h-[28px] bg-white/80 hover:bg-white text-gray-800 text-[11px] font-bold shadow-md rounded-xl border border-white/50"
          >
            Back
          </Button>
          <Button className="w-full h-[28px] bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-[11px] font-bold shadow-md rounded-xl">
            Share
          </Button>
          <Button
            onClick={() => navigate('/focus-setup')}
            className="w-full h-[28px] bg-white/80 hover:bg-white text-gray-800 text-[11px] font-bold shadow-md rounded-xl border border-white/50"
          >
            Start new!
          </Button>
        </div>

        {/* Footer Navigation */}
        <div className="flex-shrink-0">
          <Footer />
        </div>
      </div>
    </div>
  )
}
