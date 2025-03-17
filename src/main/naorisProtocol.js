const { logMessage } = require("../utils/logger");
const UserAgent = require("user-agents");
const axios = require("axios");
const userAgent = new UserAgent().toString();

module.exports = class naorisProtocol {
  constructor(account, proxy = null, currentNum, total) {
    this.currentNum = currentNum;
    this.total = total;
    this.account = account;
    this.proxy = proxy;
    this.toggleState = null;
    this.token = null;
    this.totalEarnings = 0;
    this.userAgent = userAgent;
    this.axiosConfig = {
      ...(this.proxy && { httpsAgent: getProxyAgent(this.proxy) }),
      timeout: 120000,
      headers: {
        "User-Agent": this.userAgent,
        Referer: "https://naorisprotocol.network/sec-api/api",
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        Origin: "chrome-extension://cpikalnagknmlfhnilhfelifgbollmmp",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "none",
      },
    };
  }

  async makeRequest(method, url, config = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios({
          method,
          url,
          ...this.axiosConfig,
          ...config,
          validateStatus: (status) => status < 500,
        });

        return response;
      } catch (error) {
        logMessage(
          this.currentNum,
          this.total,
          `Request Failed ${error.message}`,
          "error"
        );

        logMessage(
          this.currentNum,
          this.total,
          `Retrying... (${i + 1}/${retries})`,
          "process"
        );
        await new Promise((resolve) => setTimeout(resolve, 12000));
      }
    }
    return null;
  }

  async generateToken() {
    logMessage(
      this.currentNum,
      this.total,
      `Generating token for ${this.account.walletAddress}`,
      "process"
    );

    const payload = {
      wallet_address: this.account.walletAddress,
    };

    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    try {
      const response = await this.makeRequest(
        "POST",
        "https://naorisprotocol.network/claim-api/auth/generateToken",
        { data: payload, headers: headers }
      );
      if (response.status === 200) {
        this.token = response.data.token;
        return response.data;
      }
      return null;
    } catch (error) {
      logMessage(
        this.currentNum,
        this.total,
        `Error get token ${error.message}`,
        "error"
      );
      return null;
    }
  }

  async activateNode(state) {
    const payload = {
      deviceHash: this.account.deviceHash,
      state: state,
      walletAddress: this.account.walletAddress,
    };

    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    try {
      const response = await this.makeRequest(
        "POST",
        "https://naorisprotocol.network/sec-api/api/switch",
        { data: payload, headers: headers }
      );
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      logMessage(
        this.currentNum,
        this.total,
        `Error activate node ${error.message}`,
        "error"
      );
      return null;
    }
  }

  async sendPingRequest() {
    logMessage(
      this.currentNum,
      this.total,
      `Sending ping for ${this.account.walletAddress} (Device: ${this.account.deviceHash})`,
      "process"
    );

    const payload = {};
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    try {
      const response = await this.makeRequest(
        "POST",
        "https://beat.naorisprotocol.network/api/ping",
        { data: payload, headers: headers }
      );
      if (response.status === 410) {
        logMessage(
          this.currentNum,
          this.total,
          `Ping Succesfully, total earnings : ${this.totalEarnings}`,
          "success"
        );
        return response.data;
      }
      return null;
    } catch (error) {
      logMessage(
        this.currentNum,
        this.total,
        `Error send ping request ${error.message}`,
        "error"
      );
      return null;
    }
  }

  async getDataAccount() {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    try {
      const response = await this.makeRequest(
        "GET",
        "https://naorisprotocol.network/sec-api/api/wallet-details",
        { headers: headers }
      );
      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      logMessage(
        this.currentNum,
        this.total,
        `Error get data account ${error.message}`,
        "error"
      );
      return null;
    }
  }

  async processAccount() {
    logMessage(
      this.currentNum,
      this.total,
      `Processing account ${this.account.walletAddress}`,
      "process"
    );

    try {
      await this.generateToken();
      const data = await this.getDataAccount();
      this.totalEarnings = data.message.totalEarnings;
      const updateInterval = setInterval(async () => {
        try {
          const updatedData = await this.getDataAccount();
          this.totalEarnings = updatedData.message.totalEarnings;
          logMessage(
            this.currentNum,
            this.total,
            `Updated total earnings: ${this.totalEarnings}`,
            "info"
          );
        } catch (error) {
          logMessage(
            this.currentNum,
            this.total,
            `Error updating earnings: ${error.message}`,
            "error"
          );
        }
      }, 10 * 60 * 1000);

      await this.activateNode("ON");
      this.toggleState = true;

      while (this.toggleState) {
        try {
          await this.sendPingRequest();
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          logMessage(
            this.currentNum,
            this.total,
            `Error keep ping ${error.message}`,
            "error"
          );
        }
      }
      clearInterval(updateInterval);
    } catch (error) {
      logMessage(
        this.currentNum,
        this.total,
        `Error processing account ${this.account.walletAddress}: ${error.message}`,
        "error"
      );
    }
  }
};
