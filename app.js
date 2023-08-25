const express = require("express");
const app = express();
const { CLIENT_IDS } = require("./public/config");
const rl = require("./public/utils");
const createPage = require("./src/createPage");
const axios = require("axios");

app.use(express.json());
require("dotenv").config();

// 유저가 터미널에서 타자를 칠수 있게 해주는 함수
const askQuestion = (prompt) =>
  new Promise((resolve) => rl.question(prompt, resolve));

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

const getLowIdBySelection = async () => {
  const page = await notionPageId();

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
    console.error("잘못된 선택입니다.");
    rl.close();
    process.exit();
  }
};

const pageLevelPick = async () => {
  return await askQuestion("1: 상위 페이지, 2: 하위 페이지 ");
};

const notionPageId = async () => {
  try {
    const response = await axios.get(
      `https://api.notion.com/v1/blocks/${process.env.NOTION_PAGE_ID_C}/children`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );
    const page = response.data.results.map((el) => {
      return {
        id: el.id,
        title: el.child_page.title,
      };
    });
    return page;
  } catch (error) {
    console.log(error.message);
  }
};

const notionServer = async () => {
  console.log("서버가 실행이되었습니다.");
  try {
    // 1. 최상위 페이지들을 선택하게한다 . => 유저가 선택한 페이지의 아이디를 저장한다.
    let clientId = await getClientIdBySelection();

    // 2. 최상위 페이지에서 생성할 지 아니면 하위 페이지에서 생성할 지 선택하게 한다.
    const userPick = await pageLevelPick();

    if (userPick === "2") {
      // 2-1. 하위 페이지의 리스트들을 보여준다.
      // 선택한 페이지의 아이디를 다시 clientId에 재할당
      clientId = await getLowIdBySelection();
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
