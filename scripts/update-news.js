// =====================================
// SORAVIN AUTO NEWS UPDATER
// IRAN DIGITAL NEWS ENGINE VERSION 9
// ARTICLE SCRAPER VERSION
// =====================================


const fs = require("fs");
const https = require("https");
const cheerio = require("cheerio");


const outputFile = "./data/auto-news.json";




// =====================================
// RSS SOURCES
// =====================================


const RSS_SOURCES = [

"https://www.zoomit.ir/feed/",

"https://digiato.com/feed",

"https://itresan.com/feed",

"https://gadgetnews.net/feed/",

"https://toranji.ir/feed/",

"https://peivast.com/feed"

];






// =====================================
// FETCH PAGE
// =====================================


function fetchPage(url){


return new Promise((resolve,reject)=>{


https.get(url,{

headers:{
"User-Agent":"Mozilla/5.0 Soravin News Bot"
}

},response=>{


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


}).on(
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

.replace(/\s+/g," ")

.trim();


}







// =====================================
// FETCH ARTICLE CONTENT
// =====================================


async function fetchArticle(url){


try{


const html =

await fetchPage(url);



const $ = cheerio.load(html);



let content = "";





const selectors = [

"article p",

".entry-content p",

".post-content p",

".article-content p",

".content p"

];






for(const selector of selectors){


$(selector).each((i,el)=>{


let text =

$(el).text();



if(text.length > 40){

content += text+" ";

}



});



if(content.length > 500){

break;

}


}






return cleanText(content);



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
// RSS FETCH
// =====================================


function fetchRSS(url){


return fetchPage(url);


}







// =====================================
// HTML CLEAN
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

.replace(/<[^>]+>/g,"")

.replace(/\s+/g," ")

.trim();


}








// =====================================
// EXTRACT LINK
// =====================================


function extractLink(item){


let link =

item.match(
/<link>([\s\S]*?)<\/link>/i
);



if(link){

return cleanHTML(link[1]);

}



let atom =

item.match(
/href="([^"]+)"/i
);



if(atom){

return atom[1];

}



return "";

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





result.push({

title:title
?
cleanHTML(title[1])
:
"",

summary:description
?
cleanHTML(description[1])
:
"",

link:extractLink(item),

source

});



});



return result;


}








// =====================================
// SUMMARY
// =====================================


function createSummary(text){


if(text.length > 300){

return text.substring(0,300)+"...";

}


return text;


}







// =====================================
// CATEGORY
// =====================================


function detectCategory(text){


text=text.toLowerCase();



if(
text.includes("هوش مصنوعی") ||
text.includes("ai") ||
text.includes("gpt")
)

return "AI";



if(
text.includes("گوشی") ||
text.includes("موبایل") ||
text.includes("iphone")
)

return "Mobile";



if(
text.includes("لپتاپ") ||
text.includes("کامپیوتر") ||
text.includes("پردازنده")
)

return "PC";



return "Technology";


}








// =====================================
// MAIN
// =====================================


async function updateNews(){


let allNews=[];



for(const rss of RSS_SOURCES){


try{


console.log(
"RSS:",
rss
);



const xml =

await fetchRSS(rss);



const news =

parseRSS(xml,rss);



allNews.push(...news);



}

catch(error){


console.log(
"RSS FAILED",
rss
);


}



}






let unique=[];

let seen=new Set();




for(const news of allNews){



let key =
news.title.toLowerCase();



if(!seen.has(key)){


seen.add(key);

unique.push(news);


}


}






let selected =

unique.slice(0,10);






let finalNews=[];






for(let i=0;i<selected.length;i++){



let news = selected[i];



console.log(

"Reading article:",

news.title

);





let fullText =

await fetchArticle(news.link);






if(fullText.length < 200){


fullText = news.summary;


}






finalNews.push({


id:i+1,


title:news.title,


summary_fa:createSummary(fullText),


summary_en:"",


description:fullText,


category:

detectCategory(
news.title+
" "+
fullText
),


tag:

detectCategory(news.title),


source:news.source,


image:

"assets/image/ai-news.jpg",


date:

new Date().toISOString(),


link:news.link,


featured:false,


status:"published"


});



}








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
