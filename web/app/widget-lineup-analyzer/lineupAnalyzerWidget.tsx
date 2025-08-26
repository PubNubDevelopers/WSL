'use client'

import { useState, useEffect } from 'react'
import GuideOverlay from '../components/guideOverlay'
import { lineupRecommendationsChannelId } from '../data/constants'

interface SurferAnalysis {
  id: string;
  name: string;
  avatar: string;
  position: 'power-surfer' | 'value-pick' | 'safe-choice' | 'high-risk';
  expectedValue: number; // Points per dollar
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  riskScore: number; // 0-100
  salary: number; // Fantasy salary
  projectedPoints: number;
  ownership: number; // % of lineups using this surfer
  volatility: number; // Point variance
  upside: number; // Best case scenario points
  downside: number; // Worst case scenario points
  matchupRating: 'favorable' | 'neutral' | 'difficult';
  conditionsBonus: number; // Bonus/penalty based on conditions
  formAdjustment: number; // Recent performance adjustment
  weatherImpact: 'positive' | 'neutral' | 'negative';
  tags: string[];
}

interface LineupRecommendation {
  id: string;
  name: string;
  totalSalary: number;
  budgetRemaining: number;
  projectedPoints: number;
  riskLevel: 'conservative' | 'balanced' | 'aggressive' | 'tournament';
  diversification: number; // 0-100 score
  upside: number;
  floor: number;
  ownership: number;
  surfers: SurferAnalysis[];
  reasoning: string[];
}

