// ===============================
// SORAVIN NEWS SYSTEM
// Dynamic News Loader
// ===============================


let newsData = [];




// دریافت اخبار از JSON

fetch("data/news.json")

.then(response => response.json())

.then(data => {


newsData = data;


loadNews(newsData);


})

.catch(error => {


console.log("News loading error:", error);


});







// ساخت کارت خبر


function createNewsCard(news){


return `


<article class="tech-card">


<div class="news-image">


<img src="${news.image}" alt="${news.title}">


</div>



<div class="news-content">


<span class="category ${news.category}">

${news.tag}

</span>



<h2>

${news.title}

</h2>



<p>

${news.description}

</p>



<div class="news-meta">


<span>

${news.source}

</span>


<span>

${news.date}

</span>


</div>



<a href="${news.link || '#'}" class="read-more">

مطالعه خبر →

</a>



</div>


</article>


`;


}








// نمایش اخبار


function loadNews(data){



const mainGrid =
document.getElementById("newsGrid");


const featuredGrid =
document.getElementById("featuredGrid");


const latestGrid =
document.getElementById("latestNewsGrid");





if(mainGrid){


mainGrid.innerHTML =
data
.slice(0,3)
.map(createNewsCard)
.join("");

}




if(featuredGrid){


featuredGrid.innerHTML =
data
.slice(3,6)
.map(createNewsCard)
.join("");

}





if(latestGrid){


latestGrid.innerHTML =
data
.slice(6,9)
.map(createNewsCard)
.join("");

}





}










// ===============================
// FILTER SYSTEM
// ===============================



const filterButtons =
document.querySelectorAll(".news-filter button");



filterButtons.forEach(button=>{


button.addEventListener("click",()=>{


let category =
button.dataset.category;



filterButtons.forEach(btn=>{

btn.classList.remove("active");

});


button.classList.add("active");





if(category==="all"){


loadNews(newsData);


}

else{


let filtered =
newsData.filter(item=>

item.category === category

);



loadNews(filtered);


}




});


});
