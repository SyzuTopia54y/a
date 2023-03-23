const { RTTEXPack } = require("rttexconverter");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const readline = require("readline");
const protonhash = require("protonhash.js");

module.exports = {
  name: "png2rttex",
  description: "Converts a PNG file to a RTTEX file and calculates hash",
  usage: "<prefix>png2rttex",
  aliases: ["png2rttex"],
  permissions: [],
  cooldown: 3000,
  async run(client, message, args) {
    try {
      await message.reply(
        "Please upload the image file to convert within the next 30 seconds. Type anything to cancel."
      );

      const filter = (m) =>
        m.author.id === message.author.id && m.attachments.size > 0;
      const collector = message.channel.createMessageCollector(filter, {
        time: 30000,
        max: 1,
      });

      let cancelled = false;
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      collector.on("collect", async (m) => {
        const attachment = m.attachments.first();
        const extension = path.extname(attachment.name);
        if (extension !== ".png") {
          return message.reply("Please upload a PNG image file.");
        }

        const cacheDir = `./cache/${message.author.id}`;

        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }

        function calculateHash(file) {
          return new Promise((resolve, reject) => {
            const size = protonhash.filesize(file);
            const data = protonhash.getA(file, size, false, false);
            if (data) {
              const hash = protonhash.HashString(data, size);
              resolve(hash);
            } else {
              reject(new Error("Failed to calculate hash"));
            }
          });
        }

        const response = await fetch(attachment.url);
        const buffer = await response.buffer();
        const pngName = `${cacheDir}/${attachment.name}`;
        fs.writeFileSync(pngName, buffer);

        const rttexName = `${cacheDir}/${path.basename(
          pngName,
          path.extname(pngName)
        )}.rttex`;
        const rttexBuffer = await RTTEXPack(pngName);
        fs.writeFileSync(rttexName, rttexBuffer);

        const hash = await calculateHash(rttexName);

        await message.reply({
          files: [{ attachment: rttexName, name: "result.rttex" }],
        });

        await message.reply(`\nHash: ${hash}`);
        fs.unlinkSync(rttexName);
        fs.unlinkSync(pngName);
        fs.rmdirSync(cacheDir, { recursive: true });
      });

      const rl1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl1.on("line", (input) => {
        cancelled = true;
        collector.stop();
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          message.reply(
            "No PNG file was uploaded within the specified time."
          );
        } else if (cancelled) {
          message.reply("PNG file conversion was cancelled.");
        }
      });
    } catch (err) {
      console.error(err);
      return message.reply("An error occurred during conversion");
    }
  },
};
