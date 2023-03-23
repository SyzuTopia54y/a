const { spawn } = require("child_process");
const fs = require("fs/promises");
const path = require("path");
const fetch = require("node-fetch");

module.exports = {
  name: "itemsenc",
  description: "Encoding Items.dat",
  usage: "<prefix>itemsenc",
  aliases: ["itemsenc"],
  permissions: [],
  cooldown: 3000,
  run: async (client, message, args) => {
    try {
      const msg = await message.reply("Please send the `data.txt` file within 30 seconds or type anything to cancel.");

      // Set up message collector to cancel process if user types anything
      const filter2 = (m) => m.author.id === message.author.id && m.attachments.size === 0; // Only collect messages with no attachments
      const options2 = { max: 1, time: 30000 };
      const collector = message.channel.createMessageCollector(filter2, options2);

      collector.on("collect", async () => { // add async keyword to use await inside the function
        await message.reply("Process Canceled!");
        collector.stop("User input received");
      });
      // Set up file attachment collector
      const filter = (m) => m.author.id === message.author.id && m.attachments.size > 0;
      const options = { max: 1, time: 30000, errors: ["time"] };
      const collected = await message.channel.awaitMessages(filter, options);

      // Stop message collector to prevent further processing
      collector.stop();

      if (!collected || collected.size === 0) {
        return message.reply("Process canceled: no file received within 30 seconds.");
      }
      const attachment = collected.first().attachments.first();
      if (!attachment || !attachment.name.endsWith(".txt")) {
        return message.reply("Process canceled: please send a `*.txt` file.");
      }
      const filename = attachment.name;
      const file = await fetch(attachment.url);
      await fs.writeFile(`./cache/encdec/${filename}`, await file.buffer());

      let decCommand;
    if (process.platform === "win32") {
      decCommand = "enc.exe";
    } else {
      try {
        // Check if the "enc" command exists on Linux
        decCommand = "enc";
      } catch {
        // Use "enc.exe" on Windows or if "enc" doesn't exist on Linux
        decCommand = "enc.exe";
      }
    }

    const processingMsg = await message.reply("Processing, please wait...");
    const decProcess = spawn(decCommand, [`./cache/encdec/${filename}`, "-dont_pause"]);
    decProcess.stdout.on("data", (data) => {
    });

    decProcess.stderr.on("data", (data) => {
    });


      decProcess.on("close", async (code) => {
        await message.reply("Here you go", {
          files: ["./items.dat"],
        });
        const itemsdatPath = `./cache/encdec/${filename}`;
        const dataTxtPath = "./items.dat";
        await fs.unlink(itemsdatPath);
        await fs.unlink(dataTxtPath);
      });
      decProcess.on("exit", (code) => {
      });
    } catch (error) {
      console.error(error);
      await message.reply("Process Canceled, Please Try again.");
    }
  },
};
