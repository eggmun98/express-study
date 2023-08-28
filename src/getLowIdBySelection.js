const askQuestion = require("./askQuestion");
const notionPageId = require("./notionPageId");

// 하위 페이지 목록 불러오는 함수
const getLowIdBySelection = async (page) => {
  const lowPageList = page.map((el, dex) => ` ${String(dex)}.${el.title}`);

  // 하위 페이지들의 번호와 리스트들을 보여준다.
  const selection = await askQuestion(
    `하위 페이지의 번호를 선택하세요 ${lowPageList} `
  );
  // 유저가 선택한 페이지 번호의 아이디를 저장한다.
  if (selection) {
    const clientId = page
      .map((el) => el.id)
      .filter((_, dex) => dex === Number(selection));
    return clientId[0];
  }

  if (!clientId) {
    // 이 코드 수정하기
    console.log("잘못된 선택입니다.");
    rl.close();
    process.exit();
  }
};
module.exports = getLowIdBySelection;
