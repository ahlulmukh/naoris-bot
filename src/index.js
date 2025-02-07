const Dashboard = require("./classes/dashboard");
const logger = require("./utils/logger");
const path = require("path");
const { getRandomProxy, loadProxies } = require("./classes/proxy");
const fs = require("fs");
const NaorisProtocol = require("./classes/naorisProtocol");

const dashboard = new Dashboard();

const naoris = new Map();
let accounts = [];

async function main() {
  try {
    const accountsPath = path.join(__dirname, "..", "accounts.json");
    if (!fs.existsSync(accountsPath)) {
      logger.log(`{red-fg}Error: accounts.json not found{/red-fg}`);
      return;
    }

    const wallets = JSON.parse(fs.readFileSync(accountsPath, "utf-8"));
    logger.log(
      `{green-fg}Found ${wallets.length} accounts to process{/green-fg}`
    );

    const proxiesLoaded = loadProxies();
    if (!proxiesLoaded) {
      logger.log(`{red-fg}No proxy using default IP{/red-fg}`);
    }

    for (const wallet of wallets) {
      try {
        const currentProxy = await getRandomProxy();
        const naor = new NaorisProtocol(wallet, currentProxy);
        naoris.set(wallet.walletAddress, naor);
        await naor.generateToken();
        const userInfo = await naor.getWalletAccount();

        if (userInfo) {
          const account = {
            walletAddress: naor.account.walletAddress,
            stats: naor.stats,
          };
          accounts.push(account);
          await naor.processAccount();
        }
      } catch (error) {
        logger.log(
          `{red-fg}Error initializing account: ${error.message}{/red-fg}`
        );
      }

      dashboard.setAccounts(accounts);
      logger.log(
        `{green-fg}Waiting 10 seconds before initializing next account{/green-fg}`
      );
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    startAutoUpdate();
  } catch (error) {
    logger.log(`{red-fg}Main process failed: ${error.message}{/red-fg}`);
  }
}

async function startAutoUpdate() {
  setInterval(async () => {
    logger.log("{cyan-fg}Refreshing account data...{/cyan-fg}");
    const updatedAccounts = [];
    for (const [walletAddress, naor] of naoris) {
      try {
        await naor.getWalletAccount();
        updatedAccounts.push({
          walletAddress: naor.account.walletAddress,
          stats: naor.stats,
        });
      } catch (error) {
        logger.log(
          `{red-fg}Error refreshing account ${walletAddress}: ${error.message}{/red-fg}`
        );
      }
    }

    dashboard.setAccounts(updatedAccounts);
  }, 10 * 60 * 1000);
}

main();
