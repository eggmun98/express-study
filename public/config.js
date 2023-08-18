require("dotenv").config(); // 환경변수 설정 라이브러리

// 지라 인증 정보 변수
const jiraUrl = process.env.JIRA_URL;
const jiraUsername = process.env.JIRA_USERNAME;
const jiraUserPassword = process.env.JIRA_PASSWORD;
const authBuffer = Buffer.from(`${jiraUsername}:${jiraUserPassword}`); // 유저 아이디와 유저 비밀번호 => 비밀번호 대신에 api key 적을 수 있음
const base64Auth = authBuffer.toString("base64");

// 노션 api 인증 정보 변수
const apiKey = process.env.NOTION_API_KEY;
const dbId = process.env.NOTION_DATABASE_ID;

// 지라 api 요청 설정
const startAt = 0; // 몇번째 글부터 가져올건지 => 안적어도 됨!
const maxResults = 300; // 한 번에 가져올 수 있는 최대 이슈 수
const latestDate = "2023-07-02"; // 최신 날짜 => 이 기준으로 이슈들을 가져옴

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
// `encodeURIComponent`는 JQL 쿼리를 URL에 안전하게 포함시키기 위해 사용됩니다(인코딩)

const config = {
  jiraUrl,
  base64Auth,
  startAt,
  maxResults,
  latestDate,
  jql,
  apiKey,
  dbId,
};

module.exports = config;
