require("dotenv").config(); // 환경변수 설정 라이브러리

const express = require("express");
const axios = require("axios");
const app = express();
const morgan = require("morgan");
const {
  createPayload,
  createPayload02,
  createPayload03,
  createPayload04,
} = require("./payload");

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
const latestDate = "2023-07-02"; // 최신 날짜
// 지라 JQL 설정
const jql = encodeURIComponent(
  `created >= "${latestDate}" ORDER BY created ASC`
);

// jql 문법
// created >= "2023-01-01"  2023년 1월 1일 이후의 데이터만 가져와라
// ORDER BY created DESC' 내림차순으로
// ORDER BY created ASC 오름차순으로
// 아래는 프로젝트 별로 이슈를 가져오는 방법임
// const projectKey = 'YOUR_PROJECT_KEY'; // 프로젝트 키
// const jql = encodeURIComponent(`project = "${projectKey}" ORDER BY created ASC`);

//
//
//

// 노션 마지막 ID를 가져오는 함수 => 데이터가 100개씩 가져오니 1개씩 가져오는법 찾기
const getLatestNotionId = async () => {
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
};

// 초기에 노션 db에 데이터가 한줄이라도 있어야 작동 => C
const updateIssues = async () => {
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
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

// 반복하기 위해 재귀의 원리 사용
const updateIssuesRepeatedly = async () => {
  try {
    await updateIssues(); // 업데이트 작업 기다리기
    setTimeout(updateIssuesRepeatedly, 10000); // 업데이트가 성공적으로 완료된 후, 10초 후에 다시 호출
  } catch (error) {
    console.error(error.message);
  }
};

//

//

//

//

//

// 기존 노션 db 이슈 업데이트 코드
const today = new Date().setHours(0, 0, 0, 0); // 이 시간 기준으로 잡는다2.

const editIssues = async () => {
  try {
    // 먼저 지라의 api를 가져온다.
    const response = await axios({
      method: "get",
      url: `${jiraUrl}/rest/api/2/search?jql=${jql}&startAt=${startAt}&maxResults=${maxResults}`,
      headers: {
        Authorization: `Basic ${base64Auth}`,
        "Content-Type": "application/json",
      },
    });

    // 가져온 지라 이슈의 날짜와 today와 비교를해서 필터링 처리를 한다.
    const issues = response.data.issues
      .filter((el) => Number(new Date(el.fields.updated)) > today)
      .map((el) => ({
        id: el.id,
        title: el.fields.summary,
        createDate: el.fields.created.slice(0, 10),
        state: el.fields.status.name,
        explanation: el.fields.description
          ? el.fields.description.replaceAll(/\\r|\\n|\\/g, "")
          : null,
        updateIssue: el.fields.updated,
      }));

    // 노션 db의 데이터를 가져온다 100개
    const response2 = await axios.post(
      "https://api.notion.com/v1/databases/002e536f493e416b96826360e4a1ba74/query",
      {},
      {
        headers: {
          Authorization:
            "Bearer secret_FUTaguiG5ogDG7V9pD7eHl1ENERxdDXtjd6oPxMr2q8",
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
      }
    );

    // 가져온 노션 db 데이터들을 정리한다.
    const result = response2.data.results.map((el) => ({
      dbID: el.id,
      issueID: el.properties.IssueID.rich_text[0].text.content,
      title: el.properties.Title.title[0].text.content,
      createDate: el.properties.CreateDate.rich_text[0].text.content,
      state: el.properties.State.select.name,
      // explanation: el.properties.Explanation.rich_text[0].text.content
      //   ? el.properties.Explanation.rich_text[0].text.content
      //   : "",
    }));

    // 가져온 이슈와 가져온 노션db들을 아이디값을 비교해서 같은 아이디값을 가진 노션db 페이지를 찾아서
    // 그 노션db 페이지를 변경하는 로직
    for (i of issues) {
      for (r of result) {
        if (i.id === r.issueID) {
          await axios.patch(
            `https://api.notion.com/v1/pages/${r.dbID}`,
            createPayload03("** 이슈 변경 로직 자동화 성공7 **"),
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28",
              },
            }
          );
          break;
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const issuesRepeatedly = async () => {
  try {
    await updateIssues();
    await editIssues();
    setTimeout(issuesRepeatedly, 30000);
  } catch (error) {
    console.error(error.message);
  }
};

issuesRepeatedly();

module.exports = app;