export default function LineupAnalyzerWidget ({
  className,
  isMobilePreview,
  chat,
  isGuidedDemo,
  guidesShown,
  visibleGuide,
  setVisibleGuide,
  selectedSurfers,
  setSelectedSurfers,
  salaryBudget,
  setSalaryBudget
}) {
  const [availableSurfers, setAvailableSurfers] = useState<SurferAnalysis[]>(defaultSurferAnalysis)
  const [recommendations, setRecommendations] = useState<LineupRecommendation[]>([])
  const [selectedView, setSelectedView] = useState<'analyzer' | 'recommendations' | 'optimizer'>('analyzer')
  const [riskPreference, setRiskPreference] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced')
  const [sortBy, setSortBy] = useState<'expectedValue' | 'projectedPoints' | 'riskScore' | 'salary'>('expectedValue')
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [isOptimizing, setIsOptimizing] = useState(false)
  
  useEffect(() => {
    if (!chat) return
    
    // Subscribe to lineup recommendations
    const lineupChannel = chat.sdk.channel(lineupRecommendationsChannelId)
    const lineupSubscription = lineupChannel.subscription({ receivePresenceEvents: false })
    lineupSubscription.onMessage = messageEvent => {
      processRecommendationUpdate(messageEvent.message)
    }
    lineupSubscription.subscribe()
    
    return () => {
      lineupSubscription.unsubscribe()
    }
  }, [chat])
  
  useEffect(() => {
    if (!chat) return
    if (isGuidedDemo) return
    
    // Fetch latest recommendations
    chat.sdk.fetchMessages({
      channels: [lineupRecommendationsChannelId],
      count: 5
    }).then(result => {
      if (result?.channels[lineupRecommendationsChannelId]) {
        const recs = result.channels[lineupRecommendationsChannelId]
          .map(msg => msg.message)
          .filter(msg => msg.type === 'lineupRecommendation')
          .map(msg => msg.data)
        setRecommendations(recs)
      }
    })
  }, [chat, isGuidedDemo])
  
  function processRecommendationUpdate(message) {
    if (message.type === 'lineupRecommendation') {
      setRecommendations(prev => {
        const existing = prev.find(r => r.id === message.data.id)
        if (existing) return prev
        return [message.data, ...prev.slice(0, 4)]
      })
    } else if (message.type === 'lineupOptimized') {
      // Handle user's custom optimization result
      if (message.userId === chat?.currentUser?.id) {
        setIsOptimizing(false)
        setSelectedSurfers(message.lineup.surfers)
        // Switch to analyzer view to show the optimized lineup
        setSelectedView('analyzer')
        // Show success feedback (could add toast notification here)
        console.log(`✅ Optimized ${message.lineup.riskLevel} lineup: ${message.lineup.projectedPoints.toFixed(1)} projected points`)
      }
    } else if (message.type === 'surferUpdate') {
      setAvailableSurfers(prev => prev.map(surfer =>
        surfer.id === message.surferId 
          ? { ...surfer, ...message.updates }
          : surfer
      ))
    } else if (message.type === 'optimizationError') {
      // Handle optimization errors
      if (message.userId === chat?.currentUser?.id || !message.userId) {
        setIsOptimizing(false)
        console.error(`❌ Optimization failed: ${message.message}`)
        // Could show error toast notification here
      }
    }
  }
  
  function toggleSurferSelection(surfer: SurferAnalysis) {
    const isSelected = selectedSurfers.find(s => s.id === surfer.id)
    const currentSalary = selectedSurfers.reduce((sum, s) => sum + s.salary, 0)
    
    if (isSelected) {
      setSelectedSurfers(prev => prev.filter(s => s.id !== surfer.id))
    } else if (selectedSurfers.length < 6 && currentSalary + surfer.salary <= salaryBudget) {
      setSelectedSurfers(prev => [...prev, surfer])
    }
  }
  
  function generateOptimalLineup() {
    if (!chat) return
    
    setIsOptimizing(true)
    
    const preferences = {
      budget: salaryBudget,
      riskPreference,
      selectedSurfers: selectedSurfers.map(s => s.id),
      diversificationTarget: riskPreference === 'conservative' ? 80 : riskPreference === 'balanced' ? 60 : 40
    }
    
    // Request optimization from backend
    chat.sdk.publish({
      channel: lineupRecommendationsChannelId,
      message: {
        type: 'optimizeLineup',
        preferences,
        userId: chat.currentUser.id
      }
    })
    
    // Safety timeout - clear loading state after 10 seconds if no response
    setTimeout(() => {
      setIsOptimizing(false)
    }, 10000)
  }
  
  const filteredSurfers = availableSurfers
    .filter(s => filterRisk === 'all' || s.riskLevel === filterRisk)
    .sort((a, b) => {
      switch (sortBy) {
        case 'expectedValue': return b.expectedValue - a.expectedValue
        case 'projectedPoints': return b.projectedPoints - a.projectedPoints
        case 'riskScore': return a.riskScore - b.riskScore
        case 'salary': return a.salary - b.salary
        default: return 0
      }
    })
    
  const currentSalary = selectedSurfers.reduce((sum, s) => sum + s.salary, 0)
  const remainingBudget = salaryBudget - currentSalary
  const currentProjection = selectedSurfers.reduce((sum, s) => sum + s.projectedPoints, 0)

  return (
    <div className={`${className}`}>
      <GuideOverlay
        id={'lineupAnalyzerGuide'}
        guidesShown={guidesShown}
        visibleGuide={visibleGuide}
        setVisibleGuide={setVisibleGuide}
        text={
          <span>
            Advanced lineup optimization using <span className='font-semibold'>AI-powered analysis</span> of
            surf conditions, form, and matchups. <span className='font-semibold'>PubNub Functions</span> process
            real-time data to provide <span className='font-semibold'>risk assessments and recommendations</span>.
          </span>
        }
        xOffset={`right-[50px]`}
        yOffset={'top-[10px]'}
        flexStyle={'flex-row items-start'}
      />

      <div className='bg-gradient-to-br from-wsl-blue-50 to-wsl-blue-100 p-4 rounded-lg'>
        {/* Header with current lineup summary */}
        <div className='mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-lg font-bold text-wsl-dark'>Lineup Analyzer</h3>
            <div className='text-right'>
              <div className='text-sm font-medium text-wsl-primary'>Pipeline Masters</div>
              <div className='text-xs text-wsl-blue-600'>Fantasy Contest</div>
            </div>
          </div>
          

        </div>
        
        {/* View Toggle */}
        <div className='flex mb-4 bg-white rounded-lg p-1'>
          {(['analyzer', 'recommendations', 'optimizer'] as const).map(view => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 transition-all ${
                selectedView === view
                  ? 'bg-wsl-primary text-white'
                  : 'text-wsl-blue-600 hover:bg-wsl-blue-50'
              }`}
            >
              {view === 'analyzer' ? '🔍 Analyze' : view === 'recommendations' ? '💡 Recs' : '⚡ Optimize'}
            </button>
          ))}
        </div>

        {/* Content based on selected view */}
        {selectedView === 'analyzer' && (
          <SurferAnalyzerView
            surfers={filteredSurfers}
            selectedSurfers={selectedSurfers}
            onToggleSelection={toggleSurferSelection}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterRisk={filterRisk}
            setFilterRisk={setFilterRisk}
            remainingBudget={remainingBudget}
            isMobilePreview={isMobilePreview}
          />
        )}
        
        {selectedView === 'recommendations' && (
          <RecommendationsView
            recommendations={recommendations}
            onSelectRecommendation={setSelectedSurfers}
            isMobilePreview={isMobilePreview}
          />
        )}
        
        {selectedView === 'optimizer' && (
          <OptimizerView
            riskPreference={riskPreference}
            setRiskPreference={setRiskPreference}
            salaryBudget={salaryBudget}
            setSalaryBudget={setSalaryBudget}
            onOptimize={generateOptimalLineup}
            selectedSurfers={selectedSurfers}
            isOptimizing={isOptimizing}
          />
        )}
      </div>
    </div>
  )
}



function SurferAnalyzerView({ 
  surfers, 
  selectedSurfers, 
  onToggleSelection, 
  sortBy, 
  setSortBy, 
  filterRisk, 
  setFilterRisk,
  remainingBudget,
  isMobilePreview 
}) {
  const displayCount = isMobilePreview ? 6 : 12
  
  return (
    <div className='space-y-4'>
      {/* Controls */}
      <div className='bg-white rounded-lg p-3'>
        <div className='flex items-center justify-between mb-3'>
          <h4 className='font-bold text-wsl-dark'>Player Analysis</h4>
          <div className='flex items-center gap-2 text-xs'>
            <span className='text-wsl-blue-600'>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className='border border-wsl-blue-200 rounded px-2 py-1 text-xs'
            >
              <option value="expectedValue">Expected Value</option>
              <option value="projectedPoints">Projected Points</option>
              <option value="riskScore">Risk Level</option>
              <option value="salary">Salary</option>
            </select>
          </div>
        </div>
        
        <div className='flex gap-2 flex-wrap'>
          {(['all', 'low', 'medium', 'high'] as const).map(risk => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterRisk === risk
                  ? 'bg-wsl-primary text-white'
                  : 'bg-wsl-blue-50 text-wsl-blue-600 hover:bg-wsl-blue-100'
              }`}
            >
              {risk === 'all' ? 'All Risk Levels' : `${risk.charAt(0).toUpperCase()}${risk.slice(1)} Risk`}
            </button>
          ))}
        </div>
      </div>
      
      {/* Surfer Cards */}
      <div className='space-y-3'>
        {surfers.slice(0, displayCount).map(surfer => (
          <SurferAnalysisCard
            key={surfer.id}
            surfer={surfer}
            isSelected={selectedSurfers.some(s => s.id === surfer.id)}
            onToggle={() => onToggleSelection(surfer)}
            canAfford={surfer.salary <= remainingBudget}
            isCompact={isMobilePreview}
          />
        ))}
      </div>
    </div>
  )
}

