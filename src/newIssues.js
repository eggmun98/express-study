const getLatestNotionId = require("./getLatestNotionId");
const axios = require("axios");

const { createPayload02 } = require("./payload");
require("dotenv").config(); // 환경변수 설정 라이브러리

const jiraUrl = process.env.JIRA_URL;
const jiraUsername = process.env.JIRA_USERNAME;
const jiraUserPassword = process.env.JIRA_PASSWORD;
const authBuffer = Buffer.from(`${jiraUsername}:${jiraUserPassword}`); // 유저 아이디와 유저 비밀번호 => 비밀번호 대신에 api key 적을 수 있음
const base64Auth = authBuffer.toString("base64");

const apiKey = process.env.NOTION_API_KEY;
const dbId = process.env.NOTION_DATABASE_ID;

const startAt = 0; // 몇번째 글부터 가져올건지 => 안적어도 됨!
const maxResults = 300; // 한 번에 가져올 수 있는 최대 이슈 수
const latestDate = "2023-07-02"; // 최신 날짜 => 이 기준으로 이슈들을 가져옴

// 지라 JQL 설정
const jql = encodeURIComponent(
  `created >= "${latestDate}" ORDER BY created ASC`
);

// 기존의 노션db의 아이디값을 비교해 새로운 이슈를 노션 db에 추가하는 로직
const newIssues = async () => {
  try {
    // 1. 노션에서 최신 아이디 가져오기
    const latestNotionId = (await getLatestNotionId()) ?? "1";

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

    // 만약에 노션 db에 데이터가 하나도 없을 경우

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
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

module.exports = newIssues;
