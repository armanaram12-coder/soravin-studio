// =====================================
// SORAVIN NEWS DETAIL SYSTEM
// VERSION 10 COMPATIBLE
// FULL ARTICLE VIEW
// =====================================


document.addEventListener(
"DOMContentLoaded",
function(){



const detailBox =
document.getElementById("newsDetail");



if(!detailBox){

console.log(
"newsDetail not found"
);

return;

}




const params =
new URLSearchParams(
window.location.search
);



const newsId =
params.get("id");






function cleanText(text=""){


return text

.replace(/<script[\s\S]*?<\/script>/gi,"")

.replace(/<style[\s\S]*?<\/style>/gi,"")

.replace(/<[^>]+>/g,"")

.replace(/&lt;/gi,"<")

.replace(/&gt;/gi,">")

.replace(/&amp;/gi,"&")

.replace(/&quot;/gi,'"')

.replace(/&#39;/gi,"'")

.replace(/\s+/g," ")

.trim();


}







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






const fullArticle =


cleanText(

news.content_fa ||

news.description ||

news.summary_fa ||

"متن خبر موجود نیست"

);







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

${

news.tag ||

news.category ||

"Technology"

}

</div>







<h1>

${news.title}

</h1>







<div class="news-detail-meta">


${

news.source ||

"Soravin Tech"

}


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


${

fullArticle

.split("\n")

.map(text=>`

<p>${text}</p>

`)

.join("")

}



</div>







<a

class="source-link"

href="${news.link}"

target="_blank"

rel="noopener noreferrer"

>

مشاهده منبع اصلی خبر

</a>







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
