'use client'

import { useState, useEffect } from 'react'
import GuideOverlay from '../components/guideOverlay'
import { achievementsChannelId, goldJerseyWinnersChannelId } from '../data/constants'

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'fantasy' | 'community' | 'prediction' | 'social' | 'special';
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

interface WinnerProfile {
  userId: string;
  username: string;
  avatar: string;
  rank: number;
  totalPoints: number;
  weeklyWins: number;
  goldJerseys: GoldJersey[];
  achievements: Achievement[];
  stats: {
    fantasyWins: number;
    pollAccuracy: number;
    chatMessages: number;
    predictionsCorrect: number;
    streakRecord: number;
    totalEvents: number;
  };
  badges: string[];
  joinedDate: number;
  lastActiveDate: number;
}

interface GoldJersey {
  id: string;
  eventName: string;
  location: string;
  date: number;
  category: 'weekly-winner' | 'season-champion' | 'tournament-king' | 'prediction-master';
  points: number;
  rank: number;
  specialAchievement?: string;
}

export default function WinnerProfileWidget ({
  className,
  isMobilePreview,
  chat,
  isGuidedDemo,
  guidesShown,
  visibleGuide,
  setVisibleGuide
}) {
  const [currentWinners, setCurrentWinners] = useState<WinnerProfile[]>([])
  const [seasonLeaders, setSeasonLeaders] = useState<WinnerProfile[]>([])
  const [userProfile, setUserProfile] = useState<WinnerProfile | null>(null)
  const [selectedView, setSelectedView] = useState<'current' | 'season' | 'profile'>('current')
  const [selectedWinner, setSelectedWinner] = useState<WinnerProfile | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])
  
  useEffect(() => {
    if (!chat) return
    
    // Subscribe to winner announcements
    const winnersChannel = chat.sdk.channel(goldJerseyWinnersChannelId)
    const winnersSubscription = winnersChannel.subscription({ receivePresenceEvents: false })
    winnersSubscription.onMessage = messageEvent => {
      processWinnerUpdate(messageEvent.message)
    }
    winnersSubscription.subscribe()
    
    // Subscribe to achievement notifications
    const achievementsChannel = chat.sdk.channel(achievementsChannelId)
    const achievementsSubscription = achievementsChannel.subscription({ receivePresenceEvents: false })
    achievementsSubscription.onMessage = messageEvent => {
      processAchievementUpdate(messageEvent.message)
    }
    achievementsSubscription.subscribe()
    
    return () => {
      winnersSubscription.unsubscribe()
      achievementsSubscription.unsubscribe()
    }
  }, [chat])
  
  useEffect(() => {
    if (!chat) return
    if (isGuidedDemo) return
    
    // Fetch current standings and user profile
    Promise.all([
      chat.sdk.fetchMessages({
        channels: [goldJerseyWinnersChannelId],
        count: 10
      }),
      chat.sdk.fetchMessages({
        channels: [achievementsChannelId],
        count: 5
      })
    ]).then(([winnersResult, achievementsResult]) => {
      
      if (winnersResult?.channels[goldJerseyWinnersChannelId]) {
        const winners = winnersResult.channels[goldJerseyWinnersChannelId]
          .map(msg => msg.message)
          .filter(msg => msg.type === 'weeklyWinner' || msg.type === 'leaderboardUpdate')
          .map(msg => msg.data)
        
        const weeklyWinners = winners.filter((w: any) => w.category === 'weekly')
        const seasonData = winners.filter((w: any) => w.category === 'season')
        
        setCurrentWinners(weeklyWinners)
        setSeasonLeaders(seasonData)
      }
      
      if (achievementsResult?.channels[achievementsChannelId]) {
        const achievements = achievementsResult.channels[achievementsChannelId]
          .map(msg => msg.message)
          .filter(msg => msg.type === 'achievementUnlocked')
          .map(msg => msg.data)
        setRecentAchievements(achievements)
      }
    })
    
    // Get current user profile
    initializeUserProfile()
  }, [chat, isGuidedDemo])
  
  function processWinnerUpdate(message) {
    console.log('🏆 Winner Profile Widget received:', message.type, message)
    
    if (message.type === 'weeklyWinner') {
      setCurrentWinners(prev => {
        const existing = prev.find(w => w.userId === message.data.userId)
        if (existing) return prev
        return [message.data, ...prev.slice(0, 9)]
      })
    } else if (message.type === 'leaderboardUpdate') {
      if (message.period === 'season') {
        setSeasonLeaders(message.data)
      } else if (message.period === 'weekly') {
        // Handle weekly leaderboard updates (Gold Jersey Drama)
        console.log('📊 Updating weekly leaderboard with', message.data.length, 'participants')
        setCurrentWinners(message.data)
      }
    } else if (message.type === 'goldJerseyAwarded') {
      console.log('🥇 Gold Jersey awarded to', message.username)
      // Update user's gold jersey collection
      if (message.userId === chat?.currentUser?.id) {
        setUserProfile(prev => prev ? {
          ...prev,
          goldJerseys: [message.data, ...prev.goldJerseys]
        } : null)
      }
    } else if (message.type === 'competitionComplete') {
      // Handle competition finale celebration
      console.log('🎉 Competition Complete:', message.data)
    }
  }
  
  function processAchievementUpdate(message) {
    console.log('🎯 Achievement Update received:', message.type, message)
    
    if (message.type === 'achievementUnlocked') {
      console.log('🏅 Achievement unlocked:', message.data.name, `(${message.data.rarity})`)
      setRecentAchievements(prev => [message.data, ...prev.slice(0, 4)])
      
      // Update user profile if it's their achievement
      if (message.userId === chat?.currentUser?.id) {
        console.log('✨ Adding achievement to your profile:', message.data.name)
        setUserProfile(prev => prev ? {
          ...prev,
          achievements: [message.data, ...prev.achievements]
        } : null)
      }
    }
  }
  
  function initializeUserProfile() {
    if (!chat) return
    
    // Create/fetch user profile from App Context
    const userId = chat.currentUser.id
    setUserProfile({
      userId,
      username: chat.currentUser.name || 'Surf Fan',
      avatar: chat.currentUser.profileUrl || '/avatars/placeholder.png',
      rank: 127,
      totalPoints: 1234,
      weeklyWins: 2,
      goldJerseys: defaultGoldJerseys,
      achievements: defaultAchievements,
      stats: {
        fantasyWins: 5,
        pollAccuracy: 73.2,
        chatMessages: 248,
        predictionsCorrect: 28,
        streakRecord: 7,
        totalEvents: 12
      },
      badges: ['Rookie', 'Chat Master', 'Fantasy Player'],
      joinedDate: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
      lastActiveDate: Date.now()
    })
  }
  
  function openProfileModal(winner: WinnerProfile) {
    setSelectedWinner(winner)
    setShowProfileModal(true)
  }

  return (
    <div className={`${className}`}>
      <GuideOverlay
        id={'winnerProfileGuide'}
        guidesShown={guidesShown}
        visibleGuide={visibleGuide}
        setVisibleGuide={setVisibleGuide}
        text={
          <span>
            Showcase weekly winners and achievements using <span className='font-semibold'>PubNub App Context</span> for
            persistent user profiles. <span className='font-semibold'>Real-time notifications</span> announce new
            gold jersey winners and unlocked achievements across the community.
          </span>
        }
        xOffset={`right-[50px]`}
        yOffset={'top-[10px]'}
        flexStyle={'flex-row items-start'}
      />

      <div className='bg-gradient-to-br from-wsl-blue-50 to-wsl-blue-100 p-4 rounded-lg'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-yellow-500 rounded-full animate-pulse'></div>
            <h3 className='text-lg font-bold text-wsl-dark'>Gold Jersey</h3>
          </div>
          <div className='text-xs font-medium text-wsl-blue-600 bg-white px-2 py-1 rounded-full'>
            2024 Season
          </div>
        </div>
        
        {/* Recent Achievement Alert */}
        {recentAchievements.length > 0 && (
          <RecentAchievementAlert achievement={recentAchievements[0]} />
        )}
        
        {/* View Toggle */}
        <div className='flex mb-4 bg-white rounded-lg p-1'>
          {(['current', 'season', 'profile'] as const).map(view => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 transition-all ${
                selectedView === view
                  ? 'bg-wsl-primary text-white'
                  : 'text-wsl-blue-600 hover:bg-wsl-blue-50'
              }`}
            >
              {view === 'current' ? '👑 This Week' : view === 'season' ? '🏆 Season' : '👤 My Profile'}
            </button>
          ))}
        </div>

        {/* Content based on selected view */}
        {selectedView === 'current' && (
          <CurrentWinnersView
            winners={currentWinners}
            onProfileClick={openProfileModal}
            isMobilePreview={isMobilePreview}
          />
        )}
        
        {selectedView === 'season' && (
          <SeasonLeadersView
            leaders={seasonLeaders}
            onProfileClick={openProfileModal}
            isMobilePreview={isMobilePreview}
          />
        )}
        
        {selectedView === 'profile' && userProfile && (
          <UserProfileView
            profile={userProfile}
            isMobilePreview={isMobilePreview}
          />
        )}
      </div>
      
      {/* Profile Modal */}
      {showProfileModal && selectedWinner && (
        <ProfileDetailsModal
          profile={selectedWinner}
          onClose={() => {
            setShowProfileModal(false)
            setSelectedWinner(null)
          }}
        />
      )}
    </div>
  )
}

function RecentAchievementAlert({ achievement }) {
  return (
    <div className='bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-lg mb-4 text-white'>
      <div className='flex items-center gap-3'>
        <div className='text-2xl'>{achievement.icon}</div>
        <div className='flex-1'>
          <div className='font-bold text-sm'>{achievement.name}</div>
          <div className='text-xs opacity-90'>Recently unlocked by community members!</div>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full bg-white bg-opacity-20 ${
          achievement.rarity === 'legendary' ? 'animate-pulse' : ''
        }`}>
          {achievement.rarity.toUpperCase()}
        </div>
      </div>
    </div>
  )
}

