// =====================================
// SORAVIN AUTO NEWS UPDATER
// MULTI RSS + AUTO CATEGORY VERSION
// =====================================


const fs = require("fs");
const https = require("https");



const outputFile =
"./data/auto-news.json";



const RSS_SOURCES = [


// =====================
// GLOBAL SOURCES
// =====================

"https://feeds.feedburner.com/TechCrunch",

"https://blogs.nvidia.com/feed/",

"https://blogs.microsoft.com/ai/feed/",

"https://openai.com/blog/rss.xml",



// =====================
// IRANIAN SOURCES
// =====================

"https://www.zoomit.ir/feed/",

"https://digiato.com/feed",

"https://peivast.com/fa/feed"


];




// =====================================
// GET RSS
// =====================================


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





// =====================================
// AUTO CATEGORY DETECTOR
// =====================================


function detectCategory(text){


text =
text.toLowerCase();



if(

text.includes("ai") ||

text.includes("openai") ||

text.includes("gpt") ||

text.includes("artificial intelligence") ||

text.includes("machine learning") ||

text.includes("chatbot") ||

text.includes("هوش مصنوعی")

){

return "AI";


}





if(

text.includes("nvidia") ||

text.includes("gpu") ||

text.includes("rtx") ||

text.includes("graphics") ||

text.includes("processor") ||

text.includes("chip") ||

text.includes("پردازنده") ||

text.includes("کارت گرافیک")

){

return "PC";


}





if(

text.includes("phone") ||

text.includes("android") ||

text.includes("iphone") ||

text.includes("mobile") ||

text.includes("گوشی") ||

text.includes("موبایل")

){

return "Mobile";


}





return "Tech";


}






// =====================================
// EXTRACT NEWS
// =====================================


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





const cleanTitle =

title.replace(
/<!\[CDATA\[|\]\]>/g,
""
);





const cleanDescription =

description
.replace(
/<!\[CDATA\[|\]\]>/g,
""
)
.substring(0,150);





const category =

detectCategory(
cleanTitle + " " + cleanDescription
);






return {


id:index + 1,


title:
cleanTitle,


category:
category,



tag:

category === "AI"

?

"Artificial Intelligence"

:

category === "PC"

?

"Hardware"

:

category === "Mobile"

?

"Mobile Technology"

:

"Technology",



source:

"Soravin Tech",



image:

category === "Mobile"

?

"assets/image/mobile-news.jpg"

:

category === "PC"

?

"assets/image/pc-news.jpg"

:

"assets/image/ai-news.jpg",



description:

cleanDescription,



date:

"امروز",



link:

link,



featured:

false,



status:

"published"



};



});


}







// =====================================
// UPDATE NEWS
// =====================================


async function updateNews(){


try{


console.log(
"Loading technology news..."
);




let allNews = [];





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





// حذف خبرهای تکراری

const uniqueNews =

allNews.filter(

(news,index,self)=>

index ===

self.findIndex(

(item)=>

item.title === news.title

)

);





const finalNews =

uniqueNews.slice(0,6);







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
