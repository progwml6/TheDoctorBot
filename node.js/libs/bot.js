var events = require('events'),
    net = require('net'),
    util = require('util');

/*
  Twitch IRC bot lib.
*/
function Bot (config) {
         if (!(this instanceof Bot)) {
            return new Bot(config);
         };
         events.EventEmitter.call(this);
         this.config = config||{};

         this.irc = {
              users: [], // DO NOT USE AN ARRAY HERE! Protect against __proto__ inject and similar.
              channels: [], // DO NOT USE AN ARRAY HERE! Protect against __proto__ inject and similar.
              buffer: '', // Empty var for buffering messages before parsing.
         };

         this.on("ping",function(source) {
               self.raw('PONG :'+source);
         });

         return this; // Make Bot() chainable.
}
util.inherits(Bot,events.EventEmitter);

/*
  Manage connection.
*/
Bot.prototype.connect = function () {
         var self = this;
         self.opts = {
              port: (("address" in self.config.server)?self.config.server.port:6667),
              host: (("address" in self.config.server)?self.config.server.address:"irc.twitch.tv"),
         };

         self.socket = net.connect(self.opts,function () {
              self.raw('PASS '+self.config.oauth+'\nNICK '+self.config.username+'\nUSER '+self.config.username+' * * :'+self.config.username);
         });

         self.socket.on('data',function(data) {
              self.socket.setTimeout(180000);
              self.buffer(data);
         });
}

/*
  Send full IRC strings to the server.
*/
Bot.prototype.raw = function (data,nocolor) {
         var self = this;
         if (('socket' in self) && self.socket.writable) {
            self.socket.write(data+'\n', 'utf8', function() {
               if (self.config.debug) {
                  console.log("O -> "+data);
               }
            });
          } else {
            console.log("E -> Socket not writable!");
         }
}

/*
  Buffer all messages from IRC, then pass
  the result to Bot.parse to read them.
*/
Bot.prototype.buffer = function (data) {
         var self = this;
         self.irc.buffer += data.toString();
         while (self.irc.buffer) {
               var offset = self.irc.buffer.search(/\r?\n/);
               if (offset < 0) {
                  return;
               }
               var message = self.irc.buffer.substr(0,offset);
               self.irc.buffer = self.irc.buffer.substr(offset+2);
               if (self.config.debug) {
                  console.log("I -> "+message);
               }
               self.parse(message);
         }
}

/*
  Parse each IRC message and pass to the emitter.
*/
Bot.prototype.parse = function (data) {
         var exp = data.split(' '), match;
         if (exp.length > 1) {
            switch (exp[0].toLowerCase()) {
               case 'ping':
                    return this.emit('ping',(exp[1]?exp[1].replace(/:/,''):"PONG"));
            }
            if (exp[0] && (match = exp[0].replace(/:/,'').match(/^([^!]+)!([^@]+)@(.+)[^ ]$/))) {
               var user = match;
            }
            var chan = ((match = String(exp[2]).match(/^:?#[^\x07\x2C\s]{0,200}$/))?String(match[0]).toLowerCase().replace(/^:/,''):null);

            
            switch (String(exp[1]).toLowerCase()) { // Emit what IRC commands you require.
                   case 'join':
                        this.emit('join',user,chan);
                        break;
                   default:
                        this.emit(exp[1].toLowerCase(),exp,data); //Attempt to emit everything else thats not listed.
            }
         }
}


/*
  Export the bot lib.
*/
module.exports = Bot;
