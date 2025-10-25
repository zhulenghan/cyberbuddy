import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'
import { ArrowLeftIcon } from 'raster-react'
import { PixelFooter } from '@/components/layout/PixelFooter'
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
    <div className="h-[600px] w-[450px] bg-gray-800 flex relative overflow-hidden">
      {/* Left Sidebar Navigation */}
      <PixelFooter />
      
      {/* Main Content - properly spaced from sidebar */}
      <div className="ml-16 flex-1 relative z-10 h-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel { font-family: 'Press Start 2P', cursive; }
        .pixel-border { border: 4px solid #1a1a1a; box-shadow: 8px 8px 0 #000000; background-color: #f0f0f0; }
        .pixel-button { border: 3px solid #1a1a1a; box-shadow: 4px 4px 0 #000000; transition: all 0.1s; cursor: pointer; }
        .pixel-button:active:not(:disabled) { box-shadow: 1px 1px 0 #000000; transform: translate(3px, 3px); }
        .pixel-button:hover:not(:disabled) { opacity: 0.8; }
        .neon-pink { background-color: #ff00ff; }
        .neon-cyan { background-color: #00ffff; }
        .neon-yellow { background-color: #ffff00; }
        .neon-green { background-color: #00ff00; }
        .text-neon-pink { color: #ff00ff; }
        .text-neon-cyan { color: #00ffff; }
        .text-neon-yellow { color: #ffff00; }
        .text-neon-green { color: #00ff00; }
        .dark-bg { background-color: #1a1a1a; }
      `}</style>

        <div className="pixel-border w-full h-full p-4 overflow-y-auto">
        {/* Window Header */}
        <div className="dark-bg pixel-border border-2 px-4 py-2 mb-4 flex justify-between items-center relative">
          <button
            onClick={() => navigate('/home')}
            className="w-5 h-5 neon-cyan pixel-border border-2 cursor-pointer flex items-center justify-center text-sm text-black font-bold pixel-button hover:bg-cyan-300 z-10 flex-shrink-0"
          >
            <ArrowLeftIcon className="w-8 h-8 text-black stroke-[3]" />
          </button>

          <h1 className="font-pixel text-[8px] absolute left-1/2 transform -translate-x-1/2 select-none text-neon-cyan whitespace-nowrap">
            V I B E B U D D Y . E X E
          </h1>

          <div className="flex space-x-2 z-10 flex-shrink-0">
            <div className="w-4 h-4 neon-cyan pixel-border border-2 cursor-pointer"></div>
            <div className="w-4 h-4 bg-red-600 pixel-border border-2 cursor-pointer"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Title and Pet Image */}
          <div className="flex items-start justify-between mb-4">
            <div className="mr-4 flex-1">
              <h1 className="font-pixel text-[16px] text-neon-pink mb-2 whitespace-nowrap">
                DAILY REPORT
              </h1>
              <p className="text-[8px] font-bold" style={{ fontFamily: 'monospace' }}>
                {dateStr.toUpperCase()}, {timeStr}
              </p>
              <p className="text-[8px] font-bold mt-2" style={{ fontFamily: 'monospace' }}>
                "以宠物视角第一人称写一段走心文字：你今天专注了xx小时，我也连续吃了很久香蕉！你真是太棒了，本牛油果为你感到骄傲。Congrats! You reached your focus goal!睡个好觉吧！无论什么目标，你有这样的定力都会成功的！"
              </p>
            </div>
            <div className="w-[121px] h-[114px] flex items-center justify-center flex-shrink-0 pixel-border bg-gray-100">
              <div className="text-center">
                <Trophy className="w-12 h-12 mx-auto mb-1" />
                <p className="text-[8px] font-bold" style={{ fontFamily: 'monospace' }}>PET NAME HERE</p>
              </div>
            </div>
          </div>

          {/* Label *
          <div className="mb-2">
            <p className="text-[10px] font-bold mb-1" style={{ fontFamily: 'monospace' }}>label</p>
            <div className="flex gap-2">
              <div className="h-3 w-16 pixel-border bg-gray-100" style={{ border: '2px solid #1a1a1a', boxShadow: '2px 2px 0 #000000' }}></div>
              <div className="h-3 w-16 pixel-border bg-gray-100" style={{ border: '2px solid #1a1a1a', boxShadow: '2px 2px 0 #000000' }}></div>
              <div className="h-3 w-16 pixel-border bg-gray-100" style={{ border: '2px solid #1a1a1a', boxShadow: '2px 2px 0 #000000' }}></div>
            </div>
          </div>

          {/* Small behavior images */}
          <div className="flex gap-2 mb-4">
            {['一张图片\n(不同行为)', '一张图片\n(不同行为)', '一张图片\n(不同行为)', '一张图片\n(不同行为)'].map((label, i) => (
              <div key={i} className="w-20 h-20 flex items-center justify-center text-center pixel-border bg-gray-100" style={{
                border: '3px solid #1a1a1a',
                boxShadow: '3px 3px 0 #000000'
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
            <div className="w-48 h-60 flex items-center justify-center pixel-border bg-gray-100 relative">
              <div className="relative">
                {/* Outer Ring - Background */}
                <div className="w-32 h-32 rounded-full relative" style={{
                  background: 'conic-gradient(from 0deg, #d1d5db 0deg, #d1d5db 360deg)',
                  border: '4px solid #1a1a1a',
                  boxShadow: '2px 2px 0 #000000'
                }}>
                  {/* Ring 1 - Focus (35%) - Darker Neon Yellow - 0° to 126° */}
                  <div className="absolute inset-0 rounded-full" style={{
                    background: `conic-gradient(from 0deg, #F637EC 0deg, #F637EC 126deg, transparent 126deg, transparent 360deg)`,
                    mask: 'radial-gradient(circle, transparent 32px, black 32px, black 60px, transparent 60px)',
                    WebkitMask: 'radial-gradient(circle, transparent 32px, black 32px, black 60px, transparent 60px)'
                  }}></div>
                  
                  {/* Ring 2 - Study (25%) - Neon Cyan - 126° to 216° */}
                  <div className="absolute inset-0 rounded-full" style={{
                    background: `conic-gradient(from 126deg, #00ffff 0deg, #00ffff 90deg, transparent 90deg, transparent 360deg)`,
                    mask: 'radial-gradient(circle, transparent 32px, black 32px, black 60px, transparent 60px)',
                    WebkitMask: 'radial-gradient(circle, transparent 32px, black 32px, black 60px, transparent 60px)'
                  }}></div>
                  
                  {/* Ring 3 - Shopping (20%) - Neon Yellow - 216° to 288° */}
                  <div className="absolute inset-0 rounded-full" style={{
                    background: `conic-gradient(from 216deg, #ffff00 0deg, #ffff00 72deg, transparent 72deg, transparent 360deg)`,
                    mask: 'radial-gradient(circle, transparent 32px, black 32px, black 60px, transparent 60px)',
                    WebkitMask: 'radial-gradient(circle, transparent 32px, black 32px, black 60px, transparent 60px)'
                  }}></div>
                  
                  {/* Ring 4 - Exercise (20%) - Neon Orange - 288° to 360° */}
                  <div className="absolute inset-0 rounded-full" style={{
                    background: `conic-gradient(from 288deg, #ff8000 0deg, #ff8000 72deg, transparent 72deg, transparent 360deg)`,
                    mask: 'radial-gradient(circle, transparent 32px, black 32px, black 60px, transparent 60px)',
                    WebkitMask: 'radial-gradient(circle, transparent 32px, black 32px, black 60px, transparent 60px)'
                  }}></div>
                  
                  {/* Inner Circle - Original Background */}
                  <div className="absolute inset-8 rounded-full flex items-center justify-center" style={{
                    backgroundColor: '#d1d5db',
                    border: '3px solid #1a1a1a',
                    boxShadow: 'inset 2px 2px 0 #000000'
                  }}>
                    <div className="text-center">
                      <p className="text-sm font-bold text-black" style={{ fontFamily: 'monospace' }}>100%</p>
                      <p className="text-[6px] font-bold" style={{ fontFamily: 'monospace' }}>DAILY</p>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3" style={{ backgroundColor: '#F637EC', border: '1px solid #000' }}></div>
                    <p className="text-[7px] font-bold" style={{ fontFamily: 'monospace' }}>Focus (35%)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3" style={{ backgroundColor: '#00ffff', border: '1px solid #000' }}></div>
                    <p className="text-[7px] font-bold" style={{ fontFamily: 'monospace' }}>Study (25%)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3" style={{ backgroundColor: '#ffff00', border: '1px solid #000' }}></div>
                    <p className="text-[7px] font-bold" style={{ fontFamily: 'monospace' }}>Shopping (20%)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3" style={{ backgroundColor: '#ff8000', border: '1px solid #000' }}></div>
                    <p className="text-[7px] font-bold" style={{ fontFamily: 'monospace' }}>Exercise (20%)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Stats Boxes */}
            <div className="flex-1 space-y-1">
              {/* 4 Individual Stats Boxes */}
              <div className="p-2 pixel-border neon-cyan">
                <p className="text-[9px] font-bold" style={{ fontFamily: 'monospace' }}>
                  Focus hours: xxxx
                </p>
              </div>
              <div className="p-2 pixel-border neon-cyan">
                <p className="text-[9px] font-bold" style={{ fontFamily: 'monospace' }}>
                  Webpage used:
                </p>
              </div>
              <div className="p-2 pixel-border neon-cyan">
                <p className="text-[8px] font-bold" style={{ fontFamily: 'monospace' }}>
                  #tag# #tag# #tag#
                </p>
              </div>
              <div className="p-2 pixel-border neon-cyan">
                <p className="text-[8px] font-bold" style={{ fontFamily: 'monospace' }}>
                  You have surpassed xxx % people
                </p>
              </div>
              
              {/* Large Focus Persona Box */}
              <div className="p-4 pixel-border neon-cyan h-16 mt-2">
                <p className="text-[8px] font-bold text-neon-pink" style={{ fontFamily: 'monospace' }}>
                  Your Focus Persona:
                </p>
                <p className="text-sm font-bold" style={{ fontFamily: 'monospace' }}>
                  "XXX"
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-4 mb-4 pixel-border bg-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-bold" style={{ fontFamily: 'monospace' }}>{report.startDate}</span>
              <div className="flex gap-2">
                {[1, 1, 1, 1, 1, 0, 0].map((active, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full"
                    style={{ 
                      backgroundColor: active ? '#1a1a1a' : '#9ca3af',
                      border: '2px solid #000000' 
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
            <button className="w-full h-[35px] text-black font-bold text-[11px] pixel-button bg-gray-300 hover:bg-gray-200"
              style={{ fontFamily: 'monospace' }}
            >
              Export & Share your focus report!
            </button>
            <button 
              onClick={() => navigate('/focus-setup')}
              className="w-full h-[35px] text-black font-bold text-[11px] pixel-button bg-gray-300 hover:bg-gray-200"
              style={{ fontFamily: 'monospace' }}
            >
              View my monthly focus report {/* might not need this part*/}
            </button>
          </div>

          {/* Help Link */}
          <div className="text-center">
            <p className="text-[10px] italic" style={{ fontFamily: 'monospace' }}>
              Having question? {'>'} Go to <span className="underline text-neon-pink cursor-pointer" onClick={() => navigate('/guide')}>guide</span>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
