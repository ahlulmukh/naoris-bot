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
    this.deviceHashes = Array.isArray(account.deviceHash)
      ? account.deviceHash
      : [account.deviceHash];
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
    const proxyOptions = this.proxy ? { flag: ["--proxy", this.proxy] } : {};

    try {
      const response = await new RequestBuilder()
        .url(`https://naorisprotocol.network/claim-api/auth/generateToken`)
        .method("POST")
        .headers(headers)
        .body(JSON.stringify(sendData))
        .send({ ...proxyOptions });
      const jsonResponse =
        typeof response.response === "string"
          ? JSON.parse(response.response)
          : response.response;
      this.token = jsonResponse.token;
      return jsonResponse;
    } catch (error) {
      logger.log(`{red-fg}Error get token ${error.message}{/red-fg}`);
      return null;
    }
  }

  setToken(token) {
    this.token = token;
  }

  async activatedNode(state, maxRetries = 5) {
    for (const deviceHash of this.deviceHashes) {
      let retries = 0;
      const sendData = {
        walletAddress: this.account.walletAddress,
        state: state,
        deviceHash: deviceHash,
      };

      const headers = {
        "User-Agent": this.userAgent,
        Authorization: `Bearer ${this.token}`,
        Referer: "https://naorisprotocol.network/sec-api/api",
        "Content-Type": "application/json",
      };

      while (retries < maxRetries) {
        try {
          const response = await new RequestBuilder()
            .url(`https://naorisprotocol.network/sec-api/api/toggle`)
            .method("POST")
            .headers(headers)
            .body(JSON.stringify(sendData))
            .send();

          if (
            response.response === "Session started" ||
            response.response === "No action needed"
          ) {
            logger.log(`{green-fg}Device ${deviceHash} activated{/green-fg}`);
            break;
          }
        } catch (error) {
          logger.log(
            `{red-fg}Attempt ${
              retries + 1
            } failed for device ${deviceHash}{/red-fg}`
          );
        }

        retries++;
        if (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      if (retries === maxRetries) {
        logger.log(
          `{red-fg}Failed to activate device ${deviceHash} after ${maxRetries} attempts{/red-fg}`
        );
      }
    }
  }

  async checkNodeactivate() {
    const headers = {
      Authorization: `Bearer ${this.token}`,
      "User-Agent": this.userAgent,
      Referer: "https://naorisprotocol.network/sec-api/api",
      "Content-Type": "application/json",
    };
    const proxyOptions = this.proxy ? { flag: ["--proxy", this.proxy] } : {};
    try {
      const response = await new RequestBuilder()
        .url(`https://naorisprotocol.network/ext-api/api/active-nodes`)
        .method("GET")
        .headers(headers)
        .send({ ...proxyOptions });

      const jsonResponse =
        typeof response.response === "string"
          ? JSON.parse(response.response)
          : response.response;

      if (jsonResponse && jsonResponse["active-nodes"]) {
        const nodes = jsonResponse["active-nodes"].nodes;

        for (const deviceHash of this.deviceHashes) {
          const node = nodes.find((n) => n.deviceHash === deviceHash);

          if (node && node.startTime === null) {
            logger.log(
              `{yellow-fg}Device ${deviceHash} inactive, reactivating...{/yellow-fg}`
            );
            await this.activatedNode("ON");
          }
        }
      }
      return jsonResponse;
    } catch (error) {
      logger.log(
        `{red-fg}Error checking node activation: ${error.message}{/red-fg}`
      );
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
    const proxyOptions = this.proxy ? { flag: ["--proxy", this.proxy] } : {};
    try {
      const response = await new RequestBuilder()
        .url(`https://naorisprotocol.network/sec-api/api/addWhitelist`)
        .method("POST")
        .headers(headers)
        .body(JSON.stringify(sendData))
        .send({ ...proxyOptions });
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
    for (const deviceHash of this.deviceHashes) {
      logger.log(
        `{yellow-fg}Sending ping for ${this.account.walletAddress} (Device: ${deviceHash}){/yellow-fg}`
      );

      const sendData = {
        topic: "device-heartbeat",
        inputData: {
          walletAddress: this.account.walletAddress,
          deviceHash: deviceHash,
        },
      };

      const headers = {
        Authorization: `Bearer ${this.token}`,
        "User-Agent": this.userAgent,
        Referer: "https://naorisprotocol.network/sec-api/api",
        "Content-Type": "application/json",
      };

      let retries = 3;
      while (retries > 0) {
        try {
          const response = await new RequestBuilder()
            .url(`https://naorisprotocol.network/sec-api/api/produce-to-kafka`)
            .method("POST")
            .headers(headers)
            .body(JSON.stringify(sendData))
            .send();

          const rawResponse = response.response;

          if (
            typeof rawResponse === "string" &&
            rawResponse.startsWith("<!DOCTYPE html>")
          ) {
            logger.log(
              `{red-fg}Server returned an HTML error page for device ${deviceHash}, retrying...{/red-fg}`
            );
            retries--;
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          }

          try {
            const jsonResponse = JSON.parse(rawResponse);

            if (jsonResponse.message === "Message production initiated") {
              logger.log(
                `{green-fg}Ping sent successfully for device ${deviceHash}{/green-fg}`
              );
              break;
            } else {
              logger.log(
                `{red-fg}Ping failed for device ${deviceHash}: ${JSON.stringify(
                  jsonResponse
                )}{/red-fg}`
              );
            }
          } catch (jsonError) {
            logger.log(
              `{red-fg}Invalid JSON response for device ${deviceHash}: ${rawResponse}{/red-fg}`
            );
          }
        } catch (error) {
          logger.log(
            `{red-fg}Error sending ping for device ${deviceHash}: ${error.message}{/red-fg}`
          );
        }

        retries--;
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
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
      await this.activatedNode("ON");
      logger.log(
        `{green-fg}Account ${this.account.walletAddress} activated{/green-fg}`
      );

      let cycleCount = 0;
      this.timer = setInterval(async () => {
        try {
          cycleCount++;
          this.uptimeMinutes++;
          if (cycleCount % 5 === 0) {
            logger.log(`{cyan-fg}Checking active nodes{/cyan-fg}`);
            await this.checkNodeactivate();
          }
          await this.sendPingRequest();
          if (!this.toggleState) {
            await this.activatedNode("ON");
          }
        } catch (error) {
          logger.log(
            `{red-fg}Error processing account ${this.account.walletAddress}: ${error.message}{/red-fg}`
          );
        }
      }, 30000);
    } catch (error) {
      logger.log(
        `{red-fg}Error processing account ${this.account.walletAddress}: ${error.message}{/red-fg}`
      );
    }
  }
}

module.exports = naorisProtocol;
