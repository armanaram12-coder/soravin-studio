// ===============================
// SORAVIN AUTO NEWS FEED API
// ===============================

export default async function handler(req, res) {


try {


const feeds = [

"https://openai.com/news/rss.xml",

"https://blogs.nvidia.com/feed/",

"https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"

];



let allNews = [];



for (const feed of feeds) {


const response = await fetch(feed);


const text = await response.text();



const items = text.match(/<item>([\s\S]*?)<\/item>/g);



if(items){


items.slice(0,3).forEach(item=>{


const title =
item.match(/<title>(.*?)<\/title>/)?.[1] || "Technology News";



const link =
item.match(/<link>(.*?)<\/link>/)?.[1] || "#";



const description =
item.match(/<description>(.*?)<\/description>/)?.[1]
|| "Latest technology news";




allNews.push({


id: Date.now(),


title: clean(title),


category:"AI",


tag:"Artificial Intelligence",


source:"Soravin Tech",


image:"assets/image/ai-news.jpg",


description:clean(description),


date:"امروز",


link:link,


featured:false,


status:"published"


});



});

}


}



res.status(200).json({

success:true,

count:allNews.length,

news:allNews

});



}

catch(error){


res.status(500).json({

success:false,

error:error.message

});


}



}





function clean(text){


return text

.replace(/<!\[CDATA\[/g,"")

.replace(/\]\]>/g,"")

.replace(/<[^>]*>/g,"")

.trim();


}
