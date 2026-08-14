// =====================================
// SORAVIN AUTO NEWS UPDATER + SEO PAGES GENERATOR
// VERSION 11.0
// - Generates static HTML pages for each news item
// - Generates sitemap.xml
// - Creates/updates robots.txt
// =====================================


const fs = require("fs");
const https = require("https");
const path = require("path");


const outputFile = "./data/auto-news.json";
const newsDir = "./news";
const siteUrl = "https://soravin-studio.vercel.app";


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
// SLUG GENERATOR
// =====================================


function generateSlug(text){
return text
.toLowerCase()
.replace(/[^\w\s\u0600-\u06FF-]/g, "")
.replace(/\s+/g, "-")
.replace(/-+/g, "-")
.trim()
.substring(0, 60);
}




// =====================================
// GET HEADER HTML
// =====================================


function getHeaderHTML(pageTitle, pageDescription, currentPage){
return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${pageTitle}</title>
<meta name="description" content="${pageDescription}">
<meta property="og:title" content="${pageTitle}">
<meta property="og:description" content="${pageDescription}">
<meta property="og:type" content="article">
<link rel="canonical" href="${siteUrl}/${currentPage}">
<link rel="stylesheet" href="../style.css">
<style>
body{background:#050505;color:#eaf4ff;font-family:Tahoma,Arial,sans-serif;direction:rtl;margin:0;padding-top:70px}
.news-detail-container{max-width:900px;margin:40px auto;padding:20px}
.news-detail-header{border-bottom:1px solid rgba(212,175,55,.2);padding-bottom:20px;margin-bottom:30px}
.news-detail-title{color:#d4af37;font-size:28px;margin:0 0 15px 0;line-height:1.4}
.news-detail-meta{color:#888;font-size:13px;display:flex;gap:20px;flex-wrap:wrap}
.news-detail-meta span{display:flex;align-items:center;gap:5px}
.news-detail-content{color:#cfc6e8;font-size:15px;line-height:1.8}
.news-detail-content p{margin:0 0 20px 0}
.news-source-link{display:inline-block;margin-top:20px;padding:10px 20px;background:#d4af37;color:#000;text-decoration:none;border-radius:8px;font-weight:bold;transition:.3s}
.news-source-link:hover{background:#e3c76a}
.back-to-news{display:inline-block;margin-top:30px;color:#d4af37;text-decoration:none;font-size:14px;transition:.3s}
.back-to-news:hover{color:#e3c76a}
.tech-footer{background:#1a1a1a;border-top:1px solid #333;padding:30px 20px;text-align:center;margin-top:60px}
.tech-footer h3{color:#b39dff;font-size:18px;margin:0 0 10px}
.tech-footer p{color:#cfc6e8;font-size:13px;margin:5px 0}
.footer-links{display:flex;justify-content:center;gap:24px;margin:20px 0}
.footer-links a{color:#cfc6e8;text-decoration:none;font-size:13px;transition:color 0.3s}
.footer-links a:hover{color:#b39dff}
</style>
</head>
<body>
<header class="header">
<div class="logo">SORAVIN <span>Ai</span></div>
<nav class="main-nav">
<a href="../index.html">خانه</a>
<a href="../tech-news.html">اخبار تکنولوژی</a>
<a href="../ai-learning.html">دانشنامه AI</a>
<a href="../ai-tools.html">ابزارهای رایگان</a>
</nav>
<div class="auth-buttons"><a href="../login.html" class="btn-outline-small">ورود / ثبت‌نام</a></div>
</header>
`;
}


function getFooterHTML(){
return `
<footer class="tech-footer">
<h3>SORAVIN NEWS</h3>
<p>اخبار هوش مصنوعی، کامپیوتر، موبایل و فناوری‌های آینده</p>
<div class="footer-links">
<a href="../index.html">خانه</a>
<a href="../tech-news.html">اخبار</a>
<a href="../ai-learning.html">دانشنامه AI</a>
</div>
<p>© <span id="copyright-year"></span> Soravin Ai — کلیه حقوق محفوظ است. طراحی و توسعه: آرمان آرام</p>
</footer>
<script>document.getElementById("copyright-year").textContent = new Date().getFullYear();</script>
</body>
</html>`;
}


// =====================================
// GENERATE STATIC NEWS PAGE
// =====================================


function generateNewsPage(news, index){
const slug = generateSlug(news.title) || `news-${news.id}`;
const pubDate = new Date(news.date);
const dateStr = pubDate.toLocaleDateString('fa-IR');

const pageTitle = `${news.title} | دانشنامه سوراوین`;
const pageDescription = news.summary_fa?.substring(0, 160) || news.description?.substring(0, 160) || "";

const categoryFa = {
"AI": "هوش مصنوعی",
"Mobile": "موبایل",
"PC": "کامپیوتر",
"Technology": "تکنولوژی"
}[news.category] || news.category;

const html = getHeaderHTML(pageTitle, pageDescription, `news/${slug}.html`) +
`
<section class="news-detail-container">
<article>
<div class="news-detail-header">
<h1 class="news-detail-title">${news.title}</h1>
<div class="news-detail-meta">
<span>📅 ${dateStr}</span>
<span>📁 ${categoryFa}</span>
<span>📰 منبع: ${news.source}</span>
</div>
</div>
<div class="news-detail-content">
<p>${news.summary_fa || news.description || ""}</p>
${news.link ? `<a href="${news.link}" target="_blank" rel="noopener" class="news-source-link">مشاهده خبر در منبع اصلی</a>` : ''}
</div>
<a href="../tech-news.html" class="back-to-news">← بازگشت به صفحه اخبار</a>
</article>
</section>
` + getFooterHTML();

return { slug, html };
}


// =====================================
// MAIN - UPDATE NEWS & GENERATE PAGES
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


// =====================================
// GENERATE STATIC HTML PAGES FOR EACH NEWS
// =====================================


if(!fs.existsSync(newsDir)){
fs.mkdirSync(newsDir, { recursive: true });
}

// Read existing news archive for more content
let archiveNews = [];
if(fs.existsSync("./data/news-archive.json")){
try{
archiveNews = JSON.parse(fs.readFileSync("./data/news-archive.json", "utf8"));
} catch(e){}
}

// Combine current + archive for static pages
const allNewsForPages = [...finalNews, ...archiveNews].slice(0, 50);

const slugs = [];

allNewsForPages.forEach((news, idx) => {
const { slug, html } = generateNewsPage(news, idx);
const filePath = path.join(newsDir, `${slug}.html`);
fs.writeFileSync(filePath, html, "utf8");
slugs.push(`news/${slug}.html`);
console.log(`Generated: ${filePath}`);
});


// =====================================
// GENERATE SITEMAP.XML
// =====================================


const staticPages = [
"",
"tech-news.html",
"ai-learning.html",
"ai-tools.html",
"login.html",
"register.html",
"dashboard.html"
];

// Get article pages
const articlePages = fs.readdirSync(".")
.filter(f => f.endsWith(".html") && f !== "index.html" && !f.startsWith("news-"))
.filter(f => ["ai-", "chatgpt", "free-", "future-", "generative", "prompt-", "hardware", "mobile", "computer"].some(p => f.includes(p)))
.map(f => f);

const allUrls = [
...staticPages.map(p => `${siteUrl}/${p}`),
...articlePages.map(p => `${siteUrl}/${p}`),
...slugs.map(s => `${siteUrl}/${s}`)
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n")}
</urlset>`;

fs.writeFileSync("./sitemap.xml", sitemapXml, "utf8");
console.log("Generated: sitemap.xml");


// =====================================
// GENERATE ROBOTS.TXT
// =====================================


const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${siteUrl}/sitemap.xml
`;

fs.writeFileSync("./robots.txt", robotsTxt, "utf8");
console.log("Generated: robots.txt");



}




updateNews();

