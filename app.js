const express = require("express");
const axios = require("axios");
const { CLIENT_IDS } = require("./public/config");
const rl = require("./public/utils");
const createPage = require("./src/createPage");

require("dotenv").config();

const app = express();
app.use(express.json());

const askQuestion = (prompt) =>
  new Promise((resolve) => rl.question(prompt, resolve));

const displayOptions = (options) =>
  options.map((option, index) => ` ${index}.${option}`).join(", ");

const getSelection = async (message, options) => {
  const promptMessage = `${message} ${displayOptions(options)}`;
  const selection = await askQuestion(promptMessage);

  if (!options[selection]) {
    console.error("잘못된 선택입니다.");
    rl.close();
    process.exit();
  }

  return options[selection];
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
    return response.data.results.map((el) => ({
      id: el.id,
      title: el.child_page.title,
    }));
  } catch (error) {
    console.error(error.message);
  }
};

const notionServer = async () => {
  console.log("서버가 실행이되었습니다.");
  try {
    const clientId = await getSelection(
      "회사를 선택하세요:",
      Object.keys(CLIENT_IDS)
    );
    const pageLevel = await getSelection("페이지 레벨을 선택하세요:", [
      "상위 페이지",
      "하위 페이지",
    ]);

    let selectedId = clientId;
    if (pageLevel === "하위 페이지") {
      const page = await notionPageId();
      selectedId = await getSelection(
        "하위 페이지의 번호를 선택하세요:",
        page.map((p) => p.title)
      );
    }

    const childTitle = await askQuestion("자식 페이지의 이름을 입력하세요: ");
    const childPageId = await createPage(selectedId, childTitle);

    const grandchildTitle = await askQuestion(
      "손자 페이지의 이름을 입력하세요: "
    );
    await createPage(childPageId, grandchildTitle);

    rl.close();
  } catch (error) {
    console.error(error.message);
    rl.close();
  }
};

notionServer();

module.exports = app;
