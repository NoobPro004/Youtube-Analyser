const puppeteer = require("puppeteer");
let page;
let cVideos=0;
async function fn() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
    });
    let pages = await browser.pages();
    page = pages[0];
    await page.goto(
      "https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq"
    );
    await page.waitForSelector(
      "#stats>.style-scope.ytd-playlist-sidebar-primary-info-renderer",
      { visible: true }
    );
    await page.waitForSelector("h1#title", { visible: true });
    let obj = await page.evaluate(function () {
      let t = document.querySelector("h1#title");
      let title = t.innerText;
      let allElement = document.querySelectorAll(
        "#stats>.style-scope.ytd-playlist-sidebar-primary-info-renderer"
      );
      let noOfVideos = allElement[0].innerText;
      let noOfViews = allElement[1].innerText;
      let obj = {
        "title": title,
        "noOfVideos": noOfVideos,
        "noOfViews": noOfViews,
      };
      return obj;
    });
    console.log(
      "title ",
      obj.title,
      "noOfVideos ",
      obj.noOfVideos,
      ", noOfViews ",
      obj.noOfViews
    );
    let noOfVideos = obj.noOfVideos.split(" ")[0];
    noOfVideos = Number(noOfVideos);
    console.log(noOfVideos);
    let videoSelector = "#video-title";
    let duration =
      "span.style-scope.ytd-thumbnail-overlay-time-status-renderer";
    let i = 0;
    while (noOfVideos-cVideos>=100) {
      await scrollDown();
      i++;
    }
   
   // await page.waitForNavigation({waitUntil:"networkidle0"});
    //   videos_title -> #video-title
    // duration-> span.style-scope.ytd-thumbnail-overlay-time-status-renderer
    
    await  waitTillHTMLRendered(page);
    await scrollDown();
    await  waitTillHTMLRendered(page);
    console.log(cVideos);
    let titleDurArr = await getTitleNDuration(videoSelector, duration);
    console.table(titleDurArr);
  } catch (err) {
    console.log(err);
  }
}
async function getTitleNDuration(videoSelector, duration) {
    let titleDurArr=[];
  titleDurArr=await page.evaluate(
    function (vs, ds) {
        let titleDurArr=[];
      let titleElementsArr = document.querySelectorAll(vs);
      let durationElementArr = document.querySelectorAll(ds);
      for (let i = 0; i < durationElementArr.length; i++) {
        let title = titleElementsArr[i].innerText;
        let duration = durationElementArr[i].innerText;
        titleDurArr.push({ title, duration });
      }
      return titleDurArr;
    },
    videoSelector,
    duration
  );
  return titleDurArr;
}
async function scrollDown(){

    await page.waitForSelector("span.style-scope.ytd-thumbnail-overlay-time-status-renderer", { visible: true });
    await page.waitForSelector("#video-title", { visible: true });
    cVideos=await page.evaluate(function () {
      let allElements = document.querySelectorAll(
        "#video-title"
      );
      allElements[allElements.length - 1].scrollIntoView(true);

      return allElements.length;
    });
}

async function waitTillHTMLRendered(page, timeout = 30000){
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;
  
    while(checkCounts++ <= maxChecks){
      let html = await page.content();
      let currentHTMLSize = html.length; 
  
      let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);
  
      console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);
  
      if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
        countStableSizeIterations++;
      else 
        countStableSizeIterations = 0; //reset the counter
  
      if(countStableSizeIterations >= minStableSizeIterations) {
        console.log("Page rendered fully..");
        break;
      }
  
      lastHTMLSize = currentHTMLSize;
      await page.waitFor(checkDurationMsecs);
    }  
  };



fn();
