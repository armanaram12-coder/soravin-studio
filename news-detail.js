// =====================================
// SORAVIN NEWS DETAIL
// =====================================



const detailBox =
document.getElementById("newsDetail");



const params =
new URLSearchParams(
window.location.search
);



const newsId =
params.get("id");





fetch("data/auto-news.json")

.then(response => response.json())

.then(data => {



const news =

data.find(

item =>

item.id == newsId

);





if(!news){


detailBox.innerHTML = `

<h2>
خبر پیدا نشد
</h2>

`;

return;


}





detailBox.innerHTML = `


<article class="news-detail-card">


<img

src="${news.image}"

alt="${news.title}"

>



<h1>

${news.title}

</h1>



<div class="news-detail-meta">

${news.tag}

 |

${news.date}

</div>




<p>

${news.description}

</p>



<a

href="${news.link}"

target="_blank"

>

مشاهده منبع اصلی خبر

</a>



</article>


`;



})

.catch(error=>{


detailBox.innerHTML =

"خطا در دریافت خبر";



});
