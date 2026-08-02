// =====================================
// SORAVIN AUTO NEWS UPDATER
// IRAN DIGITAL NEWS ENGINE VERSION 5
// 10 AUTO NEWS CARDS
// =====================================


const fs = require("fs");
const https = require("https");


const outputFile = "./data/auto-news.json";



// =====================================
// IRAN DIGITAL RSS SOURCES
// =====================================


const RSS_SOURCES = [


    // ZOOMIT

    "https://www.zoomit.ir/feed/",



    // DIGIATO

    "https://digiato.com/feed",



    // IT RESAN

    "https://itresan.com/feed",



    // GADGET NEWS

    "https://gadgetnews.net/feed/",



    // TORANJI

    "https://toranji.ir/feed/",



    // PEIVAST

    "https://peivast.com/feed"

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


response.on("data",chunk=>{

data += chunk;

});


response.on("end",()=>{

resolve(data);

});


}).on("error",reject);



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

.replace(/<img[^>]*>/gi,"")

.replace(/<[^>]+>/gi,"")

.replace(/https?:\/\/\S+/gi,"")

.replace(/\s+/g," ")

.trim();


}





// =====================================
// VALID NEWS
// =====================================


function validNews(news){


let text =

(
news.title +
" " +
news.description
)

.toLowerCase();



const badWords=[

"تبلیغات",

"advertisement",

"اشتراک",

"newsletter",

"cookie",

"privacy"

];



for(const word of badWords){


if(text.includes(word))

return false;


}



if(news.title.length < 10)

return false;



if(news.description.length < 30)

return false;



return true;


}





// =====================================
// RSS PARSER
// =====================================


function parseRSS(xml,source){



let items =

xml.match(/<item[\s\S]*?<\/item>/g)

||

xml.match(/<entry[\s\S]*?<\/entry>/g);



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
/<link[^>]*>([\s\S]*?)<\/link>/i
)

||

item.match(
/href="([^"]+)"/i
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



source



};





if(validNews(news)){


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

text.includes("chatgpt") ||

text.includes("gpt")

)

return "AI";



if(

text.includes("موبایل") ||

text.includes("گوشی") ||

text.includes("iphone") ||

text.includes("android")

)

return "Mobile";



if(

text.includes("کامپیوتر") ||

text.includes("پردازنده") ||

text.includes("لپتاپ") ||

text.includes("gpu")

)

return "PC";



return "Technology";


}





// =====================================
// PERSIAN SUMMARY
// =====================================


function createSummary(text){


let clean = cleanHTML(text);



if(clean.length > 300){

clean = clean.substring(0,300);

}



return clean;


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



let xml = await fetchRSS(rss);



console.log(
"SIZE:",
xml.length
);



let news = parseRSS(
xml,
rss
);



allNews.push(...news);



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

let seen=new Set();



allNews.forEach(news=>{


let key =
news.title.toLowerCase();



if(!seen.has(key)){


seen.add(key);

unique.push(news);


}


});







// =====================================
// FINAL 10 AUTO NEWS
// =====================================


let finalNews =


unique

.slice(0,10)

.map((news,index)=>{


return {


id:index+1,


title:news.title,


summary_fa:createSummary(news.description),


summary_en:"",


description:createSummary(news.description),


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

"news saved"

);



}




updateNews();
