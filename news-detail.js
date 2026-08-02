// =====================================
// SORAVIN NEWS DETAIL SYSTEM
// VERSION 3
// CLEAN ARTICLE DISPLAY
// =====================================


document.addEventListener(
"DOMContentLoaded",
function(){



const detailBox =

document.getElementById(
"newsDetail"
);





if(!detailBox){

console.log(
"newsDetail not found"
);

return;

}






function cleanNewsText(text=""){


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







const params =

new URLSearchParams(
window.location.search
);



const newsId =

params.get("id");






fetch("data/auto-news.json")

.then(response=>{


if(!response.ok){

throw new Error(
"JSON not found"
);

}


return response.json();


})

.then(data=>{



const news =

data.find(

item =>

String(item.id)

===

String(newsId)

);






if(!news){


detailBox.innerHTML = `

<div class="news-detail-card">

<h2>
خبر پیدا نشد
</h2>

<p>
شناسه خبر: ${newsId}
</p>

</div>

`;


return;


}






let articleText =

cleanNewsText(

news.description ||

news.summary_fa ||

"متن خبر موجود نیست"

);






if(!articleText){


articleText =

"متن خبر موجود نیست";


}







let sourceButton = "";




if(

news.link &&

news.link.startsWith("http")

){


sourceButton = `


<a

class="source-link"

href="${news.link}"

target="_blank"

rel="noopener noreferrer"

>

مشاهده منبع اصلی خبر

</a>


`;



}








detailBox.innerHTML = `



<article class="news-detail-card">





<div class="news-detail-image">


<img

src="${

news.image ||

"assets/image/ai-news.jpg"

}"

alt="${news.title}"

>


</div>







<div class="news-detail-content">





<div class="category">

${news.tag || news.category || "Technology"}

</div>







<h1>

${news.title}

</h1>







<div class="news-detail-meta">

${news.source || "Soravin Tech"}

|

${

news.date

?

new Date(news.date)

.toLocaleDateString("fa-IR")

:

""

}

</div>







<div class="news-full-text">

<p>

${articleText}

</p>

</div>







${sourceButton}





</div>






</article>



`;





})

.catch(error=>{


console.log(

"News detail error:",

error

);



detailBox.innerHTML = `


<div class="news-detail-card">

<h2>

خطا در بارگذاری خبر

</h2>


<p>

${error.message}

</p>


</div>


`;



});



});
