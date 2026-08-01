// ===============================
// SORAVIN AUTO NEWS UPDATER
// Safe Version
// ===============================


const fs = require("fs");

const https = require("https");





// مسیر خروجی

const outputFile = "./data/auto-news.json";





// دریافت خبر از API خودمان

function getNews(){


return new Promise((resolve,reject)=>{


https.get(
"https://YOUR-DOMAIN.com/api/news-feed",
(response)=>{


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


try{


const json = JSON.parse(data);


resolve(json.news || []);


}

catch(error){

reject(error);

}


}


);


}

).on(
"error",
error=>{


reject(error);


});


});


}








async function updateNews(){


try{


console.log("Loading Soravin news...");



const news = await getNews();




fs.writeFileSync(

outputFile,

JSON.stringify(news,null,2),

"utf8"

);




console.log(
"News updated:",
news.length
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
