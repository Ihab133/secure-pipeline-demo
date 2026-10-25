function runCommand(userInput) {
  const { exec } = require("child_process");
  exec("ls " + userInput);
}

function showMessage(userInput) {
  return "<div>" + userInput + "</div>";
}

module.exports = { runCommand, showMessage };