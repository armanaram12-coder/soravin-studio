// =====================================
// SORAVIN NEWS DETAIL SYSTEM
// =====================================


document.addEventListener("DOMContentLoaded", function(){



const detailBox =
document.getElementById("newsDetail");



if(!detailBox){

console.log("newsDetail not found");

return;

}




const params =
new URLSearchParams(
window.location.search
);



const newsId =
params.get("id");




fetch("data/auto-news.json")

.then(response => {


if(!response.ok){

throw new Error("JSON not found");

}


return response.json();


})

.then(data => {



const news = data.find(

item =>

String(item.id) === String(newsId)

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





detailBox.innerHTML = `



<article class="news-detail-card">



<div class="news-detail-image">

<img

src="${news.image}"

alt="${news.title}"

>

</div>





<div class="news-detail-content">



<div class="category">

${news.tag}

</div>





<h1>

${news.title}

</h1>





<div class="news-detail-meta">

${news.source}

|

${news.date}

</div>





<p>

${news.description}

</p>





<a

class="source-link"

href="${news.link}"

target="_blank"

>

مشاهده منبع اصلی خبر

</a>



</div>



</article>



`;




})

.catch(error => {


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
