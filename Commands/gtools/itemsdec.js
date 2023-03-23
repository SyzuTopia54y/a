const { spawn } = require("child_process");
const fs = require("fs/promises");
const path = require("path");
const fetch = require("node-fetch");

// Initialize an empty queue
const queue = [];

module.exports = {
  name: "itemsdec",
  description: "Decoding Items.dat",
  usage: "<prefix>itemsdec",
  aliases: ["itemsdec"],
  permissions: [],
  cooldown: 3000,
  run: async (client, message, args) => {
    try {
      // Add the user to the queue and wait until it's their turn
      queue.push(message.author.id);
      while (queue[0] !== message.author.id) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before checking again
      }

      const msg = await message.reply("Please send the `items.dat` file within 30 seconds or type anything to cancel.");

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
      if (!attachment || !attachment.name.endsWith(".dat")) {
        return message.reply("Process canceled: please send a `*.dat` file.");
      }
      const filename = attachment.name;
      const file = await fetch(attachment.url);
      await fs.writeFile(`./cache/encdec/${filename}`, await file.buffer());

      let decCommand;
      if (process.platform === "win32") {
        decCommand = "dec.exe";
      } else {
        decCommand = "dec";
      }

      const processingMsg = await message.reply("Processing, please wait...");

      // Execute the dec.exe command and wait for it to finish
      const decProcess = spawn(decCommand, [`./cache/encdec/${filename}`, "-dont_pause"]);
      decProcess.stdout.on("data", (data) => {});

      decProcess.stderr.on("data", (data) => {});

      await new Promise((resolve) => {
        decProcess.on("close", async (code) => {
          await message.reply("Here you go", {
            files: ["./data.txt"],
          });
          const itemsdatPath = `./cache/encdec/${filename}`;
          const dataTxtPath = "./data.txt";
          await fs.unlink(itemsdatPath);
          await fs.unlink(dataTxtPath);

          // Remove the user from the queue when they're done
          queue.shift();
          resolve();
        });
        decProcess.on("exit", (code) => {});
      });
    } catch (error) {
      console.error(error);
      await message.reply("Process Canceled, Please Try again.");
    }
  },
};
