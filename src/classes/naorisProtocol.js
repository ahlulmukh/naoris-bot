const logger = require("../utils/logger");
const UserAgent = require("user-agents");
const userAgent = new UserAgent().toString();
const { RequestBuilder } = require("ts-curl-impersonate");

class naorisProtocol {
  constructor(account, proxy = null) {
    this.account = account;
    this.proxy = proxy;
    this.stats = {
      todayEarnings: 0,
      totalEarnings: 0,
      todayUptime: 0,
    };
    this.uptimeMinutes = 0;
    this.deviceHash = account.deviceHash;
    this.toggleState = true;
    this.userAgent = userAgent;
    this.isInstalled = true;
    this.token = null;
  }

  async generateToken() {
    const sendData = {
      wallet_address: this.account.walletAddress,
    };
    const headers = {
      "User-Agent": this.userAgent,
      Referer: "https://naorisprotocol.network/sec-api/api",
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: "chrome-extension://cpikalnagknmlfhnilhfelifgbollmmp",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "none",
    };
    try {
      const response = await new RequestBuilder()
        .url(`https://naorisprotocol.network/claim-api/auth/generateToken`)
        .method("POST")
        .headers(headers)
        .flag("--proxy", this.proxy)
        .body(JSON.stringify(sendData))
        .send();
      const jsonResponse =
        typeof response.response === "string"
          ? JSON.parse(response.response)
          : response.response;
      this.token = jsonResponse.token;
      return jsonResponse;
    } catch (error) {
      logger.log(`{red-fg}Error get token{/red-fg}`);
      return null;
    }
  }

  setToken(token) {
    this.token = token;
  }

  async activatedNode(state, maxRetries = 5) {
    const sendData = {
      walletAddress: this.account.walletAddress,
      state: state,
      deviceHash: this.deviceHash,
    };

    const headers = {
      "User-Agent": this.userAgent,
      Referer: "https://naorisprotocol.network/sec-api/api",
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: "chrome-extension://cpikalnagknmlfhnilhfelifgbollmmp",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "none",
    };

    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await new RequestBuilder()
          .url(`https://naorisprotocol.network/sec-api/api/toggle`)
          .method("POST")
          .headers(headers)
          .flag("--proxy", this.proxy)
          .body(JSON.stringify(sendData))
          .send();

        if (
          (state === "ON" && response.response === "Session started") ||
          response.response === "No action needed"
        ) {
          return response.response;
        }
      } catch (error) {
        logger.log(`{red-fg}Attempt ${retries + 1} failed{/red-fg}`);
      }

      retries++;
      if (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    logger.log(
      `{red-fg}Max retries (${maxRetries}) reached. Unable to activate/deactivate node.{/red-fg}`
    );
    return null;
  }

  async checkNodeactivate() {
    const headers = {
      Authorization: `Bearer ${this.token}`,
      "User-Agent": this.userAgent,
      Referer: "https://naorisprotocol.network/sec-api/api",
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: "chrome-extension://cpikalnagknmlfhnilhfelifgbollmmp",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "none",
    };

    try {
      const response = await new RequestBuilder()
        .url(`https://naorisprotocol.network/ext-api/api/active-nodes`)
        .method("GET")
        .headers(headers)
        .flag("--proxy", this.proxy)
        .send();
      const jsonResponse =
        typeof response.response === "string"
          ? JSON.parse(response.response)
          : response.response;
      return jsonResponse;
    } catch (error) {
      logger.log(`{red-fg}Error checknode account:{/red-fg}`);
      return null;
    }
  }

  async addWhitelist() {
    const sendData = {};
    const headers = {
      Authorization: `Bearer ${this.token}`,
      "User-Agent": this.userAgent,
      Referer: "https://naorisprotocol.network/sec-api/api",
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: "chrome-extension://cpikalnagknmlfhnilhfelifgbollmmp",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "none",
    };

    try {
      const response = await new RequestBuilder()
        .url(`https://naorisprotocol.network/sec-api/api/addWhitelist`)
        .method("POST")
        .headers(headers)
        .flag("--proxy", this.proxy)
        .body(JSON.stringify(sendData))
        .send();
      const jsonResponse =
        typeof response.response === "string"
          ? JSON.parse(response.response)
          : response.response;
      return jsonResponse;
    } catch (error) {
      logger.log(`{red-fg}Error checknode account:{/red-fg}`);
      return null;
    }
  }

