'use client'

import { useState, useEffect, useRef } from 'react'
import GuideOverlay from '../components/guideOverlay'
import { surferOddsChannelId, surfConditionsChannelId, betOddsASDChannelId } from '../data/constants'

interface SurferOdds {
  surferId: string;
  name: string;
  avatar: string;
  winRate: number;
  conditionRating: 'excellent' | 'good' | 'fair' | 'poor';
  difficultyRating: 'easy' | 'medium' | 'hard' | 'extreme';
  pastPerformance: number; // 0-100 rating at this location
  currentForm: 'hot' | 'warm' | 'cold';
  betOdds: string; // e.g., "+150", "-200"
  trend: 'up' | 'down' | 'stable';
}

interface SurfConditions {
  waveHeight: string;
  waveQuality: number; // 1-10 scale
  windDirection: string;
  windSpeed: string;
  tide: string;
  waterTemp: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert-only';
  location: string;
}

export default function SurferOddsWidget ({
  className,
  isMobilePreview,
  chat,
  isGuidedDemo,
  guidesShown,
  visibleGuide,
  setVisibleGuide
}) {
  const [surferOdds, setSurferOdds] = useState<SurferOdds[]>(defaultSurferOdds)
  const [surfConditions, setSurfConditions] = useState<SurfConditions>(defaultSurfConditions)
  const [selectedView, setSelectedView] = useState<'odds' | 'conditions' | 'analysis'>('odds')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  
  useEffect(() => {
    if (!chat) return
    
    // Subscribe to surfer odds updates
    const oddsChannel = chat.sdk.channel(surferOddsChannelId)
    const oddsSubscription = oddsChannel.subscription({ receivePresenceEvents: false })
    oddsSubscription.onMessage = messageEvent => {
      if (messageEvent.message.type === 'oddsUpdate') {
        processSurferOddsUpdate(messageEvent.message.data)
      }
    }
    oddsSubscription.subscribe()
    
    // Subscribe to surf conditions updates
    const conditionsChannel = chat.sdk.channel(surfConditionsChannelId)
    const conditionsSubscription = conditionsChannel.subscription({ receivePresenceEvents: false })
    conditionsSubscription.onMessage = messageEvent => {
      if (messageEvent.message.type === 'conditionsUpdate') {
        setSurfConditions(messageEvent.message.data)
        setLastUpdate(new Date())
      }
    }
    conditionsSubscription.subscribe()
    
    // Subscribe to ASD betting odds
    const asdChannel = chat.sdk.channel(betOddsASDChannelId)
    const asdSubscription = asdChannel.subscription({ receivePresenceEvents: false })
    asdSubscription.onMessage = messageEvent => {
      if (messageEvent.message.type === 'asdOddsUpdate') {
        updateBettingOdds(messageEvent.message.data)
      }
    }
    asdSubscription.subscribe()
    
    return () => {
      oddsSubscription.unsubscribe()
      conditionsSubscription.unsubscribe()
      asdSubscription.unsubscribe()
    }
  }, [chat])
  
  useEffect(() => {
    if (!chat) return
    if (isGuidedDemo) return
    
    // Fetch latest odds and conditions on mount
    Promise.all([
      chat.sdk.fetchMessages({
        channels: [surferOddsChannelId],
        count: 1
      }),
      chat.sdk.fetchMessages({
        channels: [surfConditionsChannelId], 
        count: 1
      })
    ]).then(([oddsResult, conditionsResult]) => {
      if (oddsResult?.channels[surferOddsChannelId]?.[0]) {
        const latestOdds = oddsResult.channels[surferOddsChannelId][0].message
        if (latestOdds.type === 'oddsUpdate') {
          processSurferOddsUpdate(latestOdds.data)
        }
      }
      
      if (conditionsResult?.channels[surfConditionsChannelId]?.[0]) {
        const latestConditions = conditionsResult.channels[surfConditionsChannelId][0].message
        if (latestConditions.type === 'conditionsUpdate') {
          setSurfConditions(latestConditions.data)
        }
      }
    })
  }, [chat, isGuidedDemo])
  
  function processSurferOddsUpdate(oddsData: Partial<SurferOdds>[]) {
    setSurferOdds(prev => {
      return prev.map(surfer => {
        const update = oddsData.find(o => o.surferId === surfer.surferId)
        return update ? { ...surfer, ...update } : surfer
      })
    })
    setLastUpdate(new Date())
  }
  
  function updateBettingOdds(asdData: Array<{surferId: string, betOdds: string, trend: 'up' | 'down' | 'stable'}>) {
    setSurferOdds(prev => {
      return prev.map(surfer => {
        const asdUpdate = asdData.find(a => a.surferId === surfer.surferId)
        return asdUpdate ? { ...surfer, betOdds: asdUpdate.betOdds, trend: asdUpdate.trend } : surfer
      })
    })
  }
  
  const sortedOdds = [...surferOdds].sort((a, b) => b.winRate - a.winRate)

  return (
    <div className={`${className}`}>
      <GuideOverlay
        id={'surferOddsGuide'}
        guidesShown={guidesShown}
        visibleGuide={visibleGuide}
        setVisibleGuide={setVisibleGuide}
        text={
          <span>
            <span className='font-semibold'>Real-time surfer odds</span> combine surf conditions,
            past performance, and current form via <span className='font-semibold'>PubNub Signals</span>.
            <span className='font-semibold'> Live betting data</span> integrates ASD (Alt Sports Data)
            market odds for comprehensive analysis.
          </span>
        }
        xOffset={`right-[50px]`}
        yOffset={'top-[10px]'}
        flexStyle={'flex-row items-start'}
      />

      <div className='bg-gradient-to-br from-wsl-blue-50 to-wsl-blue-100 p-4 rounded-lg'>
        {/* Header with view toggle */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-wsl-accent rounded-full animate-pulse'></div>
            <h3 className='text-lg font-bold text-wsl-dark'>Surfer Odds</h3>
          </div>
          <div className='text-xs font-medium text-wsl-blue-600 bg-white px-2 py-1 rounded-full'>
            Pipeline Masters
          </div>
        </div>
        
        {/* View Toggle */}
        <div className='flex mb-4 bg-white rounded-lg p-1'>
          {(['odds', 'conditions', 'analysis'] as const).map(view => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 transition-all ${
                selectedView === view
                  ? 'bg-wsl-primary text-white'
                  : 'text-wsl-blue-600 hover:bg-wsl-blue-50'
              }`}
            >
              {view === 'odds' ? '🎯 Odds' : view === 'conditions' ? '🌊 Conditions' : '📊 Analysis'}
            </button>
          ))}
        </div>

        {/* Content based on selected view */}
        {selectedView === 'odds' && (
          <SurferOddsView 
            surferOdds={sortedOdds}
            lastUpdate={lastUpdate}
            isMobilePreview={isMobilePreview}
          />
        )}
        
        {selectedView === 'conditions' && (
          <SurfConditionsView 
            conditions={surfConditions}
            lastUpdate={lastUpdate}
          />
        )}
        
        {selectedView === 'analysis' && (
          <OddsAnalysisView 
            surferOdds={sortedOdds}
            conditions={surfConditions}
            isMobilePreview={isMobilePreview}
          />
        )}
      </div>
    </div>
  )
}

function SurferOddsView({ surferOdds, lastUpdate, isMobilePreview }) {
  const displayCount = isMobilePreview ? 4 : 6
  
  return (
    <div className='space-y-3'>
      {surferOdds.slice(0, displayCount).map((surfer, index) => (
        <div key={surfer.surferId} className='bg-white rounded-lg p-3 border border-wsl-blue-200'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='relative'>
                <img 
                  src={surfer.avatar} 
                  alt={surfer.name}
                  className='w-10 h-10 rounded-full object-cover'
                />
                {index === 0 && (
                  <div className='absolute -top-1 -right-1 w-5 h-5 bg-wsl-warning rounded-full flex items-center justify-center'>
                    <span className='text-white text-xs font-bold'>👑</span>
                  </div>
                )}
              </div>
              <div>
                <h4 className='font-bold text-wsl-dark'>{surfer.name}</h4>
                <div className='flex items-center gap-2 text-xs'>
                  <FormIndicator form={surfer.currentForm} />
                  <PerformanceIndicator rating={surfer.pastPerformance} />
                </div>
              </div>
            </div>
            
            <div className='text-right'>
              <div className='flex items-center gap-2'>
                <div className='text-xl font-bold text-wsl-primary'>
                  {surfer.winRate}%
                </div>
                <TrendIndicator trend={surfer.trend} />
              </div>
              <div className='text-xs text-wsl-blue-600'>
                ASD: <span className='font-mono font-bold'>{surfer.betOdds}</span>
              </div>
            </div>
          </div>
          
          {/* Condition ratings bar */}
          <div className='mt-3 flex items-center justify-between text-xs'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-1'>
                <span className='text-wsl-blue-600'>Conditions:</span>
                <ConditionBadge rating={surfer.conditionRating} />
              </div>
              <div className='flex items-center gap-1'>
                <span className='text-wsl-blue-600'>Difficulty:</span>
                <DifficultyBadge rating={surfer.difficultyRating} />
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className='text-center text-xs text-wsl-blue-600 mt-3'>
        Last updated: {lastUpdate.toLocaleTimeString()} • Live ASD data
      </div>
    </div>
  )
}

function SurfConditionsView({ conditions, lastUpdate }) {
  return (
    <div className='bg-white rounded-lg p-4'>
      <div className='grid grid-cols-2 gap-4 mb-4'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-wsl-primary'>{conditions.waveHeight}</div>
          <div className='text-sm text-wsl-blue-600'>Wave Height</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-wsl-accent'>{conditions.waveQuality}/10</div>
          <div className='text-sm text-wsl-blue-600'>Quality</div>
        </div>
        <div className='text-center'>
          <div className='text-lg font-bold text-wsl-dark'>{conditions.windSpeed}</div>
          <div className='text-sm text-wsl-blue-600'>{conditions.windDirection} Wind</div>
        </div>
        <div className='text-center'>
          <div className='text-lg font-bold text-wsl-dark'>{conditions.tide}</div>
          <div className='text-sm text-wsl-blue-600'>Tide</div>
        </div>
      </div>
      
      <div className='border-t border-wsl-blue-200 pt-3'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-medium text-wsl-dark'>Difficulty Level:</span>
          <DifficultyBadge rating={conditions.difficulty} />
        </div>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-medium text-wsl-dark'>Water Temperature:</span>
          <span className='text-sm font-bold text-wsl-primary'>{conditions.waterTemp}</span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium text-wsl-dark'>Location:</span>
          <span className='text-sm font-bold text-wsl-accent'>{conditions.location}</span>
        </div>
      </div>
      
      <div className='text-center text-xs text-wsl-blue-600 mt-4'>
        Conditions updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  )
}

function OddsAnalysisView({ surferOdds, conditions, isMobilePreview }) {
  const favorites = surferOdds.slice(0, 3)
  const underdogs = surferOdds.slice(-2)
  const hotStreaks = surferOdds.filter(s => s.currentForm === 'hot')
  
  return (
    <div className='space-y-4'>
      {/* Quick Stats */}
      <div className='grid grid-cols-3 gap-2 mb-4'>
        <div className='bg-white rounded-lg p-3 text-center'>
          <div className='text-lg font-bold text-wsl-success'>{favorites.length}</div>
          <div className='text-xs text-wsl-blue-600'>Favorites</div>
        </div>
        <div className='bg-white rounded-lg p-3 text-center'>
          <div className='text-lg font-bold text-wsl-warning'>{hotStreaks.length}</div>
          <div className='text-xs text-wsl-blue-600'>Hot Form</div>
        </div>
        <div className='bg-white rounded-lg p-3 text-center'>
          <div className='text-lg font-bold text-wsl-accent'>{conditions.waveQuality}/10</div>
          <div className='text-xs text-wsl-blue-600'>Wave Quality</div>
        </div>
      </div>
      
      {/* Key Insights */}
      <div className='bg-white rounded-lg p-4'>
        <h4 className='font-bold text-wsl-dark mb-3'>📊 Key Insights</h4>
        <div className='space-y-2 text-sm'>
          <div className='flex items-center gap-2'>
            <span className='text-lg'>🏆</span>
            <span className='text-wsl-dark'>
              <strong>{favorites[0]?.name}</strong> leads with {favorites[0]?.winRate}% win rate
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-lg'>🔥</span>
            <span className='text-wsl-dark'>
              {hotStreaks.length} surfer{hotStreaks.length !== 1 ? 's' : ''} in hot form
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-lg'>🌊</span>
            <span className='text-wsl-dark'>
              Conditions favor <strong>{conditions.difficulty}</strong> level surfers
            </span>
          </div>
          {underdogs.length > 0 && (
            <div className='flex items-center gap-2'>
              <span className='text-lg'>💎</span>
              <span className='text-wsl-dark'>
                Value pick: <strong>{underdogs[0]?.name}</strong> ({underdogs[0]?.betOdds})
              </span>
            </div>
          )}
        </div>
      </div>
      
      {!isMobilePreview && (
        <div className='bg-white rounded-lg p-4'>
          <h4 className='font-bold text-wsl-dark mb-3'>⚡ Market Movement</h4>
          <div className='space-y-2'>
            {surferOdds.filter(s => s.trend !== 'stable').slice(0, 3).map(surfer => (
              <div key={surfer.surferId} className='flex items-center justify-between text-sm'>
                <span className='text-wsl-dark'>{surfer.name}</span>
                <div className='flex items-center gap-2'>
                  <span className='text-wsl-blue-600'>{surfer.betOdds}</span>
                  <TrendIndicator trend={surfer.trend} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Components
function FormIndicator({ form }: { form: 'hot' | 'warm' | 'cold' }) {
  const styles = {
    hot: 'bg-red-500 text-white',
    warm: 'bg-yellow-500 text-white', 
    cold: 'bg-blue-500 text-white'
  }
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${styles[form]}`}>
      {form.toUpperCase()}
    </span>
  )
}

function PerformanceIndicator({ rating }: { rating: number }) {
  const getColor = (rating: number) => {
    if (rating >= 80) return 'text-wsl-success'
    if (rating >= 60) return 'text-wsl-warning'
    return 'text-wsl-blue-600'
  }
  
  return (
    <span className={`text-xs font-bold ${getColor(rating)}`}>
      {rating}% here
    </span>
  )
}

function ConditionBadge({ rating }: { rating: 'excellent' | 'good' | 'fair' | 'poor' }) {
  const styles = {
    excellent: 'bg-green-100 text-green-700 border-green-200',
    good: 'bg-blue-100 text-blue-700 border-blue-200',
    fair: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    poor: 'bg-red-100 text-red-700 border-red-200'
  }
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${styles[rating]}`}>
      {rating}
    </span>
  )
}

function DifficultyBadge({ rating }: { rating: string }) {
  const styles = {
    'beginner': 'bg-green-100 text-green-700',
    'intermediate': 'bg-blue-100 text-blue-700',
    'advanced': 'bg-yellow-100 text-yellow-700',
    'expert-only': 'bg-red-100 text-red-700',
    'easy': 'bg-green-100 text-green-700',
    'medium': 'bg-yellow-100 text-yellow-700',
    'hard': 'bg-orange-100 text-orange-700',
    'extreme': 'bg-red-100 text-red-700'
  }
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${styles[rating] || styles['medium']}`}>
      {rating}
    </span>
  )
}

