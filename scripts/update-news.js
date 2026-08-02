// =====================================
// SORAVIN AUTO NEWS UPDATER
// MULTI RSS + AUTO CATEGORY VERSION
// =====================================

const fs = require("fs");
const https = require("https");

const outputFile = "./data/auto-news.json";


// =====================================
// RSS SOURCES
// =====================================

const RSS_SOURCES = [

    // AI / Technology
    "https://feeds.feedburner.com/TechCrunch",

    "https://blogs.nvidia.com/feed/",

    "https://blogs.microsoft.com/ai/feed/",

    "https://openai.com/blog/rss.xml",

    "https://www.technologyreview.com/feed/",

    // Computer News
    "https://www.theverge.com/rss/index.xml",

    "https://www.wired.com/feed/rss",

    "https://arstechnica.com/feed/",

];


// =====================================
// DOWNLOAD RSS
// =====================================

function fetchRSS(url) {

    return new Promise((resolve, reject) => {

        https.get(url, {

            headers: {
                "User-Agent": "Mozilla/5.0"
            }

        }, response => {

            let data = "";

            response.on("data", chunk => {
                data += chunk;
            });


            response.on("end", () => {
                resolve(data);
            });


        }).on("error", err => {

            reject(err);

        });

    });

}


// =====================================
// REMOVE HTML
// =====================================

function cleanHTML(text = "") {

    return text
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, " ")
        .trim();

}


// =====================================
// RSS PARSER SIMPLE
// =====================================

function parseRSS(xml, source){


    let items = [];


    const entries = xml.match(/<item[\s\S]*?<\/item>/g);


    if(!entries) return [];


    entries.forEach(item => {


        let title =
            item.match(/<title>([\s\S]*?)<\/title>/);


        let link =
            item.match(/<link>([\s\S]*?)<\/link>/);


        let description =
            item.match(/<description>([\s\S]*?)<\/description>/);



        title = title ? cleanHTML(title[1]) : "";

        link = link ? cleanHTML(link[1]) : "";

        description = description ?
            cleanHTML(description[1]) :
            "";



        if(title){

            items.push({

                title,
                link,
                description,
                source

            });

        }


    });


    return items;

}


// =====================================
// AUTO CATEGORY
// =====================================

function detectCategory(text){


    text = text.toLowerCase();



    if(
        text.includes("ai") ||
        text.includes("artificial intelligence") ||
        text.includes("machine learning") ||
        text.includes("gpt")
    ){
        return "AI";
    }



    if(
        text.includes("security") ||
        text.includes("hack") ||
        text.includes("malware")
    ){
        return "Security";
    }



    if(
        text.includes("computer") ||
        text.includes("chip") ||
        text.includes("processor") ||
        text.includes("gpu")
    ){
        return "Computer";
    }



    if(
        text.includes("business") ||
        text.includes("market") ||
        text.includes("company")
    ){
        return "Business";
    }



    return "Technology";

}



// =====================================
// SUMMARY GENERATOR
// =====================================

function createSummary(news){


    let text =
        news.description ||
        news.title;



    text = cleanHTML(text);



    let sentences =
        text.split(".")
            .filter(x => x.trim().length > 20);



    let summary =
        sentences
        .slice(0,5)
        .join(". ");



    if(summary.length < 80){

        summary =
        `${news.title}. ${text}`;

    }



    return summary.substring(0,500);

}


// =====================================
// MAIN
// =====================================


async function updateNews(){


    let allNews = [];



    for(const rss of RSS_SOURCES){


        try{


            console.log(
                "Reading:",
                rss
            );


            let xml =
                await fetchRSS(rss);



            let news =
                parseRSS(
                    xml,
                    rss
                );


            allNews.push(
                ...news
            );



        }
        catch(error){

            console.log(
                "RSS ERROR:",
                rss
            );

        }


    }



    // Remove duplicates

    let unique = [];

    let titles = new Set();



    allNews.forEach(news => {


        let key =
            news.title.toLowerCase();



        if(!titles.has(key)){

            titles.add(key);

            unique.push(news);

        }


    });



    // Create final JSON


    let finalNews =
        unique
        .slice(0,50)
        .map(news => {


            return {


                title:
                    news.title,


                summary_fa:
                    createSummary(news),


                summary_en:
                    "",


                category:
                    detectCategory(
                        news.title +
                        " " +
                        news.description
                    ),


                source:
                    news.source,


                date:
                    new Date()
                    .toISOString(),


                link:
                    news.link


            };


        });



    // Make folder if missing

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
