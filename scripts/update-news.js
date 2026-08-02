// =====================================
// SORAVIN AUTO NEWS UPDATER
// IRAN DIGITAL NEWS ENGINE VERSION 11
// UNIVERSAL ARTICLE EXTRACTOR
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
// FETCH URL
// =====================================


function fetchPage(url){


return new Promise((resolve,reject)=>{


https.get(url,{

headers:{

"User-Agent":
"Mozilla/5.0 (Soravin AI News Bot)"

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
// EXTRACT RSS DESCRIPTION
// =====================================


function extractDescription(item){


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





let news={



title:

title ?

cleanText(title[1])

:

"",




description:

extractDescription(item),




link:

extractLink(item),




source:

source.name



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
// UNIVERSAL ARTICLE EXTRACTOR
// =====================================


async function extractArticle(url){


try{


const html =

await fetchPage(url);



const $ = cheerio.load(html);




let paragraphs=[];





// حذف عناصر غیر محتوا


$(
"script,style,nav,header,footer,aside,form,button"
)

.remove();






$("p").each((i,el)=>{



let text =

$(el).text();



text = cleanText(text);






if(

text.length > 50 &&

!text.includes("تبلیغات") &&

!text.includes("عضویت") &&

!text.includes("اشتراک")

){



paragraphs.push(text);



}



});






// مرتب کردن بر اساس طول


paragraphs.sort((a,b)=>{

return b.length-a.length;

});







// گرفتن بهترین پاراگراف‌ها


let article="";



for(const p of paragraphs){



article += p+" ";




if(article.length > 5000){

break;

}



}






return cleanText(article);



}

catch(error){



console.log(

"ARTICLE FETCH ERROR",

url

);



return "";

}



}
// =====================================
// PART 2
// NEWS BUILDER
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

text.includes("کارت گرافیک")

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
// MAIN
// =====================================


async function updateNews(){



let allNews=[];






// دریافت RSS


for(const source of RSS_SOURCES){


try{


console.log(

"RSS:",

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







// حذف تکراری‌ها


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








// فقط ۱۰ خبر


let selected =

unique.slice(0,10);






let finalNews=[];







// استخراج متن کامل


for(let i=0;i<selected.length;i++){



let news = selected[i];




console.log(

"Extracting:",

news.title

);






let fullText =

await extractArticle(news.link);






// اگر استخراج نشد


if(

!fullText ||

fullText.length < 300

){


console.log(

"Using RSS summary"

);


fullText = news.description;


}







finalNews.push({



id:i+1,




title:

news.title,





summary_fa:

createSummary(fullText),





summary_en:"",





description:

fullText,





category:

detectCategory(

news.title+" "+fullText

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








// ذخیره JSON


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
