// ===============================
// SORAVIN AUTO NEWS SYSTEM
// latestNewsGrid ONLY
// ===============================


fetch("data/auto-news.json")

.then(response => response.json())

.then(data => {


const latestGrid =
document.getElementById("latestNewsGrid");



if(!latestGrid) return;



latestGrid.innerHTML = "";



data.forEach(news => {



const card = document.createElement("div");


card.className = "tech-card";



card.innerHTML = `


<div class="news-image">

<img 
src="${news.image}" 
alt="${news.title}"
>

</div>



<div class="news-content">


<div class="category ${news.category.toLowerCase()}">

${news.tag}

</div>



<h3>

${news.title}

</h3>



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



<a 
class="read-more"
href="${news.link || '#'}"
>

مطالعه بیشتر

</a>



</div>


`;



latestGrid.appendChild(card);



});


})


.catch(error => {


console.log(
"Auto news loading error:",
error
);


});
