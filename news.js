// ===============================
// SORAVIN NEWS SYSTEM
// Dynamic News Updater
// ===============================


let newsData = [];


// ===============================
// LOAD JSON
// ===============================


fetch("data/news.json")

.then(response => response.json())

.then(data => {


    newsData = data;


    createNewsCards(newsData);


})


.catch(error => {


    console.log("News loading error:", error);


});





// ===============================
// CREATE NEWS CARDS
// ===============================


function createNewsCards(data){


const newsGrid = document.getElementById("newsGrid");

const featuredGrid = document.getElementById("featuredGrid");



if(!newsGrid) return;



newsGrid.innerHTML = "";



if(featuredGrid){

    featuredGrid.innerHTML = "";

}




data.forEach(news => {



const card = createCard(news);





// خبر ویژه

if(news.featured === true && featuredGrid){


    featuredGrid.appendChild(
        card.cloneNode(true)
    );


}





// همه خبرها در گرید اصلی

newsGrid.appendChild(card);



});



}
// ===============================
// CREATE SINGLE CARD
// ===============================


function createCard(news){


const card = document.createElement("div");


card.className = "tech-card";



card.dataset.category = news.category.toLowerCase();



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

${news.tag}

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



return card;


}
// ===============================
// FILTER SYSTEM
// ===============================



const filterButtons =
document.querySelectorAll(".news-filter button");





filterButtons.forEach(button => {



button.addEventListener("click", () => {



const category =
button.dataset.category;





filterButtons.forEach(btn => {


btn.classList.remove("active");


});





button.classList.add("active");





const cards =
document.querySelectorAll(".tech-card");





cards.forEach(card => {



const cardCategory =
card.dataset.category;





if(
category === "all" ||
newsData[index].category.toLowerCase()===category
){


card.style.display = "flex";


}

else{


card.style.display = "none";


}



});



});



});