function CurrentWinnersView({ winners, onProfileClick, isMobilePreview }) {
  const displayCount = isMobilePreview ? 3 : 5
  
  if (winners.length === 0) {
    return (
      <div className='bg-white rounded-lg p-6 text-center'>
        <div className='text-4xl mb-3'>👑</div>
        <div className='text-lg font-bold text-wsl-dark mb-2'>This Week's Champions</div>
        <div className='text-wsl-blue-600'>
          Gold Jersey winners will be announced after each contest
        </div>
      </div>
    )
  }
  
  return (
    <div className='space-y-3'>
      {winners.slice(0, displayCount).map((winner, index) => (
        <WinnerCard
          key={winner.userId}
          winner={winner}
          rank={index + 1}
          onClick={() => onProfileClick(winner)}
          isCurrentWinner={index === 0}
          isCompact={isMobilePreview}
        />
      ))}
    </div>
  )
}

function SeasonLeadersView({ leaders, onProfileClick, isMobilePreview }) {
  const displayCount = isMobilePreview ? 5 : 8
  
  return (
    <div className='space-y-3'>
      <div className='bg-white rounded-lg p-4 mb-4'>
        <h4 className='font-bold text-wsl-dark mb-2'>Season Standings</h4>
        <div className='text-sm text-wsl-blue-600'>
          Consistent performers earning gold jerseys throughout the 2024 season
        </div>
      </div>
      
      {defaultSeasonLeaders.slice(0, displayCount).map((leader, index) => (
        <LeaderboardCard
          key={leader.userId}
          leader={leader}
          rank={index + 1}
          onClick={() => onProfileClick(leader)}
          isCompact={isMobilePreview}
        />
      ))}
    </div>
  )
}

