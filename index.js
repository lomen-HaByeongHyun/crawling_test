const puppeteer = require("puppeteer");
const axios = require("axios"); // 서버로 데이터를 전송하기 위해 사용

(async () => {
  // 브라우저 실행
  const browser = await puppeteer.launch({
    headless: false, // 브라우저가 화면에 보이도록 설정
    args: ["--start-maximized"], // 브라우저를 화면에 꽉 차게 실행
  });
  const page = await browser.newPage();

  // 현재 창 크기를 화면 크기에 맞게 설정
  const [width, height] = await page.evaluate(() => [
    window.screen.width,
    window.screen.height,
  ]);
  await page.setViewport({ width, height });

  // 고양이 검색
  await page.goto("https://unsplash.com/ko/s/사진/고양이");

  await Promise.all([
    page.waitForNavigation(), // 네비게이션이 완료될 때까지 기다림
  ]);

  const gridSelector = '[data-testid="photo-grid-masonry-figure"]';
  await page.waitForSelector(gridSelector);

  // gridSelector 변수를 page.evaluate 함수에서 사용하려면 해당 변수를 직접 전달해야함
  // page.evaluate 함수는 브라우저 컨텍스트에서 DOM을 조작하기 때문에 Node.js 환경에서 정의한 값을 알 수 없음
  const imageDetails = await page.evaluate((gridSelector) => {
    const images = [];
    const elements = document.querySelectorAll(gridSelector);

    elements.forEach((el) => {
      // 첫번째 div의 img 태그에서 srcset 속성을 추출
      const imgTag = el.querySelector("img[srcset]");
      const srcset = imgTag ? imgTag.getAttribute("srcset") : null;

      // 두번째 div의 a 태그에서 title 속성을 갖고 있는 요소 확인 (태그 목록)
      const tags = [];
      const tagElements = el.querySelectorAll("div:nth-child(2) a[title]");
      tagElements.forEach((tagEl) => {
        tags.push(tagEl.textContent);
      });

      images.push({
        srcset, // 이미지 경로
        tags, // 태그 목록
      });
    });

    return images;
  }, gridSelector);

  // 검색 결과를 서버로 전송 (로컬 저장)
  try {
    const response = await axios.post("http://localhost:3000/save-results", {
      data: imageDetails,
    });
    console.log("서버 응답:", response.data);
  } catch (error) {
    console.error("데이터 전송 실패:", error);
  }

  // 브라우저 종료
  await browser.close();
})();
