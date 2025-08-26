import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StreamWidget from '../widget-stream/streamWidget'
import HeatLoungeWidget from '../widget-heat-lounge/heatLoungeWidget'
import FantasyLiveWidget from '../widget-fantasy-live/fantasyLiveWidget'
import AdvertsOfferWidget from '../widget-adverts/advertsOfferWidget'
import PropPickemWidget from '../widget-prop-pickem/propPickemWidget'
import CoWatchPartyWidget from '../widget-cowatch-party/coWatchPartyWidget'
import ClipCreatorWidget from '../widget-clip-creator/clipCreatorWidget'
import SurferOddsWidget from '../widget-surfer-odds/surferOddsWidget'
import AnnouncerQnAWidget from '../widget-announcer-qna/announcerQnAWidget'
import TournamentBracketsWidget from '../widget-tournament-brackets/tournamentBracketsWidget'
import LineupAnalyzerWidget from '../widget-lineup-analyzer/lineupAnalyzerWidget'
import WinnerProfileWidget from '../widget-winner-profile/winnerProfileWidget'
import AdvertsWidget from '../widget-adverts/advertsWidget'
import { dynamicAdChannelId } from '../data/constants'

interface OverlayPosition {
  x: number
  y: number
  width: number
  height: number
}

interface SmartOverlayProps {
  chat: any
  isGuidedDemo: boolean
  guidesShown: boolean
  visibleGuide: string
  setVisibleGuide: (guide: string) => void
  currentScore: number
  selectedSurfers: any[]
  setSelectedSurfers: (surfers: any[]) => void
  salaryBudget: number
  setSalaryBudget: (budget: number) => void
  dynamicAd: { adId: string; clickPoints: number } | null
  overlaysVisible: boolean
  onInteraction: () => void
  awardPoints: (points: number, message?: string) => void
  chatDemoActive: boolean
  fantasyDemoActive: boolean
  hypeDemoActive: boolean
  qnaDemoActive: boolean
  propPicksDemoActive: boolean
}

