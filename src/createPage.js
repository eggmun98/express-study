const axios = require("axios");
const { NOTION_API_URL, HEADERS } = require("../public/config");
const { createPayload } = require("./payload");

// 노션 하위 페이지를 생성하는 함수
const createPage = async (page_id, title) => {
  try {
    const response = await axios.post(
      NOTION_API_URL,
      createPayload(page_id, title),
      {
        headers: HEADERS,
      }
    );
    return response.data.id;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = createPage;
