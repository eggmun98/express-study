require("dotenv").config(); // 환경변수 설정 라이브러리
const readline = require("readline");
const express = require("express");
const app = express();
const morgan = require("morgan");
const newIssues = require("./src/newIssues");
const editIssues = require("./src/editIssues");

// express에서 json 사용하려면 json()함수 사용해야 함
app.use(express.json());

require("dotenv").config();

// 오류 같은거 알려주는 도구
app.use(morgan("tiny"));

// 다른 api 개발을 위해 주석처리
// const issuesServer = async () => {
//   try {
//     console.log("newIssues 함수가 실행이 되었습니다.");
//     await newIssues();
//     console.log("newIssues 실행이 끝났습니다.");

//     console.log("editIssues 함수가 실행이 되었습니다.");
//     await editIssues();
//     console.log("editIssues 실행이 끝났습니다.");
//     setTimeout(issuesServer, 60000);
//   } catch (error) {
//     console.error(error.message);
//   }
// };

// issuesServer(); // 서버 시작시 자동으로 실행됨

// 현재 문제점 이슈 업데이트는 최대 100개 검사밖에 못해서 한계가 있음 => 개선하려면 노션db 가져오는거 추가로 요청해야 함
// => 근데 프로젝트별로 이슈를 나눌거니까 괜찮을거 같음

// 터미널 명령어 입력을 위한 readline 인터페이스 생성
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const apiKey = process.env.NOTION_API_KEY;
const pageId = process.env.NOTION_PAGE_ID04;

const NOTION_API_URL = "https://api.notion.com/v1/pages";
const HEADERS = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

const payload = (page_id, title) => {
  return {
    parent: { page_id },
    properties: {
      title: {
        title: [{ text: { content: title } }],
      },
    },
  };
};

async function createPage(page_id, title) {
  try {
    const response = await axios.post(NOTION_API_URL, payload(page_id, title), {
      headers: HEADERS,
    });

    return response.data.id;
  } catch (error) {
    throw new Error(error.message);
  }
}

const askQuestion = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

app.listen(PORT, async () => {
  console.log(
    "1. 자식페이지 이름을 적으세요.(자식 페이지 이름을 다 적었으면 손자 페이지 이름도 입력하세요.)"
  );

  try {
    const childTitle = await askQuestion("자식 페이지의 이름을 입력하세요: ");
    const childPageId = await createPage(pageId, childTitle);
    console.log(`자식 페이지 ID: ${childPageId}`);

    const grandchildTitle = await askQuestion(
      "손자 페이지의 이름을 입력하세요: "
    );
    const grandchildPageId = await createPage(childPageId, grandchildTitle);
    console.log(`손자 페이지 ID: ${grandchildPageId}`);

    rl.close();
  } catch (error) {
    console.error("Error:", error);
    rl.close();
  }
});

module.exports = app;

// const express = require("express");
// const axios = require("axios");

// const app = express();
// const PORT = 3001;

// app.use(express.json());
// require("dotenv").config();

// const apiKey = process.env.NOTION_API_KEY;
// const pageId = process.env.NOTION_PAGE_ID04;

// app.listen(PORT, () => {
//   // 서버가 시작될 때 자동으로 POST 요청을 보냅니다.
//   // axios
//   //   .post(
//   //     "https://api.notion.com/v1/pages",
//   //     {
//   //       parent: { page_id: pageId },
//   //       properties: {
//   //         title: {
//   //           title: [
//   //             {
//   //               type: "text",
//   //               text: { content: "page제목이에요4" },
//   //             },
//   //           ],
//   //         },
//   //       },
//   //       children: [
//   //         {
//   //           object: "block",
//   //           type: "paragraph",
//   //           paragraph: {
//   //             rich_text: [
//   //               {
//   //                 type: "text",
//   //                 text: { content: "페이지 내용이에요~~~~~~~~~~~~~~₩." },
//   //               },
//   //             ],
//   //           },
//   //         },
//   //       ],
//   //     },
//   //     {
//   //       headers: {
//   //         Authorization: `Bearer ${apiKey}`,
//   //         "Notion-Version": "2022-06-28",
//   //         "Content-Type": "application/json",
//   //       },
//   //     }
//   //   )
//   //   .then((response) => console.log("Page Created:", response.data))
//   //   .catch((error) => console.error("Error Creating Page:", error));
// });
// module.exports = app;
