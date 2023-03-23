const { prefix, logs } = require("../botconfig.json");
const { Permissions } = require("discord.js12");

// Array of allowed servers' IDs
const allowedServers = ["1083366267198644316", "1056865170787414086", "1084303328156069908"];
const ownerId = "1023576568934707261";

module.exports = (client, message) => {
  // Check if the message author is a bot
  if (message.author.bot) return;

  // Check if the message is from an allowed server or owner
  if (message.content.startsWith(prefix) && !allowedServers.includes(message.guild?.id) && message.author.id !== ownerId) {
    // Check if the message is from a DM channel
    if (message.channel.type === "dm") {
      message.reply("**Can't respond on DMs! Join**\nhttps://discord.gg/anWygW89XR");
      return;
    }
    message.reply("**Can't respond on other Discord servers! Join**\nhttps://discord.gg/anWygW89XR");
    return;
  }

  if (message.content.startsWith(prefix) && message.guild.id === "1084303328156069908" && message.channel.id !== "1084303328822960178") {
  message.reply("Please use the <#1084303328822960178> channel to run this command.")
    .then((reply) => {
      reply.delete({ timeout: 60000 });
    });
  return;
}


if(!message.content.startsWith(prefix)) return;

let args = message.content.slice(prefix.length).trim().split(" ");
let command = args.shift().toLowerCase();
if(!command) return;

let commandFile = client.commands.get(command) || client.aliases.get(command);
if(!commandFile) return;

// Permissions Handler
let CommandPermission = commandFile.permissions;
for(let i = 0; i < CommandPermission.length; i++) {
let list = Object.keys(Permissions.FLAGS);
if(!list.some((perms) => perms.includes(CommandPermission[i]))) {
  throw new Error(`Permissions Flags [${CommandPermission[i]}] for Command: ${commandFile.name} is not listed`);
} else if (!message.member.hasPermission(CommandPermission[i])) {
  return message.channel.send(`Sorry dude, You need **${CommandPermission[i].split("_").join(" ")}** before using this command`);
}
}

//Cooldown Handler
let userTime = client.cooldown.get(message.author.id + commandFile.name);
let timeout = commandFile.cooldown;
let cooldown_time = timeout - (Date.now() - userTime);

let times = getDuration(cooldown_time);

if(cooldown_time > 0 && times) {
setTimeout(() => {
client.cooldown.delete(message.author.id + commandFile.name);
}, cooldown_time);
return message.channel.send(`Calm down dude, You need to wait **${times}**`);
}

client.cooldown.set(message.author.id + commandFile.name, Date.now());

try {
commandFile.run(client, message, args);
} catch(error) {
console.log(error.message);
} finally {
return;
}
}

function getDuration(ms) {

if(ms === 0) return false

let date = new Date(ms);
let seconds = date.getUTCSeconds() ? date.getUTCSeconds() + " Seconds" : "";
let minutes = date.getUTCMinutes() ? date.getUTCMinutes() + " Minutes, " : "";
let hours = date.getUTCHours() ? date.getUTCHours() + " Hours, " : "";
let days = date.getUTCDate() - 1 ? date.getUTCDate() - 1 + " Days, " : "";

let time = days + hours + minutes + seconds;
if(time === "") return false;

return time;
}