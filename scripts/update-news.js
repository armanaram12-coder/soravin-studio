// =====================================
// SORAVIN AUTO NEWS UPDATER
// RSS TO JSON
// =====================================


const fs = require("fs");
const https = require("https");



const outputFile =
"./data/auto-news.json";





// RSS SOURCE

const RSS_SOURCES = [

"https://openai.com/blog/rss.xml",

"https://blogs.nvidia.com/feed/",

"https://blogs.microsoft.com/ai/feed/",

"https://feeds.feedburner.com/TechCrunch",

"https://www.theverge.com/rss/ai/index.xml"

];





function getRSS(){


return new Promise((resolve,reject)=>{


function getRSS(url){

return new Promise((resolve,reject)=>{


https.get(url,(response)=>{


let data="";


response.on(
"data",
chunk=>{
data += chunk;
}
);



response.on(
"end",
()=>{

resolve(data);

});


}).on(
"error",
error=>{

reject(error);

});


});

}



response.on(
"end",
()=>{


resolve(data);


});


}).on(
"error",
error=>{


reject(error);


});


});


}






function extractNews(xml){


const items =
xml.match(/<item>[\s\S]*?<\/item>/g) || [];



return items.slice(0,6).map((item,index)=>{



const title =
(item.match(/<title>(.*?)<\/title>/)||[])[1]
|| "خبر فناوری";



const link =
(item.match(/<link>(.*?)<\/link>/)||[])[1]
|| "#";



const description =
(item.match(/<description>(.*?)<\/description>/)||[])[1]
|| "آخرین اخبار فناوری";



return {


id:index+1,


title:title
.replace(/<!\[CDATA\[|\]\]>/g,""),



category:"Tech",


tag:"Technology",


source:"Soravin Tech",


image:
"assets/image/ai-news.jpg",


description:
description
.replace(/<!\[CDATA\[|\]\]>/g,"")
.substring(0,150),


date:"امروز",


link:link,


featured:false,


status:"published"



};



});


}








async function updateNews(){



try{


console.log(
"Loading technology news..."
);



const xml =
await getRSS();



const news =
extractNews(xml);




fs.writeFileSync(

outputFile,

JSON.stringify(
news,
null,
2
),

"utf8"

);



console.log(
"Updated news:",
news.length
);



}

catch(error){


console.log(
"News update error:",
error.message
);


}



}





updateNews();
