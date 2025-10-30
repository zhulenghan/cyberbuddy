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

  // Calculate focused time specifically
  const focusedHours = todayStats
    ? Math.floor(todayStats.byLabel.focused.duration / (1000 * 60 * 60))
    : 0
  const focusedMinutes = todayStats
    ? Math.floor((todayStats.byLabel.focused.duration % (1000 * 60 * 60)) / (1000 * 60))
    : 0

  // Calculate category durations and percentages from real data
  const categoryData = todayStats ? [
    {
      label: 'Focused',
      duration: todayStats.byLabel.focused.duration,
      percentage: todayStats.byLabel.focused.percentage,
      color: '#F637EC', // Neon Pink
    },
    {
      label: 'Entertainment',
      duration: todayStats.byLabel.entertainment.duration,
      percentage: todayStats.byLabel.entertainment.percentage,
      color: '#00ffff', // Neon Cyan
    },
    {
      label: 'Shopping',
      duration: todayStats.byLabel.shopping.duration,
      percentage: todayStats.byLabel.shopping.percentage,
      color: '#ffff00', // Neon Yellow
    },
    {
      label: 'Social',
      duration: todayStats.byLabel.social.duration,
      percentage: todayStats.byLabel.social.percentage,
      color: '#ff8000', // Neon Orange
    },
  ].filter(cat => cat.percentage > 0) : [] // Only show categories with data

  // Sort categories by percentage (desc) so index 0 is dominant
  const sortedCategoryData = [...categoryData].sort((a, b) => b.percentage - a.percentage)

  // Calculate angles for pie chart (360 degrees total)
  let cumulativeAngle = 0
  const categoryAngles = sortedCategoryData.map(cat => {
    const startAngle = cumulativeAngle
    const sweepAngle = (cat.percentage / 100) * 360
    cumulativeAngle += sweepAngle
    return {
      ...cat,
      startAngle,
      sweepAngle,
    }
  })

  // Format duration to hours and minutes
  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Get top websites from stats
  const topWebpages = todayStats?.topSites.slice(0, 3).map(site => site.domain) || ['No data yet']

  // Determine user persona based on dominant activity
  const getFocusPersona = () => {
    if (!sortedCategoryData.length || sortedCategoryData[0].percentage < 50) {
      return 'Balanced Multitasker'
    }
    
    const dominant = sortedCategoryData[0]
    const personaMap: Record<string, string> = {
      'Focused': 'Super Productive',
      'Entertainment': 'Chill Master',
      'Social': 'Social Butterfly',
      'Shopping': 'Smart Shopper',
    }
    
    return personaMap[dominant.label] || 'Balanced Multitasker'
  }

  // Mock data for demonstration - matching example structure
  const report = {
    wordCount: 'XXXX',
    topWebpages,
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
              "You have been focused for {focusedHours > 0 ? `${focusedHours}h ${focusedMinutes}m` : `${focusedMinutes}m`} today! Congrats! You reached your focus goal! Get a good night's sleep! With that kind of determination, you'll succeed at any goal!"
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

        {/* Small behavior images - showing different activity states */}
        <div className="flex gap-2 mb-4">
          {[
            { state: 'focused', label: 'Focused', emoji: '🎯' },
            { state: 'entertainment', label: 'Entertain', emoji: '🎮' },
            { state: 'social', label: 'Social', emoji: '💬' },
            { state: 'shopping', label: 'Shopping', emoji: '🛒' }
          ].map(({ state, label, emoji }, i) => {
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
                        {emoji} {label}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center">
                    <p className="text-[7px] font-bold whitespace-pre-line" style={{ fontFamily: 'monospace' }}>
                      {emoji}<br/>{label}<br/>暂无图片
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
                {/* Dynamic category rings based on real data */}
                {categoryAngles.length > 0 ? (
                  categoryAngles.map((cat, index) => (
                    <div 
                      key={index}
                      className="absolute inset-0 rounded-full" 
                      style={{
                        background: `conic-gradient(from ${cat.startAngle}deg, ${cat.color} 0deg, ${cat.color} ${cat.sweepAngle}deg, transparent ${cat.sweepAngle}deg, transparent 360deg)`,
                        mask: 'radial-gradient(circle, transparent 32px, black 32px, black 60px, transparent 60px)',
                        WebkitMask: 'radial-gradient(circle, transparent 32px, black 32px, black 60px, transparent 60px)'
                      }}
                    ></div>
                  ))
                ) : (
                  // Show placeholder when no data
                  <div className="absolute inset-0 rounded-full flex items-center justify-center">
                    <p className="text-[8px] text-center font-bold" style={{ fontFamily: 'monospace' }}>
                      No activity<br/>tracked yet
                    </p>
                  </div>
                )}
                
                {/* Inner Circle */}
                <div className="absolute inset-8 rounded-full flex items-center justify-center" style={{
                  backgroundColor: '#d1d5db',
                  border: '3px solid #1a1a1a',
                  boxShadow: 'inset 2px 2px 0 #000000'
                }}>
                  <div className="text-center">
                    <p className="text-sm font-bold text-black" style={{ fontFamily: 'monospace' }}>
                      {todayStats ? '100%' : '0%'}
                    </p>
                    <p className="text-[6px] font-bold" style={{ fontFamily: 'monospace' }}>DAILY</p>
                  </div>
                </div>
              </div>
              
              {/* Legend - Dynamic based on actual data */}
              <div className="mt-3 space-y-1">
                {sortedCategoryData.length > 0 ? (
                  sortedCategoryData.map((cat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{ backgroundColor: cat.color, border: '1px solid #000' }}></div>
                      <p className="text-[7px] font-bold" style={{ fontFamily: 'monospace' }}>
                        {cat.label} ({cat.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[7px] font-bold text-center" style={{ fontFamily: 'monospace' }}>
                    Start browsing to<br/>track activity
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Stats Boxes */}
          <div className="flex-1 space-y-1">
            {/* Focus Hours Box */}
            <div className="p-2" style={{
              backgroundColor: '#00ffff',
              border: '4px solid #000',
              boxShadow: '4px 4px 0 #000'
            }}>
              <p className="text-[9px] font-bold" style={{ fontFamily: 'monospace' }}>
                Total time: {todayStats ? formatDuration(todayStats.totalDuration) : '0m'}
              </p>
            </div>
            
            {/* Category Breakdown Box */}
            <div className="p-2" style={{
              backgroundColor: '#00ffff',
              border: '4px solid #000',
              boxShadow: '4px 4px 0 #000'
            }}>
              <p className="text-[9px] font-bold mb-1" style={{ fontFamily: 'monospace' }}>
                Breakdown:
              </p>
              <div className="space-y-0.5">
                <p className="text-[7px]" style={{ fontFamily: 'monospace' }}>
                  Focused: {todayStats ? formatDuration(todayStats.byLabel.focused.duration) : '0m'}
                </p>
                <p className="text-[7px]" style={{ fontFamily: 'monospace' }}>
                  Entertainment: {todayStats ? formatDuration(todayStats.byLabel.entertainment.duration) : '0m'}
                </p>
                <p className="text-[7px]" style={{ fontFamily: 'monospace' }}>
                  Shopping: {todayStats ? formatDuration(todayStats.byLabel.shopping.duration) : '0m'}
                </p>
                <p className="text-[7px]" style={{ fontFamily: 'monospace' }}>
                  Social: {todayStats ? formatDuration(todayStats.byLabel.social.duration) : '0m'}
                </p>
              </div>
            </div>
            
           
            
            {/* Large Focus Persona Box */}
            <div className="p-4" style={{
              backgroundColor: '#00ffff',
              border: '4px solid #000',
              boxShadow: '4px 4px 0 #000',

            }}>
              <p className="text-[8px] font-bold mb-1" style={{ 
                fontFamily: 'monospace',
                color: '#ff00ff'
              }}>
                Your Focus Persona:
              </p>
              <p className="text-[12px] font-bold" style={{ fontFamily: 'monospace' }}>
                {getFocusPersona()}
              </p>
              {/* Intentionally show only persona name; no percentage/label line below */}
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
