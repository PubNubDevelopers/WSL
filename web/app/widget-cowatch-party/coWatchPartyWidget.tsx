'use client'

import { useState, useEffect, useRef } from 'react'
import GuideOverlay from '../components/guideOverlay'
import { Chat, User, Channel, Message } from '@pubnub/chat'
import { testUsers } from '../data/constants'

interface CoWatchPartyWidgetProps {
  className: string
  isMobilePreview: boolean
  chat: Chat
  isGuidedDemo: boolean
  guidesShown: boolean
  visibleGuide: string
  setVisibleGuide: (guide: string) => void
}

interface WatchParty {
  id: string
  name: string
  hostId: string
  hostName: string
  members: string[]
  memberCount: number
  isPrivate: boolean
  createdAt: string
}

interface PartyInvite {
  id: string
  fromUserId: string
  fromUserName: string
  partyId: string
  partyName: string
  timestamp: string
}

export default function CoWatchPartyWidget({
  className,
  isMobilePreview,
  chat,
  isGuidedDemo,
  guidesShown,
  visibleGuide,
  setVisibleGuide
}: CoWatchPartyWidgetProps) {
  // Party state
  const [currentParty, setCurrentParty] = useState<WatchParty | null>(null)
  const [availableParties, setAvailableParties] = useState<WatchParty[]>([])
  const [pendingInvites, setPendingInvites] = useState<PartyInvite[]>([])
  
  // UI state
  const [showCreateParty, setShowCreateParty] = useState(false)
  const [showInviteFriends, setShowInviteFriends] = useState(false)
  const [partyName, setPartyName] = useState('')
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  
  // Real-time reactions state
  const [recentReactions, setRecentReactions] = useState<{emoji: string, userId: string, userName: string, timestamp: number}[]>([])
  const [partyChannel, setPartyChannel] = useState<Channel | null>(null)
  
  // Chat messaging state
  const [chatMessages, setChatMessages] = useState<{id: string, userId: string, userName: string, message: string, timestamp: number, avatar?: string}[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showChat, setShowChat] = useState(false)
  
  // WSL Surf-themed emoji reactions for watch parties
  const partyEmojis = ['🤙', '🏄‍♂️', '🌊', '🔥', '💯', '😤', '🚀', '⚡']

  const messagesContainerRef = useRef<HTMLDivElement>(null)

  /**
   * Initialize party system when chat is available
   */
  useEffect(() => {
    if (!chat) return

    const initializeParty = async () => {
      // Load existing parties and invites
      loadAvailableParties()
      loadPendingInvites()

      // Check if user is already in a party
      await checkExistingPartyMembership()
    }
    
    initializeParty()

  }, [chat])

  /**
   * Auto-scroll chat messages to bottom when new messages arrive
   */
  useEffect(() => {
    if (messagesContainerRef.current && showChat) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [chatMessages, showChat])



  /**
   * Load available public watch parties
   */
  const loadAvailableParties = async () => {
    // Simulate some active watch parties for the demo
    const demoParties: WatchParty[] = [
      {
        id: 'party-pipeline-crew',
        name: 'Pipeline Crew 🌊',
        hostId: 'user-01',
        hostName: 'Alex Carter',
        members: ['user-01', 'user-03', 'user-15'],
        memberCount: 3,
        isPrivate: false,
        createdAt: new Date(Date.now() - 1800000).toISOString() // 30 mins ago
      },
      {
        id: 'party-wsl-fans',
        name: 'WSL Championship Watch',
        hostId: 'user-05',
        hostName: 'Chris Johnson',
        members: ['user-05', 'user-12', 'user-23', 'user-28'],
        memberCount: 4,
        isPrivate: false,
        createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: 'party-surf-legends',
        name: 'Surf Legends United 🏆',
        hostId: 'user-18',
        hostName: 'Grace Lewis',
        members: ['user-18', 'user-21', 'user-33'],
        memberCount: 3,
        isPrivate: true,
        createdAt: new Date(Date.now() - 900000).toISOString() // 15 mins ago
      }
    ]
    
    setAvailableParties(demoParties)
  }

  /**
   * Load pending party invitations for current user
   */
  const loadPendingInvites = () => {
    // Simulate pending invites for demo
    const demoInvites: PartyInvite[] = [
      {
        id: 'invite-1',
        fromUserId: 'user-01',
        fromUserName: 'Alex Carter',
        partyId: 'party-pipeline-crew',
        partyName: 'Pipeline Crew 🌊',
        timestamp: new Date(Date.now() - 300000).toISOString() // 5 mins ago
      }
    ]
    
    setPendingInvites(demoInvites)
  }

  /**
   * Check if user is already in a party (persistence)
   */
  const checkExistingPartyMembership = async () => {
    // For demo purposes, ALWAYS place user in a party for consistent experience
    console.log('🔍 Checking existing party membership...')
    
    try {
      const existingParty: WatchParty = {
        id: 'party-current-session',
        name: 'Griffin Fans Unite 🤙',
        hostId: chat.currentUser.id,
        hostName: chat.currentUser.name || 'You',
        members: [chat.currentUser.id, 'user-08', 'user-19'],
        memberCount: 3,
        isPrivate: false,
        createdAt: new Date().toISOString()
      }
      
      console.log('👥 Setting current party:', existingParty)
      setCurrentParty(existingParty)
      
      console.log('🔗 Attempting to join party channel...')
      await joinPartyChannel(existingParty.id)
      
      console.log('✅ Successfully joined existing party!')
      
    } catch (error) {
      console.error('💥 Failed to join existing party:', error)
      // Fallback: clear party state if connection fails
      setCurrentParty(null)
      setPartyChannel(null)
    }
  }

  /**
   * Create a new watch party
   */
  const createWatchParty = async () => {
    if (!chat || !partyName.trim()) return

    try {
      const partyId = `party-${Date.now()}`
      const newParty: WatchParty = {
        id: partyId,
        name: partyName.trim(),
        hostId: chat.currentUser.id,
        hostName: chat.currentUser.name || 'You',
        members: [chat.currentUser.id],
        memberCount: 1,
        isPrivate: false,
        createdAt: new Date().toISOString()
      }

      setCurrentParty(newParty)
      await joinPartyChannel(partyId)

      // Send invites to selected friends
      if (selectedFriends.length > 0) {
        await sendPartyInvites(partyId, partyName)
      }

      // Reset UI
      setShowCreateParty(false)
      setPartyName('')
      setSelectedFriends([])



    } catch (error) {
      console.error('Error creating watch party:', error)
    }
  }

  /**
   * Join a party channel for real-time communication - SIMPLE PubNub pub/sub
   */
  const joinPartyChannel = async (partyId: string) => {
    if (!chat) return

    try {
      const channelId = `wsl.cowatch.party-${partyId}`
      console.log('🔗 Joining simple PubNub channel:', channelId)
      
      // Just subscribe to the channel - PubNub handles everything else
      chat.sdk.subscribe({
        channels: [channelId]
      })

      // Simple message listener
      chat.sdk.addListener({
        message: (messageEvent) => {
          
          const messageData = messageEvent.message
          const userId = messageEvent.publisher || 'unknown-user'
          
          // Find user info
          const user = testUsers.find(u => u.id === userId) || { 
            id: userId, 
            name: 'Unknown User', 
            avatar: undefined 
          }
          
          // Handle reactions vs regular messages
          if (typeof messageData === 'string' && messageData.startsWith('🎉REACTION:')) {
            const emoji = messageData.replace('🎉REACTION:', '')
            const newReaction = {
              emoji,
              userId,
              userName: user.name || 'Unknown',
              timestamp: Date.now()
            }
            
            setRecentReactions(prev => [...prev.slice(-9), newReaction])
            
            // Remove after 3 seconds
            setTimeout(() => {
              setRecentReactions(prev => 
                prev.filter(r => r.timestamp !== newReaction.timestamp)
              )
            }, 3000)
          } else if (messageData && typeof messageData === 'string' && !messageData.startsWith('🎉REACTION:')) {
            // Regular chat message
            const timestamp = typeof messageEvent.timetoken === 'number' ? messageEvent.timetoken / 10000 : Date.now()
            setChatMessages(prev => [...prev, {
              id: `msg-${messageEvent.timetoken}`,
              userId,
              userName: user.name || 'Unknown',
              message: messageData,
              timestamp,
              avatar: user.avatar
            }])
          }
        }
      })

      // Store the channel ID for sending messages
      setPartyChannel({ id: channelId } as any)
      console.log('✅ Subscribed to party channel:', channelId)

    } catch (error) {
      console.error('💥 Error joining party channel:', error)
    }
  }

  /**
   * Send party invitations to selected friends
   */
  const sendPartyInvites = async (partyId: string, partyName: string) => {
    // In a real implementation, this would send invites via PubNub channels
    console.log(`📨 Sending party invites for "${partyName}" to:`, selectedFriends)
    
    // Simulate successful invites
    selectedFriends.forEach(friendId => {
      const friend = testUsers.find(u => u.id === friendId)
      console.log(`   ✉️ Invited ${friend?.name || friendId} to watch party`)
    })
  }

  /**
   * Join an existing watch party
   */
  const joinWatchParty = async (party: WatchParty) => {
    if (!chat) return

    try {
      // Add current user to party members
      const updatedParty = {
        ...party,
        members: [...party.members, chat.currentUser.id],
        memberCount: party.memberCount + 1
      }

      setCurrentParty(updatedParty)
      await joinPartyChannel(party.id)

      console.log('🎉 Joined watch party:', party.name)

    } catch (error) {
      console.error('Error joining watch party:', error)
    }
  }

  /**
   * Leave current watch party
   */
  const leaveWatchParty = () => {
    setCurrentParty(null)
    setPartyChannel(null)
    setRecentReactions([])
    setChatMessages([])
    setShowChat(false)
    console.log('👋 Left watch party')
  }

  /**
   * Send a reaction to the party - SIMPLE PubNub publish
   */
  const sendReaction = async (emoji: string) => {
    if (!partyChannel || !chat) return

    try {
      // Just publish the reaction - simple!
      await chat.sdk.publish({
        channel: (partyChannel as any).id,
        message: `🎉REACTION:${emoji}`
      })

      console.log(`${emoji} reaction sent to party`)

    } catch (error) {
      console.error('Error sending reaction:', error)
    }
  }

  /**
   * Send a text message to the party chat - SIMPLE PubNub publish
   */
  const sendChatMessage = async () => {
    if (!partyChannel || !newMessage.trim() || !chat) {
      console.error('❌ Missing channel, message, or chat client')
      return
    }

    try {
      console.log('📤 Publishing message to channel:', (partyChannel as any).id)
      
      // Just publish the message - simple!
      await chat.sdk.publish({
        channel: (partyChannel as any).id,
        message: newMessage.trim()
      })
      
      console.log('✅ Message published successfully!')
      setNewMessage('')

    } catch (error) {
      console.error('💥 Error publishing message:', error)
    }
  }

  /**
   * Accept a party invitation
   */
  const acceptInvite = async (invite: PartyInvite) => {
    const party = availableParties.find(p => p.id === invite.partyId)
    if (party) {
      await joinWatchParty(party)
      setPendingInvites(prev => prev.filter(i => i.id !== invite.id))
    }
  }

  /**
   * Decline a party invitation
   */
  const declineInvite = (inviteId: string) => {
    setPendingInvites(prev => prev.filter(i => i.id !== inviteId))
  }

  /**
   * Toggle friend selection for invites
   */
  const toggleFriendSelection = (userId: string) => {
    setSelectedFriends(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <div className={`${className} w-full max-h-[480px] overflow-hidden`}>
      <GuideOverlay
        id={'cowatchGuide'}
        guidesShown={guidesShown}
        visibleGuide={visibleGuide}
        setVisibleGuide={setVisibleGuide}
        text={
          <span>
            <span className='font-semibold'>CoWatch Parties</span> let you create 
            private watch experiences with friends:
            <ul className='list-disc list-inside my-2'>
              <li>Create or join watch parties</li>
              <li>Invite friends to watch together</li>
              <li>Synchronized emoji reactions</li>
              <li>Real-time presence awareness</li>
            </ul>
            Perfect for sharing the surf stoke with your crew!
          </span>
        }
        xOffset={`${isMobilePreview ? 'left-[0px]' : '-left-[60px]'}`}
        yOffset={'top-[10px]'}
        flexStyle={'flex-row items-start'}
      />

      <div className='text-lg border-b pb-2 flex flex-col bg-wsl-deep-blue overflow-hidden rounded-t text-white'>
        {/* CoWatch Party Header */}
        <div className='px-[16px] py-[12px] flex items-center justify-between h-[56px]'>
          <div className='flex items-center gap-3'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='20'
              viewBox='0 0 20 20'
              fill='none'
            >
              <path
                d='M2 4C2 2.89543 2.89543 2 4 2H16C17.1046 2 18 2.89543 18 4V12C18 13.1046 17.1046 14 16 14H4C2.89543 14 2 13.1046 2 12V4Z'
                stroke='white'
                strokeWidth='1.5'
                fill='none'
              />
              <circle cx='6' cy='16' r='2' fill='white'/>
              <circle cx='14' cy='16' r='2' fill='white'/>
              <path d='M8 16H12' stroke='white' strokeWidth='1.5'/>
              <circle cx='7' cy='7' r='1.5' fill='white'/>
              <circle cx='13' cy='7' r='1.5' fill='white'/>
              <path d='M10 10L8 8M10 10L12 8' stroke='white' strokeWidth='1.5' strokeLinecap='round'/>
            </svg>
            <div className='text-[16px] font-[600] leading-[24px]'>
              CoWatch Party
            </div>
          </div>
          
          {/* Party Status */}
          <div className='flex items-center gap-2'>
            {currentParty ? (
              <div className='flex items-center gap-1 text-xs bg-green-500 px-2 py-1 rounded'>
                <svg width='8' height='8' viewBox='0 0 8 8' fill='none'>
                  <circle cx='4' cy='4' r='4' fill='white' />
                </svg>
                {currentParty.memberCount} watching
              </div>
            ) : (
              <div className='text-xs text-gray-300'>
                Not in party
              </div>
            )}
          </div>
        </div>
        
        {/* Pipeline Context */}
        <div className='px-[16px] py-[6px] bg-wsl-primary-blue text-center'>
          <div className='text-sm font-medium'>
            <span className="text-white">Watch Together</span>
            <span className="text-wsl-light-blue mx-2">•</span>
            <span className="text-wsl-light-blue text-xs">Griffin vs John John • Pipeline</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='h-[400px] flex flex-col bg-white'>
        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className='p-3 bg-yellow-50 border-b border-yellow-200'>
            <h4 className='text-sm font-semibold text-yellow-800 mb-2'>Party Invitations</h4>
            {pendingInvites.map(invite => (
              <div key={invite.id} className='flex items-center justify-between bg-white p-2 rounded mb-2'>
                <div className='flex-1'>
                  <div className='text-sm font-medium'>{invite.fromUserName}</div>
                  <div className='text-xs text-gray-600'>invited you to "{invite.partyName}"</div>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => acceptInvite(invite)}
                    className='px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600'
                  >
                    Join
                  </button>
                  <button
                    onClick={() => declineInvite(invite.id)}
                    className='px-3 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500'
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!currentParty ? (
          /* Not in a party - Show options */
          <div className='flex-1 p-4'>
            <div className='flex gap-3 mb-4'>
              <button
                onClick={() => setShowCreateParty(true)}
                className='flex-1 py-3 bg-wsl-primary-blue text-white rounded-lg font-semibold hover:bg-wsl-ocean-blue transition-colors'
              >
                🎬 Create Party
              </button>
            </div>

            {/* Available Parties */}
            <div>
              <h4 className='text-sm font-semibold text-gray-700 mb-3'>Join Existing Parties</h4>
              {availableParties.length === 0 ? (
                <div className='text-center text-gray-500 py-4'>
                  No active parties right now
                </div>
              ) : (
                <div className='space-y-2'>
                  {availableParties.filter(p => !p.isPrivate || p.members.includes(chat?.currentUser?.id || '')).map(party => (
                    <div key={party.id} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>{party.name}</span>
                          {party.isPrivate && <span className='text-xs bg-gray-600 text-white px-1 rounded'>Private</span>}
                        </div>
                        <div className='text-xs text-gray-600'>
                          Host: {party.hostName} • {party.memberCount} members
                        </div>
                      </div>
                      <button
                        onClick={() => joinWatchParty(party)}
                        className='px-3 py-1 bg-wsl-ocean-blue text-white text-sm rounded hover:bg-wsl-light-blue hover:text-wsl-primary-blue transition-colors'
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* In a party - Show party interface */
          <div className='flex-1 flex flex-col'>
            {/* Party Info */}
            <div className='p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='font-bold text-green-800 text-lg flex items-center'>
                    {currentParty.name}
                    <svg className='w-4 h-4 ml-2 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                  </div>
                  <div className='text-sm text-green-700 flex items-center mt-1'>
                    <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M9 12a1 1 0 01-.117-1.993L9 10h2a1 1 0 01.117 1.993L11 12H9z'/>
                      <path fillRule='evenodd' d='M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zM5.5 4a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v12a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V4z' clipRule='evenodd'/>
                    </svg>
                    {currentParty.memberCount} members watching together
                  </div>
                </div>
                <button
                  onClick={leaveWatchParty}
                  className='px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 hover:shadow-md transition-all duration-200 font-medium'
                >
                  Leave Party
                </button>
              </div>
            </div>

            {/* Party Communication Area */}
            <div className='flex-1 flex flex-col'>
              {/* Tab Navigation */}
              <div className='flex bg-gray-100 rounded-t-lg mx-4 mt-4'>
                <button
                  onClick={() => setShowChat(false)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-tl-lg transition-all ${
                    !showChat 
                      ? 'bg-white text-wsl-primary-blue shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🎉 React
                </button>
                <button
                  onClick={() => setShowChat(true)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-tr-lg transition-all ${
                    showChat 
                      ? 'bg-white text-wsl-primary-blue shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  💬 Chat
                </button>
              </div>

              {!showChat ? (
                /* Reactions Interface */
                <div className='flex-1 p-6 relative'>
                  {/* Floating Reactions */}
                  <div className='absolute inset-6 pointer-events-none overflow-hidden rounded-lg'>
                    {recentReactions.map((reaction, index) => (
                      <div
                        key={`${reaction.timestamp}-${index}`}
                        className='absolute text-3xl animate-pulse'
                        style={{
                          left: `${Math.random() * 60 + 20}%`,
                          top: `${Math.random() * 40 + 30}%`,
                          animationDuration: '1.5s',
                          animationDelay: `${index * 0.3}s`,
                          transform: 'translateY(-10px)',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {reaction.emoji}
                      </div>
                    ))}
                  </div>

                  {/* Reaction Buttons */}
                  <div className='grid grid-cols-4 gap-2 mt-6 mb-4 px-2'>
                    {partyEmojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => sendReaction(emoji)}
                        className='h-14 bg-gradient-to-b from-white to-gray-50 border border-gray-300 rounded-2xl text-lg hover:from-blue-50 hover:to-blue-100 hover:border-wsl-primary-blue hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-150 ease-out shadow-sm flex items-center justify-center'
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Recent Reactions List */}
                  {recentReactions.length > 0 && (
                    <div className='mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100 max-h-24 overflow-y-auto'>
                      <div className='text-xs font-medium text-gray-700 mb-2 flex items-center'>
                        <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z' clipRule='evenodd' />
                        </svg>
                        Recent reactions:
                      </div>
                      <div className='space-y-1'>
                        {recentReactions.slice(-3).reverse().map((reaction, index) => (
                          <div key={`${reaction.timestamp}-list-${index}`} className='text-xs text-gray-700 flex items-center bg-white/50 px-2 py-1 rounded'>
                            <span className='text-base mr-2'>{reaction.emoji}</span>
                            <span className='font-medium'>{reaction.userName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Chat Interface */
                <div className='flex flex-col p-4 h-[180px]'>
                  {/* Chat Messages */}
                  <div 
                    ref={messagesContainerRef}
                    className='flex-1 overflow-y-auto space-y-2 mb-2 p-3 bg-gray-50 rounded-lg min-h-[100px] max-h-[120px]'
                  >
                    {chatMessages.length === 0 ? (
                      <div className='flex items-center justify-center h-full text-center text-gray-500 text-sm'>
                        <div>
                          💬 Start chatting with your watch party!<br/>
                          <span className='text-xs'>Share your thoughts on Griffin's waves</span>
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className='flex items-start gap-2'>
                          <div 
                            className='w-6 h-6 bg-cover bg-center rounded-full flex-shrink-0'
                            style={{ backgroundImage: msg.avatar ? `url(${msg.avatar})` : 'none', backgroundColor: msg.avatar ? 'transparent' : '#3B82F6' }}
                          >
                            {!msg.avatar && <span className='text-xs text-white font-bold flex items-center justify-center w-full h-full'>{msg.userName.charAt(0)}</span>}
                          </div>
                          <div className='flex-1 bg-white rounded-lg p-2 shadow-sm'>
                            <div className='flex items-center justify-between mb-1'>
                              <span className='text-sm font-medium text-gray-800'>{msg.userName}</span>
                              <span className='text-xs text-gray-500'>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className='text-sm text-gray-700'>{msg.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className='flex gap-2 border-t border-gray-200 pt-2' style={{ height: '44px' }}>
                    <input
                      type='text'
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          console.log('⌨️ Enter key pressed, sending message')
                          sendChatMessage()
                        }
                      }}
                      placeholder='Type your message...'
                      className='flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-wsl-primary-blue focus:border-wsl-primary-blue text-sm h-8'
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        console.log('🖱️ Send button clicked')
                        sendChatMessage()
                      }}
                      disabled={!newMessage.trim()}
                      className='px-3 py-1.5 bg-wsl-primary-blue text-white rounded-md hover:bg-wsl-ocean-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm h-8'
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Invite Friends Button */}
            <div className='p-2 border-t border-gray-200 bg-gray-50 flex-shrink-0'>
              <button
                onClick={() => setShowInviteFriends(true)}
                className='w-full py-1.5 bg-gradient-to-r from-wsl-ocean-blue to-wsl-primary-blue text-white rounded-md font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-xs'
              >
                <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z'/>
                  <path d='M3 5a2 2 0 012-2h1a1 1 0 010 2H5v6.5A1.5 1.5 0 006.5 13h7a1.5 1.5 0 001.5-1.5V5h-1a1 1 0 110-2h1a2 2 0 012 2v6.5a3.5 3.5 0 01-3.5 3.5h-7A3.5 3.5 0 013 11.5V5z'/>
                </svg>
                Invite
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Party Modal */}
      {showCreateParty && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-80 max-w-[90vw]'>
            <h3 className='text-lg font-semibold mb-4'>Create Watch Party</h3>
            
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Party Name
              </label>
              <input
                type='text'
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder='e.g., Pipeline Masters Crew'
                className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-wsl-primary-blue focus:border-wsl-primary-blue'
              />
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Invite Friends (Optional)
              </label>
              <div className='max-h-32 overflow-y-auto space-y-1'>
                {testUsers.slice(0, 8).map(user => (
                  <label key={user.id} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={selectedFriends.includes(user.id)}
                      onChange={() => toggleFriendSelection(user.id)}
                      className='mr-2'
                    />
                    <span className='text-sm'>{user.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={() => setShowCreateParty(false)}
                className='flex-1 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={createWatchParty}
                disabled={!partyName.trim()}
                className='flex-1 py-2 px-4 bg-wsl-primary-blue text-white rounded hover:bg-wsl-ocean-blue disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Friends Modal */}
      {showInviteFriends && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-80 max-w-[90vw]'>
            <h3 className='text-lg font-semibold mb-4'>Invite to {currentParty?.name}</h3>
            
            <div className='mb-4'>
              <div className='max-h-48 overflow-y-auto space-y-2'>
                {testUsers.slice(0, 12).filter(user => 
                  !currentParty?.members.includes(user.id)
                ).map(user => (
                  <div key={user.id} className='flex items-center justify-between p-2 border rounded'>
                    <div className='flex items-center gap-2'>
                      <div 
                        className='w-8 h-8 bg-cover bg-center rounded-full'
                        style={{ backgroundImage: `url(${user.avatar})` }}
                      />
                      <span className='text-sm'>{user.name}</span>
                    </div>
                    <button
                      onClick={() => console.log(`Invite sent to ${user.name}`)}
                      className='px-2 py-1 bg-wsl-primary-blue text-white text-xs rounded hover:bg-wsl-ocean-blue'
                    >
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowInviteFriends(false)}
              className='w-full py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
