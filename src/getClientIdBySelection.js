const askQuestion = require("./askQuestion");
const { CLIENT_IDS } = require("../public/config");

// 유저가 선택한 페이지의 아이디를 저장하는 함수
const getClientIdBySelection = async () => {
  const selection = await askQuestion("회사를 선택하세요 (A, B, C): "); // (A, B, C) 이것 자동으로 확장가능하게 바꾸기
  const clientId = CLIENT_IDS[selection.toUpperCase()];

  if (!clientId) {
    console.error("잘못된 선택입니다.");
    rl.close();
    process.exit();
  }

  return clientId;
};

module.exports = getClientIdBySelection;
