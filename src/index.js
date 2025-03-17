const naorisProtocol = require("./main/naorisProtocol");
const chalk = require("chalk");
const { getRandomProxy, loadProxies } = require("./main/proxy");
const fs = require("fs");
const { logMessage } = require("./utils/logger");

async function main() {
  console.log(
    chalk.cyan(`
░█▀▄░█▀█░█░█░█▀█
░█░█░█▀█░█▄█░█░█
░▀▀░░▀░▀░▀░▀░▀░▀
    By : El Puqus Airdrop
    github.com/ahlulmukh
 Use it at your own risk
  `)
  );

  try {
    const accounts = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
    const count = accounts.length;
    const proxiesLoaded = loadProxies();
    if (!proxiesLoaded) {
      logMessage(
        null,
        null,
        "Failed to load proxies, using default IP",
        "warning"
      );
    }
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      try {
        console.log(chalk.white("-".repeat(85)));
        const currentProxy = await getRandomProxy();
        const naoris = new naorisProtocol(account, currentProxy, i + 1, count);
        await naoris.processAccount();
      } catch (error) {
        logMessage(
          null,
          null,
          `Failed to process account: ${error.message}`,
          "error"
        );
      }
    }
  } catch (error) {
    logMessage(null, null, `Main process failed: ${error.message}`, "error");
  }
}

main();
