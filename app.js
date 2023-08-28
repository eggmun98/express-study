const express = require("express");
const app = express();
const rl = require("./public/utils");
const createPage = require("./src/createPage");
const notionPageId = require("./src/notionPageId");
const getClientIdBySelection = require("./src/getClientIdBySelection");
const getLowIdBySelection = require("./src/getLowIdBySelection");
const askQuestion = require("./src/askQuestion");

const notionServer = async () => {
  try {
    // 1. 최상위 페이지들을 선택하게한다 . => 유저가 선택한 페이지의 아이디를 저장한다.
    let clientId = await getClientIdBySelection(); // 이 아이디 기준으로 페이지 생성

    // 2. 최상위 페이지에서 생성할 지 아니면 하위 페이지에서 생성할 지 선택하게 한다.
    const userPick = await askQuestion("1: 상위 페이지, 2: 하위 페이지 ");

    if (userPick === "2") {
      // 2-1. 유저가 선택한 상위 페이지의 이름과 이이디를 가져오기
      const page = await notionPageId(clientId);

      // 2-2. 하위 페이지의 리스트들을 보여준다. => 그리고 선택하게 한다.
      // 선택한 페이지의 아이디를 다시 clientId에 재할당
      clientId = await getLowIdBySelection(page);
    }

    // 3. 자식 페이지의 이름을 설정한다.
    const childTitle = await askQuestion("자식 페이지의 이름을 입력하세요: ");

    // 4. 자식 페이지를 생성한다.
    const childPageId = await createPage(clientId, childTitle);

    // 5. 손자 페이지의 이름을 설정한다.
    const grandchildTitle = await askQuestion(
      "손자 페이지의 이름을 입력하세요: "
    );

    // 6. 손자 페이지를 생성한다.
    await createPage(childPageId, grandchildTitle);

    rl.close();
  } catch (error) {
    console.error(error.message);
    rl.close();
  }
};

notionServer();

module.exports = app;
