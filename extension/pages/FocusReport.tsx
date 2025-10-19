import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'
import { ArrowLeftIcon } from 'raster-react'
import { Footer } from '@/components/layout/Footer'
import { useActivityTracker } from '@/hooks/useActivityTracker'
import { usePet } from '@/hooks/usePet'

export default function FocusReport() {
  const navigate = useNavigate()
  const { todayStats, getStatsForDate } = useActivityTracker()
  const { currentPet } = usePet()

  // Calculate focus hours
  const totalHours = todayStats
    ? Math.floor(todayStats.totalDuration / (1000 * 60 * 60))
    : 0
  const totalMinutes = todayStats
    ? Math.floor((todayStats.totalDuration % (1000 * 60 * 60)) / (1000 * 60))
    : 0

  // Mock data for demonstration - matching example structure
  const report = {
    wordCount: 'XXXX',
    topWebpages: ['#TAG#', '#TAG#', '#TAG#'],
    surpassedPercentage: 'XXX',
    focusPersona: 'XXX',
    daysActive: 5,
    totalDays: 7,
    startDate: '10/03',
    endDate: '10/09',
    monthlyStats: [
      { day: '01', minutes: 50 },
      { day: '02', minutes: 40 },
      { day: '03', minutes: 50 },
      { day: '04', minutes: 40 },
      { day: '05', minutes: 60 },
      { day: '06', minutes: 40 },
      { day: '07', minutes: 70 },
    ],
    currentMonth: 'OCTOBER',
  }

  // Get current date and time
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })

  return (
    <div className="h-[600px] w-[400px] flex flex-col overflow-y-auto" style={{
      backgroundColor: '#f0f0f0',
      border: '4px solid #1a1a1a',
      boxShadow: '8px 8px 0 #000000'
    }}>
      {/* Window Header */}
      <div className="dark-bg pixel-border border-2 px-4 py-2 mb-4 flex justify-between items-center relative">
        <button
          onClick={() => navigate('/home')}
          className="w-5 h-5 pixel-border border-2 cursor-pointer flex items-center justify-center text-sm text-black font-bold pixel-button"
          style={{ backgroundColor: '#00ffff' }}
        >
          <ArrowLeftIcon className="w-8 h-8 text-black stroke-[3]" />
        </button>

        <h1 className="font-pixel text-[8px] absolute left-1/2 transform -translate-x-1/2 text-neon-cyan whitespace-nowrap">
          V I B E B U D D Y . E X E
        </h1>

        <div className="flex space-x-2 z-10 flex-shrink-0">
          <div className="w-4 h-4 pixel-border border-2" style={{ backgroundColor: '#00ffff' }}></div>
          <div className="w-4 h-4 bg-red-600 pixel-border border-2"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 pb-20">
        {/* Title and Pet Image */}
        <div className="flex items-start justify-between mb-4">
          <div className="mr-4 flex-1">
            <h1 className="text-[16px] font-bold mb-2 whitespace-nowrap" style={{ 
              fontFamily: '"Press Start 2P", cursive',
              color: '#ff00ff'
            }}>
              DAILY REPORT
            </h1>
            <p className="text-[8px] font-bold" style={{ fontFamily: 'monospace' }}>
              {dateStr.toUpperCase()}, {timeStr}
            </p>
            <p className="text-[8px] font-bold mt-2" style={{ fontFamily: 'monospace' }}>
              "以宠物视角第一人称写一段走心文字：你今天专注了xx小时，我也连续吃了很久香蕉！你真是太棒了，本牛油果为你感到骄傲。Congrats! You reached your focus goal!睡个好觉吧！无论什么目标，你有这样的定力都会成功的！"
            </p>
          </div>
          <div className="w-[121px] h-[114px] flex items-center justify-center flex-shrink-0" style={{
            backgroundColor: '#d1d5db',
            border: '4px solid #000000',
            boxShadow: '4px 4px 0 #000000'
          }}>
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-1" />
              <p className="text-[8px] font-bold" style={{ fontFamily: 'monospace' }}>PET NAME HERE</p>
            </div>
          </div>
        </div>

        {/* Label */}
        <div className="mb-2">
          <p className="text-[10px] font-bold mb-1" style={{ fontFamily: 'monospace' }}>label</p>
          <div className="flex gap-2">
            <div className="h-3 w-16" style={{ backgroundColor: '#d1d5db', border: '2px solid #000', boxShadow: '2px 2px 0 #000' }}></div>
            <div className="h-3 w-16" style={{ backgroundColor: '#d1d5db', border: '2px solid #000', boxShadow: '2px 2px 0 #000' }}></div>
            <div className="h-3 w-16" style={{ backgroundColor: '#d1d5db', border: '2px solid #000', boxShadow: '2px 2px 0 #000' }}></div>
          </div>
        </div>

        {/* Small behavior images */}
        <div className="flex gap-2 mb-4">
          {['一张图片\n(不同行为)', '一张图片\n(不同行为)', '一张图片\n(不同行为)', '一张图片\n(不同行为)'].map((label, i) => (
            <div key={i} className="w-20 h-20 flex items-center justify-center text-center" style={{
              backgroundColor: '#d1d5db',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000'
            }}>
              <p className="text-[7px] font-bold whitespace-pre-line" style={{ fontFamily: 'monospace' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Circular Chart and Stats Section */}
        <div className="flex gap-3 mb-4">
          {/* Left: Circular Chart */}
          <div className="w-48 h-48 flex items-center justify-center" style={{
            backgroundColor: '#d1d5db',
            border: '4px solid #000',
            boxShadow: '4px 4px 0 #000'
          }}>
            <div className="text-center">
              <p className="text-sm font-bold mb-2" style={{ fontFamily: 'monospace' }}>一个统计环</p>
              <p className="text-xs" style={{ fontFamily: 'monospace' }}>状图，占比</p>
            </div>
          </div>

          {/* Right: Stats Box */}
          <div className="flex-1 p-3" style={{
            backgroundColor: '#00ffff',
            border: '4px solid #000',
            boxShadow: '4px 4px 0 #000'
          }}>
            <p className="text-[10px] font-bold mb-2" style={{ fontFamily: 'monospace' }}>
              Focus hours: xxxx
            </p>
            <p className="text-[10px] font-bold mb-2" style={{ fontFamily: 'monospace' }}>
              Webpage used:
            </p>
            <p className="text-[9px] font-bold mb-2" style={{ fontFamily: 'monospace' }}>
              #tag# #tag# #tag#
            </p>
            <p className="text-[9px] font-bold mb-3" style={{ fontFamily: 'monospace' }}>
              Your have surpassed xxx % people sth
            </p>
            <div className="pt-2 border-t-2 border-black">
              <p className="text-[8px] font-bold text-right mb-1" style={{ 
                fontFamily: 'monospace',
                color: '#ff00ff'
              }}>
                Your Focus Persona:
              </p>
              <p className="text-lg font-bold text-right" style={{ fontFamily: 'monospace' }}>
                "XXX"
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-4 mb-4" style={{
          backgroundColor: '#d1d5db',
          border: '4px solid #000',
          boxShadow: '4px 4px 0 #000'
        }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold" style={{ fontFamily: 'monospace' }}>{report.startDate}</span>
            <div className="flex gap-2">
              {[1, 1, 1, 1, 1, 0, 0].map((active, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full"
                  style={{ 
                    backgroundColor: active ? '#1a1a1a' : '#9ca3af',
                    border: '2px solid #000' 
                  }}
                />
              ))}
            </div>
            <span className="text-[9px] font-bold" style={{ fontFamily: 'monospace' }}>{report.endDate}</span>
          </div>
          <p className="text-[9px] font-bold text-center" style={{ fontFamily: 'monospace' }}>
            Days active {report.daysActive}/{report.totalDays}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-4">
          <button className="w-full h-[35px] text-black font-bold text-[11px] transition-all hover:opacity-80"
            style={{
              backgroundColor: '#d1d5db',
              border: '3px solid #1a1a1a',
              boxShadow: '4px 4px 0 #000000',
              fontFamily: 'monospace'
            }}
          >
            Export & Share your focus record right now!
          </button>
          <button 
            onClick={() => navigate('/focus-setup')}
            className="w-full h-[35px] text-black font-bold text-[11px] transition-all hover:opacity-80"
            style={{
              backgroundColor: '#d1d5db',
              border: '3px solid #1a1a1a',
              boxShadow: '4px 4px 0 #000000',
              fontFamily: 'monospace'
            }}
          >
            View my monthly focus record
          </button>
        </div>

        {/* Help Link */}
        <div className="text-center mb-4">
          <p className="text-[10px] italic" style={{ fontFamily: 'monospace' }}>
            Having question? &gt;Go to <span className="underline" style={{ color: '#ff00ff' }}>guide</span>
          </p>
        </div>
      </div>

      {/* Footer Navigation - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t-4 border-black py-4" style={{
        backgroundColor: '#f0f0f0'
      }}>
        <Footer />
      </div>
    </div>
  )
}
