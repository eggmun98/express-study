const rl = require("../public/utils");

// 유저가 터미널에서 타자를 칠수 있게 해주는 함수
const askQuestion = (prompt) =>
  new Promise((resolve) => rl.question(prompt, resolve));

module.exports = askQuestion;
