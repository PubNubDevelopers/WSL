'use client'

import { useState, useEffect } from 'react'
import { Chat, User } from '@pubnub/chat'
import {
  matchStatsChannelId,
  liveCommentaryChannelId,
  pollDeclarations,
  pollVotes,
  pollResults,
  illuminatePollTesting,
  clientVideoControlChannelId,
  pushChannelSelfId,
  pushChannelSalesId,
  dynamicAdChannelId,
  illuminateUpgradeReaction,
  serverVideoControlChannelId,
  hypeUpdatesChannelId
} from '../data/constants'
import { getAuthKey } from '../getAuthKey'

export default function Page () {
  const [chat, setChat] = useState<Chat | null>(null)
  const isGuidedDemo =
    process.env.NEXT_PUBLIC_GUIDED_DEMO === 'true'
      ? process.env.NEXT_PUBLIC_GUIDED_DEMO
      : null
  const pushChannelId = isGuidedDemo ? pushChannelSalesId : pushChannelSelfId
  const testStyle = 'text-cherry cursor-pointer'

  //  Test polls all have the final score, but that is ignored in the initial declaration
  const testPolls = [
    {
      id: 1, //  Assume this increments when we only show the most recent results
      title: 'Who will get more yellow cards?',
      victoryPoints: 2,
      correctOption: 1, //  In production this would be part of the results message
      alertText: 'You unlocked a poll',
      pollType: 'side', //  The poll shows at the side of the UX
      options: [
        { id: 1, text: 'Griffin Colapinto', score: 1 },
        { id: 2, text: 'John John Florence', score: 2 },
        { id: 3, text: 'Equal', score: 0 }
      ]
    },
    {
      id: 2,
      title: 'Will the match go to extra time?',
      victoryPoints: 4,
      correctOption: 1, //  In production this would be part of the results message
      alertText: 'This is very very long text which should get cut off',
      pollType: 'side',
      options: [
        { id: 1, text: 'Yes', score: 0 },
        { id: 2, text: 'No', score: 2 }
      ]
    },
    {
      id: 3,
      title: 'Who will be man of the match?',
      victoryPoints: 0,
      pollType: 'side',
      options: [
        { id: 1, text: 'Haaland', score: 37 },
        {
          id: 2,
          text: 'Vinicius Jr. I have a very long name',
          score: 10
        },
        { id: 3, text: 'De Bruyne', score: 21 },
        { id: 4, text: 'Modric', score: 25 },
        { id: 5, text: 'Other', score: 7 }
      ]
    }
  ]

  const testPollLiveMatch = {
    id: 1,
    title: 'Win 10 points for a correct prediction',
    victoryPoints: 10,
    pollType: 'match', //  The poll appears below the stream
    options: [
      { id: 1, text: 'Griffin Colapinto' },
      { id: 2, text: 'John John Florence' },
      { id: 3, text: 'Equal Heat' }
    ]
  }

  const testPollLiveMatchResults = {
    id: 1,
    pollType: 'match',
    correctOption: 1 //  In production this would be part of the results message
  }

  //  App initialization
  useEffect(() => {
    async function init () {
      try {
        const userId = 'testing-only'
        const { accessManagerToken } = await getAuthKey(
          userId,
          isGuidedDemo ? true : false,
          `-${process.env.NEXT_PUBLIC_ENVIRONMENT_NUMBER ?? ''}`
        )
        const localChat = await Chat.init({
          publishKey: process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY as string,
          subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY as string,
          userId: userId,
          authKey: accessManagerToken
        })
        setChat(localChat)
      } catch {}
    }

    init()
  }, [])

  async function sendPubNubMessage (
    channel,
    messageBody,
    shouldPersist = false
  ) {
    await chat?.sdk.publish({
      message: messageBody,
      channel: channel,
      storeInHistory: shouldPersist
    })
  }

  async function voteInPoll (channel, pollId, optionId) {
    await chat?.sdk.publish({
      message: {
        pollId: pollId,
        questionId: '1', //  All polls only have one question
        choiceId: optionId,
        pollType: 'side'
      },
      channel: channel
    })
  }

  async function sendLiveCommentaryMessage () {
    if (!chat) return
    await chat.sdk.publish({
      message: {
        text: `Test Message ${Math.floor(Math.random() * 1000)}`,
        timeCode: `${Math.floor(Math.random() * 90)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}`
      },
      channel: liveCommentaryChannelId
    })
  }

  // Translation testing functions
  async function testPortugueseTranslation() {
    if (!chat) return;
    
    const portugueseMessages = [
      "Olá pessoal! Como estão as ondas hoje?",
      "Essa manobra foi incrível! Que tubo perfeito!",
      "O Griffin está surfando muito bem nesta bateria.",
      "Não consigo acreditar nessa pontuação!",
      "Pipeline está com condições perfeitas para o campeonato."
    ];
    
    const randomMessage = portugueseMessages[Math.floor(Math.random() * portugueseMessages.length)];
    
    console.log('🇵🇹 Sending Portuguese message:', randomMessage);
    
    // Send message to the main heat lounge channel where the translation function should pick it up
    await chat.sdk.publish({
      message: {
        text: randomMessage,
        userId: chat.currentUser.id,
        timetoken: Date.now() * 10000,
        type: 'chat_message'
      },
      channel: 'wsl.community.global',
      storeInHistory: true
    });
  }
  
  async function listenForTranslations() {
    if (!chat) return;
    
    // Listen to the main chat channel to see translated messages
    const mainChannel = chat.sdk.channel('wsl.community.global');
    const subscription = mainChannel.subscription({
      receivePresenceEvents: false
    });
    
    subscription.onMessage = (messageEvent) => {
      const message = messageEvent.message;
      if (message.meta && message.meta.translatedText) {
        // Translation received - processing handled by UI components
      }
    };
    
    subscription.subscribe();
    
    // Auto-unsubscribe after 2 minutes to avoid memory leaks
    setTimeout(() => {
      subscription.unsubscribe();
    }, 120000);
  }
  
  async function testMultiplePortugueseMessages() {
    if (!chat) return;
    
    const messages = [
      "Que onda incrível! 🌊",
      "O surfista brasileiro está dominando!",
      "Pipeline está com condições perfeitas.",
      "Essa é a melhor bateria do campeonato!",
      "Não acredito que ele conseguiu essa manobra!"
    ];
    
    console.log('🔄 Sending multiple Portuguese messages...');
    
    for (let i = 0; i < messages.length; i++) {
      setTimeout(async () => {
        await chat.sdk.publish({
          message: {
            text: messages[i],
            userId: chat.currentUser.id,
            timetoken: Date.now() * 10000,
            type: 'chat_message'
          },
          channel: 'wsl.community.global',
          storeInHistory: true
        });
        console.log(`📤 Message ${i + 1}/5 sent:`, messages[i]);
      }, i * 2000); // Send one message every 2 seconds
    }
  }
  
  async function testMessageWithTranslation() {
    if (!chat) return;
    
    // Simulate what the PubNub Function would do - send message with translation metadata
    await chat.sdk.publish({
      message: {
        text: 'Essa onda está perfeita!',
        userId: chat.currentUser.id,
        timetoken: Date.now() * 10000,
        type: 'chat_message',
        meta: {
          translatedText: 'This wave is perfect!',
          translatedLang: 'EN',
          originalLang: 'PT'
        }
      },
      channel: 'wsl.community.global',
      storeInHistory: true,
      meta: {
        translatedText: 'This wave is perfect!',
        translatedLang: 'EN',
        originalLang: 'PT'
      }
    });
  }

  async function sendHypeBoost() {
    if (!chat) return;
    
    // Send an additive 50% hype boost message
    await chat.sdk.publish({
      message: {
        userId: chat.currentUser.id,
        level: 50,
        isAdditive: true, // This tells the hype widget to add 50 to current level
        intensity: 'high',
        timestamp: Date.now()
      },
      channel: hypeUpdatesChannelId,
      storeInHistory: false // Don't persist hype messages - they're transient
    });
  }

  async function clearAllPubNubHistory() {
    if (!chat) {
      console.error('❌ Chat not initialized');
      return;
    }

    console.log('🧹 Starting to clear all PubNub history...');
    
    // Collect all channels used in the project
    const allChannels = [
      // Main WSL Production Channels
      'wsl.community.global',
      'wsl.translations.global',
      'wsl.spots.pipeline-hawaii',
      'wsl.spots.trestles-california',
      'wsl.spots.teahupoo-tahiti',
      'wsl.events.2024-pipeline-masters.heat-final',
      'wsl.events.heat-updates',
      'wsl.clips.requests',
      'wsl.clips.notifications',
      'wsl.fantasy-live',
      'wsl.prop-pickem',
      'wsl.stream.reactions',
      'wsl.stream.hype',
      'wsl.polls.live',
      'wsl.polls.results',
      'wsl.moderation.alerts',
      'wsl.analytics.realtime',
      'wsl.admin.alerts',
      'wsl.system.events',
      
      // Game/Testing Channels
      'game.push-self',
      'game.push-sales',
      'game.dynamic-ad',
      'game.client-video-control',
      'game.server-video-control',
      'game.dataControlsOccupancy',
      'illuminate-upgrade-reaction',
      
      // Legacy mapped channels
      matchStatsChannelId,
      liveCommentaryChannelId,
      pollDeclarations,
      pollResults,
      pushChannelSelfId,
      pushChannelSalesId,
      dynamicAdChannelId,
      clientVideoControlChannelId,
      serverVideoControlChannelId,
      illuminateUpgradeReaction
    ];

    // Remove duplicates
    const uniqueChannels = [...new Set(allChannels)];
    
    console.log(`🗂️  Found ${uniqueChannels.length} unique channels to clear`);

    let successCount = 0;
    let errorCount = 0;

    for (const channel of uniqueChannels) {
      try {
        console.log(`🧹 Clearing history for channel: ${channel}`);
        
        // Delete all messages from the channel
        // Use a very old start time and current time to delete all messages
        await chat.sdk.deleteMessages({
          channel: channel,
          start: '1', // Very early timetoken
          end: String(Date.now() * 10000) // Current timetoken
        });
        
        successCount++;
        console.log(`✅ Cleared history for: ${channel}`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to clear history for ${channel}:`, error);
      }
    }

    console.log(`🏁 History clearing complete!`);
    console.log(`✅ Successfully cleared: ${successCount} channels`);
    console.log(`❌ Failed to clear: ${errorCount} channels`);
    
    if (successCount > 0) {
      console.log('🎉 PubNub history has been cleared from the project channels!');
    }
  }

  async function sendMatchStatsMessage () {
    if (!chat) return
    const randomStat3Digits = () => String(Math.floor(Math.random() * 400) + 1)
    const randomStat2Digits = () => String(Math.floor(Math.random() * 99) + 1)
    const randomStat1Digit = () => String(Math.floor(Math.random() * 9) + 1)
    const randomPercent = Math.floor(Math.random() * 99) + 1
    const randomPercentDiff = 100 - randomPercent

    await chat.sdk.publish({
      message: {
        statBox1: {
          //  Score
          info: [
            {
              stat: randomStat1Digit()
            },
            {
              stat: randomStat1Digit()
            }
          ]
        },
        statBox2: {
          //  Yellow cards
          info: [
            {
              stat: randomStat1Digit()
            }
          ]
        },
        statBox3: {
          //Top Scorer
          info: [
            {
              dataPrimary: randomStat1Digit(),
              dataSecondary: 'Player Name',
              imageUrl: '/matchstats/playericon_silva.png'
            }
          ]
        },
        statBox4: {
          //  Shots on goal
          info: [
            {
              stat: randomStat1Digit()
            },
            {
              stat: randomStat1Digit()
            }
          ]
        },
        statBox5: {
          //  Red cards
          info: [
            {
              stat: randomStat1Digit()
            }
          ]
        },
        statBox6: {
          info: [
            {
              stat: `${randomStat2Digits()}%`
            },
            {
              stat: `${randomStat2Digits()}%`
            }
          ]
        }
      },
      channel: matchStatsChannelId
    })
  }

  return (
    <main>
      <div className='flex flex-col h-fit min-h-screen w-screen min-w-screen p-6 gap-3'>
        <div className='text-3xl'>App Testing</div>
        <div className='text-xl'>Video Stream (Manual Testing)</div>
        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(clientVideoControlChannelId, {
              type: 'START_STREAM',
              params: {}
            })
          }
        >
          Start Stream Manually
        </div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(clientVideoControlChannelId, {
              type: 'END_STREAM',
              params: {}
            })
          }
        >
          Stop Stream Manually
        </div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(clientVideoControlChannelId, {
              type: 'SEEK',
              params: {
                playbackTime: 30000
              }
            })
          }
        >
          Seek Stream (Game Start)
        </div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(clientVideoControlChannelId, {
              type: 'SEEK',
              params: {
                playbackTime: 48000
              }
            })
          }
        >
          Seek Stream (Goal 1)
        </div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(clientVideoControlChannelId, {
              type: 'SEEK',
              params: {
                playbackTime: 315000
              }
            })
          }
        >
          Seek Stream (Goal 4)
        </div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(clientVideoControlChannelId, {
              type: 'SEEK',
              params: {
                playbackTime: 1099000
              }
            })
          }
        >
          Seek Stream (5 minutes remaining)
        </div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(clientVideoControlChannelId, {
              type: 'STATUS',
              params: { playbackTime: 10000 }
            })
          }
        >
          Join Late - Sends a single status message for playbackTime = 10s
        </div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(clientVideoControlChannelId, {
              type: 'STATUS',
              params: { playbackTime: 0, videoStarted: true }
            })
          }
        >
          Video has looped
        </div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(clientVideoControlChannelId, {
              type: 'STATUS',
              params: { playbackTime: 100000, videoEnded: true }
            })
          }
        >
          Video has ended
        </div>

        <div className='text-xl'>
          Video Stream (Testing based on Backend Messages)
        </div>

        <div className=''>
          A backend test exists to start a stream and send status messages every
          500ms, until the stream stops. This can be used to test starting the
          stream, joining the stream late, and the stream looping.
        </div>

        {/* Key Demo Features Section */}
        <div className='text-xl font-bold text-yellow-400 mt-6 mb-3'>🎬 Key Demo Features</div>
        
        <div
          className={`${testStyle} bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer mb-4`}
          onClick={() =>
            sendPubNubMessage(serverVideoControlChannelId, {
              type: 'ON_DEMAND_SCRIPT',
              params: { scriptName: 'gold-jersey-drama' }
            })
          }
        >
          🏆 Trigger Gold Jersey Drama (26s Competition Finale)
        </div>
        
        <div className='text-sm text-gray-400 mb-6 max-w-2xl'>
          <strong>Manual Trigger:</strong> Start the epic competition finale immediately with leaderboard drama, 
          achievement unlocks, and gold jersey ceremonies. 
          <br/><span className='text-yellow-400'>⚠️ Note:</span> Drama also runs automatically at 17 minutes in main timeline.
        </div>

        <div className='text-xl'>Advertisements</div>
        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(dynamicAdChannelId, { adId: 2, clickPoints: 12 })
          }
        >
          Show Dynamic Ad
        </div>
        <div className='text-xl'>Notifications</div>
        <div
          className={`${testStyle}`}
          onClick={async () => {
            sendPubNubMessage(pushChannelId, {
              text: 'PubNub Push Notification',
              pn_fcm: {
                data: {
                  title: 'Somebody tagged you',
                  body: 'You were mentioned in the group chat'
                },
                android: {
                  priority: 'high',
                }
              }
            })
          }}
        >
          Show Notification for Chat Message
        </div>

        <div
          className={`${testStyle}`}
          onClick={async () => {
            sendPubNubMessage(pushChannelId, {
              text: 'PubNub Push Notification',
              pn_fcm: {
                data: {
                  title: 'Goal!!',
                  body: 'A Team scored a Goal'
                },
                android: {
                  priority: 'high',
                }
              }
            })
          }}
        >
          Show Notification for Cup
        </div>

        <div className='text-xl'>Emoji</div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(illuminateUpgradeReaction, {
              emoji: '😮',
              replacementEmoji: null
            })
          }
        >
          Upgrade the Shock Emoji
        </div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(illuminateUpgradeReaction, {
              emoji: '👏',
              replacementEmoji: '🤩'
            })
          }
        >
          Upgrade the Clap Emoji and override default with Star faced Emoji
        </div>

        <div className='text-xl'>Polls (Beneath Live Stream)</div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(pollDeclarations, testPollLiveMatch, true)
          }
        >
          Start Match Poll
        </div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(pollResults, testPollLiveMatchResults, true)
          }
        >
          End Match Poll
        </div>

        <div className='text-xl'>Polls (Dedicated Polls Widget)</div>

        <div
          className={`${testStyle}`}
          onClick={() => sendPubNubMessage(pollDeclarations, testPolls[0])}
        >
          Start Poll 1
        </div>

        <div className={`${testStyle}`}>
          <span className='cursor-default'>Vote in Poll 1:</span>{' '}
          <span onClick={() => voteInPoll(pollVotes, 1, 1)}>Option 1</span>
          {' | '}
          <span onClick={() => voteInPoll(pollVotes, 1, 2)}>Option 2</span>
          {' | '}
          <span onClick={() => voteInPoll(pollVotes, 1, 3)}>Option 3</span>
        </div>

        <div
          className={`${testStyle}`}
          onClick={() => sendPubNubMessage(pollResults, testPolls[0])}
        >
          End Poll 1 (send results)
        </div>

        <div
          className={`${testStyle}`}
          onClick={() => sendPubNubMessage(pollDeclarations, testPolls[1])}
        >
          Start Poll 2
        </div>

        <div className={`${testStyle}`}>
          <span className='cursor-default'>Vote in Poll 2:</span>{' '}
          <span onClick={() => voteInPoll(pollVotes, 2, 1)}>Option 1</span>
          {' | '}
          <span onClick={() => voteInPoll(pollVotes, 2, 2)}>Option 2</span>
        </div>

        <div
          className={`${testStyle}`}
          onClick={() => sendPubNubMessage(pollResults, testPolls[1])}
        >
          End Poll 2 (send results)
        </div>

        <div
          className={`${testStyle}`}
          onClick={() => sendPubNubMessage(pollDeclarations, testPolls[2])}
        >
          Start Poll 3
        </div>

        <div className={`${testStyle}`}>
          <span className='cursor-default'>Vote in Poll 3:</span>{' '}
          <span onClick={() => voteInPoll(pollVotes, 3, 1)}>Option 1</span>
          {' | '}
          <span onClick={() => voteInPoll(pollVotes, 3, 2)}>Option 2</span>
          {' | '}
          <span onClick={() => voteInPoll(pollVotes, 3, 3)}>Option 3</span>
          {' | '}
          <span onClick={() => voteInPoll(pollVotes, 3, 4)}>Option 4</span>
          {' | '}
          <span onClick={() => voteInPoll(pollVotes, 3, 5)}>Option 5</span>
        </div>

        <div
          className={`${testStyle}`}
          onClick={() => sendPubNubMessage(pollResults, testPolls[2])}
        >
          End Poll 3 (send results)
        </div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(serverVideoControlChannelId, {
              type: 'ON_DEMAND_SCRIPT',
              params: { scriptName: 'cheer' }
            })
          }
        >
          Mock Illuminate requesting a poll (Cheering)
        </div>

        <div
          className={`${testStyle}`}
          onClick={() =>
            sendPubNubMessage(serverVideoControlChannelId, {
              type: 'ON_DEMAND_SCRIPT',
              params: { scriptName: 'angry' }
            })
          }
        >
          Mock Illuminate requesting a poll (Anger)
        </div>



        {/* Hype Meter Testing Section */}
        <div className='text-xl font-bold mt-8 mb-4 text-white'>
          🔥 Hype Meter Testing
        </div>
        
        <div
          className={`${testStyle}`}
          onClick={() => sendHypeBoost()}
        >
          🚀 Add +50% Hype Boost
        </div>

        {/* Translation Testing Section */}
        <div className='text-xl font-bold mt-8 mb-4 text-white'>
          🌐 Translation Function Testing
        </div>
        
        <div
          className={`${testStyle}`}
          onClick={() => testPortugueseTranslation()}
        >
          📝 Send Portuguese Message (Test Translation)
        </div>
        
        <div
          className={`${testStyle}`}
          onClick={() => listenForTranslations()}
        >
          👂 Listen for Translations (Check Console)
        </div>
        
        <div
          className={`${testStyle}`}
          onClick={() => testMultiplePortugueseMessages()}
        >
          🔄 Send Multiple Portuguese Messages
        </div>
        
        <div
          className={`${testStyle}`}
          onClick={() => testMessageWithTranslation()}
        >
          🧪 Test Message with Embedded Translation
        </div>

        {/* History Management Section */}
        <div className='text-xl font-bold mt-8 mb-4 text-red-400'>
          🧹 History Management
        </div>
        
        <div
          className={`${testStyle} font-bold text-red-400 border border-red-400 p-2 rounded hover:bg-red-900`}
          onClick={() => {
            if (confirm('⚠️ This will permanently delete ALL message history from ALL project channels. Are you sure?')) {
              clearAllPubNubHistory();
            }
          }}
        >
          🗑️ Clear All PubNub History (DESTRUCTIVE)
        </div>
        
        <div className='text-sm text-gray-400 mb-4'>
          ⚠️ This will remove all stored messages from all WSL and game channels. Check the console for progress updates.
        </div>

        <div className='text-xl'>Match Statistics</div>

        <div className={`${testStyle}`} onClick={() => sendMatchStatsMessage()}>
          Send Random Match Stats
        </div>

        <div className='text-xl'>Live Commentary</div>
        <div
          className={`${testStyle}`}
          onClick={() => sendLiveCommentaryMessage()}
        >
          Send a Live Commentary Message
        </div>
      </div>
    </main>
  )
}
