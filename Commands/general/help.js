const fs = require('fs');
const path = require('path');
const Discord = require('discord.js12');

module.exports = {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  usage: '[command name]',
  aliases: ['commands'],
  permissions: [],
  cooldown: 5,
 async run(client, message, args) {
    const { commands } = message.client;
    const prefix = 'sy!'; // Change this to your prefix

    if (!args.length) {
      // List all available commands in categories
      const commandFolders = fs.readdirSync('./commands');
      const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('List of Commands')
        .setDescription('Here\'s a list of all my commands:')
        .setFooter(`You can send ${prefix}help [command name] to get info on a specific command!`);
      for (const folder of commandFolders) {
        if (folder === 'owner') continue;
        const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
        const category = folder.toUpperCase();
        const commandList = commandFiles.map(file => {
          const command = require(`../${folder}/${file}`);
          return `\`${command.name}\``;
        }).join(', ');
        embed.addField(category, commandList);
      }
      message.channel.send(embed);
    } else {
      // Show details of a specific command
      const name = args[0].toLowerCase();
      const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

      if (!command) {
        return message.reply('That\'s not a valid command!');
      }

      const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Command: ${command.name}`)
        .setDescription(command.description || 'No description available.')
        .addField('Usage', `${prefix}${command.name} ${command.usage || ''}`);
      if (command.aliases) embed.addField('Aliases', command.aliases.join(', '));
      message.channel.send(embed);
    }
  },
};
