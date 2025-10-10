import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MonthlyBarChart } from '@/components/charts/MonthlyBarChart'
import { WeeklyActivityDots } from '@/components/charts/WeeklyActivityDots'
import { useActivityTracker } from '@/hooks/useActivityTracker'

export default function FocusReport() {
  const navigate = useNavigate()
  const { todayStats } = useActivityTracker()

  // Mock data for demonstration
  const mockReport = {
    monthlyStats: [
      { day: '01', duration: 60 },
      { day: '02', duration: 45 },
      { day: '03', duration: 60 },
      { day: '04', duration: 45 },
      { day: '05', duration: 75 },
      { day: '06', duration: 45 },
      { day: '07', duration: 90 },
    ],
    weeklyActive: [1, 1, 1, 1, 1, 0, 0],
    wordCount: 1234,
    topWebpages: ['#productivity', '#work', '#research'],
    focusPersona: 'Deep Thinker',
  }

  return (
    <div className="min-h-[600px] w-[420px] bg-white flex flex-col pb-20 overflow-y-auto">
      {/* Header */}
      <Header />

      {/* Title and Pet */}
      <div className="px-6 flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[30px] font-bold mb-2">FOCUS REPORT</h1>
          <p className="text-[10px] font-bold">
            Congrats! You reached your focus goal!
          </p>
        </div>
        <div className="w-[121px] h-[114px] bg-vibe-gray-700 rounded flex items-center justify-center">
          <p className="text-[15px] text-center px-2">
            Pet figure graphic (pet holding trophy sth)
          </p>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="px-4 mb-6">
        <div className="bg-vibe-gray-500 rounded p-4 shadow-md">
          <div className="mb-2">
            <p className="text-[10px] font-bold">Monthly Stats</p>
            <p className="text-sm font-bold">October</p>
          </div>

          {/* Bar Chart using Recharts */}
          <MonthlyBarChart
            data={mockReport.monthlyStats}
            currentDay="07"
          />
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="px-4 mb-6">
        <WeeklyActivityDots
          weekData={mockReport.weeklyActive}
          startDate="10/03"
          endDate="10/09"
        />
      </div>

      {/* Stats and Persona */}
      <div className="px-4 mb-6">
        <div className="bg-vibe-gray-500 rounded p-4 shadow-md flex gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-bold mb-2">
              Word count: {mockReport.wordCount}
            </p>
            <p className="text-[10px] font-bold mb-2">
              Webpage used: {mockReport.topWebpages.join(' ')}
            </p>
            <p className="text-[10px] font-bold">
              Your have surpassed 80% people!
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold mb-2">Your Focus Persona:</p>
            <p className="text-xl font-bold">&quot;{mockReport.focusPersona}&quot;</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 space-y-3 mb-6">
        <Button
          onClick={() => navigate('/home')}
          className="w-full h-[25px] bg-vibe-gray-700 hover:bg-vibe-gray-800 text-[11px] font-bold shadow-md"
        >
          Back
        </Button>
        <Button className="w-full h-[25px] bg-vibe-gray-700 hover:bg-vibe-gray-800 text-[11px] font-bold shadow-md">
          Share
        </Button>
        <Button
          onClick={() => navigate('/focus-setup')}
          className="w-full h-[25px] bg-vibe-gray-700 hover:bg-vibe-gray-800 text-[11px] font-bold shadow-md"
        >
          Start new!
        </Button>
      </div>

      {/* Footer Navigation */}
      <Footer />
    </div>
  )
}
