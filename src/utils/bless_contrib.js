const { lcd } = require("blessed-contrib");

const dashboardConfig = {
  screen: {
    smartCSR: true,
    title: "Naoris BOT",
  },
  grid: {
    rows: 12,
    cols: 12,
  },
  components: {
    accountLog: {
      position: [1, 5, 5, 7],
      config: {
        label: "Log",
        tags: true,
        width: "100%",
        height: "100%",
        wrap: true,
        border: { type: "line", fg: "cyan" },
        scrollback: 100,
        scrollbar: {
          ch: " ",
          track: { bg: "cyan" },
          style: { inverse: true },
        },
      },
    },
    dataAccount: {
      position: [6, 7, 5, 5],
      config: {
        keys: true,
        fg: "white",
        selectedFg: "white",
        selectedBg: "blue",
        interactive: false,
        label: "Data Account",
        width: "50%",
        height: "50%",
        border: { type: "line", fg: "cyan" },
        columnSpacing: 3,
        columnWidth: [15, 15],
      },
    },
    accountList: {
      position: [6, 0, 6, 7],
      config: {
        keys: true,
        fg: "white",
        selectedFg: "white",
        selectedBg: "blue",
        interactive: true,
        label: "Account List",
        width: "100%",
        height: "50%",
        border: { type: "line", fg: "cyan" },
        columnSpacing: 10,
        columnWidth: [40, 15, 20, 15],
      },
    },
    lcd: {
      position: [1, 0, 3, 5],
      config: {
        segmentWidth: 0.06,
        segmentInterval: 0.11,
        strokeWidth: 0.11,
        elements: 6,
        display: "LOADING",
        elementSpacing: 4,
        elementPadding: 2,
        color: "red",
        label: "Information",
      },
    },
    lcdText: {
      position: [4, 0, 2, 5],
      config: {
        border: "none",
        style: {
          fg: "white",
        },
      },
    },
  },
};

module.exports = dashboardConfig;
