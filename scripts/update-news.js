// =====================================
// SORAVIN AUTO NEWS UPDATER
// IRAN DIGITAL NEWS ENGINE VERSION 6
// FULL ARTICLE DATA VERSION
// =====================================


const fs = require("fs");
const https = require("https");


const outputFile = "./data/auto-news.json";



const RSS_SOURCES = [

"https://www.zoomit.ir/feed/",

"https://digiato.com/feed",

"https://itresan.com/feed",

"https://gadgetnews.net/feed/",

"https://toranji.ir/feed/",

"https://peivast.com/feed"

];





function fetchRSS(url){

return new Promise((resolve,reject)=>{


https.get(url,{

headers:{
"User-Agent":"Mozilla/5.0"
}

},response=>{


let data="";


response.on("data",chunk=>{

data+=chunk;

});


response.on("end",()=>{

resolve(data);

});


}).on("error",reject);


});


}





function cleanHTML(text=""){


return text

.replace(/<!\[CDATA\[/gi,"")

.replace(/\]\]>/gi,"")

.replace(/&lt;/gi,"<")

.replace(/&gt;/>/gi,">")

.replace(/&amp;/gi,"&")

.replace(/&quot;/gi,'"')

.replace(/&#39;/gi,"'")

.replace(/<script[\s\S]*?<\/script>/gi,"")

.replace(/<style[\s\S]*?<\/style>/gi,"")

.replace(/<img[^>]*>/gi,"")

.replace(/<[^>]+>/gi,"")

.replace(/\s+/g," ")

.trim();


}





function validNews(news){


let text=

(
news.title+
" "+
news.description
)

.toLowerCase();



if(news.title.length<10)

return false;


if(news.description.length<30)

return false;



return true;


}





function parseRSS(xml,source){


let items=

xml.match(/<item[\s\S]*?<\/item>/g)
||
xml.match(/<entry[\s\S]*?<\/entry>/g);



if(!items)

return [];



let result=[];



items.forEach(item=>{


let title=item.match(
/<title[^>]*>([\s\S]*?)<\/title>/i
);


let description=item.match(
/<description[^>]*>([\s\S]*?)<\/description>/i
)
||
item.match(
/<summary[^>]*>([\s\S]*?)<\/summary>/i
);



let link=item.match(
/<link[^>]*>([\s\S]*?)<\/link>/i
)
||
item.match(
/href="([^"]+)"/i
);



let news={

title:title ? cleanHTML(title[1]) : "",

description:description ? cleanHTML(description[1]) : "",

link:link ? cleanHTML(link[1]) : "",

source

};



if(validNews(news)){

result.push(news);

}


});


return result;


}





function detectCategory(text){


text=text.toLowerCase();



if(
text.includes("هوش مصنوعی")||
text.includes("ai")||
text.includes("gpt")
)

return "AI";



if(
text.includes("گوشی")||
text.includes("موبایل")||
text.includes("android")||
text.includes("iphone")
)

return "Mobile";



if(
text.includes("کامپیوتر")||
text.includes("لپتاپ")||
text.includes("پردازنده")||
text.includes("gpu")
)

return "PC";



return "Technology";


}





function createSummary(text){


let clean=cleanHTML(text);



if(clean.length>300){

return clean.substring(0,300)+"...";

}



return clean;


}






async function updateNews(){


let allNews=[];



for(const rss of RSS_SOURCES){


try{


console.log("Reading:",rss);



let xml=await fetchRSS(rss);



let news=parseRSS(xml,rss);



allNews.push(...news);



}

catch(error){


console.log(
"RSS ERROR:",
rss
);


}


}






let unique=[];

let seen=new Set();



allNews.forEach(news=>{


let key=news.title.toLowerCase();



if(!seen.has(key)){


seen.add(key);

unique.push(news);


}


});







let finalNews=

unique.slice(0,10)

.map((news,index)=>{


return {


id:index+1,


title:news.title,


summary_fa:createSummary(news.description),


summary_en:"",



// متن کامل برای صفحه خبر

description:news.description,



category:detectCategory(
news.title+" "+news.description
),



tag:detectCategory(news.title),



source:news.source,



image:"assets/image/ai-news.jpg",



date:new Date().toISOString(),



link:news.link,



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
"news saved"
);


}




updateNews();