function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  const icons = {
    up: '📈',
    down: '📉', 
    stable: '➡️'
  }
  
  const colors = {
    up: 'text-green-500',
    down: 'text-red-500',
    stable: 'text-gray-500'
  }
  
  return (
    <span className={colors[trend]} title={`Trending ${trend}`}>
      {icons[trend]}
    </span>
  )
}

// Default data for initialization
const defaultSurferOdds: SurferOdds[] = [
  {
    surferId: 'griffin-colapinto',
    name: 'Griffin Colapinto',
    avatar: '/avatars/m/01.jpg',
    winRate: 73,
    conditionRating: 'excellent',
    difficultyRating: 'medium',
    pastPerformance: 85,
    currentForm: 'hot',
    betOdds: '+120',
    trend: 'up'
  },
  {
    surferId: 'john-john-florence',
    name: 'John John Florence', 
    avatar: '/avatars/m/02.jpg',
    winRate: 68,
    conditionRating: 'good',
    difficultyRating: 'easy',
    pastPerformance: 92,
    currentForm: 'warm',
    betOdds: '+150',
    trend: 'stable'
  },
  {
    surferId: 'kelly-slater',
    name: 'Kelly Slater',
    avatar: '/avatars/m/03.jpg', 
    winRate: 65,
    conditionRating: 'excellent',
    difficultyRating: 'hard',
    pastPerformance: 88,
    currentForm: 'warm',
    betOdds: '+180',
    trend: 'down'
  },
  {
    surferId: 'gabriel-medina',
    name: 'Gabriel Medina',
    avatar: '/avatars/m/04.jpg',
    winRate: 62,
    conditionRating: 'good', 
    difficultyRating: 'medium',
    pastPerformance: 76,
    currentForm: 'hot',
    betOdds: '+200',
    trend: 'up'
  },
  {
    surferId: 'carissa-moore',
    name: 'Carissa Moore',
    avatar: '/avatars/f/01.jpg',
    winRate: 58,
    conditionRating: 'fair',
    difficultyRating: 'hard', 
    pastPerformance: 71,
    currentForm: 'cold',
    betOdds: '+250',
    trend: 'down'
  },
  {
    surferId: 'italo-ferreira',
    name: 'Italo Ferreira',
    avatar: '/avatars/m/05.jpg',
    winRate: 55,
    conditionRating: 'good',
    difficultyRating: 'extreme',
    pastPerformance: 69,
    currentForm: 'warm',
    betOdds: '+300',
    trend: 'stable'
  }
]

const defaultSurfConditions: SurfConditions = {
  waveHeight: '6-8ft',
  waveQuality: 8,
  windDirection: 'Offshore',
  windSpeed: '10-15mph',
  tide: 'Mid Rising',
  waterTemp: '74°F',
  difficulty: 'advanced',
  location: 'Pipeline, Hawaii'
}
