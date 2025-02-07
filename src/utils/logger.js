let accountLog = null;

function setLogger(logComponent) {
  accountLog = logComponent;
}

function log(message) {
  if (accountLog) {
    accountLog.log(message);
  }
}

module.exports = {
  setLogger,
  log,
};
