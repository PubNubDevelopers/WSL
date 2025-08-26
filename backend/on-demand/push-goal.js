exports.goalScored = [
  {
    delayOffsetInMs: 0,
    persistInHistory: false,
    action: {
      channel: "game.push-sales",   //  Only the sales-led demo supports this push message
      data: {
        text: 'PubNub Push Notification',
        pn_fcm: {
          data: {
            title: 'Pipeline Masters',
            body: 'Griffin scores 9.2!'
          },
          android: {
            priority: 'high',
          }
        }
      },
    },
  },
];
