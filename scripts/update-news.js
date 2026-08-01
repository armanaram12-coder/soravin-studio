// =====================================
// SORAVIN AUTO NEWS UPDATER
// MULTI RSS VERSION
// =====================================


const fs = require("fs");
const https = require("https");



const outputFile =
"./data/auto-news.json";



const RSS_SOURCES = [

"https://feeds.feedburner.com/TechCrunch",

"https://blogs.nvidia.com/feed/",

"https://blogs.microsoft.com/ai/feed/",

"https://openai.com/blog/rss.xml"

];





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

}

);



}).on(
"error",
error=>{

reject(error);

}

);


});


}







function extractNews(xml){


const items =
xml.match(/<item>[\s\S]*?<\/item>/g) || [];



return items.slice(0,5).map((item,index)=>{



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

title:title.replace(
/<!\[CDATA\[|\]\]>/g,
""
),

category:"Tech",

tag:"Technology",

source:"Soravin Tech",

image:"assets/image/ai-news.jpg",

description:description
.replace(
/<!\[CDATA\[|\]\]>/g,
""
)
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



let allNews=[];



for(
const source of RSS_SOURCES
){


try{


const xml =
await getRSS(source);



const news =
extractNews(xml);



allNews.push(
...news
);



}

catch(error){


console.log(
"RSS failed:",
source
);


}


}





const finalNews =
allNews.slice(0,6);



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
"Updated news:",
finalNews.length
);



}

catch(error){


console.log(
"Update error:",
error.message
);


}


}



updateNews();
