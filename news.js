document.addEventListener("DOMContentLoaded", function () {


const newsContainer = document.querySelector(".news-grid");


if (!newsContainer) return;



fetch("data/news.json")


.then(response => response.json())


.then(news => {


newsContainer.innerHTML = "";



news.forEach(item => {



const card = document.createElement("article");


card.className = "tech-card";



card.innerHTML = `

<div class="news-image">

<img src="${item.image}" alt="${item.title}">

</div>



<div class="news-content">


<span class="category ${item.category.toLowerCase()}">

${item.tag}

</span>



<h2>

${item.title}

</h2>



<p>

${item.description}

</p>



<div class="news-meta">


<span>

${item.category}

</span>



<span>

${item.date}

</span>


</div>



<a href="${item.link}" class="read-more">

مطالعه خبر →

</a>



</div>

`;



newsContainer.appendChild(card);



});


})


.catch(error => {


console.log("News loading error:", error);


});



});
