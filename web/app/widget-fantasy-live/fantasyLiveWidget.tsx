'use client'

import { useState, useEffect, useRef } from 'react'
import GuideOverlay from '../components/guideOverlay'
import { fantasyLiveChannelId, multiplierTriggersChannelId, pointWagersChannelId } from '../data/constants'

export default function FantasyLiveWidget ({
  className,
  isMobilePreview,
  chat,
  isGuidedDemo,
  guidesShown,
  visibleGuide,
  setVisibleGuide
}) {
  const [fantasyData, setFantasyData] = useState(defaultFantasyData)
  const [animatingScore, setAnimatingScore] = useState(false)
  const [positionChange, setPositionChange] = useState(null)
  const [multiplierPeriod, setMultiplierPeriod] = useState(null) // Backend-triggered multiplier periods
  const [pointWagers, setPointWagers] = useState([]) // Active point wagers
  const [availableMultipliers, setAvailableMultipliers] = useState([]) // Available surfers for 2x
  const [showWagerModal, setShowWagerModal] = useState(false)
  const [selectedWager, setSelectedWager] = useState(null)
  const animationRef = useRef(null)

  useEffect(() => {
    if (!chat) return
    
    // Main fantasy updates
    const channel = chat.sdk.channel(fantasyLiveChannelId)
    const subscription = channel.subscription({ receivePresenceEvents: false })
    subscription.onMessage = messageEvent => {
      processFantasyUpdate(messageEvent.message)
    }
    subscription.subscribe()
    
    // Multiplier period triggers
    const multiplierChannel = chat.sdk.channel(multiplierTriggersChannelId)
    const multiplierSubscription = multiplierChannel.subscription({ receivePresenceEvents: false })
    multiplierSubscription.onMessage = messageEvent => {
      processMultiplierTrigger(messageEvent.message)
    }
    multiplierSubscription.subscribe()
    
    // Point wager updates  
    const wagerChannel = chat.sdk.channel(pointWagersChannelId)
    const wagerSubscription = wagerChannel.subscription({ receivePresenceEvents: false })
    wagerSubscription.onMessage = messageEvent => {
      processWagerUpdate(messageEvent.message)
    }
    wagerSubscription.subscribe()
    
    return () => {
      subscription.unsubscribe()
      multiplierSubscription.unsubscribe()
      wagerSubscription.unsubscribe()
    }
  }, [chat])

  useEffect(() => {
    if (!chat) return
    if (isGuidedDemo) return
    chat.sdk
      .fetchMessages({
        channels: [fantasyLiveChannelId],
        count: 1
      })
      .then(result => {
        if (result && result.channels[fantasyLiveChannelId]) {
          const previousFantasyData = result.channels[fantasyLiveChannelId][0]
          if (previousFantasyData) {
            processFantasyUpdate(previousFantasyData.message)
          }
        }
      })
  }, [chat, isGuidedDemo])

  function processFantasyUpdate(update) {
    if (update.type === 'powerSurferScore') {
      // Griffin scores - apply 2x multiplier and animate
      const oldPosition = fantasyData.userPosition
      let multiplier = 2 // Base Power Surfer multiplier
      
      // Check if there's an active multiplier period for additional bonus
      if (multiplierPeriod && multiplierPeriod.active && multiplierPeriod.surferId === update.surferId) {
        multiplier = multiplierPeriod.multiplier || 2
      }
      
      const newScore = update.originalScore * multiplier
      
      setAnimatingScore(true)
      
      setTimeout(() => {
        setFantasyData(prev => ({
          ...prev,
          userTotalScore: prev.userTotalScore + newScore,
          userPosition: update.newPosition,
          powerSurferScore: newScore,
          lastWaveScore: update.originalScore
        }))
        
        if (update.newPosition < oldPosition) {
          setPositionChange({
            from: oldPosition,
            to: update.newPosition,
            points: newScore
          })
          
          setTimeout(() => setPositionChange(null), 3000)
        }
        
        setAnimatingScore(false)
      }, 1000)
    } else if (update.type === 'leaderboardUpdate') {
      setFantasyData(prev => ({
        ...prev,
        leaderboard: update.leaderboard
      }))
    } else if (update.type === 'rivalUpdate') {
      setFantasyData(prev => ({
        ...prev,
        rivalScore: update.rivalScore
      }))
    }
  }
  
  function processMultiplierTrigger(message) {
    if (message.type === 'multiplierPeriodStart') {
      setMultiplierPeriod({
        active: true,
        surferId: message.surferId,
        surferName: message.surferName,
        multiplier: message.multiplier || 2,
        duration: message.duration || 30, // seconds
        reason: message.reason || 'Big wave opportunity!'
      })
      
      // Set available multipliers for wagering
      setAvailableMultipliers(message.availableMultipliers || [])
      
      // Auto-close after duration
      setTimeout(() => {
        setMultiplierPeriod(prev => prev ? { ...prev, active: false } : null)
      }, (message.duration || 30) * 1000)
      
    } else if (message.type === 'multiplierPeriodEnd') {
      setMultiplierPeriod(prev => prev ? { ...prev, active: false } : null)
      setAvailableMultipliers([])
    }
  }
  
  function processWagerUpdate(message) {
    if (message.type === 'wagerResult') {
      // Update point wagers with results
      setPointWagers(prev => prev.map(wager => 
        wager.id === message.wagerId 
          ? { ...wager, result: message.result, payout: message.payout }
          : wager
      ))
      
      // Update user's total score if they won
      if (message.result === 'win' && message.userId === chat?.currentUser?.id) {
        setFantasyData(prev => ({
          ...prev,
          userTotalScore: prev.userTotalScore + message.payout
        }))
      }
    } else if (message.type === 'wagerUpdate') {
      setPointWagers(prev => {
        const existingIndex = prev.findIndex(w => w.id === message.wager.id)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = message.wager
          return updated
        }
        return [...prev, message.wager]
      })
    }
  }
  
  function placePointWager(surferId, surferName, pointsWagered, multiplier) {
    if (!chat || pointsWagered > fantasyData.userTotalScore) return
    
    const wager = {
      id: `wager-${Date.now()}`,
      userId: chat.currentUser.id,
      surferId,
      surferName,
      pointsWagered,
      multiplier,
      timestamp: Date.now(),
      status: 'active'
    }
    
    // Optimistically add wager
    setPointWagers(prev => [...prev, wager])
    
    // Deduct wagered points immediately
    setFantasyData(prev => ({
      ...prev,
      userTotalScore: prev.userTotalScore - pointsWagered
    }))
    
    // Publish wager to backend
    chat.sdk.publish({
      channel: pointWagersChannelId,
      message: {
        type: 'newWager',
        wager
      }
    })
    
    setShowWagerModal(false)
    setSelectedWager(null)
  }

  return (
    <div className={`${className}`}>
      <GuideOverlay
        id={'fantasyLive'}
        guidesShown={guidesShown}
        visibleGuide={visibleGuide}
        setVisibleGuide={setVisibleGuide}
        text={
          <span>
            <span className='font-semibold'>PubNub Signals</span> enable ultra-fast,
            lightweight messaging for real-time fantasy scoring updates. Perfect for
            <span className='font-semibold'> live competitions, multipliers, and instant leaderboard changes</span>.
          </span>
        }
        xOffset={`right-[50px]`}
        yOffset={'top-[10px]'}
        flexStyle={'flex-row items-start'}
      />

      <div className='bg-gradient-to-br from-wsl-blue-50 to-wsl-blue-100 p-4 rounded-lg'>
        {/* Fantasy Header */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-wsl-primary rounded-full animate-pulse'></div>
            <h3 className='text-lg font-bold text-wsl-dark'>Fantasy Live</h3>
          </div>
          <div className='text-xs font-medium text-wsl-blue-600 bg-white px-2 py-1 rounded-full'>
            Pipeline Masters
          </div>
        </div>

        {/* Active Multiplier Period Alert */}
        {multiplierPeriod && multiplierPeriod.active && (
          <MultiplierPeriodAlert 
            multiplierPeriod={multiplierPeriod}
            availableMultipliers={availableMultipliers}
            onWager={(surferId, surferName) => {
              setSelectedWager({ surferId, surferName })
              setShowWagerModal(true)
            }}
          />
        )}

        {/* Power Surfer Section */}
        <PowerSurferCard 
          fantasyData={fantasyData}
          animatingScore={animatingScore}
          positionChange={positionChange}
          multiplierPeriod={multiplierPeriod}
        />

        {/* Point Wagers Section */}
        {pointWagers.length > 0 && (
          <ActiveWagersCard 
            wagers={pointWagers}
            isMobilePreview={isMobilePreview}
          />
        )}

        {/* Head-to-Head vs WaveWizard */}
        <HeadToHeadCard fantasyData={fantasyData} />

        {/* Mini Leaderboard */}
        <MiniLeaderboard 
          fantasyData={fantasyData}
          isMobilePreview={isMobilePreview}
        />
        
        {/* Point Wager Modal */}
        {showWagerModal && selectedWager && (
          <PointWagerModal
            wager={selectedWager}
            userPoints={fantasyData.userTotalScore}
            onWager={placePointWager}
            onClose={() => {
              setShowWagerModal(false)
              setSelectedWager(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

function PowerSurferCard({ fantasyData, animatingScore, positionChange, multiplierPeriod }) {
  return (
    <div className='bg-white rounded-lg p-4 mb-4 border-2 border-wsl-accent shadow-sm'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <div className={`w-8 h-8 bg-gradient-to-r from-wsl-accent to-wsl-warning rounded-full flex items-center justify-center ${
            multiplierPeriod && multiplierPeriod.active ? 'animate-pulse' : ''
          }`}>
            <span className='text-white text-sm font-bold'>
              {multiplierPeriod && multiplierPeriod.active && multiplierPeriod.surferId === 'griffin-colapinto' 
                ? `${multiplierPeriod.multiplier}×` 
                : '2×'
              }
            </span>
          </div>
          <div>
            <h4 className='font-bold text-wsl-dark'>Power Surfer</h4>
            <p className='text-xs text-wsl-blue-600'>Griffin Colapinto</p>
          </div>
        </div>
        <div className='text-right'>
          <div className='text-xl font-bold text-wsl-primary'>
            {animatingScore ? (
              <span className='animate-pulse text-wsl-accent'>+{fantasyData.powerSurferScore}</span>
            ) : (
              `${fantasyData.userTotalScore}pts`
            )}
          </div>
          <div className='text-xs text-wsl-blue-600'>
            Last wave: {fantasyData.lastWaveScore} → {fantasyData.powerSurferScore}
          </div>
        </div>
      </div>
      
      {positionChange && (
        <div className='bg-wsl-success-light text-wsl-success p-2 rounded-md text-sm font-medium animate-bounce'>
          🏄‍♂️ Moved from #{positionChange.from} to #{positionChange.to}! (+{positionChange.points} pts)
        </div>
      )}
    </div>
  )
}

function HeadToHeadCard({ fantasyData }) {
  const scoreDiff = fantasyData.userTotalScore - fantasyData.rivalScore
  const isWinning = scoreDiff > 0

  return (
    <div className='bg-white rounded-lg p-4 mb-4 border border-wsl-blue-200 shadow-sm'>
      <div className='flex items-center justify-between mb-2'>
        <h4 className='font-bold text-wsl-dark text-sm'>Head-to-Head</h4>
        <div className='text-xs text-wsl-blue-600'>vs WaveWizard</div>
      </div>
      
      <div className='flex items-center justify-between'>
        <div className='text-center'>
          <div className='text-lg font-bold text-wsl-primary'>
            {fantasyData.userTotalScore}
          </div>
          <div className='text-xs text-wsl-blue-600'>You</div>
        </div>
        
        <div className='flex flex-col items-center'>
          <div className={`text-sm font-medium ${isWinning ? 'text-wsl-success' : 'text-wsl-warning'}`}>
            {isWinning ? `+${scoreDiff}` : scoreDiff}
          </div>
          <div className='text-xs text-wsl-blue-600'>difference</div>
        </div>
        
        <div className='text-center'>
          <div className='text-lg font-bold text-wsl-blue-600'>
            {fantasyData.rivalScore}
          </div>
          <div className='text-xs text-wsl-blue-600'>WaveWizard</div>
        </div>
      </div>
    </div>
  )
}

function MiniLeaderboard({ fantasyData, isMobilePreview }) {
  const displayCount = isMobilePreview ? 5 : 8
  const nearbyPositions = fantasyData.leaderboard
    .slice(Math.max(0, fantasyData.userPosition - 3), fantasyData.userPosition + 2)
    .slice(0, displayCount)

  return (
    <div className='bg-white rounded-lg p-4 border border-wsl-blue-200 shadow-sm'>
      <h4 className='font-bold text-wsl-dark text-sm mb-3'>Live Leaderboard</h4>
      
      <div className='space-y-2'>
        {nearbyPositions.map((entry, index) => (
          <div 
            key={entry.position}
            className={`flex items-center justify-between p-2 rounded-md transition-all ${
              entry.position === fantasyData.userPosition 
                ? 'bg-wsl-blue-50 border border-wsl-primary' 
                : 'bg-wsl-blue-25'
            }`}
          >
            <div className='flex items-center gap-2'>
              <span className={`text-sm font-bold w-6 ${
                entry.position === fantasyData.userPosition 
                  ? 'text-wsl-primary' 
                  : 'text-wsl-blue-600'
              }`}>
                #{entry.position}
              </span>
              <span className={`text-sm ${
                entry.position === fantasyData.userPosition 
                  ? 'font-bold text-wsl-dark' 
                  : 'text-wsl-blue-700'
              }`}>
                {entry.name}
              </span>
              {entry.position === fantasyData.userPosition && (
                <span className='text-xs bg-wsl-accent text-white px-2 py-0.5 rounded-full'>YOU</span>
              )}
            </div>
            <span className='text-sm font-medium text-wsl-blue-700'>
              {entry.score}pts
            </span>
          </div>
        ))}
      </div>
      
      <div className='mt-3 pt-3 border-t border-wsl-blue-200 text-center'>
        <span className='text-xs text-wsl-blue-600'>
          Real-time updates via PubNub • {fantasyData.leaderboard.length} surfers competing
        </span>
      </div>
    </div>
  )
}

// Default fantasy data
const defaultFantasyData = {
  userPosition: 15,
  userTotalScore: 23.4,
  powerSurferScore: 0,
  lastWaveScore: 0,
  rivalScore: 82.6,
  leaderboard: [
    { position: 1, name: "SurfKing2024", score: 87.3 },
    { position: 2, name: "PipelinePro", score: 84.1 },
    { position: 3, name: "WaveWizard", score: 82.6 },
    { position: 4, name: "BarrelRider", score: 78.9 },
    { position: 5, name: "TubeTime", score: 76.2 },
    { position: 6, name: "AirMaster", score: 74.1 },
    { position: 7, name: "WaveWarrior", score: 71.8 },
    { position: 8, name: "SurfSage", score: 68.5 },
    { position: 9, name: "PipeGuru", score: 65.3 },
    { position: 10, name: "WaveHunter", score: 62.7 },
    { position: 11, name: "SurfPhenom", score: 58.9 },
    { position: 12, name: "TideRider", score: 55.4 },
    { position: 13, name: "BreakMaster", score: 51.2 },
    { position: 14, name: "WaveDancer", score: 47.8 },
    { position: 15, name: "You", score: 23.4 },
    { position: 16, name: "SurfNewbie", score: 19.6 },
    { position: 17, name: "RookiePaddle", score: 16.3 },
    { position: 18, name: "LearningToSurf", score: 12.1 },
    { position: 19, name: "BeachBoy22", score: 8.7 },
    { position: 20, name: "FirstTimer", score: 5.2 }
  ]
}

// New Phase 2 Components

function MultiplierPeriodAlert({ multiplierPeriod, availableMultipliers, onWager }) {
  const [countdown, setCountdown] = useState(multiplierPeriod.duration || 30)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1))
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className='bg-gradient-to-r from-wsl-warning to-wsl-accent p-4 rounded-lg mb-4 border-2 border-wsl-warning animate-pulse'>
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <span className='text-2xl'>⚡</span>
          <div>
            <h4 className='font-bold text-white'>{multiplierPeriod.multiplier}× MULTIPLIER ACTIVE!</h4>
            <p className='text-white text-sm opacity-90'>{multiplierPeriod.reason}</p>
          </div>
        </div>
        <div className='text-right'>
          <div className='text-2xl font-bold text-white'>{countdown}s</div>
          <div className='text-xs text-white opacity-90'>remaining</div>
        </div>
      </div>
      
      {availableMultipliers.length > 0 && (
        <div className='mt-3'>
          <p className='text-white text-sm font-medium mb-2'>Wager points on these surfers:</p>
          <div className='flex gap-2 flex-wrap'>
            {availableMultipliers.map(surfer => (
              <button
                key={surfer.id}
                onClick={() => onWager(surfer.id, surfer.name)}
                className='bg-white text-wsl-accent px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-all'
              >
                {surfer.name} {surfer.multiplier}×
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ActiveWagersCard({ wagers, isMobilePreview }) {
  const activeWagers = wagers.filter(w => w.status === 'active')
  const displayCount = isMobilePreview ? 2 : 4
  
  if (activeWagers.length === 0) return null
  
  return (
    <div className='bg-white rounded-lg p-4 mb-4 border border-wsl-blue-200'>
      <div className='flex items-center justify-between mb-3'>
        <h4 className='font-bold text-wsl-dark'>Active Point Wagers</h4>
        <span className='text-xs bg-wsl-accent text-white px-2 py-1 rounded-full'>
          {activeWagers.length}
        </span>
      </div>
      
      <div className='space-y-2'>
        {activeWagers.slice(0, displayCount).map(wager => (
          <div key={wager.id} className='flex items-center justify-between p-2 bg-wsl-blue-50 rounded-md'>
            <div>
              <div className='font-medium text-wsl-dark text-sm'>{wager.surferName}</div>
              <div className='text-xs text-wsl-blue-600'>
                {wager.pointsWagered} pts @ {wager.multiplier}× multiplier
              </div>
            </div>
            <div className='text-right'>
              {wager.result ? (
                <div className={`font-bold text-sm ${
                  wager.result === 'win' ? 'text-wsl-success' : 'text-wsl-warning'
                }`}>
                  {wager.result === 'win' ? `+${wager.payout}` : 'Lost'}
                </div>
              ) : (
                <div className='text-wsl-accent text-sm font-bold animate-pulse'>
                  Pending
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PointWagerModal({ wager, userPoints, onWager, onClose }) {
  const [wagerAmount, setWagerAmount] = useState(10)
  const [selectedMultiplier, setSelectedMultiplier] = useState(2)
  
  const maxWager = Math.floor(userPoints * 0.5) // Max 50% of points
  const potentialWin = wagerAmount * selectedMultiplier
  
  const multiplierOptions = [
    { value: 1.5, label: '1.5× (Safe)', risk: 'Low' },
    { value: 2, label: '2× (Balanced)', risk: 'Medium' }, 
    { value: 3, label: '3× (Risky)', risk: 'High' },
    { value: 5, label: '5× (EXTREME)', risk: 'Extreme' }
  ]
  
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg p-6 max-w-sm w-full'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-bold text-wsl-dark text-lg'>Point Wager</h3>
          <button onClick={onClose} className='text-wsl-blue-600 hover:text-wsl-dark'>
            ✕
          </button>
        </div>
        
        <div className='mb-4'>
          <div className='text-center p-3 bg-wsl-blue-50 rounded-lg mb-4'>
            <div className='font-bold text-wsl-dark'>{wager.surferName}</div>
            <div className='text-sm text-wsl-blue-600'>Place wager on next wave</div>
          </div>
          
          <div className='mb-4'>
            <label className='block text-sm font-medium text-wsl-dark mb-2'>
              Wager Amount: {wagerAmount} points
            </label>
            <input
              type='range'
              min={5}
              max={maxWager}
              value={wagerAmount}
              onChange={(e) => setWagerAmount(parseInt(e.target.value))}
              className='w-full'
            />
            <div className='flex justify-between text-xs text-wsl-blue-600 mt-1'>
              <span>5 pts</span>
              <span>{maxWager} pts (max)</span>
            </div>
          </div>
          
          <div className='mb-4'>
            <label className='block text-sm font-medium text-wsl-dark mb-2'>
              Multiplier
            </label>
            <div className='space-y-2'>
              {multiplierOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMultiplier(option.value)}
                  className={`w-full p-2 rounded-lg text-left border transition-all ${
                    selectedMultiplier === option.value
                      ? 'border-wsl-primary bg-wsl-blue-50'
                      : 'border-wsl-blue-200 hover:border-wsl-primary'
                  }`}
                >
                  <div className='flex justify-between items-center'>
                    <span className='font-medium text-wsl-dark'>{option.label}</span>
                    <span className='text-xs text-wsl-blue-600'>{option.risk} Risk</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className='bg-wsl-blue-50 p-3 rounded-lg mb-4'>
            <div className='flex justify-between text-sm'>
              <span className='text-wsl-blue-600'>Risk:</span>
              <span className='font-medium text-wsl-dark'>{wagerAmount} points</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-wsl-blue-600'>Potential win:</span>
              <span className='font-bold text-wsl-success'>+{potentialWin} points</span>
            </div>
          </div>
        </div>
        
        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 px-4 py-2 border border-wsl-blue-200 text-wsl-blue-600 rounded-lg hover:bg-wsl-blue-50 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={() => onWager(wager.surferId, wager.surferName, wagerAmount, selectedMultiplier)}
            disabled={wagerAmount > userPoints}
            className='flex-1 px-4 py-2 bg-wsl-primary text-white rounded-lg hover:bg-wsl-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Place Wager
          </button>
        </div>
      </div>
    </div>
  )
}
