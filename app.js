require("dotenv").config(); // 환경변수 설정 라이브러리

const express = require("express");
const axios = require("axios");
const app = express();
const port = 3001; // 서버 포트번호
const morgan = require("morgan");
const { createPayload, createPayload02 } = require("./payload");

// express에서 json 사용하려면 json()함수 사용해야 함
app.use(express.json());

// 오류 같은거 알려주는 도구
app.use(morgan("tiny"));

// 노션 api 인증 정보 변수
const apiKey = process.env.NOTION_API_KEY;
const dbId = process.env.NOTION_DATABASE_ID;

// 지라 api 인증 정보 변수
const jiraUrl = process.env.JIRA_URL;
const jiraUsername = process.env.JIRA_USERNAME;
const jiraUserPassword = process.env.JIRA_PASSWORD;

// Base64 방식으로 인코딩 후 스트링으로 변환 => 지라 api 요청할때 사용
const authBuffer = Buffer.from(`${jiraUsername}:${jiraUserPassword}`); // 유저 아이디와 유저 비밀번호 => 비밀번호 대신에 api key 적을 수 있음
const base64Auth = authBuffer.toString("base64");

// 지라 api 요청 설정
let startAt = 0; // 몇번째 글부터 가져올건지 => 안적어도 됨!
const maxResults = 200; // 한 번에 가져올 수 있는 최대 이슈 수
const latestDate = "2023-07-01"; // 최신 날짜 // 이 부분을 유동적으로 바꿔야 함 즉 노션 db의 최신 날짜를 가져와서 바꾸기

// 지라 JQL 설정
const jql = encodeURIComponent(
  `created >= "${latestDate}" ORDER BY created ASC`
);

// jql 문법
// created >= "2023-01-01"  2023년 1월 1일 이후의 데이터만 가져와라
// ORDER BY created DESC' 내림차순으로
// ORDER BY created ASC 오름차순으로

// 노션 db 가져오는 로직 100개 가져옴 => 1개만 가져오는 걸로 수정하기
app.get("/notion", async (req, res) => {
  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${dbId}/query`,
      {},
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
      }
    );
    res.send(
      // response.data.results[0].properties.CreateDate.rich_text[0].plain_text,
      Number(
        response.data.results[0].properties.IssueID.rich_text[0].text.content
      )
    );
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get(
  "/",
  async (req, res, next) => {
    try {
      const response = await axios.get(
        `${jiraUrl}/rest/api/2/search?jql=${jql}&startAt=${startAt}&maxResults=${maxResults}`,
        {
          headers: {
            Authorization: `Basic ${base64Auth}`,
            "Content-Type": "application/json",
          },
        }
      );

      req.processedData = response.data.issues.map((issue) => {
        return {
          id: issue.id,
          title: issue.fields.summary,
          createDate: issue.fields.created.slice(0, 10),
          state: issue.fields.status.name,
          explanation: issue.fields.description
            ? issue.fields.description.replaceAll(/\\r|\\n|\\/g, "")
            : null,
        };
      });
      next(); // 다음 미들웨어 함수에게 제어를 전달하는 함수이다. 즉 다음 미들웨어 함수로 넘어간다.
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  }, // 두번째 미들웨어 함수
  async (req, res) => {
    try {
      for (let issue of req.processedData) {
        const { id, title, state, createDate, explanation } = issue;
        console.log(issue);

        await axios.post(
          "https://api.notion.com/v1/pages",
          createPayload02(title, state, createDate, id, dbId),
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "Notion-Version": "2022-06-28",
            },
          }
        );
      }

      res.send("모든 이슈가 성공적으로 담겼습니다.");
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;
