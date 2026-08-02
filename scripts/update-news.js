// =====================================
// SORAVIN AUTO NEWS UPDATER
// VERSION 10.2
// SOURCE LINK FINAL FIX
// MULTI SOURCE VERSION
// =====================================


const fs = require("fs");
const https = require("https");


const outputFile = "./data/auto-news.json";



// =====================================
// RSS SOURCES
// =====================================


const RSS_SOURCES = [

{
url:"https://www.zoomit.ir/feed/",
name:"Zoomit"
},

{
url:"https://digiato.com/feed",
name:"Digiato"
},

{
url:"https://itresan.com/feed",
name:"ITResan"
},

{
url:"https://gadgetnews.net/feed/",
name:"GadgetNews"
},

{
url:"https://toranji.ir/feed/",
name:"Toranji"
},

{
url:"https://peivast.com/feed",
name:"Peivast"
}

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
// CLEAN TEXT ONLY
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

.replace(/\s+/g," ")

.trim();


}






// =====================================
// CLEAN URL
// =====================================


function cleanURL(text=""){


return text

.replace(/<!\[CDATA\[/gi,"")

.replace(/\]\]>/gi,"")

.trim();


}







// =====================================
// VALID NEWS
// =====================================


function validNews(news){


if(!news.title)

return false;


if(news.title.length < 10)

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



let title = item.match(
/<title[^>]*>([\s\S]*?)<\/title>/i
);



let description = item.match(
/<description[^>]*>([\s\S]*?)<\/description>/i
)

||

item.match(
/<summary[^>]*>([\s\S]*?)<\/summary>/i
);





// =====================================
// SOURCE LINK FIX
// =====================================


let link="";



let normalLink = item.match(
/<link>([\s\S]*?)<\/link>/i
);



if(normalLink){

link = cleanURL(normalLink[1]);

}




if(!link){


let atomLink = item.match(
/<link[^>]+href=["']([^"']+)["']/i
);


if(atomLink){

link = cleanURL(atomLink[1]);

}


}




if(!link){


let guidLink = item.match(
/<guid[^>]*>([\s\S]*?)<\/guid>/i
);


if(guidLink){

link = cleanURL(guidLink[1]);

}


}




if(!link.startsWith("http")){

link="";

}






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



link,



source: source



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

text.includes("gpt")

)

return "AI";




if(

text.includes("موبایل") ||

text.includes("گوشی") ||

text.includes("iphone")

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




for(const rss of RSS_SOURCES){


try{


console.log(
"READ:",
rss.name
);



let xml = await fetchRSS(rss.url);



let news = parseRSS(
xml,
rss.name
);



allNews.push(...news);



}

catch(error){


console.log(
"RSS ERROR:",
rss.name
);


}


}






// REMOVE DUPLICATE


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








// MIX SOURCES


unique.sort(
()=>Math.random()-0.5
);







let finalNews = unique

.slice(0,10)

.map((news,index)=>{


return {


id:index+1,


title:news.title,


summary_fa:news.description,


summary_en:"",


description:news.description,


category:

detectCategory(
news.title+" "+news.description
),


tag:

detectCategory(
news.title
),


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
