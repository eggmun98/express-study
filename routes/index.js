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

router.get("/qqq2", (req, res) => {
  res.send("서버를 실행시켰습니다2.");
});

module.exports = router;
