import { useEffect, useState } from 'react'
import {
  Message,
  User,
  Channel,
  TimetokenUtils,
  MixedTextTypedElement
} from '@pubnub/chat'
import { reactions } from '@/app/data/constants'
import { useHover } from '@uidotdev/usehooks'

interface ChatMessageProps {
  message: Message & {
    sender?: { name: string }
    publisher?: string
  }
  currentUser: User
  users: User[]
  channel: Channel
  translations?: Record<string, { originalText: string; translatedText: string; language: string; confidence: number }>
  showTranslations?: boolean
  selectedLanguage?: 'en' | 'pt' | 'es'
}

export default function ChatMessage ({
  message,
  currentUser,
  users,
  channel,
  translations,
  showTranslations,
  selectedLanguage
}: ChatMessageProps) {
  const [ref, hovering] = useHover()
  const [showReactions, setShowReactions] = useState(false)
  const [userRestrictions, setUserRestrictions] = useState<{
    ban: boolean
    mute: boolean
  }>({ ban: false, mute: false })

  
  useEffect(() => {
    if (hovering && message.userId.startsWith('user-')) {
      setShowReactions(true)
    }
    if (showReactions && !hovering) {
      setShowReactions(false)
    }
  }, [hovering])

  const isOwnMessage = message.userId === currentUser?.id

  /**
   * Toggles a reaction on a message
   */
  const toggleReaction = async (emoji: string) => {
    setShowReactions(false)
    try {
      await message.toggleReaction(emoji)
    } catch (error) {
      console.error('Unable to toggle reaction:', error)
    }
  }

  /**
   * Gets counts of reactions grouped by type
   */
  const getReactionCounts = () => {
    const counts: Record<string, number> = {}

    if (message.reactions) {
      Object.entries(message.reactions).forEach(([type, users]) => {
        if (Array.isArray(users)) {
          counts[type] = users.length
        }
      })
    }

    return counts
  }

  const reactionCounts = getReactionCounts()

  function pubnubTimetokenToHHMM (timetoken) {
    const date = TimetokenUtils.timetokenToDate(timetoken)

    return `${(date.getHours() + '').padStart(2, '0')}:${(
      date.getMinutes() + ''
    ).padStart(2, '0')}`
  }

  const filtered = users.filter(user => message.userId === user.id)
  const user = filtered.length === 1 ? filtered[0] : null

  // Check if there's a translation embedded in message metadata OR message payload
  const messageWithMeta = message as any // Cast to access meta property
  
  // Look for translations embedded in message payload (Chat SDK strips metadata)
  const rawMessage = typeof (messageWithMeta as any).toJSON === 'function' ? (messageWithMeta as any).toJSON() : messageWithMeta;
  
  // Parse translation data from text field marker (Chat SDK strips all custom fields)
  const parseTextTranslation = () => {
    const messageText = rawMessage.text || '';
    const translationRegex = /\[WSL-TRANSLATION:(\w+)>(\w+):(.+?)\]/;
    const match = messageText.match(translationRegex);
    
    if (match) {
      const [fullMatch, sourceLang, targetLang, translatedText] = match;
      
      return {
        source: 'text-marker',
        data: {
          translatedText,
          originalLang: sourceLang, 
          translatedLang: targetLang
        },
        originalText: messageText.replace(fullMatch, '').trim(), // Remove marker from display
        marker: fullMatch
      };
    }
    return null;
  };
  
  const translationResult = parseTextTranslation();
  const translationData = translationResult?.data || null;
  
  const hasTranslation = showTranslations && 
                        translationData && 
                        translationData.translatedText &&
                        translationData.originalLang !== 'EN' // Don't show translation if original is already English



  // Get clean message text (without translation marker for display)
  const displayText = translationResult?.originalText || rawMessage.text;

  const renderMessagePart = (
    messagePart: MixedTextTypedElement,
    index: number
  ) => {
    if (messagePart.type === 'mention') {
      return (
        <span key={index} className={'text-[#589CFF]'}>
          {messagePart.content.name}
        </span>
      )
    }
    if (messagePart.type === 'text') {
      return messagePart.content.text
    }

    return ''
  }

  return (
    <div
      className={`mb-6 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwnMessage && (
        <div
          data-user={user?.name || 'Unknown User'}
          className={`rounded-full w-[36px] h-[36px] mr-[16px] !bg-cover bg-gray-100 ${
            userRestrictions.ban || (userRestrictions.mute && 'grayscale')
          }`}
          style={
            user
              ? {
                  background: `url(${
                    user?.profileUrl ?? '/avatars/placeholder2.png'
                  }) center center no-repeat`
                }
              : {}
          }
        ></div>
      )}

      <div
        ref={ref}
        className={`group relative max-w-[80%] flex items-end rounded-lg px-4 py-[4px] gap-[16px] ${
          isOwnMessage ? 'bg-navy900 text-white' : 'bg-navy100'
        }`}
      >
        <div
          className={`text-[16px] font-[400] leading-[24px] tracking-[0.08px] ${
            userRestrictions.ban ||
            userRestrictions.mute && 'text-neutral500 italic'
          }`}
        >
          {message.deleted
            ? 'This message has been deleted'
            : userRestrictions.ban
            ? 'This user has been banned'
            : userRestrictions.mute
            ? 'This user has been muted'
            : (
              <div className="space-y-1">
                <div>
                  {translationResult ? 
                    // Display clean text (without marker) when we have translation
                    displayText
                    :
                    // Use normal Chat SDK parsing when no translation
                    message.getMessageElements().map(renderMessagePart)
                  }
                </div>
                {hasTranslation && translationData && (
                  <div className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded border-l-2 border-blue-300">
                    <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
                        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.01-4.65.75-6.96l-1.41 1.41c.73 1.34.5 3.01-.59 4.09l-.36.37-.44-.44c-1.1-1.1-1.28-2.75-.59-4.09l-1.41-1.41c-1.26 2.31-.99 5.02.75 6.96l.03.03-2.54 2.51 1.41 1.41 2.5-2.5 2.5 2.5 1.41-1.41zM18.5 10l-1.41-1.41c-.73 1.34-.5 3.01.59 4.09l.36.37.44-.44c1.1-1.1 1.28-2.75.59-4.09L20.48 7.1c1.26 2.31.99 5.02-.75 6.96l-.03.03 2.54 2.51-1.41 1.41-2.5-2.5-2.5 2.5-1.41-1.41 2.54-2.51-.03-.03c-1.74-1.94-2.01-4.65-.75-6.96z"/>
                      </svg>
                      <span>{translationData.originalLang} → {translationData.translatedLang}</span>
                    </div>
                    <div className="italic">
                      "{translationData.translatedText}"
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
        <div className={'text-[11px] font-[400] leading-[150%]'}>
          {pubnubTimetokenToHHMM(message.timetoken)}
        </div>

        {/* Display reactions */}
        <div className='absolute bottom-[-17px] right-[0] flex'>
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <div
              key={emoji}
              className='text-xs text-black bg-white/20 rounded-full px-1 z-10'
            >
              {emoji}&nbsp;{count}
            </div>
          ))}
        </div>

        {showReactions && (
          <div className='absolute bottom-[-20px] bg-white border shadow-lg rounded-lg p-1 flex gap-2 z-10'>
            {reactions.map(emoji => (
              <button
                key={emoji}
                className='text-xs hover:scale-125 transition-transform'
                onClick={() => toggleReaction(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {isOwnMessage && (
        <div
          className={
            'rounded-full w-[36px] h-[36px] ml-[16px] !bg-cover bg-gray-100'
          }
          style={
            user
              ? {
                  background: `url(${user?.profileUrl}) center center no-repeat`
                }
              : {}
          }
        ></div>
      )}
    </div>
  )
}
