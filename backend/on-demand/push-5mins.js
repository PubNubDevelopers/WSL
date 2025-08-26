exports.fiveMinutesRemaining = [
  {
    delayOffsetInMs: 0,
    persistInHistory: false,
    action: {
      channel: "game.push-sales", //  Only the sales-led demo supports this push message
      data: {
        text: 'PubNub Push Notification',
        pn_fcm: {
          data: {
            title: 'Final Minutes',
            body: "Griffin leading with 2 minutes left!"
          },
          android: {
            priority: 'high',
          }
        }
      },
    },
  },
];
