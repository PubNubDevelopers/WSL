'use client'

import { useState, useEffect, useRef } from 'react'
import GuideOverlay from '../components/guideOverlay'
import { qnaSubmissionsChannelId, qnaFeaturedChannelId, announcerResponsesChannelId } from '../data/constants'

interface QnAQuestion {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  question: string;
  timestamp: number;
  votes: number;
  hasVoted: boolean;
  status: 'pending' | 'featured' | 'answered' | 'dismissed';
  category: 'general' | 'technical' | 'surfer' | 'conditions';
  priority: 'low' | 'medium' | 'high';
}

interface AnnouncerResponse {
  id: string;
  questionId: string;
  announcerName: string;
  response: string;
  timestamp: number;
  isLive: boolean;
}

export default function AnnouncerQnAWidget ({
  className,
  isMobilePreview,
  chat,
  isGuidedDemo,
  guidesShown,
  visibleGuide,
  setVisibleGuide
}) {
  const [questions, setQuestions] = useState<QnAQuestion[]>([])
  const [featuredQuestions, setFeaturedQuestions] = useState<QnAQuestion[]>([])
  const [responses, setResponses] = useState<AnnouncerResponse[]>([])
  const [selectedView, setSelectedView] = useState<'submit' | 'featured' | 'answered'>('submit')
  const [newQuestion, setNewQuestion] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'general' | 'technical' | 'surfer' | 'conditions'>('general')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [liveResponse, setLiveResponse] = useState(null)
  
  const questionInputRef = useRef(null)
  
  useEffect(() => {
    if (!chat) return
    
    // Subscribe to Q&A submissions (all questions)
    const submissionsChannel = chat.sdk.channel(qnaSubmissionsChannelId)
    const submissionsSubscription = submissionsChannel.subscription({ receivePresenceEvents: false })
    submissionsSubscription.onMessage = messageEvent => {
      if (messageEvent.message.type === 'newQuestion') {
        processNewQuestion(messageEvent.message.data)
      } else if (messageEvent.message.type === 'questionUpdate') {
        processQuestionUpdate(messageEvent.message.data)
      }
    }
    submissionsSubscription.subscribe()
    
    // Subscribe to featured questions
    const featuredChannel = chat.sdk.channel(qnaFeaturedChannelId)
    const featuredSubscription = featuredChannel.subscription({ receivePresenceEvents: false })
    featuredSubscription.onMessage = messageEvent => {
      if (messageEvent.message.type === 'questionFeatured') {
        processFeaturedQuestion(messageEvent.message.data)
      }
    }
    featuredSubscription.subscribe()
    
    // Subscribe to announcer responses  
    const responsesChannel = chat.sdk.channel(announcerResponsesChannelId)
    const responsesSubscription = responsesChannel.subscription({ receivePresenceEvents: false })
    responsesSubscription.onMessage = messageEvent => {
      if (messageEvent.message.type === 'announcerResponse') {
        processAnnouncerResponse(messageEvent.message.data)
      } else if (messageEvent.message.type === 'liveResponse') {
        setLiveResponse(messageEvent.message.data)
        setTimeout(() => setLiveResponse(null), 10000) // Auto-clear after 10s
      }
    }
    responsesSubscription.subscribe()
    
    return () => {
      submissionsSubscription.unsubscribe()
      featuredSubscription.unsubscribe()
      responsesSubscription.unsubscribe()
    }
  }, [chat])
  
  useEffect(() => {
    if (!chat) return
    if (isGuidedDemo) return
    
    // Fetch recent questions and responses on mount
    Promise.all([
      chat.sdk.fetchMessages({
        channels: [qnaSubmissionsChannelId],
        count: 20
      }),
      chat.sdk.fetchMessages({
        channels: [qnaFeaturedChannelId], 
        count: 10
      }),
      chat.sdk.fetchMessages({
        channels: [announcerResponsesChannelId],
        count: 10
      })
    ]).then(([submissionsResult, featuredResult, responsesResult]) => {
      
      // Process submissions
      if (submissionsResult?.channels[qnaSubmissionsChannelId]) {
        const submissions = submissionsResult.channels[qnaSubmissionsChannelId]
          .map(msg => msg.message)
          .filter(msg => msg.type === 'newQuestion')
          .map(msg => msg.data)
        setQuestions(submissions)
      }
      
      // Process featured
      if (featuredResult?.channels[qnaFeaturedChannelId]) {
        const featured = featuredResult.channels[qnaFeaturedChannelId]
          .map(msg => msg.message)
          .filter(msg => msg.type === 'questionFeatured')
          .map(msg => msg.data)
        setFeaturedQuestions(featured)
      }
      
      // Process responses
      if (responsesResult?.channels[announcerResponsesChannelId]) {
        const responses = responsesResult.channels[announcerResponsesChannelId]
          .map(msg => msg.message)
          .filter(msg => msg.type === 'announcerResponse')
          .map(msg => msg.data)
        setResponses(responses)
      }
    })
  }, [chat, isGuidedDemo])
  
  function processNewQuestion(questionData: QnAQuestion) {
    setQuestions(prev => {
      const exists = prev.find(q => q.id === questionData.id)
      if (exists) return prev
      return [questionData, ...prev].slice(0, 50) // Keep latest 50
    })
  }
  
  function processQuestionUpdate(questionData: Partial<QnAQuestion> & {id: string}) {
    setQuestions(prev => prev.map(q => 
      q.id === questionData.id ? { ...q, ...questionData } : q
    ))
  }
  
  function processFeaturedQuestion(questionData: QnAQuestion) {
    setFeaturedQuestions(prev => {
      const exists = prev.find(q => q.id === questionData.id)
      if (exists) return prev
      return [questionData, ...prev].slice(0, 10) // Keep latest 10 featured
    })
  }
  
  function processAnnouncerResponse(responseData: AnnouncerResponse) {
    setResponses(prev => {
      const exists = prev.find(r => r.id === responseData.id)
      if (exists) return prev
      return [responseData, ...prev].slice(0, 20) // Keep latest 20 responses
    })
    
    // Mark question as answered
    setQuestions(prev => prev.map(q => 
      q.id === responseData.questionId ? { ...q, status: 'answered' } : q
    ))
    setFeaturedQuestions(prev => prev.map(q => 
      q.id === responseData.questionId ? { ...q, status: 'answered' } : q
    ))
  }
  
  function submitQuestion() {
    if (!chat || !newQuestion.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    
    const question: QnAQuestion = {
      id: `qna-${Date.now()}`,
      userId: chat.currentUser.id,
      username: chat.currentUser.name || 'Anonymous',
      userAvatar: chat.currentUser.profileUrl || '/avatars/placeholder.png',
      question: newQuestion.trim(),
      timestamp: Date.now(),
      votes: 0,
      hasVoted: false,
      status: 'pending',
      category: selectedCategory,
      priority: 'medium'
    }
    
    // Optimistically add to local state
    setQuestions(prev => [question, ...prev])
    
    // Publish to backend
    chat.sdk.publish({
      channel: qnaSubmissionsChannelId,
      message: {
        type: 'newQuestion',
        data: question
      }
    }).then(() => {
      setNewQuestion('')
      setIsSubmitting(false)
      if (questionInputRef.current) {
        questionInputRef.current.blur()
      }
    }).catch(() => {
      // Remove from local state on error
      setQuestions(prev => prev.filter(q => q.id !== question.id))
      setIsSubmitting(false)
    })
  }
  
  function voteForQuestion(questionId: string) {
    if (!chat) return
    
    const question = questions.find(q => q.id === questionId)
    if (!question || question.hasVoted) return
    
    // Optimistically update
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, votes: q.votes + 1, hasVoted: true }
        : q
    ))
    
    // Publish vote
    chat.sdk.publish({
      channel: qnaSubmissionsChannelId,
      message: {
        type: 'voteQuestion',
        questionId,
        userId: chat.currentUser.id
      }
    })
  }
  
  const categoryOptions = [
    { value: 'general', label: '🗣️ General', color: 'bg-blue-100 text-blue-700' },
    { value: 'technical', label: '🏄‍♂️ Technical', color: 'bg-green-100 text-green-700' },
    { value: 'surfer', label: '👤 Surfer', color: 'bg-purple-100 text-purple-700' },
    { value: 'conditions', label: '🌊 Conditions', color: 'bg-cyan-100 text-cyan-700' }
  ]

  return (
    <div className={`${className}`}>
      <GuideOverlay
        id={'qnaGuide'}
        guidesShown={guidesShown}
        visibleGuide={visibleGuide}
        setVisibleGuide={setVisibleGuide}
        text={
          <span>
            Submit questions to the broadcast team using <span className='font-semibold'>PubNub Messaging</span>.
            Questions are moderated and upvoted by the community, then <span className='font-semibold'>featured live</span> 
            during the broadcast with real-time announcer responses.
          </span>
        }
        xOffset={`right-[50px]`}
        yOffset={'top-[10px]'}
        flexStyle={'flex-row items-start'}
      />

      <div className='bg-gradient-to-br from-wsl-blue-50 to-wsl-blue-100 p-4 rounded-lg'>
        {/* Live Response Alert */}
        {liveResponse && (
          <LiveResponseAlert response={liveResponse} />
        )}
        
        {/* Header with view toggle */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-wsl-success rounded-full animate-pulse'></div>
            <h3 className='text-lg font-bold text-wsl-dark'>Q&A Live</h3>
          </div>
          <div className='text-xs font-medium text-wsl-blue-600 bg-white px-2 py-1 rounded-full'>
            Pipeline Masters
          </div>
        </div>
        
        {/* View Toggle */}
        <div className='flex mb-4 bg-white rounded-lg p-1'>
          {(['submit', 'featured', 'answered'] as const).map(view => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 transition-all ${
                selectedView === view
                  ? 'bg-wsl-primary text-white'
                  : 'text-wsl-blue-600 hover:bg-wsl-blue-50'
              }`}
            >
              {view === 'submit' ? '💬 Submit' : view === 'featured' ? '⭐ Featured' : '✅ Answered'}
            </button>
          ))}
        </div>

        {/* Content based on selected view */}
        {selectedView === 'submit' && (
          <SubmitQuestionView 
            questions={questions}
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categoryOptions={categoryOptions}
            isSubmitting={isSubmitting}
            onSubmit={submitQuestion}
            onVote={voteForQuestion}
            questionInputRef={questionInputRef}
            isMobilePreview={isMobilePreview}
          />
        )}
        
        {selectedView === 'featured' && (
          <FeaturedQuestionsView 
            featuredQuestions={featuredQuestions}
            isMobilePreview={isMobilePreview}
          />
        )}
        
        {selectedView === 'answered' && (
          <AnsweredQuestionsView 
            responses={responses}
            questions={[...questions, ...featuredQuestions]}
            isMobilePreview={isMobilePreview}
          />
        )}
      </div>
    </div>
  )
}

function LiveResponseAlert({ response }) {
  return (
    <div className='bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg mb-4 text-white animate-pulse'>
      <div className='flex items-start gap-3'>
        <div className='flex-shrink-0'>
          <div className='w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center'>
            <span className='text-sm font-bold'>🎙️</span>
          </div>
        </div>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-1'>
            <span className='font-bold'>{response.announcerName}</span>
            <span className='text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full'>LIVE</span>
          </div>
          <p className='text-sm opacity-90'>{response.response}</p>
        </div>
      </div>
    </div>
  )
}

function SubmitQuestionView({ 
  questions, 
  newQuestion, 
  setNewQuestion, 
  selectedCategory, 
  setSelectedCategory,
  categoryOptions,
  isSubmitting,
  onSubmit,
  onVote,
  questionInputRef,
  isMobilePreview 
}) {
  const userQuestions = questions.filter(q => q.status === 'pending').slice(0, isMobilePreview ? 3 : 5)
  
  return (
    <div className='space-y-4'>
      {/* Question Submission Form */}
      <div className='bg-white rounded-lg p-4'>
        <h4 className='font-bold text-wsl-dark mb-3'>Ask the Broadcast Team</h4>
        
        {/* Category Selection */}
        <div className='mb-3'>
          <label className='block text-sm font-medium text-wsl-dark mb-2'>Category</label>
          <div className='flex gap-2 flex-wrap'>
            {categoryOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedCategory(option.value as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === option.value
                    ? 'bg-wsl-primary text-white'
                    : `${option.color} hover:opacity-80`
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Question Input */}
        <div className='mb-3'>
          <textarea
            ref={questionInputRef}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask about surf conditions, technique, strategy, or anything surf-related..."
            className='w-full px-3 py-2 border border-wsl-blue-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-wsl-primary focus:border-transparent'
            rows={3}
            maxLength={280}
          />
          <div className='text-right text-xs text-wsl-blue-600 mt-1'>
            {newQuestion.length}/280 characters
          </div>
        </div>
        
        <button
          onClick={onSubmit}
          disabled={!newQuestion.trim() || isSubmitting}
          className='w-full bg-wsl-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-wsl-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSubmitting ? 'Submitting...' : 'Submit Question'}
        </button>
      </div>
      
      {/* Recent Questions */}
      {userQuestions.length > 0 && (
        <div className='bg-white rounded-lg p-4'>
          <h4 className='font-bold text-wsl-dark mb-3'>Recent Questions</h4>
          <div className='space-y-3'>
            {userQuestions.map(question => (
              <QuestionCard 
                key={question.id}
                question={question}
                onVote={onVote}
                showActions={true}
                categoryOptions={categoryOptions}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FeaturedQuestionsView({ featuredQuestions, isMobilePreview }) {
  const displayCount = isMobilePreview ? 4 : 6
  
  if (featuredQuestions.length === 0) {
    return (
      <div className='bg-white rounded-lg p-6 text-center'>
        <div className='text-4xl mb-3'>⭐</div>
        <div className='text-lg font-bold text-wsl-dark mb-2'>No Featured Questions Yet</div>
        <div className='text-wsl-blue-600'>
          Questions with high community votes get featured by the broadcast team
        </div>
      </div>
    )
  }
  
  return (
    <div className='space-y-3'>
      {featuredQuestions.slice(0, displayCount).map(question => (
        <div key={question.id} className='bg-white rounded-lg p-4 border-l-4 border-wsl-warning'>
          <QuestionCard 
            question={question}
            onVote={() => {}}
            showActions={false}
            categoryOptions={[]}
            isFeatured={true}
          />
        </div>
      ))}
    </div>
  )
}

function AnsweredQuestionsView({ responses, questions, isMobilePreview }) {
  const displayCount = isMobilePreview ? 3 : 5
  
  if (responses.length === 0) {
    return (
      <div className='bg-white rounded-lg p-6 text-center'>
        <div className='text-4xl mb-3'>🎙️</div>
        <div className='text-lg font-bold text-wsl-dark mb-2'>No Answers Yet</div>
        <div className='text-wsl-blue-600'>
          Answered questions from the broadcast team will appear here
        </div>
      </div>
    )
  }
  
  return (
    <div className='space-y-4'>
      {responses.slice(0, displayCount).map(response => {
        const originalQuestion = questions.find(q => q.id === response.questionId)
        
        return (
          <div key={response.id} className='bg-white rounded-lg p-4 border-l-4 border-wsl-success'>
            <div className='mb-3'>
              <div className='flex items-center gap-2 mb-2'>
                <img 
                  src={originalQuestion?.userAvatar || '/avatars/placeholder.png'} 
                  alt={originalQuestion?.username || 'User'}
                  className='w-6 h-6 rounded-full'
                />
                <span className='font-medium text-wsl-dark text-sm'>
                  {originalQuestion?.username || 'Anonymous'}
                </span>
                <span className='text-xs text-wsl-blue-600'>asked:</span>
              </div>
              <p className='text-wsl-dark text-sm bg-wsl-blue-50 p-2 rounded-md'>
                {originalQuestion?.question || 'Question not found'}
              </p>
            </div>
            
            <div className='border-t border-wsl-blue-200 pt-3'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='w-6 h-6 bg-wsl-success rounded-full flex items-center justify-center'>
                  <span className='text-white text-xs font-bold'>🎙️</span>
                </div>
                <span className='font-bold text-wsl-success'>{response.announcerName}</span>
                <span className='text-xs text-wsl-blue-600'>
                  {new Date(response.timestamp).toLocaleTimeString()}
                </span>
                {response.isLive && (
                  <span className='text-xs bg-red-500 text-white px-2 py-0.5 rounded-full'>
                    LIVE
                  </span>
                )}
              </div>
              <p className='text-wsl-dark'>{response.response}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function QuestionCard({ question, onVote, showActions, categoryOptions, isFeatured = false }) {
  const categoryOption = categoryOptions.find(c => c.value === question.category)
  
  return (
    <div className='space-y-2'>
      <div className='flex items-start gap-3'>
        <img 
          src={question.userAvatar} 
          alt={question.username}
          className='w-8 h-8 rounded-full flex-shrink-0'
        />
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <span className='font-medium text-wsl-dark text-sm'>{question.username}</span>
            {categoryOption && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryOption.color}`}>
                {categoryOption.label}
              </span>
            )}
            {isFeatured && (
              <span className='text-xs bg-wsl-warning text-white px-2 py-0.5 rounded-full'>
                ⭐ FEATURED
              </span>
            )}
            <span className='text-xs text-wsl-blue-600'>
              {new Date(question.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className='text-wsl-dark text-sm'>{question.question}</p>
          
          {showActions && (
            <div className='flex items-center gap-4 mt-2'>
              <button
                onClick={() => onVote(question.id)}
                disabled={question.hasVoted}
                className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                  question.hasVoted 
                    ? 'text-wsl-success cursor-not-allowed' 
                    : 'text-wsl-blue-600 hover:text-wsl-primary'
                }`}
              >
                <span>{question.hasVoted ? '👍' : '👍'}</span>
                <span>{question.votes}</span>
                {question.hasVoted && <span>✓</span>}
              </button>
              
              <div className={`text-xs px-2 py-0.5 rounded-full ${
                question.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                question.status === 'featured' ? 'bg-blue-100 text-blue-700' :
                question.status === 'answered' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
