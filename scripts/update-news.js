// =====================================
// SORAVIN AUTO NEWS UPDATER
// IRAN DIGITAL NEWS ENGINE VERSION 10
// SITE SPECIFIC ARTICLE EXTRACTOR
// PART 1
// =====================================


const fs = require("fs");
const https = require("https");
const cheerio = require("cheerio");



const outputFile = "./data/auto-news.json";




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
name:"GadgetNews",
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
// HTTP FETCH
// =====================================


function fetchPage(url){


return new Promise((resolve,reject)=>{


https.get(url,{

headers:{

"User-Agent":

"Mozilla/5.0 (Soravin News Bot)"

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

.replace(/<!\[CDATA\[/gi,"")

.replace(/\]\]>/gi,"")

.replace(/&nbsp;/gi," ")

.replace(/&amp;/gi,"&")

.replace(/&quot;/gi,'"')

.replace(/&#39;/gi,"'")

.replace(/<script[\s\S]*?<\/script>/gi,"")

.replace(/<style[\s\S]*?<\/style>/gi,"")

.replace(/\s+/g," ")

.trim();


}







// =====================================
// EXTRACT RSS LINK
// =====================================


function extractLink(item){



let link =

item.match(

/<link>([\s\S]*?)<\/link>/i

);



if(link){

return cleanText(link[1]);

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
// EXTRACT RSS CONTENT
// =====================================


function extractRSSContent(item){



let content =

item.match(

/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i

);



if(content){

return cleanText(content[1]);

}





let description =

item.match(

/<description[^>]*>([\s\S]*?)<\/description>/i

);



if(description){

return cleanText(description[1]);

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




let news = {


title:

title ?

cleanText(title[1])

:

"",



description:

extractRSSContent(item),



link:

extractLink(item),



source:source.name


};





if(

news.title &&

news.link

){


result.push(news);


}



});




return result;


}








// =====================================
// ARTICLE EXTRACTORS
// =====================================



async function extractArticle(url,source){


try{


const html =

await fetchPage(url);



const $ = cheerio.load(html);



let text="";





// -----------------------------
// ZOOMIT
// -----------------------------


if(source==="Zoomit"){


const selectors=[

".article-body p",

".content-body p",

"article p"

];


selectors.forEach(selector=>{


$(selector).each((i,el)=>{


text +=

$(el).text()+" ";


});


});


}






// -----------------------------
// DIGIATO
// -----------------------------


if(source==="Digiato"){


const selectors=[

".post-content p",

".entry-content p",

"article p"

];


selectors.forEach(selector=>{


$(selector).each((i,el)=>{


text +=

$(el).text()+" ";


});


});


}





// -----------------------------
// ITRESAN
// -----------------------------


if(source==="ITResan"){


$("article p").each((i,el)=>{


text +=

$(el).text()+" ";


});


}







// -----------------------------
// GADGET NEWS
// -----------------------------


if(source==="GadgetNews"){


const selectors=[

".single-content p",

".post-content p",

"article p"

];


selectors.forEach(selector=>{


$(selector).each((i,el)=>{


text +=

$(el).text()+" ";


});


});


}






// -----------------------------
// TORANJI
// -----------------------------


if(source==="Toranji"){


$("article p").each((i,el)=>{


text +=

$(el).text()+" ";


});


}






// -----------------------------
// PEIVAST
// -----------------------------


if(source==="Peivast"){


$("article p").each((i,el)=>{


text +=

$(el).text()+" ";


});


}




return cleanText(text);



}

catch(error){


console.log(

"Extractor error:",

source

);


return "";

}



}
// =====================================
// PART 2
// MAIN ENGINE
// =====================================






// =====================================
// CATEGORY
// =====================================


function detectCategory(text){


text = text.toLowerCase();



if(

text.includes("هوش مصنوعی") ||

text.includes("ai") ||

text.includes("gpt") ||

text.includes("chatgpt")

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

text.includes("لپتاپ") ||

text.includes("کامپیوتر") ||

text.includes("پردازنده") ||

text.includes("gpu")

)

return "PC";





return "Technology";


}








// =====================================
// SUMMARY
// =====================================


function createSummary(text){


if(!text)

return "";



if(text.length > 350){


return text.substring(0,350)+"...";


}



return text;


}








// =====================================
// MAIN UPDATE
// =====================================


async function updateNews(){



let allNews=[];





// -----------------------------
// READ RSS
// -----------------------------


for(const source of RSS_SOURCES){


try{


console.log(

"Reading RSS:",

source.name

);




const xml =

await fetchPage(source.url);




const news =

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








// -----------------------------
// REMOVE DUPLICATES
// -----------------------------


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








// فقط ۱۰ خبر اول


let selected =

unique.slice(0,10);






let finalNews=[];





// -----------------------------
// SCRAPE ARTICLES
// -----------------------------


for(let i=0;i<selected.length;i++){



let news = selected[i];



console.log(

"Extracting:",

news.source,

news.title

);





let articleText =

await extractArticle(

news.link,

news.source

);







// اگر استخراج نشد، RSS


if(

!articleText ||

articleText.length < 300

){


articleText =

news.description;


}






finalNews.push({



id:i+1,



title:news.title,




summary_fa:

createSummary(articleText),





summary_en:"",




description:

articleText,





category:

detectCategory(

news.title+

" "+

articleText

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

new Date().toISOString(),





link:

news.link,





featured:false,





status:"published"



});





}









// -----------------------------
// SAVE JSON
// -----------------------------


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






// =====================================
// START
// =====================================


updateNews();