export default function MobileLandscapeContents({
  chat,
  isGuidedDemo,
  guidesShown,
  visibleGuide,
  setVisibleGuide,
  currentScore,
  selectedSurfers,
  setSelectedSurfers,
  salaryBudget,
  setSalaryBudget,
  dynamicAd,
  overlaysVisible,
  onInteraction,
  awardPoints,
  chatDemoActive,
  fantasyDemoActive,
  hypeDemoActive,
  qnaDemoActive,
  propPicksDemoActive
}: SmartOverlayProps) {
  // Overlay management states
  const [activeOverlays, setActiveOverlays] = useState<string[]>([
    'stream', 'hype', 'chat', 'watchparty'
  ])
  const [contextualOverlays, setContextualOverlays] = useState<string[]>([])
  const [overlayPositions, setOverlayPositions] = useState<Record<string, OverlayPosition>>({})
  
  // Gesture states (minimal touch support)
  const [isSwipeGestureActive, setIsSwipeGestureActive] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize overlay positions - FIXED for better landscape positioning
  useEffect(() => {
    const positions: Record<string, OverlayPosition> = {
      // Main video takes center stage
      stream: { x: 0, y: 0, width: 100, height: 100 },
      
      // Core overlays - positioned for landscape viewing (16:9 aspect ratio)
      hype: { x: 300, y: 15, width: 120, height: 32 }, // Top center - safe from other overlays
      chat: { x: 20, y: 360, width: 300, height: 100 }, // Bottom left - compact for landscape
      watchparty: { x: 800, y: 20, width: 140, height: 50 }, // Top right - compact
      fantasy: { x: 640, y: 360, width: 300, height: 100 }, // Bottom right - compact
      
      // Contextual overlays - positioned for landscape (moved to not cover cowatch party)
      odds: { x: 450, y: 100, width: 250, height: 80 },
      props: { x: 400, y: 350, width: 200, height: 90 },
      clips: { x: 700, y: 200, width: 200, height: 80 },
    }
    
    setOverlayPositions(positions)
  }, [])

  // Handle contextual overlay appearance based on activity
  useEffect(() => {
    // Example: Show odds overlay when big waves detected (simplified logic)
    const contextualTimer = setTimeout(() => {
      if (Math.random() > 0.7) { // Simulate contextual triggers
        setContextualOverlays(prev => 
          prev.includes('odds') ? prev : [...prev, 'odds']
        )
      }
    }, 5000)

    return () => clearTimeout(contextualTimer)
  }, [])

  // Gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    setIsSwipeGestureActive(true)
    onInteraction()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwipeGestureActive) return
    
    const touchEndX = e.changedTouches[0].clientX
    const swipeDistance = touchEndX - touchStartX
    const minSwipeDistance = 100

    // Swipe gestures disabled in demo mode - use keyboard shortcuts instead
    console.log('Swipe detected but disabled for demo. Use keyboard shortcuts: 1, 2, H')
    
    setIsSwipeGestureActive(false)
  }

  // Smart overlay visibility logic - DEMO MODE: Keep everything visible
  const isOverlayVisible = (overlayKey: string) => {
    // For demo purposes, keep core elements always visible
    if (['hype', 'chat', 'watchparty', 'fantasy'].includes(overlayKey)) return true
    
    if (!overlaysVisible && overlayKey !== 'stream') return false
    
    return activeOverlays.includes(overlayKey) || contextualOverlays.includes(overlayKey)
  }

  // Overlay animation variants
  const overlayVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.4, 
        ease: 'easeOut' 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: -20,
      transition: { 
        duration: 0.3 
      }
    }
  }

  const expandedVariants = {
    collapsed: { 
      width: 'auto',
      height: 'auto'
    },
    expanded: { 
      width: '400px',
      height: '300px',
      transition: { 
        duration: 0.5, 
        ease: 'easeInOut' 
      }
    }
  }

  return (
    <div 
      ref={containerRef}
      className='relative w-full h-full'
      style={{ overflow: 'visible' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Video Stream - Always visible, full background */}
      <div className='absolute inset-0 z-10 bg-black' style={{ overflow: 'visible' }}>
        <StreamWidget
          className='w-full h-full border-0 rounded-none'
          isMobilePreview={false}
          chat={chat}
          isGuidedDemo={isGuidedDemo}
          guidesShown={guidesShown}
          visibleGuide={visibleGuide}
          setVisibleGuide={setVisibleGuide}
          awardPoints={awardPoints}
        />
      </div>



      {/* Smart Overlay Layer */}
      <div className='absolute inset-0 z-20 pointer-events-none'>
        
        {/* Hype Meter - Top Left Floating */}
        <AnimatePresence>
          {isOverlayVisible('hype') && (
            <motion.div
              variants={overlayVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              className={`absolute pointer-events-auto z-40 group transition-all duration-300 ${
                hypeDemoActive ? 'scale-110 drop-shadow-2xl' : ''
              }`}
              style={{
                left: '570px', // Centered in 1280px width  
                top: '15px',
                width: '140px',
                height: '32px'
              }}
            >
              <div className='relative'>
                {/* Demo highlight ring */}
                {hypeDemoActive && (
                  <div className='absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur opacity-75 animate-pulse'></div>
                )}
                
                {/* Hover indicator */}
                <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
                  <div className='bg-orange-500 text-white px-2 py-1 rounded text-xs whitespace-nowrap'>
                    {hypeDemoActive ? 'Demo Active! 🔥' : 'Click to boost hype! 🔥'}
                  </div>
                </div>
                
                <ModernHypePill
                  chat={chat}
                  isGuidedDemo={isGuidedDemo}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Demo Panel - Slide in from left when demo activated */}
        <AnimatePresence>
          {chatDemoActive && (
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className='absolute left-0 top-0 bottom-0 w-96 z-40 pointer-events-auto'
            >
              <div className='w-full h-full bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-800/95 backdrop-blur-xl border-r-2 border-blue-400 shadow-2xl'>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-blue-400/30'>
                  <div className='flex items-center gap-3'>
                    <div className='w-3 h-3 bg-green-400 rounded-full animate-pulse'></div>
                    <h2 className='text-white font-bold text-lg'>🔥 Heat Lounge Chat</h2>
                  </div>
                  <div className='text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full'>
                    Live Translations
                  </div>
                </div>
                
                {/* Chat Content */}
                <div className='h-[calc(100%-60px)]'>
                  <HeatLoungeWidget
                    className='w-full h-full bg-transparent border-0'
                    isMobilePreview={false} // Full desktop view
                    chat={chat}
                    isGuidedDemo={isGuidedDemo}
                    guidesShown={guidesShown}
                    visibleGuide={visibleGuide}
                    setVisibleGuide={setVisibleGuide}
                    userMentioned={(messageText) => {
                      console.log('User mentioned:', messageText)
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Watch Party - REMOVED from video overlay to avoid blocking */}

        {/* Fantasy Demo Panel - Slide in from right when demo activated */}
        <AnimatePresence>
          {fantasyDemoActive && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className='absolute right-0 top-0 bottom-0 w-96 z-40 pointer-events-auto'
            >
              <div className='w-full h-full bg-gradient-to-br from-green-900/95 via-emerald-800/95 to-teal-900/95 backdrop-blur-xl border-l-2 border-green-400 shadow-2xl'>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-green-400/30'>
                  <div className='flex items-center gap-3'>
                    <div className='w-3 h-3 bg-green-400 rounded-full animate-pulse'></div>
                    <h2 className='text-white font-bold text-lg'>🎮 Fantasy Live</h2>
                  </div>
                  <div className='text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded-full'>
                    Real-time Scoring
                  </div>
                </div>
                
                {/* Fantasy Content */}
                <div className='h-[calc(100%-60px)]'>
                  <FantasyLiveWidget
                    className='w-full h-full bg-transparent border-0'
                    isMobilePreview={false} // Full desktop view
                    chat={chat}
                    isGuidedDemo={isGuidedDemo}
                    guidesShown={guidesShown}
                    visibleGuide={visibleGuide}
                    setVisibleGuide={setVisibleGuide}
                    selectedSurfers={selectedSurfers}
                    setSelectedSurfers={setSelectedSurfers}
                    salaryBudget={salaryBudget}
                    setSalaryBudget={setSalaryBudget}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Q&A Demo Panel - Large modern overlay when demo activated */}
        <AnimatePresence>
          {qnaDemoActive && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className='absolute inset-8 z-25 pointer-events-auto'
            >
              <div className='w-full h-full bg-gradient-to-br from-purple-900/15 via-indigo-800/20 to-purple-900/15 backdrop-blur-3xl border border-purple-400/30 shadow-2xl rounded-3xl overflow-hidden'>
                {/* Modern Header with Glass Effect */}
                <div className='flex items-center justify-between p-8 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 backdrop-blur-xl border-b border-purple-400/20'>
                  <div className='flex items-center gap-6'>
                    <div className='w-5 h-5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse shadow-lg'></div>
                    <h2 className='text-white font-bold text-3xl tracking-wide drop-shadow-lg'>🎤 Q&A with Announcer</h2>
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='text-base text-purple-200 bg-purple-500/20 px-6 py-3 rounded-2xl border border-purple-400/30 backdrop-blur-sm shadow-lg'>
                      Live Questions
                    </div>
                    <div className='text-sm text-white/70 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm'>
                      Press Q to toggle
                    </div>
                  </div>
                </div>
                
                {/* Q&A Content with modern spacing */}
                <div className='h-[calc(100%-120px)] p-8'>
                  <div className='w-full h-full bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden shadow-inner'>
                    <AnnouncerQnAWidget
                      className='w-full h-full bg-transparent border-0'
                      isMobilePreview={false}
                      chat={chat}
                      isGuidedDemo={isGuidedDemo}
                      guidesShown={guidesShown}
                      visibleGuide={visibleGuide}
                      setVisibleGuide={setVisibleGuide}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prop Picks Demo Panel - Large modern overlay when demo activated */}
        <AnimatePresence>
          {propPicksDemoActive && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className='absolute inset-8 z-25 pointer-events-auto'
            >
              <div className='w-full h-full bg-gradient-to-br from-orange-900/15 via-yellow-800/20 to-amber-900/15 backdrop-blur-3xl border border-orange-400/30 shadow-2xl rounded-3xl overflow-hidden'>
                {/* Modern Header with Glass Effect */}
                <div className='flex items-center justify-between p-8 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 backdrop-blur-xl border-b border-orange-400/20'>
                  <div className='flex items-center gap-6'>
                    <div className='w-5 h-5 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full animate-pulse shadow-lg'></div>
                    <h2 className='text-white font-bold text-3xl tracking-wide drop-shadow-lg'>🎲 Prop Picks</h2>
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='text-base text-orange-200 bg-orange-500/20 px-6 py-3 rounded-2xl border border-orange-400/30 backdrop-blur-sm shadow-lg'>
                      Live Betting
                    </div>
                    <div className='text-sm text-white/70 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm'>
                      Press P to toggle
                    </div>
                  </div>
                </div>
                
                {/* Prop Picks Content with modern spacing */}
                <div className='h-[calc(100%-120px)] p-8'>
                  <div className='w-full h-full bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden shadow-inner'>
                    <PropPickemWidget
                      className='w-full h-full bg-transparent border-0'
                      isMobilePreview={false}
                      chat={chat}
                      isGuidedDemo={isGuidedDemo}
                      guidesShown={guidesShown}
                      visibleGuide={visibleGuide}
                      setVisibleGuide={setVisibleGuide}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contextual Overlays */}
        
        {/* Dynamic Ads - Contextual */}
        <AnimatePresence>
          {dynamicAd && overlaysVisible && (
            <motion.div
              variants={overlayVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              className='absolute pointer-events-auto z-30'
              style={{
                left: '50%',
                top: '20%',
                transform: 'translateX(-50%)',
                width: '250px',
                height: '150px'
              }}
            >
              <div className='w-full h-full bg-white/95 backdrop-blur-sm rounded-lg border border-wsl-warning shadow-xl overflow-hidden'>
                <AdvertsOfferWidget
                  className='w-full h-full bg-transparent border-0'
                  isMobilePreview={true}
                  chat={chat}
                  guidesShown={guidesShown}
                  visibleGuide={visibleGuide}
                  setVisibleGuide={setVisibleGuide}
                  adId={dynamicAd.adId}
                  clickPoints={dynamicAd.clickPoints}
                  onAdClick={(points, adId) => {
                    awardPoints(points)
                    // Clear the dynamic ad after click
                    chat?.sdk.publish({
                      message: {},
                      channel: dynamicAdChannelId
                    })
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Surfer Odds - REMOVED from video overlay to avoid blocking */}
      </div>

      {/* Gesture Indicators - DISABLED FOR DEMO to not interfere with reactions */}
    </div>
  )
}

// Modern Hype Pill Component - Sleek horizontal design for landscape  
function ModernHypePill({ chat, isGuidedDemo }) {
  const [hypeLevel, setHypeLevel] = useState(45) // Start with visible hype level for demo
  const [isHyping, setIsHyping] = useState(false)
  
  // Subscribe to hype updates
  useEffect(() => {
    if (!chat || !chat.sdk) return

    const hypeChannel = chat.sdk.channel('wsl.stream.hype')
    const hypeSubscription = hypeChannel.subscription({
      receivePresenceEvents: false
    })

    hypeSubscription.onMessage = (messageEvent: any) => {
      try {
        const hypeData = messageEvent.message
        if (hypeData && typeof hypeData.level === 'number') {
          let finalLevel = hypeData.level
          if (hypeData.isAdditive) {
            setHypeLevel(prevLevel => {
              finalLevel = Math.min(100, prevLevel + hypeData.level)
              return finalLevel
            })
          } else {
            setHypeLevel(hypeData.level)
          }
        }
      } catch (error) {
        // Silent error handling
      }
    }

    hypeSubscription.subscribe()
    return () => {
      hypeSubscription.unsubscribe()
    }
  }, [chat])

  // Hype decay
  useEffect(() => {
    const decay = setInterval(() => {
      setHypeLevel(prev => {
        if (prev > 0) {
          const decayAmount = Math.random() * 3 + 2 // 2-5 point decay
          return Math.max(0, prev - decayAmount)
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(decay)
  }, [])

  // Trigger hype
  const triggerHype = async () => {
    if (!chat || !chat.sdk || isHyping) return

    setIsHyping(true)
    
    try {
      const boost = Math.random() * 15 + 10 // 10-25 point boost
      const newLevel = Math.min(100, hypeLevel + boost)
      
      await chat.sdk.publish({
        channel: 'wsl.stream.hype',
        message: {
          userId: chat.currentUser.id,
          level: Math.round(newLevel),
          intensity: 'high',
          timestamp: Date.now()
        },
        storeInHistory: false
      })
    } catch (error) {
      // Silent error handling
    }
    
    setTimeout(() => setIsHyping(false), 800)
  }

  // Get hype color based on level
  const getHypeColor = (level: number) => {
    if (level < 25) return '#64748B' // Slate
    if (level < 50) return '#3B82F6' // Blue  
    if (level < 75) return '#F59E0B' // Amber
    return '#EF4444' // Red
  }

  return (
    <div 
      onClick={triggerHype}
      className={`w-full h-full backdrop-blur-md rounded-full shadow-xl cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95 overflow-hidden ${
        isHyping ? 'animate-pulse' : ''
      }`}
      style={{
        background: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, ${getHypeColor(hypeLevel)}30 100%)`,
        backdropFilter: 'blur(12px)',
        border: `2px solid ${getHypeColor(hypeLevel)}60`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`
      }}
    >
      {/* Inner glow effect */}
      <div 
        className='absolute inset-0 rounded-full opacity-20'
        style={{
          background: `radial-gradient(circle at 30% 50%, ${getHypeColor(hypeLevel)}60 0%, transparent 70%)`,
        }}
      />
      
      <div className='relative flex items-center justify-between h-full px-3'>
        <div className='flex items-center gap-2'>
          {/* Fire icon with enhanced glow */}
          <div 
            className='text-sm transition-all duration-300 drop-shadow-sm'
            style={{ 
              color: getHypeColor(hypeLevel),
              filter: hypeLevel > 30 ? `drop-shadow(0 0 6px ${getHypeColor(hypeLevel)}80)` : 'none',
              textShadow: hypeLevel > 50 ? `0 0 8px ${getHypeColor(hypeLevel)}` : 'none'
            }}
          >
            🔥
          </div>
          
          {/* Hype percentage with enhanced styling */}
          <div 
            className='text-xs font-extrabold transition-all duration-300 drop-shadow-sm'
            style={{ 
              color: getHypeColor(hypeLevel),
              textShadow: `0 0 8px ${getHypeColor(hypeLevel)}40`
            }}
          >
            {Math.round(hypeLevel)}%
          </div>
        </div>
        
        {/* Enhanced mini progress bar */}
        <div className='w-8 h-1.5 bg-black/30 rounded-full overflow-hidden border border-white/10'>
          <div 
            className='h-full transition-all duration-700 ease-out rounded-full relative'
            style={{
              width: `${hypeLevel}%`,
              background: `linear-gradient(90deg, ${getHypeColor(hypeLevel)} 0%, ${getHypeColor(hypeLevel)}80 100%)`,
              boxShadow: hypeLevel > 30 ? `0 0 8px ${getHypeColor(hypeLevel)}60, inset 0 0 4px ${getHypeColor(hypeLevel)}40` : 'none'
            }}
          >
            {/* Shimmer effect for high hype levels */}
            {hypeLevel > 60 && (
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse' />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
