const Discord = require("discord.js12");
const https = require("https");
const fs = require("fs");

module.exports = {
  name: "sdatareader",
  description: "Server Data Reader",
  usage: "<prefix>sdatareader",
  aliases: ["sdatareader"],
  permissions: [],
  cooldown: 3000,
  run: async (client, message, args) => {
    let ip = args[0];
    if (ip.match(/^(http|https):\/\//)) {
      return message.reply("Please enter the IP address without 'http://' or 'https://://' in front.");
    }
    try {
      const proxyList = fs.readFileSync("proxy.txt", "utf-8").split("\n");
      const proxy = proxyList[Math.floor(Math.random() * proxyList.length)].split(":");
      const options = {
        hostname: ip,
        path: "/growtopia/server_data.php",
        method: "POST",
        agent: new https.Agent({
          rejectUnauthorized: false,
          proxy: {
            host: proxy[0],
            port: proxy[1],
            auth: ""
          }
        }),
        headers: {
          "User-Agent": "UbiServices_SDK_2019.Release.27_PC64_unicode_static"
        }
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          message.channel.send(`🔎 Searching for ${ip}`);
          message.channel.send(`\`\`\`css\n${data}\`\`\``);
        });
      });

      req.on("error", (error) => {
        message.channel.send(error);
      });

      req.end();
    } catch (err) {
      return message.channel.send(err);
    }
  }
};
