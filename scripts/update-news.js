// =====================================
// SORAVIN AUTO NEWS UPDATER
// SIMPLE RSS ENGINE VERSION 8.1
// CLEAN SIMPLE NEWS VERSION
// =====================================


const fs = require("fs");
const https = require("https");


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
// FETCH RSS
// =====================================


function fetchRSS(url){


return new Promise((resolve,reject)=>{


https.get(url,{

headers:{

"User-Agent":"Mozilla/5.0 Soravin News"

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
// CLEAN HTML
// =====================================


function cleanHTML(text=""){


return text

.replace(/<!\[CDATA\[/gi,"")

.replace(/\]\]>/gi,"")

.replace(/<script[\s\S]*?<\/script>/gi,"")

.replace(/<style[\s\S]*?<\/style>/gi,"")

.replace(/<img[^>]*>/gi,"")

.replace(/<a[^>]*>/gi,"")

.replace(/<\/a>/gi,"")

.replace(/<br\s*\/?>/gi," ")

.replace(/<p[^>]*>/gi,"")

.replace(/<\/p>/gi," ")

.replace(/<[^>]+>/gi,"")

.replace(/&nbsp;/gi," ")

.replace(/&amp;/gi,"&")

.replace(/&quot;/gi,'"')

.replace(/&#39;/gi,"'")

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





let news={


title:

title ?

cleanHTML(title[1])

:

"",



description:

description ?

cleanHTML(description[1])

:

"",



link:

link ?

cleanHTML(link[1])

:

"",



source:source.name


};






if(

news.title.length > 10 &&

news.description.length > 20

){


result.push(news);


}



});




return result;


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

text.includes("iphone") ||

text.includes("android")

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



for(const source of RSS_SOURCES){


try{


console.log(

"Reading:",

source.name

);



let xml =

await fetchRSS(source.url);



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








// REMOVE DUPLICATES


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








// CREATE 10 CARDS


let finalNews =


unique.slice(0,10)

.map((news,index)=>{


return {


id:index+1,


title:news.title,


summary_fa:news.description,


summary_en:"",


description:news.description,


category:

detectCategory(

news.title+

" "+

news.description

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
