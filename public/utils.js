const readline = require("readline");

// readline을 사용하기 위한 설정
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

module.exports = rl;