function UserProfileView({ profile, isMobilePreview }) {
  return (
    <div className='space-y-4'>
      {/* Profile Header */}
      <div className='bg-white rounded-lg p-4'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='relative'>
            <img 
              src={profile.avatar} 
              alt={profile.username}
              className='w-16 h-16 rounded-full object-cover border-4 border-yellow-400'
            />
            <div className='absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold'>
              #{profile.rank}
            </div>
          </div>
          <div className='flex-1'>
            <h4 className='text-xl font-bold text-wsl-dark'>{profile.username}</h4>
            <div className='flex items-center gap-2 mt-1'>
              {profile.badges.map(badge => (
                <span key={badge} className='text-xs bg-wsl-blue-100 text-wsl-blue-600 px-2 py-0.5 rounded-full'>
                  {badge}
                </span>
              ))}
            </div>
            <div className='text-sm text-wsl-blue-600 mt-2'>
              {profile.totalPoints.toLocaleString()} total points • {profile.weeklyWins} weekly wins
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className='grid grid-cols-3 gap-3 text-center'>
          <div>
            <div className='text-lg font-bold text-wsl-success'>{profile.stats.fantasyWins}</div>
            <div className='text-xs text-wsl-blue-600'>Fantasy Wins</div>
          </div>
          <div>
            <div className='text-lg font-bold text-wsl-primary'>{profile.stats.pollAccuracy}%</div>
            <div className='text-xs text-wsl-blue-600'>Prediction Accuracy</div>
          </div>
          <div>
            <div className='text-lg font-bold text-wsl-accent'>{profile.stats.streakRecord}</div>
            <div className='text-xs text-wsl-blue-600'>Best Streak</div>
          </div>
        </div>
      </div>
      
      {/* Gold Jerseys */}
      <div className='bg-white rounded-lg p-4'>
        <h4 className='font-bold text-wsl-dark mb-3'>🏆 Gold Jerseys ({profile.goldJerseys.length})</h4>
        {profile.goldJerseys.length === 0 ? (
          <div className='text-center py-4 text-wsl-blue-600'>
            Keep competing to earn your first gold jersey!
          </div>
        ) : (
          <div className='space-y-2'>
            {profile.goldJerseys.slice(0, isMobilePreview ? 2 : 4).map(jersey => (
              <GoldJerseyCard key={jersey.id} jersey={jersey} isCompact={isMobilePreview} />
            ))}
          </div>
        )}
      </div>
      
      {/* Recent Achievements */}
      <div className='bg-white rounded-lg p-4'>
        <h4 className='font-bold text-wsl-dark mb-3'>🎯 Achievements ({profile.achievements.length})</h4>
        <div className='grid grid-cols-2 gap-2'>
          {profile.achievements.slice(0, isMobilePreview ? 4 : 6).map(achievement => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </div>
  )
}

function WinnerCard({ winner, rank, onClick, isCurrentWinner, isCompact = false }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        isCurrentWinner ? 'border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-100' : 'border border-wsl-blue-200'
      }`}
    >
      <div className='flex items-center gap-3'>
        <div className='relative flex-shrink-0'>
          <img 
            src={winner.avatar} 
            alt={winner.username}
            className='w-12 h-12 rounded-full object-cover'
          />
          {isCurrentWinner && (
            <div className='absolute -top-1 -right-1 text-lg animate-bounce'>👑</div>
          )}
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            rank === 1 ? 'bg-yellow-500 text-white' :
            rank === 2 ? 'bg-gray-400 text-white' :
            rank === 3 ? 'bg-yellow-600 text-white' :
            'bg-wsl-blue-500 text-white'
          }`}>
            {rank}
          </div>
        </div>
        
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between'>
            <h4 className='font-bold text-wsl-dark truncate'>{winner.username}</h4>
            <div className='text-right'>
              <div className='text-lg font-bold text-wsl-primary'>
                {winner.totalPoints.toLocaleString()}
              </div>
              <div className='text-xs text-wsl-blue-600'>points</div>
            </div>
          </div>
          
          {!isCompact && (
            <div className='flex items-center gap-4 mt-2 text-sm'>
              <div className='text-wsl-blue-600'>
                <span className='font-medium'>{winner.weeklyWins}</span> weekly wins
              </div>
              <div className='text-wsl-blue-600'>
                <span className='font-medium'>{winner.goldJerseys.length}</span> gold jerseys
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LeaderboardCard({ leader, rank, onClick, isCompact = false }) {
  return (
    <div 
      onClick={onClick}
      className='bg-white rounded-lg p-3 border border-wsl-blue-200 cursor-pointer hover:shadow-md transition-all'
    >
      <div className='flex items-center gap-3'>
        <div className='flex-shrink-0 text-center'>
          <div className={`text-lg font-bold ${
            rank <= 3 ? 'text-yellow-600' : 'text-wsl-blue-600'
          }`}>
            #{rank}
          </div>
        </div>
        
        <img 
          src={leader.avatar} 
          alt={leader.username}
          className='w-10 h-10 rounded-full object-cover'
        />
        
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between'>
            <h5 className='font-bold text-wsl-dark truncate'>{leader.username}</h5>
            <div className='text-right'>
              <div className='text-sm font-bold text-wsl-primary'>
                {leader.totalPoints.toLocaleString()}
              </div>
              {!isCompact && (
                <div className='text-xs text-wsl-blue-600'>
                  {leader.goldJerseys.length} gold jerseys
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoldJerseyCard({ jersey, isCompact = false }) {
  const categoryColors = {
    'weekly-winner': 'bg-yellow-100 text-yellow-700',
    'season-champion': 'bg-purple-100 text-purple-700',
    'tournament-king': 'bg-blue-100 text-blue-700',
    'prediction-master': 'bg-green-100 text-green-700'
  }
  
  return (
    <div className='flex items-center gap-3 p-2 bg-wsl-blue-50 rounded-lg'>
      <div className='text-2xl'>🏆</div>
      <div className='flex-1'>
        <div className='font-bold text-wsl-dark text-sm'>{jersey.eventName}</div>
        <div className='text-xs text-wsl-blue-600'>{jersey.location}</div>
        {!isCompact && (
          <div className='flex items-center gap-2 mt-1'>
            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[jersey.category]}`}>
              {jersey.category.replace('-', ' ')}
            </span>
            <span className='text-xs text-wsl-blue-600'>
              {new Date(jersey.date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
      <div className='text-right'>
        <div className='font-bold text-wsl-primary text-sm'>{jersey.points}</div>
        <div className='text-xs text-wsl-blue-600'>pts</div>
      </div>
    </div>
  )
}

function AchievementBadge({ achievement }) {
  const rarityColors = {
    common: 'bg-gray-100 text-gray-700',
    rare: 'bg-blue-100 text-blue-700',
    epic: 'bg-purple-100 text-purple-700',
    legendary: 'bg-yellow-100 text-yellow-700'
  }
  
  return (
    <div className={`p-2 rounded-lg text-center ${rarityColors[achievement.rarity]}`}>
      <div className='text-lg mb-1'>{achievement.icon}</div>
      <div className='text-xs font-bold truncate'>{achievement.name}</div>
    </div>
  )
}

function ProfileDetailsModal({ profile, onClose }) {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-bold text-wsl-dark text-lg'>{profile.username}</h3>
          <button onClick={onClose} className='text-wsl-blue-600 hover:text-wsl-dark text-xl'>
            ✕
          </button>
        </div>
        
        <div className='text-center mb-6'>
          <img 
            src={profile.avatar} 
            alt={profile.username}
            className='w-20 h-20 rounded-full mx-auto mb-3 border-4 border-yellow-400'
          />
          <div className='text-2xl font-bold text-wsl-primary mb-1'>
            #{profile.rank}
          </div>
          <div className='text-lg font-bold text-wsl-dark'>
            {profile.totalPoints.toLocaleString()} Points
          </div>
        </div>
        
        <div className='grid grid-cols-2 gap-4 mb-6'>
          <div className='text-center'>
            <div className='text-lg font-bold text-wsl-success'>{profile.weeklyWins}</div>
            <div className='text-xs text-wsl-blue-600'>Weekly Wins</div>
          </div>
          <div className='text-center'>
            <div className='text-lg font-bold text-wsl-accent'>{profile.goldJerseys.length}</div>
            <div className='text-xs text-wsl-blue-600'>Gold Jerseys</div>
          </div>
          <div className='text-center'>
            <div className='text-lg font-bold text-wsl-primary'>{profile.achievements.length}</div>
            <div className='text-xs text-wsl-blue-600'>Achievements</div>
          </div>
          <div className='text-center'>
            <div className='text-lg font-bold text-wsl-dark'>{profile.stats.totalEvents}</div>
            <div className='text-xs text-wsl-blue-600'>Events</div>
          </div>
        </div>
        
        <div className='space-y-4'>
          <div>
            <h4 className='font-bold text-wsl-dark mb-2'>Recent Gold Jerseys</h4>
            <div className='space-y-2'>
              {profile.goldJerseys.slice(0, 3).map(jersey => (
                <div key={jersey.id} className='flex items-center justify-between p-2 bg-wsl-blue-50 rounded'>
                  <div>
                    <div className='font-medium text-wsl-dark text-sm'>{jersey.eventName}</div>
                    <div className='text-xs text-wsl-blue-600'>{jersey.location}</div>
                  </div>
                  <div className='text-sm font-bold text-wsl-primary'>{jersey.points} pts</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className='font-bold text-wsl-dark mb-2'>Top Achievements</h4>
            <div className='grid grid-cols-3 gap-2'>
              {profile.achievements.slice(0, 6).map(achievement => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Default data
const defaultGoldJerseys: GoldJersey[] = [
  {
    id: "jersey-1",
    eventName: "Sunset Beach Pro",
    location: "Hawaii",
    date: Date.now() - (7 * 24 * 60 * 60 * 1000),
    category: "weekly-winner",
    points: 2847,
    rank: 1,
    specialAchievement: "Perfect prediction streak"
  },
  {
    id: "jersey-2", 
    eventName: "Mavericks Challenge",
    location: "California",
    date: Date.now() - (14 * 24 * 60 * 60 * 1000),
    category: "prediction-master",
    points: 1923,
    rank: 3
  }
]

const defaultAchievements: Achievement[] = [
  {
    id: "first-win",
    name: "First Victory",
    description: "Won your first fantasy contest",
    icon: "🏆",
    rarity: "common",
    category: "fantasy",
    unlockedAt: Date.now() - (10 * 24 * 60 * 60 * 1000)
  },
  {
    id: "chat-master",
    name: "Chat Master",
    description: "Sent 100 messages in community chat",
    icon: "💬",
    rarity: "rare",
    category: "community",
    unlockedAt: Date.now() - (5 * 24 * 60 * 60 * 1000)
  },
  {
    id: "prediction-streak",
    name: "Oracle",
    description: "5 correct predictions in a row",
    icon: "🔮",
    rarity: "epic",
    category: "prediction",
    unlockedAt: Date.now() - (2 * 24 * 60 * 60 * 1000)
  }
]

const defaultSeasonLeaders: WinnerProfile[] = [
  {
    userId: "leader-1",
    username: "SurfKingHawaii",
    avatar: "/avatars/m/01.jpg",
    rank: 1,
    totalPoints: 15847,
    weeklyWins: 8,
    goldJerseys: [],
    achievements: [],
    stats: {
      fantasyWins: 12,
      pollAccuracy: 89.3,
      chatMessages: 1247,
      predictionsCorrect: 89,
      streakRecord: 12,
      totalEvents: 24
    },
    badges: ["Season Leader", "Pipeline Master", "Community Champion"],
    joinedDate: Date.now() - (120 * 24 * 60 * 60 * 1000),
    lastActiveDate: Date.now()
  },
  {
    userId: "leader-2",
    username: "WaveWizard2024",
    avatar: "/avatars/f/01.jpg",
    rank: 2,
    totalPoints: 13962,
    weeklyWins: 6,
    goldJerseys: [],
    achievements: [],
    stats: {
      fantasyWins: 9,
      pollAccuracy: 84.7,
      chatMessages: 892,
      predictionsCorrect: 76,
      streakRecord: 8,
      totalEvents: 22
    },
    badges: ["Prediction Pro", "Fantasy Expert"],
    joinedDate: Date.now() - (90 * 24 * 60 * 60 * 1000),
    lastActiveDate: Date.now()
  }
]
