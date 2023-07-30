const checkPhone = (myphone) => {
  if (myphone.length < 10 || myphone.length > 11) {
    console.log("에러 발생!! 휴대폰 번호를 제대로 입력해 주세요.");
    return false;
  } else {
    return true;
  }
};

const getToken = () => {
  const result = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  console.log(result);
  return result;
};

const sendTokenToSMS = (myphone, result) => {
  console.log(myphone + "번호로 인증번호" + result + "를 전송합니다.");
};

module.exports = {
  checkPhone,
  getToken,
  sendTokenToSMS,
};
