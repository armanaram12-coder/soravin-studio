// =====================================
// SORAVIN AUTO NEWS UPDATER
// VERSION 10.1
// RSS CLEAN + GZIP FIX + FULL TEXT
// =====================================


const fs = require("fs");
const https = require("https");
const zlib = require("zlib");


const outputFile =
"./data/auto-news.json";




// =====================================
// SOURCES
// =====================================


const RSS_SOURCES = [


{
name:"Zoomit",
url:"https://www.zoomit.ir/feed/"
},


{
name:"Digiato",
url:"https://digiato.com/feed"
},


{
name:"ITResan",
url:"https://itresan.com/feed"
},


{
name:"GadgetNews",
url:"https://gadgetnews.net/feed/"
},


{
name:"Toranji",
url:"https://toranji.ir/feed/"
}


];






// =====================================
// FETCH WITH GZIP SUPPORT
// =====================================


function fetchURL(url){


return new Promise((resolve,reject)=>{


https.get(url,{

headers:{

"User-Agent":
"Mozilla/5.0",

"Accept-Encoding":
"gzip"

}


},response=>{


let chunks=[];



response.on(
"data",
chunk=>chunks.push(chunk)
);



response.on(
"end",
()=>{


let buffer =
Buffer.concat(chunks);



if(
response.headers["content-encoding"]
==="gzip"
){


try{


buffer =
zlib.gunzipSync(buffer);


}

catch(e){


console.log(
"GZIP ERROR"
);


}



}





resolve(
buffer.toString("utf8")
);



}



);



}).on(
"error",
reject
);



});


}








// =====================================
// CLEAN HTML
// =====================================


function cleanHTML(text=""){


return text

.replace(/<!\[CDATA\[/gi,"")

.replace(/\]\]>/gi,"")

.replace(/&lt;/gi,"<")

.replace(/&gt;/gi,">")

.replace(/&amp;/gi,"&")

.replace(/&quot;/gi,'"')

.replace(/&#39;/gi,"'")

.replace(/<script[\s\S]*?<\/script>/gi,"")

.replace(/<style[\s\S]*?<\/style>/gi,"")

.replace(/<a[^>]*>/gi,"")

.replace(/<\/a>/gi,"")

.replace(/<img[^>]*>/gi,"")

.replace(/<br\s*\/?>/gi," ")

.replace(/<p[^>]*>/gi,"")

.replace(/<\/p>/gi,"")

.replace(/<[^>]+>/gi,"")

.replace(/https?:\/\/\S+/gi,"")

.replace(/\s+/g," ")

.trim();


}








// =====================================
// PARSE RSS
// =====================================


function parseRSS(xml,source){


let items =

xml.match(
/<item[\s\S]*?<\/item>/g
);



if(!items)

return [];




let result=[];



items.forEach(item=>{


let title =
item.match(
/<title[^>]*>([\s\S]*?)<\/title>/i
);


let description =
item.match(
/<description[^>]*>([\s\S]*?)<\/description>/i
);



let link =
item.match(
/<link>([\s\S]*?)<\/link>/i
);





if(title && link){


result.push({


title:
cleanHTML(title[1]),


description:
description
?
cleanHTML(description[1])
:
"",



link:
cleanHTML(link[1]),



source:source.name



});


}



});



return result;



}










// =====================================
// ARTICLE SUMMARY
// =====================================


function makeSummary(text){


text =
cleanHTML(text);



if(text.length > 250)

return text.substring(0,250)+"...";



return text;


}








// =====================================
// CATEGORY
// =====================================


function detectCategory(text){


text=text.toLowerCase();



if(

text.includes("ai") ||

text.includes("هوش مصنوعی") ||

text.includes("gpt")

)

return "AI";



if(

text.includes("گوشی") ||

text.includes("موبایل") ||

text.includes("iphone") ||

text.includes("android")

)

return "Mobile";



if(

text.includes("پردازنده") ||

text.includes("لپتاپ") ||

text.includes("کامپیوتر")

)

return "PC";



return "Technology";


}










// =====================================
// MAIN
// =====================================


async function updateNews(){



let allNews=[];




for(const source of RSS_SOURCES){


try{


console.log(
"Reading:",
source.name
);



let xml =
await fetchURL(source.url);



let news =
parseRSS(xml,source);



allNews.push(...news);



}

catch(error){


console.log(
"RSS ERROR:",
source.name
);



}



}







let unique=[];

let seen=new Set();




allNews.forEach(news=>{


let key =
news.title.toLowerCase();



if(!seen.has(key)){


seen.add(key);

unique.push(news);


}



});








let finalNews =

unique
.slice(0,10)
.map((news,index)=>{


return {



id:index+1,



title:
news.title,



summary_fa:
makeSummary(news.description),



content_fa:
makeSummary(news.description),



summary_en:"",



category:
detectCategory(
news.title+
" "+
news.description
),



tag:
detectCategory(news.title),



source:
news.source,



image:
"assets/image/ai-news.jpg",



date:
new Date().toISOString(),



link:
news.link,



featured:false,



status:"published"



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

"NEWS SAVED"

);



}




updateNews();
