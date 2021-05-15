const puppeteer = require("puppeteer");
let page;
async function fn() {
  try{
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"],
      });
      let pages=await browser.pages();
      page=pages[0];
      await page.goto("https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq");
      await page.waitForSelector("#stats>.style-scope.ytd-playlist-sidebar-primary-info-renderer",{visible:true});
      await page.waitForSelector("h1#title",{visible:true});
      let obj=await page.evaluate(function(){
          let t=document.querySelector("h1#title");
          let title=t.innerText;
          let allElement=document.querySelectorAll("#stats>.style-scope.ytd-playlist-sidebar-primary-info-renderer");
          let noOfVideos=allElement[0].innerText;
          let noOfViews=allElement[1].innerText;
          let obj={
              "title":title,
              "noOfVideos":noOfVideos,
              "noOfViews":noOfViews
          };
          return obj;
  })
  console.log("title ",obj.title,"noOfVideos ",obj.noOfVideos,", noOfViews ",obj.noOfViews);
  let noOfVideos=obj.noOfVideos.split(" ")[0];
  noOfVideos=Number(noOfVideos);
  let i=0;
  while(i<=noOfViews/100){
     await scrollDown();
      i++;
  }

//   videos_title -> #video-title
// duration-> span.style-scope.ytd-thumbnail-overlay-time-status-renderer
let videoSelector="#video-title";
let duration ="span.style-scope.ytd-thumbnail-overlay-time-status-renderer";

await page.waitForSelector("#video-title",{visible:true});
await page.waitForSelector("span.style-scope.ytd-thumbnail-overlay-time-status-renderer",{visible:true});
let titleDurArr=getTitleNDuration(videoSelector,duration);
console.table(titleDurArr);
}catch(err){
    console.log(err);
}

}
async function getTitleNDuration(videoSelector,duration){
    await page.evaluate(function(vs,ds){
        let titleElementsArr=document.querySelectorAll(vs);
        let durationElementArr=document.querySelectorAll(ds);
        let titleDurArr=[];
        for(let i=0;i<durationElementArr.length;i++){
            let title=titleElementsArr[i].innerText;
            let duration=durationElementArr[i].innerText;
            titleDurArr.push({title,duration});
        }
        
        return titleDurArr;
        },videoSelector,duration)
        
}
async function scrollToPageEnd(){
    await page.waitForSelector("span.style-scope.ytd-thumbnail-overlay-time-status-renderer",{visible:true});
    await page.evaluate(function(){
        let allElements=document.querySelectorAll("span.style-scope.ytd-thumbnail-overlay-time-status-renderer");
        allElements[allElements.length-1].scrollIntoView(true);
    })
}
async function scrollDown(){
    await scrollToPageEnd();
}
fn();