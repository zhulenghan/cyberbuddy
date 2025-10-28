import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'
import { ArrowLeftIcon } from 'raster-react'
import { Footer } from '@/components/layout/Footer'
import { useActivityTracker } from '@/hooks/useActivityTracker'
import { usePet } from '@/hooks/usePet'
import { useEffect, useState } from 'react'
import { timeTracker } from '@/lib/tracker/time-tracker'

export default function FocusReport() {
  const navigate = useNavigate()
  const { todayStats, getStatsForDate } = useActivityTracker()
  const { currentPet } = usePet()

  // Calculate focus hours
  const totalHours = todayStats
    ? Math.floor(todayStats.totalDuration / (1000 * 60 * 60))
    : 0
  console.log('Today Stats:', todayStats)
  const totalMinutes = todayStats
    ? Math.floor((todayStats.totalDuration % (1000 * 60 * 60)) / (1000 * 60))
    : 0

  // Mock data for demonstration - matching example structure
  const [report, setReport] = useState<{
    topWebpages: string[]
    surpassedPercentage: string
    focusPersona: string
  }>({ topWebpages: [], surpassedPercentage: '', focusPersona: '' })

  useEffect(() => {
    async function fetchReport() {
      const topPages = await timeTracker.getStatsByPage()
      setReport({
        topWebpages: topPages.slice(0, 3).map(p => p.domain),
        surpassedPercentage: '75', // 之后可动态计算
        focusPersona: 'Deep Thinker', // 之后可根据标签分布生成
      })
    }
    fetchReport()
  }, [])

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
    <div className="h-[600px] w-[400px] bg-gray-800 flex items-center justify-center p-3 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel { font-family: 'Press Start 2P', cursive; }
        .pixel-border { border: 4px solid #1a1a1a; box-shadow: 8px 8px 0 #000000; background-color: #f0f0f0; }
        .pixel-button { border: 3px solid #1a1a1a; box-shadow: 4px 4px 0 #000000; transition: all 0.1s; cursor: pointer; }
        .pixel-button:active:not(:disabled) { box-shadow: 1px 1px 0 #000000; transform: translate(3px, 3px); }
        .neon-pink { background-color: #ff00ff; }
        .neon-cyan { background-color: #00ffff; }
        .text-neon-pink { color: #ff00ff; }
        .text-neon-cyan { color: #00ffff; }
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

        <h1 className="font-pixel text-[8px] absolute left-1/2 transform -translate-x-1/2 text-neon-cyan whitespace-nowrap">
          V I B E B U D D Y . E X E
        </h1>

        <div className="flex space-x-2 z-10 flex-shrink-0">
          <div className="w-4 h-4 pixel-border border-2" style={{ backgroundColor: '#00ffff' }}></div>
          <div className="w-4 h-4 bg-red-600 pixel-border border-2"></div>
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
          <div className="w-[121px] h-[114px] flex-shrink-0 pixel-border bg-gray-100 relative overflow-hidden">
            {currentPet?.images?.idle || currentPet?.images?.happy || currentPet?.images?.focused ? (
              <>
                <img 
                  src={currentPet?.images?.idle || currentPet?.images?.happy || currentPet?.images?.focused} 
                  alt={currentPet?.name || 'Pet'} 
                  className="w-full h-[88px] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 px-1 py-1">
                  <p className="text-[7px] font-bold text-white text-center truncate" style={{ fontFamily: 'monospace' }}>
                    {currentPet?.name || 'My Pet'}
                  </p>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center">
                <Trophy className="w-12 h-12 mb-1" />
                <p className="text-[8px] font-bold" style={{ fontFamily: 'monospace' }}>No Pet</p>
              </div>
            )}
          </div>
        </div>

        {/* Small behavior images */}
        <div className="flex gap-2 mb-4">
          {[
            { state: 'shopping', label: 'shopping' },
            { state: 'focused', label: 'focused' },
            { state: 'entertainment', label: 'entertainment' },
            { state: 'social', label: 'social' }
          ].map(({ state, label }, i) => {
            const imageUrl = currentPet?.images?.[state as keyof typeof currentPet.images]
            return (
              <div key={state} className="w-20 h-20 relative pixel-border bg-gray-100 overflow-hidden" style={{
                border: '3px solid #000',
                boxShadow: '3px 3px 0 #000'
              }}>
                {imageUrl ? (
                  <>
                    <img 
                      src={imageUrl} 
                      alt={label} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 px-1">
                      <p className="text-[6px] font-bold text-white text-center" style={{ fontFamily: 'monospace' }}>
                        {label}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center">
                    <p className="text-[7px] font-bold whitespace-pre-line" style={{ fontFamily: 'monospace' }}>
                      {label}\n暂无图片
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Circular Chart and Stats Section */}
        <div className="flex gap-3 mb-4">
          {/* Left: Circular Chart */}
          <div className="w-48 h-60 flex items-center justify-center relative" style={{
            backgroundColor: '#d1d5db',
            border: '4px solid #000',
            boxShadow: '4px 4px 0 #000'
          }}>
            <div className="relative">
              {/* Outer Ring - Background */}
              <div className="w-32 h-32 rounded-full relative" style={{
                background: 'conic-gradient(from 0deg, #d1d5db 0deg, #d1d5db 360deg)',
                border: '4px solid #000',
                boxShadow: '2px 2px 0 #000'
              }}>
                {/* Ring 1 - Focus (35%) - Neon Pink - 0° to 126° */}
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
                
                {/* Inner Circle */}
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
            <div className="p-2" style={{
              backgroundColor: '#00ffff',
              border: '4px solid #000',
              boxShadow: '4px 4px 0 #000'
            }}>
              <p className="text-[9px] font-bold" style={{ fontFamily: 'monospace' }}>
                Focus hours: {totalHours}h {totalMinutes}m
              </p>
            </div>
            <div className="p-2" style={{
              backgroundColor: '#00ffff',
              border: '4px solid #000',
              boxShadow: '4px 4px 0 #000'
            }}>
              <p className="text-[9px] font-bold" style={{ fontFamily: 'monospace' }}>
                Webpage used:
              </p>
            </div>
            <div className="p-2" style={{
              backgroundColor: '#00ffff',
              border: '4px solid #000',
              boxShadow: '4px 4px 0 #000'
            }}>
              <p className="text-[8px] font-bold" style={{ fontFamily: 'monospace' }}>
                {report.topWebpages.join(' ')}
              </p>
            </div>
            <div className="p-2" style={{
              backgroundColor: '#00ffff',
              border: '4px solid #000',
              boxShadow: '4px 4px 0 #000'
            }}>
              <p className="text-[8px] font-bold" style={{ fontFamily: 'monospace' }}>
                You have surpassed xxx % people
              </p>
            </div>
            
            {/* Large Focus Persona Box */}
            <div className="p-4" style={{
              backgroundColor: '#00ffff',
              border: '4px solid #000',
              boxShadow: '4px 4px 0 #000',
              height: '64px'
            }}>
              <p className="text-[8px] font-bold" style={{ 
                fontFamily: 'monospace',
                color: '#ff00ff'
              }}>
                Your Focus Persona:
              </p>
              <p className="text-sm font-bold" style={{ fontFamily: 'monospace' }}>
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
            Days active 5/7
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-4">
          <button className="w-full h-[35px] text-black font-bold text-[11px] pixel-button bg-gray-300 hover:bg-gray-200"
            style={{ fontFamily: 'monospace' }}
          >
            Export & Share your focus report!
          </button>
          
        </div>

        {/* Help Link */}
        <div className="text-center text-[8px] font-mono text-gray-400 mb-1">
          Having question? &gt;Go to <span className="text-neon-cyan underline cursor-pointer">guide</span>
        </div>

        {/* Footer Navigation Icons */}
        <Footer />
      </div>
      </div>
    </div>
  )
}
