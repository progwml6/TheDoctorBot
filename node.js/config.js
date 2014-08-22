/*
  Bot config.
*/
module.exports = {
       irc: {
          username: "BOT",
          channels: ["#CHANNEL","#CHANNEL2"],
          oauth: "oauth key",
          server: {
              address: "irc.twitch.tv",
              port: "6667",
          },
          debug: 1, // Output ALL messages to console.
       }
};
