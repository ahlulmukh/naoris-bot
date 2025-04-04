# Naoris Bot Auto Ping

This bot automates ping to server naoris

## Features

- Automatically ping
- Multi Accounts
- Uses proxies to avoid IP bans.
- Logs Accounts

## Requirements

- Node.js v18.20.5 LTS or latest.

## Notes

- Make sure to use valid proxies to avoid IP bans.
- If you didn't get point just wait.

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/ahlulmukh/naoris-bot.git
   cd naoris-bot
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Create proxy (optional) `nano proxy.txt` file in the root directory and add your proxies (one per line).
   Format Proxy

   ```
   http://user:pw@host:port
   http://user:pw@host:port
   http://user:pw@host:port
   ```

4. Create accounts.json `nano accounts.json` in the root directory and add your account format, you can find in network developer console

   ```json
   [
     {
       "walletAddress": "your wallet1",
       "deviceHash": "your_devicehash1"
     },
     {
       "walletAddress": "your wallet2",
       "deviceHash": "your_devicehash2"
     },
     {
       "walletAddress": "your wallet3",
       "deviceHash": "your_devicehash3"
     }
   ]
   ```

## Usage

1. Run the bot:

   ```sh
   node .
   ```

2. and you done.

## Stay Connected

- Channel Telegram : [Telegram](https://t.me/elpuqus)
- Channel WhatsApp : [Whatsapp](https://whatsapp.com/channel/0029VavBRhGBqbrEF9vxal1R)
- Channel Discrod : [Discord](https://discord.gg/uKM4UCAccY)

## Donation

If you would like to support the development of this project, you can make a donation using the following addresses:

- Solana: `FPDcn6KfFrZm3nNwvrwJqq5jzRwqfKbGZ3TxmJNsWrh9`
- EVM: `0xae1920bb53f16df1b8a15fc3544064cc71addd92`
- BTC: `bc1pnzm240jfj3ac9yk579hxcldjjwzcuhcpvd3y3jdph3ats25lrmcsln99qf`

For Indonesian People

- [Saweria](https://saweria.co/ahlulmukh)

## Disclaimer

This tool is for educational purposes only. Use it at your own risk.
