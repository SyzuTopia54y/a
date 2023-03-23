const fs = require('fs');
const path = require('path');

module.exports = {
  name: "answer",
  description: "Answer a report",
  usage: "<prefix>answer [reportId] [message]",
  aliases: ["answer"],
  permissions: [],
  cooldown: 3000,
  run: async (client, message, args) => {
    // Check if the user is the server owner
    if (message.author.id !== '1023576568934707261') {
      return ;
    }

    const reportId = args[0];
    const answerMessage = args.slice(1).join(' ');

    if (!reportId || !answerMessage) {
      return message.channel.send('Please provide a report ID and an answer message');
    }

    const reportFilePath = path.join('./reports', `${reportId}.txt`);
    if (!fs.existsSync(reportFilePath)) {
      return message.channel.send(`Report with ID ${reportId} not found`);
    }

    const reportDataString = fs.readFileSync(reportFilePath, 'utf8');
    const reportData = JSON.parse(reportDataString);

    const reportAuthorId = reportData.reporterId;
    const reportAuthor = await client.users.fetch(reportAuthorId);
    reportAuthor.send(`The answer from Owner for following report : ${reportData.reportMessage}\n\nAnswer: ${answerMessage}`);

    fs.unlinkSync(reportFilePath);

    message.channel.send(`Report with ID ${reportId} answered successfully`);
  },
};
