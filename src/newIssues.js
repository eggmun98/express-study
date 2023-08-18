const getLatestNotionId = require("./getLatestNotionId");
const axios = require("axios");
const { createPayload01 } = require("./payload");
require("dotenv").config(); // 환경변수 설정 라이브러리
const config = require("../public/config");

const { jiraUrl, base64Auth, apiKey, dbId, startAt, maxResults, jql } = config;

// 기존의 노션db의 아이디값을 비교해 새로운 이슈를 노션 db에 추가하는 로직
const newIssues = async () => {
  try {
    // 1. 노션에서 최신 아이디 가져오기
    const latestNotionId = await getLatestNotionId();

    // 2. 지라에서 이슈 가져오기 =>  300개 가져오도록 설정했음
    const jiraResponse = await axios.get(
      `${jiraUrl}/rest/api/2/search?jql=${jql}&startAt=${startAt}&maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Basic ${base64Auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 가져온 지라 이슈들 가공
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
          createPayload01(
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
