const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const protonhash = require('protonhash.js');

module.exports = {
  name: 'protonhash',
  description: 'Generate hash from uploaded file',
  usage: '<prefix>protonhash',
  aliases: ['protonhash'],
  permissions: [],
  cooldown: 3000,
  async run(client, message, args) {
    try {
      const msg = await message.reply(
        'Please send a file within 30 seconds or type anything to cancel.'
      );

      const filter2 = (m) =>
        m.author.id === message.author.id && m.attachments.size === 0; // Only collect messages with no attachments
      const options2 = { max: 1, time: 30000 };
      const collector = message.channel.createMessageCollector(filter2, options2);

      collector.on('collect', async (m) => {
        await message.reply('Process canceled: ' + m.content);
        collector.stop();
      });

      const filter = (m) =>
        m.author.id === message.author.id && m.attachments.size > 0;
      const options = { max: 1, time: 30000, errors: ['time'] };
      const collected = await message.channel.awaitMessages(filter, options);

      collector.stop();

      if (!collected || collected.size === 0) {
        return message.reply(
          'Process canceled: no file received within 30 seconds.'
        );
      }

      const attachment = collected.first().attachments.first();

      if (!attachment) {
        return message.reply('Process canceled: please send a file.');
      }

      const cacheDir = `./cache/${message.author.id}`;

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filename = path.basename(attachment.name);
      const filepath = path.join(cacheDir, filename);

      const fileStream = fs.createWriteStream(filepath);

      await new Promise((resolve, reject) => {
        fetch(attachment.url)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Received ${res.status} ${res.statusText}`);
            }
            res.body.pipe(fileStream);
            res.body.on('error', reject);
            fileStream.on('finish', resolve);
          })
          .catch((err) => {
            fileStream.close();
            fs.unlinkSync(filepath);
            throw err;
          });
      });

      const hash = await protonhash.HashString(filepath);

      await message.reply(`Hash file success! Hash: ${hash}`);

      fs.unlinkSync(filepath);
    } catch (error) {
      console.error(error);
      await message.reply('Process canceled, please try again.');
    }
  },
};
