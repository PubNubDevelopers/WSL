'use client'

import { useState, useEffect, useRef } from 'react'
import GuideOverlay from '../components/guideOverlay'
import { Chat } from '@pubnub/chat'
import { hypeUpdatesChannelId } from '../data/constants'

interface HypeMeterWidgetProps {
  className: string
  isMobilePreview: boolean
  chat: Chat
  isGuidedDemo: boolean
  guidesShown: boolean
  visibleGuide: string
  setVisibleGuide: (guide: string) => void
}

interface HypeEvent {
  timestamp: number
  level: number
  userId: string
  intensity: 'low' | 'medium' | 'high'
}

export default function HypeMeterWidget({
  className,
  isMobilePreview,
  chat,
  isGuidedDemo,
  guidesShown,
  visibleGuide,
  setVisibleGuide
}: HypeMeterWidgetProps) {
  // Hype state
  const [hypeLevel, setHypeLevel] = useState(0)
  const [hypeCurve, setHypeCurve] = useState<HypeEvent[]>([])
  const [isHyping, setIsHyping] = useState(false)
  const [crowdScore, setCrowdScore] = useState(0)
  
  // Heat context
  const [currentHeat] = useState({
    surfer1: 'Griffin Colapinto',
    surfer2: 'John John Florence',
    location: 'Pipeline, Hawaii',
    heatNumber: 7
  })

  const hypeChannelId = hypeUpdatesChannelId
  
  /**
   * Initialize PubNub listener for real-time hype updates
   */
  useEffect(() => {
    if (!chat || !chat.sdk) return



    // Subscribe to hype channel for real-time updates
    const hypeChannel = chat.sdk.channel(hypeChannelId)
    const hypeSubscription = hypeChannel.subscription({
      receivePresenceEvents: false // We don't need presence for hype updates
    })

    // Listen for hype messages (optimized for high-frequency updates)
    hypeSubscription.onMessage = (messageEvent: any) => {
      try {
        const hypeData = messageEvent.message
        
        if (hypeData && typeof hypeData.level === 'number') {
          // Handle additive boosts
          let finalLevel = hypeData.level;
          if (hypeData.isAdditive) {
            setHypeLevel(prevLevel => {
              finalLevel = Math.min(100, prevLevel + hypeData.level);
              return finalLevel;
            });
          } else {
            setHypeLevel(hypeData.level);
            finalLevel = hypeData.level;
          }
          
          const newEvent: HypeEvent = {
            timestamp: Date.now(),
            level: finalLevel,
            userId: hypeData.userId || 'anonymous',
            intensity: hypeData.intensity || 'medium'
          }
          
          // Update hype curve (keep last 50 events)
          setHypeCurve(prev => [...prev.slice(-49), newEvent])
          
          // Convert to crowd score (0-100% → 0-10 score)
          setCrowdScore(Math.round((finalLevel / 100) * 100) / 10)

        }
      } catch (error) {
        // Error processing hype message
      }
    }

    // Subscribe to start receiving hype updates
    hypeSubscription.subscribe()

    // Cleanup
    return () => {
      hypeSubscription.unsubscribe()
    }
  }, [chat, hypeChannelId])

  /**
   * Send hype message when user interacts
   */
  const triggerHype = async () => {
    if (!chat || !chat.sdk || isHyping) return

    setIsHyping(true)
    
    try {
      // Calculate new hype level (add random boost)
      const boost = Math.random() * 20 + 10 // 10-30 point boost
      const newLevel = Math.min(100, hypeLevel + boost)
      
      // Send lightweight hype message (optimized for high-frequency updates)
      await chat.sdk.publish({
        channel: hypeChannelId,
        message: {
          userId: chat.currentUser.id,
          level: Math.round(newLevel),
          intensity: 'high',
          timestamp: Date.now()
        },
        storeInHistory: false // Don't persist hype messages - they're transient
      })

      
    } catch (error) {
      // Error sending hype message
    }
    
    // Reset button state
    setTimeout(() => setIsHyping(false), 1000)
  }

  /**
   * Simulate realistic hype decay over time
   */
  useEffect(() => {
    const decay = setInterval(() => {
      setHypeLevel(prev => {
        if (prev > 0) {
          // Much faster decay - lose 5-12 points per second, more aggressive at higher levels
          const baseDecay = Math.random() * 7 + 5 // 5-12 base decay
          const acceleratedDecay = prev > 50 ? prev * 0.08 : 0 // Extra 8% decay when above 50%
          const decayAmount = baseDecay + acceleratedDecay
          return Math.max(0, prev - decayAmount)
        }
        return prev
      })
    }, 500) // Check twice as often (every 500ms instead of 1000ms)

    return () => clearInterval(decay)
  }, [])

  /**
   * Generate SVG path for hype curve visualization
   */
  const generateHypeCurvePath = (events: HypeEvent[]) => {
    if (events.length < 2) return ''
    
    const width = 300
    const height = 80
    const maxPoints = 20
    const recentEvents = events.slice(-maxPoints)
    
    let path = ''
    recentEvents.forEach((event, index) => {
      const x = (index / (maxPoints - 1)) * width
      const y = height - (event.level / 100) * height
      
      if (index === 0) {
        path += `M ${x} ${y}`
      } else {
        path += ` L ${x} ${y}`
      }
    })
    
    return path
  }

  return (
    <div className={`${className} w-full h-fit`}>
      <GuideOverlay
        id={'hypeGuide'}
        guidesShown={guidesShown}
        visibleGuide={visibleGuide}
        setVisibleGuide={setVisibleGuide}
        text={
          <span>
            The <span className='font-semibold'>Hype Meter</span> uses{' '}
            <span className='font-semibold'>optimized PubNub messages</span> for ultra-fast,
            high-frequency real-time updates:
            <ul className='list-disc list-inside my-2'>
              <li>Instant crowd excitement tracking</li>
              <li>High-frequency message delivery (&lt;100ms)</li>
              <li>Lightweight messages perfect for live events</li>
              <li>Real-time crowd scoring integration</li>
            </ul>
            These optimized messages don't persist in history (storeInHistory: false)
            and deliver instantly across the globe for real-time crowd engagement.
          </span>
        }
        xOffset={`${isMobilePreview ? 'left-[0px]' : '-left-[60px]'}`}
        yOffset={'top-[10px]'}
        flexStyle={'flex-row items-start'}
      />

      {/* Hype Meter Header */}
      <div className='flex flex-col bg-wsl-deep-blue overflow-hidden rounded-t text-white'>
        <div className='px-[16px] py-[12px] flex items-center justify-between h-[56px]'>
          <div className='flex items-center gap-3'>
            <div className='text-2xl'>🔥</div>
            <div className='text-[16px] font-[600] leading-[24px]'>
              Hype Meter
            </div>
          </div>
          <div className='text-sm text-wsl-light-blue'>
            Live Crowd Excitement
          </div>
        </div>
      </div>

      {/* Hype Visualization */}
      <div className='bg-white p-6'>
        {/* Main Hype Display */}
        <div className='flex flex-col items-center mb-6'>
          {/* Circular Progress Ring */}
          <div className='relative w-32 h-32 mb-4'>
            <svg className='w-full h-full transform -rotate-90' viewBox='0 0 100 100'>
              {/* Background circle */}
              <circle
                cx='50'
                cy='50'
                r='45'
                fill='none'
                stroke='#E6F3FF'
                strokeWidth='8'
              />
              {/* Progress circle */}
              <circle
                cx='50'
                cy='50'
                r='45'
                fill='none'
                stroke='url(#hypeGradient)'
                strokeWidth='8'
                strokeLinecap='round'
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - hypeLevel / 100)}`}
                className='transition-all duration-500 ease-out'
              />
              <defs>
                <linearGradient id='hypeGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                  <stop offset='0%' stopColor='#4A90E2' />
                  <stop offset='50%' stopColor='#3182CE' />
                  <stop offset='100%' stopColor='#ED8936' />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center Text */}
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <div className='text-3xl font-bold text-wsl-primary-blue'>
                {Math.round(hypeLevel)}%
              </div>
              <div className='text-xs text-wsl-gray-500 uppercase tracking-wide'>
                HYPE
              </div>
            </div>
          </div>
          
          {/* Crowd Score */}
          <div className='bg-wsl-light-blue rounded-lg px-4 py-2 mb-4'>
            <div className='text-center'>
              <div className='text-lg font-semibold text-wsl-deep-blue'>
                Crowd Score: {crowdScore.toFixed(1)}/10
              </div>
              <div className='text-xs text-wsl-gray-700'>
                Based on live fan excitement
              </div>
            </div>
          </div>
          
          {/* Interactive Hype Button */}
          <button
            onClick={triggerHype}
            disabled={isHyping}
            className={`px-8 py-3 rounded-full font-semibold text-white transition-all duration-200 ${
              isHyping
                ? 'bg-wsl-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-wsl-primary-blue to-wsl-ocean-blue hover:from-wsl-ocean-blue hover:to-wsl-deep-blue transform hover:scale-105 active:scale-95'
            }`}
          >
            {isHyping ? (
              <span className='flex items-center gap-2'>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                Hyping...
              </span>
            ) : (
              <span className='flex items-center gap-2'>
                🔥 HYPE IT UP!
              </span>
            )}
          </button>
        </div>

        {/* Hype Curve Visualization */}
        {hypeCurve.length > 1 && (
          <div className='border-t pt-4'>
            <div className='text-sm font-medium text-wsl-gray-700 mb-2'>
              Excitement Over Time
            </div>
            <div className='bg-wsl-gray-50 rounded-lg p-4 flex justify-center'>
              <svg width='300' height='80' className='overflow-visible'>
                <path
                  d={generateHypeCurvePath(hypeCurve)}
                  stroke='#4A90E2'
                  strokeWidth='3'
                  fill='none'
                  strokeLinecap='round'
                  className='drop-shadow-sm'
                />
                {/* Grid lines */}
                <defs>
                  <pattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'>
                    <path d='M 20 0 L 0 0 0 20' fill='none' stroke='#E6F3FF' strokeWidth='1'/>
                  </pattern>
                </defs>
                <rect width='300' height='80' fill='url(#grid)' opacity='0.5'/>
              </svg>
            </div>
            <div className='flex justify-between text-xs text-wsl-gray-500 mt-1'>
              <span>Past</span>
              <span>Now</span>
            </div>
          </div>
        )}

        {/* Heat Context */}
        <div className='mt-4 text-center text-sm text-wsl-gray-500'>
          Tracking excitement for <span className='font-medium text-wsl-primary-blue'>
            {currentHeat.surfer1} vs {currentHeat.surfer2}
          </span>
        </div>
      </div>
    </div>
  )
}
