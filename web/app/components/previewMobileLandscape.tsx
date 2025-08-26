import { useState, useEffect, useRef } from 'react'
import UserStatus from './userStatus'
import MobileLandscapeContents from './previewMobileLandscapeContents'
import Notification from './notification'
import Alert from './alert'
import GuideOverlay from './guideOverlay'
import { CommonMessageHandler, AwardPoints } from '../commonLogic'
import {
  pushChannelSelfId,
  pushChannelSalesId,
  dynamicAdChannelId,
  AlertType
} from '../data/constants'

export default function PreviewMobileLandscape ({
  className,
  chat,
  isGuidedDemo,
  guidesShown,
  visibleGuide,
  setVisibleGuide,
  logout,
  currentScore
}) {
  // Lineup Analyzer budget state - shared across components
  const [selectedSurfers, setSelectedSurfers] = useState([])
  const [salaryBudget, setSalaryBudget] = useState(50000)
  const [notification, setNotification] = useState<{
    heading: string
    message: string
    imageUrl?: string
  } | null>(null)
  const [alert, setAlert] = useState<{
    points: number | null
    body: string
  } | null>(null)
  const [dynamicAd, setDynamicAd] = useState<{
    adId: string
    clickPoints: number
  } | null>(null)
  
  // Landscape-specific overlay states
  const [overlaysVisible, setOverlaysVisible] = useState(true)
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null)
  const [lastInteraction, setLastInteraction] = useState(Date.now())
  
  // Demo control states for presenter
  const [chatDemoActive, setChatDemoActive] = useState(false)
  const [fantasyDemoActive, setFantasyDemoActive] = useState(false)
  const [hypeDemoActive, setHypeDemoActive] = useState(false)
  const [qnaDemoActive, setQnaDemoActive] = useState(false) 
  const [propPicksDemoActive, setPropPicksDemoActive] = useState(false)
  const [surferOddsDemoActive, setSurferOddsDemoActive] = useState(false)
  
  const pushChannelId = isGuidedDemo ? pushChannelSalesId : pushChannelSelfId
  const currentScoreRef = useRef(currentScore)
  
  useEffect(() => {
    currentScoreRef.current = currentScore
  }, [currentScore])

  // Auto-hide overlay system for landscape
  useEffect(() => {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer)
    }
    
    const timer = setTimeout(() => {
      setOverlaysVisible(false)
    }, 30000) // 30 second auto-hide for demo
    
    setAutoHideTimer(timer)
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [lastInteraction])

  // Set up PubNub subscription for push messages and ads
  useEffect(() => {
    if (!chat) return
    
    const subscriptionSet = chat.sdk.subscriptionSet({
      channels: [pushChannelId, dynamicAdChannelId]
    })
    
    subscriptionSet.onMessage = messageEvent => {
      CommonMessageHandler(
        isGuidedDemo,
        messageEvent,
        (notification) => setNotification(notification),
        (ad) => setDynamicAd(ad)
      )
    }
    
    subscriptionSet.subscribe()
    
    return () => {
      subscriptionSet.unsubscribe()
    }
  }, [chat, pushChannelId, dynamicAdChannelId, isGuidedDemo])

  // Interaction handler
  const handleInteraction = () => {
    setLastInteraction(Date.now())
    setOverlaysVisible(true)
  }

  const handleContainerTap = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    handleInteraction()
    setOverlaysVisible(!overlaysVisible)
  }

  function showNewPointsAlert (points: number, message: string) {
    setAlert({ points: points, body: message })
  }

  // Handle keyboard shortcuts for demo presentation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch(event.key.toLowerCase()) {
        case '1':
          setChatDemoActive(!chatDemoActive)
          console.log('Chat demo toggled:', !chatDemoActive)
          break
        case '2':
          setFantasyDemoActive(!fantasyDemoActive)
          console.log('Fantasy demo toggled:', !fantasyDemoActive)
          break
        case 'h':
          setHypeDemoActive(!hypeDemoActive)
          console.log('Hype demo toggled:', !hypeDemoActive)
          break
        case 'q':
          setQnaDemoActive(!qnaDemoActive)
          console.log('Q&A demo toggled:', !qnaDemoActive)
          break
        case 'p':
          setPropPicksDemoActive(!propPicksDemoActive)
          console.log('Prop Picks demo toggled:', !propPicksDemoActive)
          break
        case 's':
          setSurferOddsDemoActive(!surferOddsDemoActive)
          console.log('Surfer Odds demo toggled:', !surferOddsDemoActive)
          break
        case 'escape':
          // Clear all demo modes
          setChatDemoActive(false)
          setFantasyDemoActive(false)
          setHypeDemoActive(false)
          setQnaDemoActive(false)
          setPropPicksDemoActive(false)
          setSurferOddsDemoActive(false)
          console.log('All demo modes cleared')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [chatDemoActive, fantasyDemoActive, hypeDemoActive, qnaDemoActive, propPicksDemoActive, surferOddsDemoActive])

  return (
    <div className={`${className || ''} w-full h-full`} tabIndex={0}>
      <div className="flex justify-center items-center gap-6 w-full h-full">
        {/* Video Container */}
        <div 
          className='relative border-4 border-navy100 rounded-3xl bg-black'
          style={{ 
            width: '1280px', 
            height: '720px',
            aspectRatio: '16/9',
            overflow: 'visible' // Allow emojis to float above
          }}
          onTouchStart={handleInteraction}
        >
          {/* Notifications and alerts - positioned over everything */}
            {notification && (
              <div className='absolute top-4 left-1/2 transform -translate-x-1/2 z-50'>
                <Notification
                  heading={notification.heading}
                  message={notification.message}
                  imageUrl={notification.imageUrl}
                  onClose={() => {
                    setNotification(null)
                  }}
                />
              </div>
            )}
            
            {alert && (
              <div className='absolute top-4 right-4 z-50'>
                <Alert
                  type={AlertType.POINTS}
                  points={alert.points}
                  body={alert.body}
                  onClose={() => {
                    setAlert(null)
                  }}
                />
              </div>
            )}

            {/* Header */}
            <div className='relative z-30'>
              <LandscapeHeader
                currentScore={currentScore}
                budgetProps={{
                  selectedSurfers: selectedSurfers,
                  salaryBudget: salaryBudget
                }}
                chat={chat}
                logout={logout}
                onInteraction={handleInteraction}
              />
            </div>

            {/* Main Content - Smart Overlay System */}
            <MobileLandscapeContents
              chat={chat}
              isGuidedDemo={isGuidedDemo}
              guidesShown={guidesShown}
              visibleGuide={visibleGuide}
              setVisibleGuide={setVisibleGuide}
              currentScore={currentScore}
              selectedSurfers={selectedSurfers}
              setSelectedSurfers={setSelectedSurfers}
              salaryBudget={salaryBudget}
              setSalaryBudget={setSalaryBudget}
              dynamicAd={dynamicAd}
              overlaysVisible={overlaysVisible}
              onInteraction={handleInteraction}
              chatDemoActive={chatDemoActive}
              fantasyDemoActive={fantasyDemoActive}
              hypeDemoActive={hypeDemoActive}
              qnaDemoActive={qnaDemoActive}
              propPicksDemoActive={propPicksDemoActive}
              surferOddsDemoActive={surferOddsDemoActive}
              awardPoints={(points, message) => {
                AwardPoints(
                  chat,
                  points,
                  message,
                  currentScoreRef.current,
                  showNewPointsAlert
                )
              }}
            />
        </div>
        
        {/* Demo Control Panel - Outside video area */}
        <div className='flex-shrink-0'>
          <div className='bg-gradient-to-br from-slate-900/90 to-black/90 backdrop-blur-xl rounded-xl p-6 text-white border border-white/20 shadow-2xl min-w-[200px]'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-3 h-3 bg-green-400 rounded-full animate-pulse'></div>
              <span className='text-base font-medium text-green-300'>Demo Controls</span>
            </div>
            
            <div className='flex flex-col gap-3'>
              <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all ${
                chatDemoActive ? 'bg-blue-500/30 border border-blue-400' : 'hover:bg-white/10'
              }`}>
                <div className='flex items-center gap-2'>
                  <kbd className='bg-blue-500 text-white px-2 py-1 rounded text-sm font-bold'>1</kbd>
                  <span className='text-sm'>Chat</span>
                </div>
                {chatDemoActive && <div className='w-2 h-2 bg-blue-400 rounded-full animate-pulse'></div>}
              </div>
              
              <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all ${
                fantasyDemoActive ? 'bg-green-500/30 border border-green-400' : 'hover:bg-white/10'
              }`}>
                <div className='flex items-center gap-2'>
                  <kbd className='bg-green-500 text-white px-2 py-1 rounded text-sm font-bold'>2</kbd>
                  <span className='text-sm'>Fantasy</span>
                </div>
                {fantasyDemoActive && <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>}
              </div>
              
              <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all ${
                hypeDemoActive ? 'bg-orange-500/30 border border-orange-400' : 'hover:bg-white/10'
              }`}>
                <div className='flex items-center gap-2'>
                  <kbd className='bg-orange-500 text-white px-2 py-1 rounded text-sm font-bold'>H</kbd>
                  <span className='text-sm'>Hype</span>
                </div>
                {hypeDemoActive && <div className='w-2 h-2 bg-orange-400 rounded-full animate-pulse'></div>}
              </div>
              
              <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all ${
                qnaDemoActive ? 'bg-purple-500/30 border border-purple-400' : 'hover:bg-white/10'
              }`}>
                <div className='flex items-center gap-2'>
                  <kbd className='bg-purple-500 text-white px-2 py-1 rounded text-sm font-bold'>Q</kbd>
                  <span className='text-sm'>Q&A</span>
                </div>
                {qnaDemoActive && <div className='w-2 h-2 bg-purple-400 rounded-full animate-pulse'></div>}
              </div>
              
              <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all ${
                propPicksDemoActive ? 'bg-yellow-500/30 border border-yellow-400' : 'hover:bg-white/10'
              }`}>
                <div className='flex items-center gap-2'>
                  <kbd className='bg-yellow-500 text-white px-2 py-1 rounded text-sm font-bold'>P</kbd>
                  <span className='text-sm'>Props</span>
                </div>
                {propPicksDemoActive && <div className='w-2 h-2 bg-yellow-400 rounded-full animate-pulse'></div>}
              </div>
              
              <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all ${
                surferOddsDemoActive ? 'bg-cyan-500/30 border border-cyan-400' : 'hover:bg-white/10'
              }`}>
                <div className='flex items-center gap-2'>
                  <kbd className='bg-cyan-500 text-white px-2 py-1 rounded text-sm font-bold'>S</kbd>
                  <span className='text-sm'>Odds</span>
                </div>
                {surferOddsDemoActive && <div className='w-2 h-2 bg-cyan-400 rounded-full animate-pulse'></div>}
              </div>
              
              <div className='border-t border-white/20 mt-2 pt-2'>
                <div className='flex items-center gap-2 px-3 py-1'>
                  <kbd className='bg-red-500 text-white px-2 py-1 rounded text-sm font-bold'>ESC</kbd>
                  <span className='text-sm text-gray-300'>Clear All</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  function LandscapeHeader ({ currentScore, budgetProps, chat, logout, onInteraction }) {
    return (
      <div 
        className='flex flex-row items-center justify-between w-full px-4 py-1.5 bg-gradient-to-r from-navy900/90 to-wsl-deep-blue/90 backdrop-blur-sm border-b border-white/10'
        onClick={onInteraction}
        onTouchStart={onInteraction}
      >
        {/* Left side - Event info */}
        <div className='flex items-center gap-6'>
          <div className='text-white'>
            <div className='text-base font-bold'>WSL Pipeline Masters</div>
            <div className='text-xs text-wsl-light-blue'>Griffin vs John John • Heat 7 • Live</div>
          </div>
          
          {/* Budget display - compact for landscape */}
          {budgetProps && (
            <div className='text-xs text-neutral-300 bg-navy800/50 px-2 py-1 rounded'>
              Budget: ${budgetProps.salaryBudget?.toLocaleString()} | 
              Surfers: {budgetProps.selectedSurfers?.length || 0}
            </div>
          )}
        </div>

        {/* Right side - User status and score */}
        <div className='flex items-center gap-4'>
          <div className='text-right'>
            <div className='text-lg font-bold text-white'>{currentScore.toLocaleString()}</div>
            <div className='text-xs text-wsl-light-blue'>Points</div>
          </div>
          
          <UserStatus
            chat={chat}
            logout={logout}
            compact={true}
          />
        </div>
      </div>
    )
  }
}
