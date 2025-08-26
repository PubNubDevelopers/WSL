'use client'

import { useState, useEffect, useRef } from 'react'
import GuideOverlay from '../components/guideOverlay'
import Alert from '../components/alert'
import { propPickemChannelId, AlertType } from '../data/constants'

export default function PropPickemWidget ({
  className,
  isMobilePreview,
  chat,
  isGuidedDemo,
  guidesShown,
  visibleGuide,
  setVisibleGuide,
  awardPoints
}) {
  const [currentProp, setCurrentProp] = useState(null)
  const [userStats, setUserStats] = useState({
    streak: 0,
    xp: 0,
    totalPicks: 0,
    correctPicks: 0,
    winPercentage: 0
  })
  const [timeLeft, setTimeLeft] = useState(0)
  const [alert, setAlert] = useState(null)
  const [isVoting, setIsVoting] = useState(false)
  const [recentResults, setRecentResults] = useState([])
  
  const timerRef = useRef(null)
  const userStatsRef = useRef(userStats)
  
  useEffect(() => {
    userStatsRef.current = userStats
  }, [userStats])

  useEffect(() => {
    if (!chat) return
    const channel = chat.sdk.channel(propPickemChannelId)
    const subscription = channel.subscription({ receivePresenceEvents: false })
    subscription.onMessage = messageEvent => {
      handlePropMessage(messageEvent.message)
    }
    subscription.subscribe()
    return () => {
      subscription.unsubscribe()
    }
  }, [chat])

  useEffect(() => {
    if (!chat) return
    if (isGuidedDemo) return
    chat.sdk
      .fetchMessages({
        channels: [propPickemChannelId],
        count: 1
      })
      .then(result => {
        if (result && result.channels[propPickemChannelId]) {
          const previousProp = result.channels[propPickemChannelId][0]
          if (previousProp) {
            handlePropMessage(previousProp.message)
          }
        }
      })
  }, [chat, isGuidedDemo])

  function handlePropMessage(message) {
    if (message.type === 'newProp') {
      const newProp = {
        ...message,
        answered: false,
        isOpen: true,
        userChoice: null
      }
      setCurrentProp(newProp)
      setTimeLeft(message.timeWindow || 60) // Default 60 seconds
      startCountdown(message.timeWindow || 60)
      showPropAlert(`New prediction: ${message.question}`)
    } else if (message.type === 'propResult') {
      handlePropResult(message)
    }
  }

  function startCountdown(seconds) {
    if (timerRef.current) clearInterval(timerRef.current)
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          // Auto-close voting if time runs out
          setCurrentProp(prev => prev ? { ...prev, isOpen: false } : null)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function handlePropResult(result) {
    if (!currentProp || currentProp.id !== result.propId) return

    const isCorrect = currentProp.userChoice === result.correctAnswer
    const participationXP = 5 // Base XP for participating
    const correctXP = isCorrect ? 15 : 0 // Bonus XP for correct answer
    const streakBonus = isCorrect && userStatsRef.current.streak >= 2 ? userStatsRef.current.streak * 5 : 0
    
    const totalXP = participationXP + correctXP + streakBonus
    const pointsAwarded = isCorrect ? (result.points || 10) : 2 // Consolation points

    // Update user stats
    setUserStats(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0
      const newTotalPicks = prev.totalPicks + 1
      const newCorrectPicks = isCorrect ? prev.correctPicks + 1 : prev.correctPicks
      const newWinPercentage = Math.round((newCorrectPicks / newTotalPicks) * 100)
      
      return {
        streak: newStreak,
        xp: prev.xp + totalXP,
        totalPicks: newTotalPicks,
        correctPicks: newCorrectPicks,
        winPercentage: newWinPercentage
      }
    })

    // Award points
    if (isCorrect) {
      awardPoints(pointsAwarded, `Correct prediction! ${streakBonus > 0 ? `+${streakBonus} streak bonus!` : ''}`)
    } else {
      awardPoints(pointsAwarded, 'Good try! +2 consolation points')
    }

    // Update recent results
    setRecentResults(prev => [{
      id: result.propId,
      question: currentProp.question,
      userChoice: currentProp.userChoice,
      correctAnswer: result.correctAnswer,
      isCorrect,
      timestamp: Date.now()
    }, ...prev.slice(0, 4)]) // Keep last 5 results

    // Close the current prop
    setCurrentProp(prev => ({ ...prev, isOpen: false, result: result.correctAnswer }))
    
    // Clear timer
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function submitPick(choice) {
    if (!currentProp || !currentProp.isOpen || isVoting) return
    
    setIsVoting(true)
    setCurrentProp(prev => ({ ...prev, userChoice: choice, answered: true }))
    
    // Publish vote
    chat.sdk.publish({
      channel: propPickemChannelId,
      message: {
        type: 'propVote',
        propId: currentProp.id,
        choice: choice,
        userId: chat.currentUser.id
      }
    })

    setTimeout(() => setIsVoting(false), 500)
  }

  function showPropAlert(message) {
    setAlert({ points: null, body: message })
    setTimeout(() => setAlert(null), 3000)
  }

  function formatTime(seconds) {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  return (
    <div className={`${className} px-6 pt-3 pb-4`}>
      {alert && (
        <Alert
          type={AlertType.NEW_POLL}
          message={alert}
          onClose={() => setAlert(null)}
        />
      )}
      
      <GuideOverlay
        id={'propPickemGuide'}
        guidesShown={guidesShown}
        visibleGuide={visibleGuide}
        setVisibleGuide={setVisibleGuide}
        text={
          <span>
            Prop picks use <span className='font-semibold'>PubNub Signals</span> for instant
            predictions and real-time voting. <span className='font-semibold'>Functions</span> handle
            automatic settlement, while <span className='font-semibold'>App Context</span> tracks
            user streaks and XP progression.
          </span>
        }
        xOffset={`${isMobilePreview ? 'left-[0px]' : '-left-[60px]'}`}
        yOffset={''}
        flexStyle={'flex-row items-start'}
      />

      <div className='bg-gradient-to-br from-wsl-blue-50 to-wsl-accent-light p-4 rounded-lg'>
        {/* Header with stats */}
        <PropPickemHeader userStats={userStats} />
        
        {/* Current prop or recent results */}
        {currentProp ? (
          <CurrentProp 
            prop={currentProp}
            timeLeft={timeLeft}
            onSubmitPick={submitPick}
            isVoting={isVoting}
          />
        ) : (
          <NoPropAvailable recentResults={recentResults} />
        )}

        {/* Recent results if no current prop */}
        {!currentProp && recentResults.length > 0 && (
          <RecentResults results={recentResults.slice(0, 3)} />
        )}
      </div>
    </div>
  )
}

function PropPickemHeader({ userStats }) {
  return (
    <div className='flex items-center justify-between mb-4'>
      <div className='flex items-center gap-2'>
        <div className='w-3 h-3 bg-wsl-warning rounded-full animate-pulse'></div>
        <h3 className='text-lg font-bold text-wsl-dark'>Prop Picks</h3>
      </div>
      <div className='flex items-center gap-4 text-xs'>
        <div className='text-center'>
          <div className='font-bold text-wsl-primary'>{userStats.streak}</div>
          <div className='text-wsl-blue-600'>Streak</div>
        </div>
        <div className='text-center'>
          <div className='font-bold text-wsl-accent'>{userStats.xp}</div>
          <div className='text-wsl-blue-600'>XP</div>
        </div>
        <div className='text-center'>
          <div className='font-bold text-wsl-success'>{userStats.winPercentage}%</div>
          <div className='text-wsl-blue-600'>Win Rate</div>
        </div>
      </div>
    </div>
  )
}

function CurrentProp({ prop, timeLeft, onSubmitPick, isVoting }) {
  if (!prop.isOpen && prop.result !== undefined) {
    return <PropResult prop={prop} />
  }

  if (!prop.isOpen) {
    return (
      <div className='bg-white rounded-lg p-4 text-center'>
        <div className='text-wsl-blue-600 mb-2'>⏱️ Voting Closed</div>
        <div className='font-medium text-wsl-dark'>{prop.question}</div>
        <div className='text-sm text-wsl-blue-600 mt-2'>
          Your pick: <span className='font-bold'>{prop.userChoice}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-lg p-4 border-2 border-wsl-warning'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <span className='text-lg'>🏄‍♂️</span>
          <span className='font-bold text-wsl-dark'>Live Prediction</span>
        </div>
        <div className='text-right'>
          <div className={`font-bold text-lg ${timeLeft <= 10 ? 'text-wsl-warning animate-pulse' : 'text-wsl-primary'}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div className='text-xs text-wsl-blue-600'>time left</div>
        </div>
      </div>

      <div className='mb-4'>
        <h4 className='font-bold text-wsl-dark mb-2'>{prop.question}</h4>
        {prop.context && (
          <p className='text-sm text-wsl-blue-600 mb-3'>{prop.context}</p>
        )}
      </div>

      {!prop.answered ? (
        <div className='grid grid-cols-1 gap-2'>
          {prop.options.map((option, index) => (
            <PropOption
              key={index}
              option={option}
              onClick={() => onSubmitPick(option.value)}
              disabled={isVoting}
            />
          ))}
        </div>
      ) : (
        <div className='text-center py-3'>
          <div className='text-wsl-success font-bold mb-1'>✓ Pick Submitted!</div>
          <div className='text-sm text-wsl-blue-600'>
            You chose: <span className='font-bold'>{prop.userChoice}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function PropOption({ option, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className='p-3 text-left border border-wsl-blue-200 rounded-lg hover:bg-wsl-blue-50 hover:border-wsl-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed'
    >
      <div className='flex items-center justify-between'>
        <span className='font-medium text-wsl-dark'>{option.text}</span>
        {option.odds && (
          <span className='text-sm text-wsl-blue-600 font-mono'>{option.odds}</span>
        )}
      </div>
    </button>
  )
}

function PropResult({ prop }) {
  const isCorrect = prop.userChoice === prop.result
  
  return (
    <div className='bg-white rounded-lg p-4 border-l-4 border-wsl-success'>
      <div className='flex items-center gap-3 mb-3'>
        <div className={`text-2xl ${isCorrect ? '🎉' : '😔'}`}>
          {isCorrect ? '🎉' : '😔'}
        </div>
        <div>
          <h4 className='font-bold text-wsl-dark'>{prop.question}</h4>
          <div className={`text-sm font-medium ${isCorrect ? 'text-wsl-success' : 'text-wsl-warning'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </div>
        </div>
      </div>
      
      <div className='grid grid-cols-2 gap-4 text-sm'>
        <div>
          <div className='text-wsl-blue-600'>Your pick:</div>
          <div className='font-bold text-wsl-dark'>{prop.userChoice}</div>
        </div>
        <div>
          <div className='text-wsl-blue-600'>Actual result:</div>
          <div className='font-bold text-wsl-primary'>{prop.result}</div>
        </div>
      </div>
    </div>
  )
}

function NoPropAvailable({ recentResults }) {
  return (
    <div className='bg-white rounded-lg p-6 text-center'>
      <div className='text-4xl mb-3'>🌊</div>
      <div className='text-lg font-bold text-wsl-dark mb-2'>No Active Predictions</div>
      <div className='text-wsl-blue-600 mb-4'>
        New surf predictions drop throughout the heat - stay tuned!
      </div>
      {recentResults.length > 0 && (
        <div className='text-sm text-wsl-blue-600'>
          Check your recent picks below
        </div>
      )}
    </div>
  )
}

function RecentResults({ results }) {
  return (
    <div className='mt-4'>
      <h4 className='font-bold text-wsl-dark mb-3'>Recent Picks</h4>
      <div className='space-y-2'>
        {results.map((result, index) => (
          <div 
            key={result.id} 
            className='bg-white rounded-lg p-3 flex items-center justify-between'
          >
            <div className='flex-1'>
              <div className='font-medium text-sm text-wsl-dark truncate'>
                {result.question}
              </div>
              <div className='text-xs text-wsl-blue-600'>
                Picked: {result.userChoice} | Actual: {result.correctAnswer}
              </div>
            </div>
            <div className={`text-lg ${result.isCorrect ? '✅' : '❌'}`}>
              {result.isCorrect ? '✅' : '❌'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
