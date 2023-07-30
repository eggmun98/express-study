var express = require("express"); // commonjs 방식
// import express from "express" // module 방식

var router = express.Router();

/* GET home page. */
// 두번째 인자에 있는 함수는 미들웨어 함수라고 한다.
// 즉 첫번째 인자에서 엔드포인트를 적으면 그 포인트에서 두번째 인자의 함수가 실행이 된다.
// 그 함수가 미들웨어 함수
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/qqq", (req, res) => {
  res.send("서버를 실행시켰습니다.");
});

//

router.get("/boards", (req, res) => {
  // 1. db에 접속 후 데이터를 조회 즉 가져온다. => 여기서는 데이터를 조회했다고 가정할거임
  const result = [
    { number: 1, writer: "철수", title: "제목이에요", contents: "내용이에요" },
    {
      number: 2,
      writer: "짱구",
      title: "제목아니에요",
      contents: "내용아니에요",
    },
    { number: 3, writer: "훈이", title: "제목맞아요", contents: "내용맞아요" },
  ];

  // 2. db에서 꺼내온 결과를 브라우저에 응답(response)으로 주기
  res.send(result);
});

// 헤더에 중요한 정보들
// 바디에 데이터들
router.post("/boards", (req, res) => {
  // 1. 브라우저에서 보내준 데이터 확인하기
  console.log(req);
  console.log("====================");
  console.log(req.body);

  // 2. db에 접속 후, 데이터를 저장 => 여기서는 데이터를 저장했다고 가정할거임

  // 3. db에 저장된 결과를 브라우저에 응답(response) 주기
  res.send("게시글 등록에 성공하였습니다.");
});

module.exports = router;
