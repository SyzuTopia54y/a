const { RTTEXPack, RTTEXUnpack } = require("rttexconverter");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

module.exports = {
  name: "rttex2png",
  description: "Converts an RTTEX file to a PNG file",
  usage: "<prefix>rttex2png",
  aliases: ["rttex2png"],
  permissions: [],
  cooldown: 3000,
  async run(client, message, args) {
    try {
      await message.reply("Please upload the RTTEX file to convert within the next 30 seconds.");

      // Wait for the user to send a file
      const filter = (m) => m.author.id === message.author.id && m.attachments.size > 0;
      const collector = message.channel.createMessageCollector(filter, { time: 30000, max: 1 });

      // Wait for the collector to finish collecting
      collector.on("collect", async (m) => {
        const attachment = m.attachments.first();
        const extension = path.extname(attachment.name);

        if (extension !== ".rttex") {
          return message.reply("Please upload an RTTEX file.");
        }

        const cacheDir = `./cache/${message.author.id}`;

        // Make the cache directory if it doesn't exist
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }

        // Download the RTTEX file to the user's cache directory
        const response = await fetch(attachment.url);
        const buffer = await response.buffer();
        const rttexName = `${cacheDir}/${attachment.name}`;
        fs.writeFileSync(rttexName, buffer);

        // Convert the RTTEX file to PNG using rttexconverter
        const pngName = `${cacheDir}/${path.basename(rttexName, ".rttex")}.png`;
        const rttexBuffer = await RTTEXUnpack(rttexName);
        fs.writeFileSync(pngName, rttexBuffer);

        // Send the PNG back to the user
        await message.channel.send({ files: [{ attachment: pngName, name: `${attachment.name}.png` }] });

        // Remove both the RTTEX and PNG files
        fs.unlinkSync(rttexName);
        fs.unlinkSync(pngName);
        fs.rmdirSync(cacheDir, { recursive: true });
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          message.reply("No RTTEX file was uploaded within the specified time.");
        }
      });
    } catch (error) {
      console.error(error);
      return message.reply("An error occurred during conversion");
    }
  },
};
