const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 3000;

// JSON 데이터를 받기 위해 body-parser 설정
app.use(bodyParser.json());

// POST 요청으로 받은 데이터를 처리하는 라우터
app.post("/save-results", (req, res) => {
  const searchData = req.body.data;

  // 데이터를 파일로 저장
  fs.writeFile(
    "searchResults.json",
    JSON.stringify(searchData, null, 2),
    (err) => {
      if (err) {
        console.error("파일 저장 중 오류 발생:", err);
        return res.status(500).send("파일 저장 실패");
      }
      console.log("검색 결과가 성공적으로 저장되었습니다!");
      res.send("검색 결과 저장 완료");
    }
  );
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
