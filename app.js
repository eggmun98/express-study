require("dotenv").config(); // 환경변수 설정 라이브러리

const express = require("express");
const app = express();
const morgan = require("morgan");
const newIssues = require("./src/newIssues");
const editIssues = require("./src/editIssues");

// express에서 json 사용하려면 json()함수 사용해야 함
app.use(express.json());

// 오류 같은거 알려주는 도구
app.use(morgan("tiny"));

const issuesServer = async () => {
  try {
    console.log("newIssues 함수가 실행이 되었습니다.");
    await newIssues();
    console.log("newIssues 실행이 끝났습니다.");

    console.log("editIssues 함수가 실행이 되었습니다.");
    await editIssues();
    console.log("editIssues 실행이 끝났습니다.");
    setTimeout(issuesServer, 60000);
  } catch (error) {
    console.error(error.message);
  }
};

issuesServer(); // 서버 시작시 자동으로 실행됨

// 현재 문제점 이슈 업데이트는 최대 100개 검사밖에 못해서 한계가 있음 => 개선하려면 노션db 가져오는거 추가로 요청해야 함
// => 근데 프로젝트별로 이슈를 나눌거니까 괜찮을거 같음

module.exports = app;
