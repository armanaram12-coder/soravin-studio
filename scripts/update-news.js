// =====================================
// SORAVIN AUTO NEWS ENGINE
// VERSION 12
// RSS + FULL ARTICLE FETCH
// REAL SOURCE LINK FIX
// =====================================


const fs = require("fs");
const https = require("https");
const cheerio = require("cheerio");



const outputFile =
"./data/auto-news.json";




// =====================================
// RSS SOURCES
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
name:"Gadgetnews",
url:"https://gadgetnews.net/feed/"
},


{
name:"Toranji",
url:"https://toranji.ir/feed/"
},


{
name:"Peivast",
url:"https://peivast.com/feed"
}


];







// =====================================
// FETCH URL
// =====================================


function fetchURL(url){


return new Promise((resolve,reject)=>{


https.get(url,{

headers:{

"User-Agent":
"Mozilla/5.0 (Windows NT 10.0)"

}

},

response=>{


let data="";


response.on(
"data",
chunk=>{

data += chunk;

});


response.on(
"end",
()=>{

resolve(data);

});


})

.on(
"error",
reject
);


});


}







// =====================================
// CLEAN TEXT
// =====================================


function cleanText(text=""){


return text

.replace(/<!\[CDATA\[/gi,"")

.replace(/\]\]>/gi,"")

.replace(/&nbsp;/gi," ")

.replace(/&amp;/gi,"&")

.replace(/&quot;/gi,'"')

.replace(/&#39;/gi,"'")

.replace(/&lt;/gi,"<")

.replace(/&gt;/gi,">")

.replace(/<script[\s\S]*?<\/script>/gi,"")

.replace(/<style[\s\S]*?<\/style>/gi,"")

.replace(/<img[^>]*>/gi,"")

.replace(/<a[^>]*>/gi,"")

.replace(/<\/a>/gi,"")

.replace(/<[^>]+>/gi,"")

.replace(/https?:\/\/\S+/gi,"")

.replace(/\s+/g," ")

.trim();


}







// =====================================
// EXTRACT RSS ITEMS
// =====================================


function parseRSS(xml,source){


let items =

xml.match(
/<item[\s\S]*?<\/item>/g
)

||

xml.match(
/<entry[\s\S]*?<\/entry>/g
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
)

||

item.match(
/<summary[^>]*>([\s\S]*?)<\/summary>/i
);



let link =

item.match(
/<link>([\s\S]*?)<\/link>/i
)

||

item.match(
/<guid[^>]*>([\s\S]*?)<\/guid>/i
)

||

item.match(
/href="([^"]+)"/i
);



let news={


title:

title ?

cleanText(title[1])

:

"",


description:

description ?

cleanText(description[1])

:

"",


link:

link ?

cleanText(link[1])

:

"",


source


};




if(

news.link.startsWith("http")

&&

news.title.length > 10

){


result.push(news);


}



});




return result;


}



// =====================================
// FETCH FULL ARTICLE
// =====================================


async function getArticleContent(url){


try{


let html =
await fetchURL(url);



const $ =
cheerio.load(html);



$("script").remove();

$("style").remove();

$("nav").remove();

$("footer").remove();

$("header").remove();

$("aside").remove();

$("img").remove();

$("figure").remove();





let content = "";





const selectors = [


"article",

".article-body",

".post-content",

".entry-content",

".content",

"main"


];







for(const selector of selectors){


let text =

$(selector)
.text();



if(

text &&

text.length > content.length

){


content = text;


}



}







if(!content){


content =

$("body").text();


}







content =

cleanText(content);






// حذف متن‌های اضافی کوتاه

if(content.length < 100){


return "";


}






return content.substring(
0,
2500
);



}

catch(error){


console.log(
"ARTICLE ERROR:",
url
);



return "";

}



}








// =====================================
// CATEGORY
// =====================================


function detectCategory(text){



text =
text.toLowerCase();




if(

text.includes("هوش مصنوعی")

||

text.includes("ai")

||

text.includes("gpt")

)


return "AI";






if(

text.includes("گوشی")

||

text.includes("موبایل")

||

text.includes("iphone")

||

text.includes("android")

)


return "Mobile";







if(

text.includes("پردازنده")

||

text.includes("لپتاپ")

||

text.includes("کامپیوتر")

||

text.includes("gpu")

)


return "PC";






return "Technology";


}








// =====================================
// MAIN UPDATE
// =====================================


async function updateNews(){


let allNews=[];






for(const rss of RSS_SOURCES){



try{



console.log(
"Reading:",
rss.name
);





let xml =

await fetchURL(
rss.url
);





let news =

parseRSS(
xml,
rss.name
);





allNews.push(
...news
);





}

catch(error){



console.log(
"RSS ERROR:",
rss.name
);



}



}







// =====================================
// LIMIT PER SOURCE
// =====================================


let sourceCounter={};

let filtered=[];





for(const news of allNews){



if(!sourceCounter[news.source]){


sourceCounter[news.source]=0;


}





if(
sourceCounter[news.source] < 2
){



filtered.push(news);



sourceCounter[news.source]++;


}



}








// =====================================
// REMOVE DUPLICATES
// =====================================


let unique=[];

let seen=new Set();





filtered.forEach(news=>{



let key =
news.title.toLowerCase();





if(!seen.has(key)){


seen.add(key);


unique.push(news);



}



});





// =====================================
// CREATE FINAL NEWS
// =====================================


let finalNews=[];



for(
let i=0;
i<unique.length && finalNews.length<10;
i++
){



const news = unique[i];



console.log(
"Fetching article:",
news.title
);




let fullText =

await getArticleContent(
news.link
);





// اگر متن کامل پیدا نشد
// همان متن RSS استفاده شود


if(!fullText){


fullText =

news.description;


}





finalNews.push({



id:
finalNews.length + 1,



title:
news.title,



summary_fa:

cleanText(
news.description
).substring(0,250),




content_fa:

fullText,



summary_en:"",




description:

fullText.substring(
0,
500
),





category:

detectCategory(
news.title +
" " +
fullText
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





// لینک واقعی سایت اصلی

link:

news.link,





featured:

false,





status:

"published"





});



}







// =====================================
// SAVE JSON
// =====================================



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
