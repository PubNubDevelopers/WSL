'use client'

import { useState, useEffect, useRef } from 'react'
import GuideOverlay from '../components/guideOverlay'
import { Chat } from '@pubnub/chat'

interface ClipCreatorWidgetProps {
  className: string
  isMobilePreview: boolean
  chat: Chat
  isGuidedDemo: boolean
  guidesShown: boolean
  visibleGuide: string
  setVisibleGuide: (guide: string) => void
}

interface SurfClip {
  id: string
  title: string
  surfer: string
  score?: number
  maneuver: string
  location: string
  duration: number
  timestamp: string
  status: 'generating' | 'ready' | 'failed'
  thumbnailUrl?: string
  clipUrl?: string
  createdAt: string
}

interface ClipNotification {
  id: string
  clipId: string
  title: string
  status: 'ready' | 'failed'
  timestamp: string
}

export default function ClipCreatorWidget({
  className,
  isMobilePreview,
  chat,
  isGuidedDemo,
  guidesShown,
  visibleGuide,
  setVisibleGuide
}: ClipCreatorWidgetProps) {
  // Clip state
  const [recentClips, setRecentClips] = useState<SurfClip[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [clipNotifications, setClipNotifications] = useState<ClipNotification[]>([])
  
  // UI state
  const [showClipHistory, setShowClipHistory] = useState(false)
  const [selectedClip, setSelectedClip] = useState<SurfClip | null>(null)
  
  // Live stream context
  const [currentTimestamp, setCurrentTimestamp] = useState('3:42')
  const [surfMoment, setSurfMoment] = useState('Griffin charging massive Pipeline barrel')

  const notificationTimeoutRef = useRef<NodeJS.Timeout>()

  /**
   * Initialize clip system when chat is available
   */
  useEffect(() => {
    if (!chat) return

    // Load existing clips for demo
    loadDemoClips()
    
    // Listen for clip generation notifications
    listenForClipNotifications()
    
    // Simulate live surf moments for context
    simulateLiveSurfMoments()

  }, [chat])

  /**
   * Load demo clips to show recent highlights
   */
  const loadDemoClips = () => {
    const demoClips: SurfClip[] = [
      {
        id: 'clip-griffin-817',
        title: 'Griffin Colapito 8.17 - Blowtail to Layback',
        surfer: 'Griffin Colapinto',
        score: 8.17,
        maneuver: 'Blowtail to Layback Combo',
        location: 'Pipeline, Hawaii',
        duration: 30,
        timestamp: '3:42',
        status: 'ready',
        thumbnailUrl: '/matchstats/playericon_mbappe.png', // Griffin Colapinto
        clipUrl: 'https://vimeo.com/1073970603', // Demo video
        createdAt: new Date(Date.now() - 900000).toISOString() // 15 mins ago
      },
      {
        id: 'clip-jjf-dropIn',
        title: 'John John Florence Epic Drop-In',
        surfer: 'John John Florence',
        score: 7.5,
        maneuver: 'Massive Drop-In with Speed Generation',
        location: 'Pipeline, Hawaii',
        duration: 30,
        timestamp: '2:18',
        status: 'ready',
        thumbnailUrl: '/matchstats/playericon_silva.png', // Placeholder
        clipUrl: 'https://vimeo.com/1073970603',
        createdAt: new Date(Date.now() - 1800000).toISOString() // 30 mins ago
      },
      {
        id: 'clip-griffin-wipeout',
        title: 'Griffin Massive Wipeout Recovery',
        surfer: 'Griffin Colapinto',
        maneuver: 'Hold-Down Recovery and Paddle Back',
        location: 'Pipeline, Hawaii',
        duration: 30,
        timestamp: '1:33',
        status: 'ready',
        thumbnailUrl: '/matchstats/playericon_silva.png',
        clipUrl: 'https://vimeo.com/1073970603',
        createdAt: new Date(Date.now() - 2700000).toISOString() // 45 mins ago
      }
    ]
    
    setRecentClips(demoClips)
  }

  /**
   * Listen for clip generation notifications via PubNub
   */
  const listenForClipNotifications = async () => {
    if (!chat) return

    try {
      // Listen on clip notifications channel
      const clipChannel = chat.sdk.channel('wsl.clip-notifications')
      const clipSubscription = clipChannel.subscription({
        receivePresenceEvents: false
      })
      
      clipSubscription.onMessage = (messageEvent: any) => {
        const clipData = messageEvent.message
        
        if (clipData.type === 'clip_ready' || clipData.type === 'clip_failed') {
          console.log('📹 Clip notification received:', clipData)
          
          const notification: ClipNotification = {
            id: `notif-${Date.now()}`,
            clipId: clipData.clipId,
            title: clipData.title,
            status: clipData.type === 'clip_ready' ? 'ready' : 'failed',
            timestamp: new Date().toISOString()
          }
          
          setClipNotifications(prev => [notification, ...prev.slice(0, 4)]) // Keep last 5
          
          // Update clip status if it's in our recent clips
          setRecentClips(prev => prev.map(clip => 
            clip.id === clipData.clipId 
              ? { ...clip, status: notification.status, clipUrl: clipData.clipUrl }
              : clip
          ))
          
          // Auto-dismiss notification after 5 seconds
          setTimeout(() => {
            setClipNotifications(prev => prev.filter(n => n.id !== notification.id))
          }, 5000)
        }
      }
      
      clipSubscription.subscribe()
      console.log('🎬 Listening for clip notifications...')

    } catch (error) {
      console.error('Error setting up clip notifications:', error)
    }
  }

  /**
   * Simulate live surf moments for realistic context
   */
  const simulateLiveSurfMoments = () => {
    const surfMoments = [
      { time: '3:42', moment: 'Griffin charging massive Pipeline barrel' },
      { time: '4:15', moment: 'John John setting up for critical section' },
      { time: '4:38', moment: 'Griffin executing perfect cutback sequence' },
      { time: '5:02', moment: 'Pipeline cleanup set approaching' },
      { time: '5:29', moment: 'Griffin in priority position' }
    ]

    let currentIndex = 0
    
    const updateMoment = () => {
      const moment = surfMoments[currentIndex]
      setCurrentTimestamp(moment.time)
      setSurfMoment(moment.moment)
      
      currentIndex = (currentIndex + 1) % surfMoments.length
    }

    // Update every 15 seconds for demo
    const interval = setInterval(updateMoment, 15000)
    return () => clearInterval(interval)
  }

  /**
   * Generate a new 30-second highlight clip
   */
  const generateClip = async () => {
    if (!chat || isGenerating) return

    setIsGenerating(true)

    try {
      // Create new clip entry
      const newClip: SurfClip = {
        id: `clip-${Date.now()}`,
        title: `${surfMoment} - ${currentTimestamp}`,
        surfer: surfMoment.includes('Griffin') ? 'Griffin Colapinto' : 'John John Florence',
        maneuver: surfMoment,
        location: 'Pipeline, Hawaii',
        duration: 30,
        timestamp: currentTimestamp,
        status: 'generating',
        createdAt: new Date().toISOString()
      }

      // Add to recent clips
      setRecentClips(prev => [newClip, ...prev.slice(0, 9)]) // Keep last 10

      console.log('🎬 Starting clip generation:', newClip.title)

      // Publish clip generation request to backend
      await chat.sdk.publish({
        channel: 'wsl.clip-requests',
        message: {
          type: 'generate_clip',
          clipId: newClip.id,
          title: newClip.title,
          surfer: newClip.surfer,
          timestamp: currentTimestamp,
          duration: 30,
          requestedBy: chat.currentUser.id,
          requestedAt: new Date().toISOString()
        }
      })

      // Simulate clip generation process (3-8 seconds)
      const generationTime = 3000 + Math.random() * 5000
      
      setTimeout(async () => {
        // Simulate successful generation
        const completedClip = {
          ...newClip,
          status: 'ready' as const,
          score: Math.random() > 0.3 ? +(6.5 + Math.random() * 3).toFixed(1) : undefined,
          thumbnailUrl: newClip.surfer === 'Griffin Colapinto' 
            ? '/matchstats/playericon_mbappe.png' 
            : '/matchstats/playericon_silva.png',
          clipUrl: 'https://vimeo.com/1073970603' // Demo video
        }

        setRecentClips(prev => prev.map(clip => 
          clip.id === newClip.id ? completedClip : clip
        ))

        // Send clip ready notification
        await chat.sdk.publish({
          channel: 'wsl.clip-notifications',
          message: {
            type: 'clip_ready',
            clipId: newClip.id,
            title: newClip.title,
            surfer: newClip.surfer,
            clipUrl: completedClip.clipUrl,
            thumbnailUrl: completedClip.thumbnailUrl,
            completedAt: new Date().toISOString()
          }
        })

        console.log('✅ Clip generation completed:', newClip.title)
        setIsGenerating(false)

      }, generationTime)

    } catch (error) {
      console.error('Error generating clip:', error)
      setIsGenerating(false)
    }
  }

  /**
   * Share a clip (simulate social sharing)
   */
  const shareClip = (clip: SurfClip) => {
    console.log('📤 Sharing clip:', clip.title)
    
    // Simulate sharing to social platforms
    const shareText = `🏄‍♂️ Check out this epic ${clip.surfer} moment from Pipeline! "${clip.title}" #WSL #Pipeline #Surfing`
    
    if (navigator.share) {
      navigator.share({
        title: clip.title,
        text: shareText,
        url: clip.clipUrl
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${clip.clipUrl}`)
      console.log('📋 Clip link copied to clipboard!')
    }
  }

  /**
   * Watch a clip (open clip viewer)
   */
  const watchClip = (clip: SurfClip) => {
    setSelectedClip(clip)
    console.log('▶️ Watching clip:', clip.title)
  }

  /**
   * Format time ago for clips
   */
  const timeAgo = (timestamp: string) => {
    const now = Date.now()
    const created = new Date(timestamp).getTime()
    const diffMs = now - created
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  return (
    <div className={`${className} w-full h-fit`}>
      <GuideOverlay
        id={'clipCreatorGuide'}
        guidesShown={guidesShown}
        visibleGuide={visibleGuide}
        setVisibleGuide={setVisibleGuide}
        text={
          <span>
            <span className='font-semibold'>Clip Creator</span> captures the best 
            surf moments instantly:
            <ul className='list-disc list-inside my-2'>
              <li>Generate 30-second highlight clips</li>
              <li>Real-time PubNub notifications</li>
              <li>Share epic surf moments socially</li>
              <li>Browse recent Pipeline highlights</li>
            </ul>
            Never miss the perfect wave moment again!
          </span>
        }
        xOffset={`${isMobilePreview ? 'left-[0px]' : '-left-[60px]'}`}
        yOffset={'top-[10px]'}
        flexStyle={'flex-row items-start'}
      />

      <div className='text-lg border-b pb-2 flex flex-col bg-wsl-deep-blue overflow-hidden rounded-t text-white'>
        {/* Clip Creator Header */}
        <div className='px-[16px] py-[12px] flex items-center justify-between h-[56px]'>
          <div className='flex items-center gap-3'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='20'
              viewBox='0 0 20 20'
              fill='none'
            >
              <rect x='2' y='4' width='16' height='12' rx='2' stroke='white' strokeWidth='1.5' fill='none'/>
              <circle cx='7' cy='10' r='2' fill='white'/>
              <path d='M11 8L15 10L11 12V8Z' fill='white'/>
              <rect x='6' y='2' width='8' height='1' rx='0.5' fill='white'/>
            </svg>
            <div className='text-[16px] font-[600] leading-[24px]'>
              Clip Creator
            </div>
          </div>
          
          {/* Live Status */}
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1 text-xs'>
              <svg width='8' height='8' viewBox='0 0 8 8' fill='none'>
                <circle cx='4' cy='4' r='4' fill='#EF4444' />
              </svg>
              LIVE {currentTimestamp}
            </div>
          </div>
        </div>
        
        {/* Current Moment Context */}
        <div className='px-[16px] py-[6px] bg-wsl-primary-blue text-center'>
          <div className='text-sm font-medium'>
            <span className="text-white">📹 Now:</span>
            <span className="text-wsl-light-blue mx-2">{surfMoment}</span>
          </div>
        </div>
      </div>

      {/* Clip Notifications */}
      {clipNotifications.length > 0 && (
        <div className='bg-green-50 border-b border-green-200'>
          {clipNotifications.slice(0, 2).map(notification => (
            <div key={notification.id} className='px-4 py-2 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className={`w-2 h-2 rounded-full ${notification.status === 'ready' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div className='text-sm'>
                  <span className='font-medium'>
                    {notification.status === 'ready' ? '✅ Clip Ready!' : '❌ Clip Failed'}
                  </span>
                  <span className='text-gray-600 ml-2'>{notification.title}</span>
                </div>
              </div>
              <button
                onClick={() => setClipNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className='text-gray-400 hover:text-gray-600'
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className='h-[400px] flex flex-col bg-white'>
        {/* Clip Generation Section */}
        <div className='p-4 border-b border-gray-200'>
          <button
            onClick={generateClip}
            disabled={isGenerating}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
              isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-wsl-primary-blue hover:bg-wsl-ocean-blue active:scale-95'
            }`}
          >
            {isGenerating ? (
              <div className='flex items-center justify-center gap-2'>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Generating Clip...
              </div>
            ) : (
              <div className='flex items-center justify-center gap-2'>
                <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
                  <path d='M2 2a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V2z'/>
                  <path d='M6 4l4 2-4 2V4z' fill='#2563EB'/>
                </svg>
                📹 Clip Last 30 Seconds
              </div>
            )}
          </button>
          
          <div className='text-xs text-gray-600 text-center mt-2'>
            Captures: {surfMoment}
          </div>
        </div>

        {/* Recent Clips */}
        <div className='flex-1 overflow-y-auto'>
          <div className='p-4'>
            <div className='flex items-center justify-between mb-3'>
              <h4 className='text-sm font-semibold text-gray-700'>Recent Highlights</h4>
              <button
                onClick={() => setShowClipHistory(!showClipHistory)}
                className='text-xs text-wsl-primary-blue hover:text-wsl-ocean-blue'
              >
                {showClipHistory ? 'Hide All' : 'View All'}
              </button>
            </div>

            {recentClips.length === 0 ? (
              <div className='text-center text-gray-500 py-8'>
                <svg className='w-12 h-12 mx-auto mb-2 text-gray-300' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z'/>
                </svg>
                <div className='text-sm'>No clips yet</div>
                <div className='text-xs text-gray-400'>Generate your first highlight!</div>
              </div>
            ) : (
              <div className='space-y-3'>
                {recentClips.slice(0, showClipHistory ? 10 : 3).map(clip => (
                  <div key={clip.id} className='border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow'>
                    <div className='flex items-start gap-3'>
                      {/* Thumbnail */}
                      <div className='w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative'>
                        {clip.thumbnailUrl ? (
                          <div
                            className='w-full h-full bg-cover bg-center'
                            style={{ backgroundImage: `url(${clip.thumbnailUrl})` }}
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-gray-400'>
                            <svg width='16' height='16' fill='currentColor' viewBox='0 0 20 20'>
                              <path d='M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z'/>
                            </svg>
                          </div>
                        )}
                        
                        {/* Status overlay */}
                        {clip.status === 'generating' && (
                          <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                            <div className='w-3 h-3 border border-white border-t-transparent rounded-full animate-spin' />
                          </div>
                        )}
                        
                        {/* Duration */}
                        <div className='absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded'>
                          {clip.duration}s
                        </div>
                      </div>

                      {/* Clip Info */}
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm font-medium text-gray-900 truncate'>
                          {clip.title}
                        </div>
                        <div className='text-xs text-gray-600 flex items-center gap-2 mt-1'>
                          <span>{clip.surfer}</span>
                          {clip.score && (
                            <>
                              <span>•</span>
                              <span className='font-medium text-wsl-primary-blue'>{clip.score}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{timeAgo(clip.createdAt)}</span>
                        </div>
                        <div className='text-xs text-gray-500 mt-1 truncate'>
                          {clip.maneuver}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='flex gap-1'>
                        {clip.status === 'ready' && (
                          <>
                            <button
                              onClick={() => watchClip(clip)}
                              className='p-1 text-wsl-primary-blue hover:bg-wsl-light-blue rounded'
                              title='Watch clip'
                            >
                              <svg width='14' height='14' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z' clipRule='evenodd'/>
                              </svg>
                            </button>
                            <button
                              onClick={() => shareClip(clip)}
                              className='p-1 text-gray-500 hover:bg-gray-100 rounded'
                              title='Share clip'
                            >
                              <svg width='14' height='14' fill='currentColor' viewBox='0 0 20 20'>
                                <path d='M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z'/>
                              </svg>
                            </button>
                          </>
                        )}
                        {clip.status === 'generating' && (
                          <div className='text-xs text-blue-600 px-2 py-1'>
                            Processing...
                          </div>
                        )}
                        {clip.status === 'failed' && (
                          <div className='text-xs text-red-600 px-2 py-1'>
                            Failed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clip Viewer Modal */}
      {selectedClip && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg w-96 max-w-[90vw] max-h-[80vh] overflow-hidden'>
            <div className='p-4 border-b border-gray-200 flex items-center justify-between'>
              <h3 className='font-semibold text-gray-900'>Clip Preview</h3>
              <button
                onClick={() => setSelectedClip(null)}
                className='text-gray-400 hover:text-gray-600'
              >
                ✕
              </button>
            </div>
            
            <div className='p-4'>
              <div className='aspect-video bg-gray-900 rounded mb-4 flex items-center justify-center text-white'>
                <div className='text-center'>
                  <svg className='w-12 h-12 mx-auto mb-2' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z' clipRule='evenodd'/>
                  </svg>
                  <div className='text-sm'>Click to play</div>
                  <div className='text-xs text-gray-400'>{selectedClip.title}</div>
                </div>
              </div>
              
              <div className='space-y-2 text-sm'>
                <div><span className='font-medium'>Surfer:</span> {selectedClip.surfer}</div>
                {selectedClip.score && (
                  <div><span className='font-medium'>Score:</span> {selectedClip.score}</div>
                )}
                <div><span className='font-medium'>Maneuver:</span> {selectedClip.maneuver}</div>
                <div><span className='font-medium'>Time:</span> {selectedClip.timestamp}</div>
                <div><span className='font-medium'>Duration:</span> {selectedClip.duration} seconds</div>
              </div>
              
              <div className='flex gap-3 mt-4'>
                <button
                  onClick={() => shareClip(selectedClip)}
                  className='flex-1 py-2 bg-wsl-primary-blue text-white rounded hover:bg-wsl-ocean-blue'
                >
                  📤 Share
                </button>
                <button
                  onClick={() => setSelectedClip(null)}
                  className='flex-1 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