function SurferAnalysisCard({ surfer, isSelected, onToggle, canAfford, isCompact = false }) {
  const riskColor = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50', 
    high: 'text-orange-600 bg-orange-50',
    extreme: 'text-red-600 bg-red-50'
  }
  
  const positionColors = {
    'power-surfer': 'bg-purple-100 text-purple-700',
    'value-pick': 'bg-green-100 text-green-700',
    'safe-choice': 'bg-blue-100 text-blue-700',
    'high-risk': 'bg-red-100 text-red-700'
  }
  
  return (
    <div 
      className={`bg-white rounded-lg p-4 border-2 cursor-pointer transition-all ${
        isSelected ? 'border-wsl-primary bg-wsl-blue-50' : 
        canAfford ? 'border-wsl-blue-200 hover:border-wsl-primary hover:shadow-md' :
        'border-gray-200 opacity-50 cursor-not-allowed'
      }`}
      onClick={canAfford ? onToggle : undefined}
    >
      <div className='flex items-start gap-3'>
        <div className='relative'>
          <img 
            src={surfer.avatar} 
            alt={surfer.name}
            className='w-12 h-12 rounded-full object-cover'
          />
          {isSelected && (
            <div className='absolute -top-1 -right-1 w-5 h-5 bg-wsl-primary rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>✓</span>
            </div>
          )}
        </div>
        
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between mb-2'>
            <div>
              <h4 className='font-bold text-wsl-dark'>{surfer.name}</h4>
              <div className='flex items-center gap-2 mt-1'>
                <span className={`text-xs px-2 py-0.5 rounded-full ${positionColors[surfer.position]}`}>
                  {surfer.position.replace('-', ' ')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${riskColor[surfer.riskLevel]}`}>
                  {surfer.riskLevel} risk
                </span>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-lg font-bold text-wsl-dark'>
                ${(surfer.salary / 1000).toFixed(0)}K
              </div>
              <div className='text-xs text-wsl-blue-600'>
                {surfer.ownership}% owned
              </div>
            </div>
          </div>
          
          <div className='grid grid-cols-2 gap-3 text-sm mb-3'>
            <div>
              <span className='text-wsl-blue-600'>Proj. Points:</span>
              <div className='font-bold text-wsl-primary'>{surfer.projectedPoints.toFixed(1)}</div>
            </div>
            <div>
              <span className='text-wsl-blue-600'>Value Score:</span>
              <div className='font-bold text-wsl-success'>{surfer.expectedValue.toFixed(2)}</div>
            </div>
            <div>
              <span className='text-wsl-blue-600'>Upside:</span>
              <div className='font-medium text-wsl-dark'>{surfer.upside.toFixed(1)}</div>
            </div>
            <div>
              <span className='text-wsl-blue-600'>Floor:</span>
              <div className='font-medium text-wsl-dark'>{surfer.downside.toFixed(1)}</div>
            </div>
          </div>
          
          {!isCompact && (
            <div className='border-t border-wsl-blue-200 pt-2'>
              <div className='flex items-center gap-2 text-xs'>
                <MatchupIndicator rating={surfer.matchupRating} />
                <WeatherIndicator impact={surfer.weatherImpact} />
                {surfer.tags.slice(0, 2).map(tag => (
                  <span key={tag} className='bg-wsl-blue-100 text-wsl-blue-600 px-2 py-0.5 rounded-full'>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RecommendationsView({ recommendations, onSelectRecommendation, isMobilePreview }) {
  if (recommendations.length === 0) {
    return (
      <div className='bg-white rounded-lg p-6 text-center'>
        <div className='text-4xl mb-3'>🤖</div>
        <div className='text-lg font-bold text-wsl-dark mb-2'>AI Recommendations Coming</div>
        <div className='text-wsl-blue-600'>
          Optimized lineups based on conditions and matchups will appear here
        </div>
      </div>
    )
  }
  
  return (
    <div className='space-y-4'>
      {recommendations.slice(0, isMobilePreview ? 2 : 3).map(rec => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          onSelect={() => onSelectRecommendation(rec.surfers)}
          isCompact={isMobilePreview}
        />
      ))}
    </div>
  )
}

function RecommendationCard({ recommendation, onSelect, isCompact = false }) {
  const riskColors = {
    conservative: 'bg-green-100 text-green-700',
    balanced: 'bg-blue-100 text-blue-700',
    aggressive: 'bg-orange-100 text-orange-700',
    tournament: 'bg-red-100 text-red-700'
  }
  
  return (
    <div className='bg-white rounded-lg p-4 border border-wsl-blue-200'>
      <div className='flex items-start justify-between mb-3'>
        <div>
          <h4 className='font-bold text-wsl-dark'>{recommendation.name}</h4>
          <div className='flex items-center gap-2 mt-1'>
            <span className={`text-xs px-2 py-0.5 rounded-full ${riskColors[recommendation.riskLevel]}`}>
              {recommendation.riskLevel}
            </span>
            <span className='text-xs text-wsl-blue-600'>
              {recommendation.ownership.toFixed(1)}% avg ownership
            </span>
          </div>
        </div>
        <button
          onClick={onSelect}
          className='bg-wsl-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-wsl-primary-dark transition-colors'
        >
          Use Lineup
        </button>
      </div>
      
      <div className='grid grid-cols-3 gap-3 text-center mb-3'>
        <div>
          <div className='text-lg font-bold text-wsl-success'>{recommendation.projectedPoints.toFixed(1)}</div>
          <div className='text-xs text-wsl-blue-600'>Projected</div>
        </div>
        <div>
          <div className='text-lg font-bold text-wsl-primary'>{recommendation.upside.toFixed(1)}</div>
          <div className='text-xs text-wsl-blue-600'>Upside</div>
        </div>
        <div>
          <div className='text-lg font-bold text-wsl-dark'>${(recommendation.totalSalary / 1000).toFixed(0)}K</div>
          <div className='text-xs text-wsl-blue-600'>Salary</div>
        </div>
      </div>
      
      {!isCompact && (
        <div className='mb-3'>
          <div className='text-sm font-medium text-wsl-dark mb-2'>Key Insights:</div>
          <div className='space-y-1'>
            {recommendation.reasoning.slice(0, 2).map((reason, index) => (
              <div key={index} className='flex items-center gap-2 text-sm text-wsl-blue-600'>
                <span className='w-1 h-1 bg-wsl-primary rounded-full'></span>
                {reason}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className='border-t border-wsl-blue-200 pt-2'>
        <div className='flex flex-wrap gap-1'>
          {recommendation.surfers.slice(0, isCompact ? 3 : 6).map(surfer => (
            <div key={surfer.id} className='flex items-center gap-1 bg-wsl-blue-50 px-2 py-1 rounded text-xs'>
              <img src={surfer.avatar} alt={surfer.name} className='w-4 h-4 rounded-full' />
              <span className='text-wsl-dark'>{surfer.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OptimizerView({ riskPreference, setRiskPreference, salaryBudget, setSalaryBudget, onOptimize, selectedSurfers, isOptimizing }) {
  return (
    <div className='bg-white rounded-lg p-4'>
      <h4 className='font-bold text-wsl-dark mb-4'>Lineup Optimizer</h4>
      
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-wsl-dark mb-2'>
            Risk Preference
          </label>
          <div className='flex gap-2'>
            {(['conservative', 'balanced', 'aggressive'] as const).map(risk => (
              <button
                key={risk}
                onClick={() => setRiskPreference(risk)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 transition-all ${
                  riskPreference === risk
                    ? 'bg-wsl-primary text-white'
                    : 'bg-wsl-blue-50 text-wsl-blue-600 hover:bg-wsl-blue-100'
                }`}
              >
                {risk.charAt(0).toUpperCase() + risk.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className='block text-sm font-medium text-wsl-dark mb-2'>
            Salary Budget: ${salaryBudget.toLocaleString()}
          </label>
          <input
            type='range'
            min={45000}
            max={55000}
            step={1000}
            value={salaryBudget}
            onChange={(e) => setSalaryBudget(parseInt(e.target.value))}
            className='w-full'
          />
          <div className='flex justify-between text-xs text-wsl-blue-600 mt-1'>
            <span>$45K</span>
            <span>$55K</span>
          </div>
        </div>
        
        {selectedSurfers.length > 0 && (
          <div className='bg-wsl-blue-50 p-3 rounded-lg'>
            <div className='text-sm font-medium text-wsl-dark mb-2'>Locked Players:</div>
            <div className='flex flex-wrap gap-2'>
              {selectedSurfers.map(surfer => (
                <div key={surfer.id} className='flex items-center gap-1 bg-white px-2 py-1 rounded text-xs'>
                  <img src={surfer.avatar} alt={surfer.name} className='w-4 h-4 rounded-full' />
                  <span className='text-wsl-dark'>{surfer.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button
          onClick={onOptimize}
          disabled={isOptimizing}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-colors ${
            isOptimizing 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-wsl-primary text-white hover:bg-wsl-primary-dark'
          }`}
        >
          {isOptimizing ? (
            <>
              ⏳ Optimizing Lineup...
            </>
          ) : (
            <>
              🤖 Generate Optimal Lineup
            </>
          )}
        </button>
        
        <div className='text-xs text-wsl-blue-600 text-center'>
          AI optimization considers conditions, matchups, and ownership projections
        </div>
      </div>
    </div>
  )
}

// Helper Components
function MatchupIndicator({ rating }) {
  const colors = {
    favorable: 'bg-green-100 text-green-700',
    neutral: 'bg-gray-100 text-gray-700',
    difficult: 'bg-red-100 text-red-700'
  }
  
  const icons = {
    favorable: '😊',
    neutral: '😐',
    difficult: '😟'
  }
  
  return (
    <span className={`px-2 py-0.5 rounded-full ${colors[rating]}`}>
      {icons[rating]} {rating}
    </span>
  )
}

function WeatherIndicator({ impact }) {
  const colors = {
    positive: 'text-green-600',
    neutral: 'text-gray-600', 
    negative: 'text-red-600'
  }
  
  const icons = {
    positive: '☀️',
    neutral: '⛅',
    negative: '🌧️'
  }
  
  return (
    <span className={colors[impact]} title={`Weather ${impact}`}>
      {icons[impact]}
    </span>
  )
}

// Default data
const defaultSurferAnalysis: SurferAnalysis[] = [
  {
    id: "griffin-colapinto",
    name: "Griffin Colapinto",
    avatar: "/avatars/m/01.jpg",
    position: "power-surfer",
    expectedValue: 4.2,
    riskLevel: "medium",
    riskScore: 45,
    salary: 12500,
    projectedPoints: 52.5,
    ownership: 28.5,
    volatility: 18.3,
    upside: 75.2,
    downside: 32.1,
    matchupRating: "favorable",
    conditionsBonus: 5.2,
    formAdjustment: 8.1,
    weatherImpact: "positive",
    tags: ["power-surfer", "trending-up", "conditions-boost"]
  },
  {
    id: "john-john-florence",
    name: "John John Florence",
    avatar: "/avatars/m/02.jpg",
    position: "safe-choice",
    expectedValue: 3.8,
    riskLevel: "low",
    riskScore: 22,
    salary: 13800,
    projectedPoints: 48.7,
    ownership: 45.2,
    volatility: 12.1,
    upside: 68.3,
    downside: 38.9,
    matchupRating: "favorable",
    conditionsBonus: 3.1,
    formAdjustment: 2.3,
    weatherImpact: "positive",
    tags: ["pipeline-specialist", "safe-floor", "high-owned"]
  },
  {
    id: "kelly-slater",
    name: "Kelly Slater",
    avatar: "/avatars/m/03.jpg",
    position: "value-pick",
    expectedValue: 5.1,
    riskLevel: "high",
    riskScore: 67,
    salary: 8900,
    projectedPoints: 45.4,
    ownership: 12.8,
    volatility: 24.6,
    upside: 82.1,
    downside: 18.7,
    matchupRating: "neutral",
    conditionsBonus: 2.8,
    formAdjustment: 12.4,
    weatherImpact: "neutral",
    tags: ["tournament-play", "low-owned", "high-upside"]
  },
  {
    id: "gabriel-medina",
    name: "Gabriel Medina",
    avatar: "/avatars/m/04.jpg",
    position: "safe-choice",
    expectedValue: 3.9,
    riskLevel: "medium",
    riskScore: 38,
    salary: 11200,
    projectedPoints: 43.7,
    ownership: 32.1,
    volatility: 15.8,
    upside: 64.2,
    downside: 28.3,
    matchupRating: "favorable",
    conditionsBonus: 1.9,
    formAdjustment: -1.2,
    weatherImpact: "neutral",
    tags: ["consistent", "matchup-dependent"]
  },
  {
    id: "italo-ferreira",
    name: "Italo Ferreira",
    avatar: "/avatars/m/05.jpg",
    position: "high-risk",
    expectedValue: 4.7,
    riskLevel: "extreme",
    riskScore: 89,
    salary: 7600,
    projectedPoints: 35.7,
    ownership: 8.3,
    volatility: 31.2,
    upside: 88.9,
    downside: 8.4,
    matchupRating: "difficult",
    conditionsBonus: -2.1,
    formAdjustment: -8.3,
    weatherImpact: "negative",
    tags: ["boom-bust", "gpp-only", "contrarian"]
  },
  {
    id: "carissa-moore",
    name: "Carissa Moore",
    avatar: "/avatars/f/01.jpg",
    position: "value-pick",
    expectedValue: 4.4,
    riskLevel: "medium",
    riskScore: 41,
    salary: 9800,
    projectedPoints: 43.1,
    ownership: 19.7,
    volatility: 16.9,
    upside: 67.8,
    downside: 24.6,
    matchupRating: "neutral",
    conditionsBonus: 0.8,
    formAdjustment: 4.2,
    weatherImpact: "positive",
    tags: ["sleeper-pick", "form-boost"]
  }
]
