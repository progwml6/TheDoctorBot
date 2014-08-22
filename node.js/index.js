/*
  Make sure the bot runs from the correct directory.
    (Fix using require(), loading plugins, etc.)
*/
if (process.cwd() !== __dirname) {
   console.log('Attempting to switch directory... '+process.cwd()+' -> '+__dirname);
   try {
      process.chdir(__dirname);
      if (process.cwd() !== __dirname) {
         console.log('Switching directory failed...');
         process.exit(1);
      }
      console.log('Switch successful.');
    } catch (err) {
      console.trace(err);
      process.exit(1);
   }
}

/*
 Quick example of the "Bot" lib.
*/
var bot = require('./libs/bot'),
    conf = require('./config');

var Bot = bot(conf.irc);

Bot.connect();

Bot.on('001',function () {
    Bot.raw("join "+conf.irc.channels.join(','));
});
Bot.on('join',function (user,chan) {
    if (user[1] == conf.irc.username) {
       Bot.raw("PRIVMSG "+chan+" :Hello, I'm an IRC bot!");
     } else {
       Bot.raw("PRIVMSG "+chan+" :Hello, "+user[1]+"! I'm an IRC bot.");
    };
});
