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

// 노션 마지막 ID를 가져오는 함수 => 데이터가 100개씩 가져오니 1개씩 가져오는법 찾기
async function getLatestNotionId() {
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
    return Number(
      response.data.results[0].properties.IssueID.rich_text[0].text.content
    );
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

app.get("/", async (req, res) => {
  try {
    // 1. 노션에서 최신 아이디 가져오기
    const latestNotionId = await getLatestNotionId();

    // 2. 지라에서 이슈 가져오기 =>  200가 가져오도록 설정했음
    const jiraResponse = await axios.get(
      `${jiraUrl}/rest/api/2/search?jql=${jql}&startAt=${startAt}&maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Basic ${base64Auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    const issues = jiraResponse.data.issues.map((issue) => ({
      id: issue.id,
      title: issue.fields.summary,
      createDate: issue.fields.created.slice(0, 10),
      state: issue.fields.status.name,
      explanation: issue.fields.description
        ? issue.fields.description.replaceAll(/\\r|\\n|\\/g, "")
        : null,
    }));

    // 3. 노션 DB의 최신 아이디와 지라의 이슈 아이디 비교
    for (let issue of issues) {
      if (Number(issue.id) > latestNotionId) {
        await axios.post(
          "https://api.notion.com/v1/pages",
          createPayload02(
            issue.title,
            issue.state,
            issue.createDate,
            issue.id,
            dbId
          ),
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "Notion-Version": "2022-06-28",
            },
          }
        );
      }
    }

    res.send("성공적으로 노션 db에 이슈를 추가하였습니다.");
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;
