var express = require("express"); // commonjs 방식
const { checkPhone, getToken, sendTokenToSMS } = require("../phone");

var router = express.Router();

router.post("/phone2", (req, res) => {
  // 0.
  const myphone = req.body.phone;

  // 1. 휴대폰번호 자릿수 맞는지 확인하기(10~11자리)
  const isValid = checkPhone(myphone);
  if (isValid === false) return;

  // 2. 핸드폰 토큰 6자리 만들기
  const mytoken = getToken();

  // 3. 핸드폰번호에 토큰 전송하기
  sendTokenToSMS(myphone, mytoken);

  res.send("인증완료!!!");
});

module.exports = router;
