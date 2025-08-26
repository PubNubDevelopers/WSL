'use client'

import { useState, useEffect } from 'react'
import GuideOverlay from '../components/guideOverlay'
import { bracketsChannelId } from '../data/constants'

interface Surfer {
  id: string;
  name: string;
  avatar: string;
  seed: number;
  country: string;
  worldRanking: number;
  pipelineRecord: string;
  momentum: 'hot' | 'warm' | 'cold';
  recentForm: number; // 0-100
}

interface Matchup {
  id: string;
  round: 'round1' | 'round2' | 'quarterfinals' | 'semifinals' | 'final';
  heat: number;
  surfer1: Surfer;
  surfer2: Surfer;
  winner?: Surfer;
  status: 'upcoming' | 'live' | 'completed';
  startTime: string;
  headToHeadRecord: {
    surfer1Wins: number;
    surfer2Wins: number;
  };
  conditions?: {
    waveHeight: string;
    quality: number;
  };
}

interface Tournament {
  name: string;
  location: string;
  currentRound: string;
  totalPrize: string;
  rounds: {
    round1: Matchup[];
    round2: Matchup[];
    quarterfinals: Matchup[];
    semifinals: Matchup[];
    final: Matchup[];
  };
}

export default function TournamentBracketsWidget ({
  className,
  isMobilePreview,
  chat,
  isGuidedDemo,
  guidesShown,
  visibleGuide,
  setVisibleGuide
}) {
  const [tournament, setTournament] = useState<Tournament>(defaultTournament)
  const [selectedMatchup, setSelectedMatchup] = useState<Matchup | null>(null)
  const [selectedRound, setSelectedRound] = useState<'all' | 'round1' | 'round2' | 'quarterfinals' | 'semifinals' | 'final'>('all')
  const [showMatchupDetails, setShowMatchupDetails] = useState(false)
  
  useEffect(() => {
    if (!chat) return
    
    // Subscribe to bracket updates
    const bracketsChannel = chat.sdk.channel(bracketsChannelId)
    const bracketsSubscription = bracketsChannel.subscription({ receivePresenceEvents: false })
    bracketsSubscription.onMessage = messageEvent => {
      processBracketUpdate(messageEvent.message)
    }
    bracketsSubscription.subscribe()
    
    return () => {
      bracketsSubscription.unsubscribe()
    }
  }, [chat])
  
  useEffect(() => {
    if (!chat) return
    if (isGuidedDemo) return
    
    // Fetch latest bracket data on mount
    chat.sdk.fetchMessages({
      channels: [bracketsChannelId],
      count: 1
    }).then(result => {
      if (result?.channels[bracketsChannelId]?.[0]) {
        const latestBracket = result.channels[bracketsChannelId][0].message
        if (latestBracket.type === 'bracketUpdate') {
          setTournament(latestBracket.data)
        }
      }
    })
  }, [chat, isGuidedDemo])
  
  function processBracketUpdate(message) {
    if (message.type === 'bracketUpdate') {
      setTournament(message.data)
    } else if (message.type === 'matchupResult') {
      // Update specific matchup result
      setTournament(prev => ({
        ...prev,
        rounds: {
          ...prev.rounds,
          [message.round]: prev.rounds[message.round].map(matchup =>
            matchup.id === message.matchupId 
              ? { ...matchup, winner: message.winner, status: 'completed' }
              : matchup
          )
        }
      }))
    } else if (message.type === 'matchupLive') {
      // Update matchup to live status
      setTournament(prev => ({
        ...prev,
        rounds: {
          ...prev.rounds,
          [message.round]: prev.rounds[message.round].map(matchup =>
            matchup.id === message.matchupId 
              ? { ...matchup, status: 'live', conditions: message.conditions }
              : matchup
          )
        }
      }))
    }
  }
  
  function openMatchupDetails(matchup: Matchup) {
    setSelectedMatchup(matchup)
    setShowMatchupDetails(true)
  }
  
  const roundLabels = {
    'round1': 'Round 1',
    'round2': 'Round 2', 
    'quarterfinals': 'Quarterfinals',
    'semifinals': 'Semifinals',
    'final': 'Final'
  }
  
  const filteredRounds = selectedRound === 'all' 
    ? Object.keys(tournament.rounds) 
    : [selectedRound]

  return (
    <div className={`${className}`}>
      <GuideOverlay
        id={'bracketsGuide'}
        guidesShown={guidesShown}
        visibleGuide={visibleGuide}
        setVisibleGuide={setVisibleGuide}
        text={
          <span>
            Interactive tournament brackets powered by <span className='font-semibold'>PubNub real-time updates</span>.
            Track matchups, head-to-head records, and live heat progressions with 
            <span className='font-semibold'> instant bracket updates</span> as results come in.
          </span>
        }
        xOffset={`right-[50px]`}
        yOffset={'top-[10px]'}
        flexStyle={'flex-row items-start'}
      />

      <div className='bg-gradient-to-br from-wsl-blue-50 to-wsl-blue-100 p-4 rounded-lg'>
        {/* Tournament Header */}
        <div className='mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <div>
              <h3 className='text-lg font-bold text-wsl-dark'>{tournament.name}</h3>
              <p className='text-sm text-wsl-blue-600'>{tournament.location} • {tournament.totalPrize}</p>
            </div>
            <div className='text-right'>
              <div className='text-sm font-medium text-wsl-primary'>Current Round</div>
              <div className='text-xs text-wsl-blue-600'>{roundLabels[tournament.currentRound]}</div>
            </div>
          </div>
          
          {/* Round Filter */}
          <div className='flex gap-1 overflow-x-auto pb-2'>
            {(['all', ...Object.keys(tournament.rounds)] as const).map(round => (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-all ${
                  selectedRound === round
                    ? 'bg-wsl-primary text-white'
                    : 'bg-white text-wsl-blue-600 hover:bg-wsl-blue-50'
                }`}
              >
                {round === 'all' ? 'All Rounds' : roundLabels[round]}
              </button>
            ))}
          </div>
        </div>
        
        {/* Brackets Display */}
        <div className={`space-y-6 ${isMobilePreview ? '' : 'max-h-96 overflow-y-auto'}`}>
          {filteredRounds.map(roundKey => (
            <RoundSection
              key={roundKey}
              round={roundKey as keyof Tournament['rounds']}
              roundLabel={roundLabels[roundKey]}
              matchups={tournament.rounds[roundKey]}
              onMatchupClick={openMatchupDetails}
              isMobilePreview={isMobilePreview}
            />
          ))}
        </div>
      </div>
      
      {/* Matchup Details Modal */}
      {showMatchupDetails && selectedMatchup && (
        <MatchupDetailsModal
          matchup={selectedMatchup}
          onClose={() => {
            setShowMatchupDetails(false)
            setSelectedMatchup(null)
          }}
        />
      )}
    </div>
  )
}

function RoundSection({ round, roundLabel, matchups, onMatchupClick, isMobilePreview }) {
  const liveMatchups = matchups.filter(m => m.status === 'live')
  const upcomingMatchups = matchups.filter(m => m.status === 'upcoming')
  const completedMatchups = matchups.filter(m => m.status === 'completed')
  
  return (
    <div className='bg-white rounded-lg p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h4 className='font-bold text-wsl-dark'>{roundLabel}</h4>
        <div className='flex items-center gap-2 text-xs'>
          {liveMatchups.length > 0 && (
            <span className='bg-red-500 text-white px-2 py-0.5 rounded-full'>
              {liveMatchups.length} Live
            </span>
          )}
          <span className='text-wsl-blue-600'>
            {matchups.length} heat{matchups.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {/* Live Matchups First */}
      {liveMatchups.length > 0 && (
        <div className='mb-4'>
          <h5 className='text-sm font-medium text-red-600 mb-2 flex items-center gap-1'>
            <span className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></span>
            Live Now
          </h5>
          <div className='space-y-2'>
            {liveMatchups.map(matchup => (
              <MatchupCard
                key={matchup.id}
                matchup={matchup}
                onClick={() => onMatchupClick(matchup)}
                isCompact={isMobilePreview}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Upcoming Matchups */}
      {upcomingMatchups.length > 0 && (
        <div className='mb-4'>
          <h5 className='text-sm font-medium text-wsl-blue-600 mb-2'>Upcoming</h5>
          <div className='space-y-2'>
            {upcomingMatchups.slice(0, isMobilePreview ? 2 : 4).map(matchup => (
              <MatchupCard
                key={matchup.id}
                matchup={matchup}
                onClick={() => onMatchupClick(matchup)}
                isCompact={isMobilePreview}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Completed Matchups */}
      {completedMatchups.length > 0 && (
        <div>
          <h5 className='text-sm font-medium text-wsl-success mb-2'>Completed</h5>
          <div className='space-y-2'>
            {completedMatchups.slice(0, isMobilePreview ? 2 : 3).map(matchup => (
              <MatchupCard
                key={matchup.id}
                matchup={matchup}
                onClick={() => onMatchupClick(matchup)}
                isCompact={isMobilePreview}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MatchupCard({ matchup, onClick, isCompact = false }) {
  const statusStyles = {
    upcoming: 'border-wsl-blue-200 bg-white',
    live: 'border-red-300 bg-red-50 shadow-md',
    completed: 'border-wsl-success-light bg-wsl-success-light'
  }
  
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${statusStyles[matchup.status]}`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          {/* Heat Info */}
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-wsl-dark'>
              Heat {matchup.heat}
            </span>
            <div className='flex items-center gap-2'>
              {matchup.status === 'live' && (
                <span className='bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse'>
                  LIVE
                </span>
              )}
              <span className='text-xs text-wsl-blue-600'>
                {matchup.startTime}
              </span>
            </div>
          </div>
          
          {/* Surfers */}
          <div className='space-y-2'>
            <SurferRow 
              surfer={matchup.surfer1} 
              isWinner={matchup.winner?.id === matchup.surfer1.id}
              isCompact={isCompact}
            />
            <div className='text-center text-xs text-wsl-blue-600'>vs</div>
            <SurferRow 
              surfer={matchup.surfer2} 
              isWinner={matchup.winner?.id === matchup.surfer2.id}
              isCompact={isCompact}
            />
          </div>
          
          {/* Head-to-Head */}
          {!isCompact && (
            <div className='mt-2 pt-2 border-t border-wsl-blue-200'>
              <div className='text-xs text-wsl-blue-600 text-center'>
                H2H: {matchup.headToHeadRecord.surfer1Wins}-{matchup.headToHeadRecord.surfer2Wins}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SurferRow({ surfer, isWinner = false, isCompact = false }) {
  const momentumColors = {
    hot: 'text-red-500',
    warm: 'text-orange-500',
    cold: 'text-blue-500'
  }
  
  return (
    <div className={`flex items-center gap-2 p-2 rounded-md transition-all ${
      isWinner ? 'bg-wsl-success-light border border-wsl-success' : 'bg-gray-50'
    }`}>
      <img 
        src={surfer.avatar} 
        alt={surfer.name}
        className='w-8 h-8 rounded-full object-cover flex-shrink-0'
      />
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className={`font-medium text-sm ${isWinner ? 'text-wsl-success font-bold' : 'text-wsl-dark'}`}>
            {isWinner && '👑'} {surfer.name}
          </span>
          {!isCompact && (
            <span className='text-xs text-wsl-blue-600'>#{surfer.worldRanking}</span>
          )}
        </div>
        {!isCompact && (
          <div className='flex items-center gap-2 text-xs'>
            <span className='text-wsl-blue-600'>{surfer.country}</span>
            <span className={`font-medium ${momentumColors[surfer.momentum]}`}>
              {surfer.momentum.toUpperCase()}
            </span>
            <span className='text-wsl-blue-600'>{surfer.pipelineRecord}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function MatchupDetailsModal({ matchup, onClose }) {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-bold text-wsl-dark text-lg'>
            Heat {matchup.heat} Details
          </h3>
          <button onClick={onClose} className='text-wsl-blue-600 hover:text-wsl-dark text-xl'>
            ✕
          </button>
        </div>
        
        {/* Status & Time */}
        <div className='mb-4 p-3 bg-wsl-blue-50 rounded-lg'>
          <div className='flex items-center justify-between'>
            <div>
              <div className={`font-medium ${
                matchup.status === 'live' ? 'text-red-600' :
                matchup.status === 'completed' ? 'text-wsl-success' :
                'text-wsl-blue-600'
              }`}>
                {matchup.status === 'live' ? '🔴 LIVE NOW' :
                 matchup.status === 'completed' ? '✅ COMPLETED' :
                 '⏰ UPCOMING'
                }
              </div>
              <div className='text-sm text-wsl-blue-600'>{matchup.startTime}</div>
            </div>
            {matchup.conditions && (
              <div className='text-right'>
                <div className='text-sm font-medium text-wsl-dark'>
                  {matchup.conditions.waveHeight}
                </div>
                <div className='text-xs text-wsl-blue-600'>
                  Quality: {matchup.conditions.quality}/10
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Detailed Surfer Comparison */}
        <div className='space-y-4 mb-6'>
          {[matchup.surfer1, matchup.surfer2].map((surfer, index) => (
            <div 
              key={surfer.id} 
              className={`p-4 rounded-lg border-2 ${
                matchup.winner?.id === surfer.id 
                  ? 'border-wsl-success bg-wsl-success-light' 
                  : 'border-wsl-blue-200 bg-white'
              }`}
            >
              <div className='flex items-start gap-3'>
                <img 
                  src={surfer.avatar} 
                  alt={surfer.name}
                  className='w-12 h-12 rounded-full object-cover'
                />
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <h4 className='font-bold text-wsl-dark'>{surfer.name}</h4>
                    {matchup.winner?.id === surfer.id && <span className='text-lg'>👑</span>}
                  </div>
                  
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div>
                      <span className='text-wsl-blue-600'>World Ranking:</span>
                      <div className='font-medium text-wsl-dark'>#{surfer.worldRanking}</div>
                    </div>
                    <div>
                      <span className='text-wsl-blue-600'>Country:</span>
                      <div className='font-medium text-wsl-dark'>{surfer.country}</div>
                    </div>
                    <div>
                      <span className='text-wsl-blue-600'>Pipeline Record:</span>
                      <div className='font-medium text-wsl-dark'>{surfer.pipelineRecord}</div>
                    </div>
                    <div>
                      <span className='text-wsl-blue-600'>Current Form:</span>
                      <div className={`font-medium ${
                        surfer.momentum === 'hot' ? 'text-red-500' :
                        surfer.momentum === 'warm' ? 'text-orange-500' :
                        'text-blue-500'
                      }`}>
                        {surfer.recentForm}% ({surfer.momentum.toUpperCase()})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Head-to-Head Stats */}
        <div className='bg-wsl-blue-50 p-4 rounded-lg mb-4'>
          <h4 className='font-bold text-wsl-dark mb-3'>Head-to-Head Record</h4>
          <div className='flex items-center justify-center gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-wsl-primary'>
                {matchup.headToHeadRecord.surfer1Wins}
              </div>
              <div className='text-xs text-wsl-blue-600'>{matchup.surfer1.name}</div>
            </div>
            <div className='text-wsl-blue-600 font-bold'>-</div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-wsl-primary'>
                {matchup.headToHeadRecord.surfer2Wins}
              </div>
              <div className='text-xs text-wsl-blue-600'>{matchup.surfer2.name}</div>
            </div>
          </div>
        </div>
        
        {/* Path to Victory */}
        <div className='bg-white border border-wsl-blue-200 p-4 rounded-lg'>
          <h4 className='font-bold text-wsl-dark mb-2'>Key Factors</h4>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='text-lg'>🌊</span>
              <span className='text-wsl-dark'>
                Conditions favor {matchup.surfer1.momentum === 'hot' ? matchup.surfer1.name : matchup.surfer2.name}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-lg'>📊</span>
              <span className='text-wsl-dark'>
                Experience edge to {matchup.surfer1.worldRanking < matchup.surfer2.worldRanking ? matchup.surfer1.name : matchup.surfer2.name}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-lg'>⚡</span>
              <span className='text-wsl-dark'>
                Momentum with {matchup.surfer1.momentum === 'hot' ? matchup.surfer1.name : 
                                matchup.surfer2.momentum === 'hot' ? matchup.surfer2.name : 'Both surfers steady'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Default tournament data
const defaultTournament: Tournament = {
  name: "Billabong Pipeline Masters",
  location: "Pipeline, Hawaii",
  currentRound: "quarterfinals",
  totalPrize: "$100,000",
  rounds: {
    round1: [
      {
        id: "r1-h1",
        round: "round1",
        heat: 1,
        surfer1: {
          id: "griffin-colapinto",
          name: "Griffin Colapinto",
          avatar: "/avatars/m/01.jpg",
          seed: 1,
          country: "USA",
          worldRanking: 3,
          pipelineRecord: "4-2",
          momentum: "hot",
          recentForm: 85
        },
        surfer2: {
          id: "rookie-surfer",
          name: "Jake Thompson",
          avatar: "/avatars/m/04.jpg", 
          seed: 16,
          country: "AUS",
          worldRanking: 24,
          pipelineRecord: "1-3",
          momentum: "cold",
          recentForm: 62
        },
        status: "completed",
        startTime: "8:00 AM",
        headToHeadRecord: { surfer1Wins: 2, surfer2Wins: 0 },
        winner: {
          id: "griffin-colapinto",
          name: "Griffin Colapinto",
          avatar: "/avatars/m/01.jpg",
          seed: 1,
          country: "USA", 
          worldRanking: 3,
          pipelineRecord: "4-2",
          momentum: "hot",
          recentForm: 85
        }
      }
    ],
    round2: [
      {
        id: "r2-h1",
        round: "round2",
        heat: 1,
        surfer1: {
          id: "john-john-florence",
          name: "John John Florence",
          avatar: "/avatars/m/02.jpg",
          seed: 2,
          country: "HAW",
          worldRanking: 1,
          pipelineRecord: "12-1",
          momentum: "warm",
          recentForm: 92
        },
        surfer2: {
          id: "griffin-colapinto",
          name: "Griffin Colapinto",
          avatar: "/avatars/m/01.jpg",
          seed: 1,
          country: "USA",
          worldRanking: 3,
          pipelineRecord: "4-2",
          momentum: "hot",
          recentForm: 85
        },
        status: "completed",
        startTime: "10:30 AM",
        headToHeadRecord: { surfer1Wins: 3, surfer2Wins: 1 },
        winner: {
          id: "john-john-florence",
          name: "John John Florence",
          avatar: "/avatars/m/02.jpg",
          seed: 2,
          country: "HAW",
          worldRanking: 1,
          pipelineRecord: "12-1",
          momentum: "warm",
          recentForm: 92
        }
      }
    ],
    quarterfinals: [
      {
        id: "qf-h1",
        round: "quarterfinals",
        heat: 1,
        surfer1: {
          id: "john-john-florence",
          name: "John John Florence",
          avatar: "/avatars/m/02.jpg",
          seed: 2,
          country: "HAW",
          worldRanking: 1,
          pipelineRecord: "12-1",
          momentum: "warm",
          recentForm: 92
        },
        surfer2: {
          id: "kelly-slater",
          name: "Kelly Slater",
          avatar: "/avatars/m/03.jpg",
          seed: 3,
          country: "USA",
          worldRanking: 15,
          pipelineRecord: "8-4",
          momentum: "hot",
          recentForm: 88
        },
        status: "live",
        startTime: "1:00 PM",
        headToHeadRecord: { surfer1Wins: 2, surfer2Wins: 5 },
        conditions: {
          waveHeight: "8-10ft",
          quality: 9
        }
      },
      {
        id: "qf-h2", 
        round: "quarterfinals",
        heat: 2,
        surfer1: {
          id: "gabriel-medina",
          name: "Gabriel Medina",
          avatar: "/avatars/m/05.jpg",
          seed: 4,
          country: "BRA",
          worldRanking: 5,
          pipelineRecord: "6-3",
          momentum: "warm",
          recentForm: 76
        },
        surfer2: {
          id: "italo-ferreira",
          name: "Italo Ferreira",
          avatar: "/avatars/m/06.jpg",
          seed: 5,
          country: "BRA",
          worldRanking: 7,
          pipelineRecord: "5-4",
          momentum: "cold",
          recentForm: 69
        },
        status: "upcoming",
        startTime: "2:30 PM",
        headToHeadRecord: { surfer1Wins: 4, surfer2Wins: 3 }
      }
    ],
    semifinals: [
      {
        id: "sf-h1",
        round: "semifinals",
        heat: 1,
        surfer1: {
          id: "tbd1",
          name: "TBD",
          avatar: "/avatars/placeholder.png",
          seed: 0,
          country: "",
          worldRanking: 0,
          pipelineRecord: "",
          momentum: "warm",
          recentForm: 0
        },
        surfer2: {
          id: "tbd2",
          name: "TBD", 
          avatar: "/avatars/placeholder.png",
          seed: 0,
          country: "",
          worldRanking: 0,
          pipelineRecord: "",
          momentum: "warm",
          recentForm: 0
        },
        status: "upcoming",
        startTime: "4:00 PM",
        headToHeadRecord: { surfer1Wins: 0, surfer2Wins: 0 }
      }
    ],
    final: [
      {
        id: "final-h1",
        round: "final",
        heat: 1,
        surfer1: {
          id: "tbd-final1",
          name: "TBD",
          avatar: "/avatars/placeholder.png",
          seed: 0,
          country: "",
          worldRanking: 0,
          pipelineRecord: "",
          momentum: "warm",
          recentForm: 0
        },
        surfer2: {
          id: "tbd-final2",
          name: "TBD",
          avatar: "/avatars/placeholder.png", 
          seed: 0,
          country: "",
          worldRanking: 0,
          pipelineRecord: "",
          momentum: "warm",
          recentForm: 0
        },
        status: "upcoming",
        startTime: "5:30 PM",
        headToHeadRecord: { surfer1Wins: 0, surfer2Wins: 0 }
      }
    ]
  }
}