  async sendPingRequest() {
    logger.log(
      `{yellow-fg}Send ping for ${this.account.walletAddress}{/yellow-fg}`
    );
    const sendData = {
      topic: "device-heartbeat",
      inputData: {
        walletAddress: this.account.walletAddress,
        deviceHash: this.deviceHash,
      },
    };

    const headers = {
      Authorization: `Bearer ${this.token}`,
      "User-Agent": this.userAgent,
      Referer: "https://naorisprotocol.network/sec-api/api",
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: "chrome-extension://cpikalnagknmlfhnilhfelifgbollmmp",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "none",
    };

    try {
      const response = await new RequestBuilder()
        .url(`https://naorisprotocol.network/sec-api/api/produce-to-kafka`)
        .method("POST")
        .headers(headers)
        .flag("--proxy", this.proxy)
        .body(JSON.stringify(sendData))
        .send();
      const jsonResponse =
        typeof response.response === "string"
          ? JSON.parse(response.response)
          : response.response;
      if (jsonResponse.message === "Message production initiated") {
        logger.log(
          `{green-fg}Ping account ${this.account.walletAddress}sent succesfully{/green-fg}`
        );
        return jsonResponse;
      }
      return false;
    } catch (error) {
      logger.log(`{red-fg}Error ping account:{/red-fg}`);
      return null;
    }
  }

  async getWalletAccount() {
    const sendData = {
      walletAddress: this.account.walletAddress,
    };

    const headers = {
      Authorization: `Bearer ${this.token}`,
      "User-Agent": this.userAgent,
      Referer: "https://naorisprotocol.network/sec-api/api",
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: "chrome-extension://cpikalnagknmlfhnilhfelifgbollmmp",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "none",
    };

    try {
      const response = await new RequestBuilder()
        .url(
          `https://naorisprotocol.network/testnet-api/api/testnet/walletDetails`
        )
        .method("POST")
        .headers(headers)
        .flag("--proxy", this.proxy)
        .body(JSON.stringify(sendData))
        .send();

      const jsonResponse =
        typeof response.response === "string"
          ? JSON.parse(response.response)
          : response.response;

      if (jsonResponse.error === false) {
        this.stats.todayEarnings = jsonResponse.details.todayEarnings || 0;
        this.stats.totalEarnings = jsonResponse.details.totalEarnings || 0;
        this.stats.todayUptime = jsonResponse.details.todayUptimeMinutes || 0;
        return jsonResponse;
      }
      return false;
    } catch (error) {
      logger.log(`{red-fg}Error get wallet account:{/red-fg}`);
      return null;
    }
  }

  async processAccount() {
    try {
      const gaskan = await this.activatedNode("ON");
      if (gaskan === "Session started" || gaskan === "No action needed") {
        logger.log(
          `{green-fg}Device ${this.account.walletAddress} activated successfully{/green-fg}`
        );
        await this.sendPingRequest();
        let cycleCount = 0;

        this.timer = setInterval(async () => {
          try {
            cycleCount++;
            this.uptimeMinutes++;

            if (cycleCount % 5 === 0) {
              logger.log(`{cyan-fg}Trying checking nodes{/cyan-fg}`);
              const activeNodes = await this.checkNodeactivate();
              if (activeNodes && activeNodes["active-nodes"]) {
                const nodes = activeNodes["active-nodes"].nodes;
                const node = nodes.find(
                  (n) => n.deviceHash === this.deviceHash
                );
                if (node && node.startTime === null) {
                  logger.log(
                    `{yellow-fg}Node with deviceHash ${this.deviceHash} has null startTime. Activating node...{/yellow-fg}`
                  );
                  const tryactive = await this.activatedNode("ON");
                  if (tryactive === "Session started") {
                    logger.log(`{green-fg}Node activated again{/green-fg}`);
                  }
                }
              }
            }

            if (!this.toggleState) {
              await this.activatedNode("ON");
            }
            await this.sendPingRequest();
          } catch (error) {
            logger.log(
              `{red-fg}Error processing account ${this.account.walletAddress}: ${error.message}{/red-fg}`
            );
          }
        }, 20000);
      }
    } catch (error) {
      logger.log(
        `{red-fg}Error processing account ${this.account.walletAddress}: ${error.message}{/red-fg}`
      );
    }
  }
}

module.exports = naorisProtocol;
