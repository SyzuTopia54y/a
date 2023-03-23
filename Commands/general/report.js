const fs = require('fs');
const path = require('path');

module.exports = {
  name: "report",
  description: "Report an issue",
  usage: "<prefix>report [message]",
  aliases: ["report"],
  permissions: [],
  cooldown: 3000,
  run: async (client, message, args) => {
    const reportMessage = args.join(' ');
    if (!reportMessage) {
      return message.channel.send('Please provide a report message');
    }

    const reportId = Date.now();
    const reportFilePath = path.join('./reports', `${reportId}.txt`);

    const reporterId = message.author.id;
    const reportData = {
      reporterId: reporterId,
      reportMessage: reportMessage
    };
    fs.writeFileSync(reportFilePath, JSON.stringify(reportData));

    const owner = await client.users.fetch('1023576568934707261');
    owner.send(`New report (ID: ${reportId}) from <@${reporterId}>:\n${reportMessage}`);

    message.channel.send(`Report sent successfully`);
  },
};
