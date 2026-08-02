// =====================================
// SORAVIN AUTO NEWS UPDATER
// VERSION 10
// FULL ARTICLE EXTRACTOR
// CHEERIO ENGINE
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
// FETCH
// =====================================


function fetchURL(url){


return new Promise((resolve,reject)=>{


https.get(url,{

headers:{
"User-Agent":
"Mozilla/5.0 SoravinBot"
}

},res=>{


let data="";


res.on(
"data",
chunk=>data+=chunk
);



res.on(
"end",
()=>resolve(data)
);



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
// EXTRACT ARTICLE
// =====================================


async function getArticle(url){


try{


let html =

await fetchURL(url);



const $ = cheerio.load(html);



$("script").remove();

$("style").remove();

$("img").remove();

$("nav").remove();

$("header").remove();

$("footer").remove();

$("aside").remove();





let articleText="";





const selectors=[

"article",

".article-content",

".entry-content",

".post-content",

".content"

];





for(const selector of selectors){


let text=$(selector).text();



if(text.length > articleText.length){

articleText=text;

}


}






if(articleText.length < 200){


articleText=$("body").text();


}






return cleanText(articleText)
.substring(0,3000);



}

catch(error){


return "";

}



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
/<link[^>]*>([\s\S]*?)<\/link>/i
);






if(title && link){



result.push({


title:title[1]
.replace(/<[^>]+>/g,"")
.trim(),



description:

description

?

description[1]
.replace(/<[^>]+>/g,"")
.trim()

:

"",



link:

link[1]
.trim(),



source:source.name



});


}



});



return result;



}








// =====================================
// CATEGORY
// =====================================


function category(text){


text=text.toLowerCase();



if(

text.includes("ai") ||

text.includes("هوش مصنوعی") ||

text.includes("gpt")

)

return "AI";



if(

text.includes("موبایل") ||

text.includes("گوشی")

)

return "Mobile";



if(

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



let all=[];



for(const source of RSS_SOURCES){



try{


console.log(
"RSS:",
source.name
);



let xml=

await fetchURL(source.url);



let news=

parseRSS(xml,source);



all.push(...news);



}

catch(e){


console.log(
"RSS ERROR",
source.name
);


}



}






let unique=[];

let seen=new Set();




all.forEach(news=>{


let key=

news.title.toLowerCase();



if(!seen.has(key)){


seen.add(key);

unique.push(news);


}



});







let final=[];





for(

const [index,news]

of unique.slice(0,10).entries()

){



console.log(
"ARTICLE:",
news.title
);





let fullText=

await getArticle(news.link);





final.push({



id:index+1,


title:news.title,



summary_fa:

news.description.substring(0,220),



content_fa:

fullText || news.description,



summary_en:"",



category:

category(
news.title+
" "+
fullText
),



tag:

category(news.title),



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








if(!fs.existsSync("./data")){

fs.mkdirSync("./data");

}





fs.writeFileSync(

outputFile,

JSON.stringify(
final,
null,
2
),

"utf8"

);






console.log(

"DONE:",

final.length,

"FULL NEWS SAVED"

);



}





updateNews();
