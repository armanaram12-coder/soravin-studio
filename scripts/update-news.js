// =====================================
// SORAVIN AUTO NEWS UPDATER
// CLEAN RSS ENGINE VERSION 2
// =====================================


const fs = require("fs");
const https = require("https");


const outputFile = "./data/auto-news.json";



// =====================================
// RSS SOURCES
// =====================================


const RSS_SOURCES = [

    // AI SOURCES
    "https://openai.com/news/rss.xml",

    "https://blogs.microsoft.com/ai/feed/",

    "https://www.technologyreview.com/feed/",


    // TECHNOLOGY SOURCES
    "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",

    "https://arstechnica.com/feed/",

    "https://www.wired.com/feed/rss",


    // NVIDIA LAST
    "https://blogs.nvidia.com/feed/"

];





// =====================================
// FETCH RSS
// =====================================


function fetchRSS(url){


return new Promise((resolve,reject)=>{


https.get(url,{

headers:{
"User-Agent":"Mozilla/5.0"
}

},response=>{


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
}
);



}).on(
"error",
err=>{
reject(err);
});


});


}






// =====================================
// HTML DECODE
// =====================================


function decodeHTML(text=""){


return text

.replace(/&lt;/gi,"<")

.replace(/&gt;/gi,">")

.replace(/&amp;/gi,"&")

.replace(/&quot;/gi,'"')

.replace(/&#39;/gi,"'")

.replace(/&nbsp;/gi," ");


}






// =====================================
// CLEAN TEXT
// =====================================


function cleanHTML(text=""){


text = decodeHTML(text);



return text

.replace(/<!\[CDATA\[/gi,"")

.replace(/\]\]>/gi,"")

.replace(/<script[\s\S]*?<\/script>/gi,"")

.replace(/<style[\s\S]*?<\/style>/gi,"")

.replace(/<img[^>]*>/gi,"")

.replace(/<iframe[\s\S]*?<\/iframe>/gi,"")

.replace(/<a[^>]*>/gi,"")

.replace(/<\/a>/gi,"")

.replace(/<[^>]+>/gi,"")

.replace(/https?:\/\/\S+/gi,"")

.replace(/\s+/g," ")

.trim();


}








// =====================================
// QUALITY CHECK
// =====================================


function isValidNews(news){


const badWords = [

"advertisement",

"affiliate",

"newsletter",

"subscribe",

"cookie",

"login",

"sign up"

];



let text =
(
news.title +
" " +
news.description
)
.toLowerCase();



if(text.length < 50)
return false;



for(const word of badWords){


if(text.includes(word))
return false;


}



if(
text.includes("<") ||
text.includes(">") ||
text.includes("style")
)

return false;



return true;


}







// =====================================
// RSS PARSER
// =====================================


function parseRSS(xml,source){


let items=[];



const entries =
xml.match(/<item[\s\S]*?<\/item>/g);



if(!entries)
return [];




entries.forEach(item=>{


let title =
item.match(/<title>([\s\S]*?)<\/title>/);



let link =
item.match(/<link>([\s\S]*?)<\/link>/);



let description =
item.match(/<description>([\s\S]*?)<\/description>/);




title =
title ? cleanHTML(title[1]) : "";



link =
link ? cleanHTML(link[1]) : "";



description =
description ? cleanHTML(description[1]) : "";




let news = {

title,

link,

description,

source

};



if(isValidNews(news)){


items.push(news);


}



});



return items;


}








// =====================================
// CATEGORY
// =====================================


function detectCategory(text){


text =
text.toLowerCase();



if(

text.includes("ai") ||

text.includes("artificial") ||

text.includes("gpt") ||

text.includes("machine")

)

return "AI";




if(

text.includes("gpu") ||

text.includes("chip") ||

text.includes("processor")

)

return "PC";





if(

text.includes("phone") ||

text.includes("mobile")

)

return "Mobile";





return "Technology";


}








// =====================================
// SUMMARY
// =====================================


function createSummary(text){


let clean =
cleanHTML(text);



let parts =
clean
.split(".")
.filter(
x=>x.trim().length>25
);



let result =
parts
.slice(0,3)
.join(". ");



if(result.length < 60){

result =
clean.substring(0,250);

}



return result.substring(0,300);


}







// =====================================
// MAIN
// =====================================


async function updateNews(){



let allNews=[];



for(const rss of RSS_SOURCES){


try{


console.log(
"Reading:",
rss
);



let xml =
await fetchRSS(rss);



let news =
parseRSS(
xml,
rss
);



allNews.push(
...news
);



}

catch(error){


console.log(
"RSS ERROR:",
rss
);


}



}






// REMOVE DUPLICATES


let unique=[];

let titles=new Set();



allNews.forEach(news=>{


let key =
news.title.toLowerCase();



if(!titles.has(key)){


titles.add(key);

unique.push(news);


}



});








// CREATE FINAL JSON


let finalNews =

unique
.slice(0,50)
.map((news,index)=>{


return {


id:index+1,


title:
news.title,


summary_fa:
createSummary(news.description),



summary_en:
"",



description:
createSummary(news.description),



category:
detectCategory(
news.title+
" "+
news.description
),



tag:
detectCategory(
news.title
),



source:
news.source,



image:
"assets/image/ai-news.jpg",



date:
new Date()
.toISOString(),



link:
news.link,



featured:
index===0,



status:
"published"


};



});







if(!fs.existsSync("./data")){


fs.mkdirSync("./data");


}




fs.writeFileSync(

outputFile,

JSON.stringify(
finalNews,
null,
2
),

"utf8"

);




console.log(

"DONE:",
finalNews.length,
"news saved"

);



}






updateNews();
