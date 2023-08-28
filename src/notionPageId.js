const axios = require("axios");
require("dotenv").config();

// 노션 페이지 이름과 아이디 가져오는 함수
const notionPageId = async (clientId) => {
  try {
    const response = await axios.get(
      `https://api.notion.com/v1/blocks/${clientId}/children`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );
    const page = response.data.results
      .map((el) => {
        return {
          id: el.id,
          title: el.child_page ? el.child_page.title : "제목없음", // => 제목이 없을 경우 언디파인드임
        };
      })
      .filter((el) => el.title !== "제목없음"); // =>  필터한 이유는 한 페이지의 모든 속성을 가져오기 때문에
    return page;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = notionPageId;
