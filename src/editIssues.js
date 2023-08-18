const { createPayload02 } = require("./payload");
const axios = require("axios");
require("dotenv").config(); // 환경변수 설정 라이브러리
const config = require("../public/config");

const { jiraUrl, base64Auth, apiKey, startAt, maxResults, jql } = config;
const today = new Date().setHours(0, 0, 0, 0); // 이 시간 기준으로 잡는다

// 변경된 이슈룰 감지해서 노션 db를 수정하는 로직
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

    // 가져온 지라 이슈의 날짜와 today와 비교를해서 필터링 처리를 한다. => 최적화를 한다면 생성일과 변경일 시간대도 비교해서 같은건 제거
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
    const notionResponse = await axios.post(
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
    const result = notionResponse.data.results.map((el) => ({
      dbID: el.id,
      issueID: el.properties.IssueID.rich_text[0].text.content,
      title: el.properties.Title.title[0].text.content,
      createDate: el.properties.CreateDate.rich_text[0].text.content,
      state: el.properties.State.rich_text[0].text.content,
    }));

    // 가져온 이슈와 가져온 노션db들을 아이디값을 비교해서 같은 아이디값을 가진 노션db 페이지를 찾아서
    // 그 노션db 페이지를 변경하는 로직
    for (i of issues) {
      for (r of result) {
        if (i.id === r.issueID) {
          await axios.patch(
            `https://api.notion.com/v1/pages/${r.dbID}`,
            createPayload02(i.title, i.state),
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
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

module.exports = editIssues;
