require("dotenv").config(); // 환경변수 사용을 위해

// 노션 api 링크
const NOTION_API_URL = "https://api.notion.com/v1/pages";

// 노션 api 헤더
const HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

// 상위 페이지의 아이디들
const CLIENT_IDS = {
  A: process.env.NOTION_PAGE_ID_A,
  B: process.env.NOTION_PAGE_ID_B,
  C: process.env.NOTION_PAGE_ID_C,
};

module.exports = {
  NOTION_API_URL,
  HEADERS,
  CLIENT_IDS,
};
