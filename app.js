require("dotenv").config();

const express = require("express");
const axios = require("axios");
const app = express();
const port = 3001; // 서버 포트번호
const morgan = require("morgan");

// express에서 json 사용하려면 json()함수 사용해야 함
app.use(express.json());

// 오류 같은거 알려주는 도구
app.use(morgan("tiny"));

// 지라 api 인증 정보 변수
const jiraUrl = process.env.JIRA_URL;
const jiraUsername = process.env.JIRA_USERNAME;
const jiraUserPassword = process.env.JIRA_PASSWORD;

// Base64 방식으로 인코딩 후 스트링으로 변환
const authBuffer = Buffer.from(`${jiraUsername}:${jiraUserPassword}`);
const base64Auth = authBuffer.toString("base64");

// 노션 api 인증 정보 변수
const apiKey = process.env.NOTION_API_KEY;
const dbId = process.env.NOTION_DATABASE_ID;

// 이슈 갯수 확인 용
let count = 0;

// 1. 먼저 get 메소드를 이용하여 지라의 api를 받아 온다.
// 2. 받아온 데이터들을 가공하여 req.processedData 라는 객체에 담는다.
// 3. next() 함수를 이용하여 다음 미들웨어 함수를 작동시킨다.
// 4. req.processedData 객체를 반복문을 돌린다.
// 5. 그리고 구조분해할당을 해준다.
// 6. payload 변수에 노션 JSON 구조에 맞춰서 값을 넣는다.
// 7. 그리고 노션 api 요청을 하여 노션 Db에 데이터를 추가한다. => 비효율적임 개선 방법을 찾아야함

app.get(
  "/",
  async (req, res, next) => {
    try {
      const response = await axios({
        method: "get",
        url: `${jiraUrl}/rest/api/2/search`,
        headers: {
          Authorization: `Basic ${base64Auth}`,
          "Content-Type": "application/json",
        },
      });

      req.processedData = response.data.issues.map((issue) => {
        return {
          id: issue.id,
          title: issue.fields.summary,
          createDate: issue.fields.created.slice(0, 10),
          state: issue.fields.status.name,
          explanation: issue.fields.description
            ? issue.fields.description.replaceAll(/\\r|\\n|\\/g, "")
            : null,
        };
      });

      next(); // 다음 미들웨어 함수에게 제어를 전달하는 함수이다. 즉 다음 미들웨어 함수에게 권한을 넘긴다.
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  },
  async (req, res) => {
    try {
      for (let issue of req.processedData) {
        const { id, title, state, createDate, explanation } = issue;

        count++;

        const payload = {
          parent: { database_id: dbId },
          properties: {
            Title: {
              title: [
                {
                  text: {
                    content: title,
                  },
                },
              ],
            },
            State: {
              rich_text: [
                {
                  text: {
                    content: state,
                  },
                },
              ],
            },
            CreateDate: {
              rich_text: [
                {
                  text: {
                    content: createDate,
                  },
                },
              ],
            },
            IssueID: {
              rich_text: [
                {
                  text: {
                    content: id,
                  },
                },
              ],
            },
            Explanation: {
              rich_text: [
                {
                  text: {
                    content: explanation,
                  },
                },
              ],
            },
          },
        };

        await axios.post("https://api.notion.com/v1/pages", payload, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
          },
        });
      }

      res.send("모든 이슈가 성공적으로 담겼습니다.");
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;
