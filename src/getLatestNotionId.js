require("dotenv").config(); // 환경변수 설정 라이브러리
const axios = require("axios");

const apiKey = process.env.NOTION_API_KEY;
const dbId = process.env.NOTION_DATABASE_ID;

// 노션 db 가장 위에 있는 데이터의 날짜를 가져오는 로직
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
  } catch {
    return 1; // 만약에 노션db에 아이디가 없을 경우에 1을 할당 => newIssues 로직은 id값이 있어야 작동하므로 필요함
  }
};

module.exports = getLatestNotionId;
