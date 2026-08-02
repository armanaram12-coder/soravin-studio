// ===============================
// SORAVIN NEWS SYSTEM
// AUTO NEWS ONLY VERSION
// ===============================


let newsData = [];


// ===============================
// LOAD AUTO NEWS JSON
// ===============================


fetch("data/auto-news.json")

.then(response => {

    if(!response.ok){

        throw new Error("auto-news.json not found");

    }

    return response.json();

})

.then(data => {


    newsData = data;


    createNewsCards(newsData);



})


.catch(error => {


    console.log(
        "News loading error:",
        error
    );


});





// ===============================
// CREATE NEWS CARDS
// ===============================


function createNewsCards(data){


const newsGrid =
document.getElementById("newsGrid");


const featuredGrid =
document.getElementById("featuredGrid");



if(!newsGrid) return;



newsGrid.innerHTML = "";



if(featuredGrid){

    featuredGrid.innerHTML = "";

}




data.forEach(news => {



const card =
createCard(news);





if(
news.featured === true &&
featuredGrid
){


featuredGrid.appendChild(
card.cloneNode(true)
);


}




newsGrid.appendChild(card);



});



}







// ===============================
// CREATE SINGLE CARD
// ===============================


function createCard(news){


const card =
document.createElement("div");



card.className =
"tech-card";



card.dataset.category =
(news.category || "tech")
.toLowerCase();




card.innerHTML = `


<div class="news-image">

<img

src="${news.image || 'assets/image/ai-news.jpg'}"

alt="${news.title}"

>

</div>



<div class="news-content">



<div class="category ${card.dataset.category}">

${news.tag || news.category}

</div>




<h3>

${news.title}

</h3>





<p>

${news.summary_fa || news.description || ""}

</p>





<div class="news-meta">


<span>

${news.source || "Soravin Tech"}

</span>



<span>

${news.date || ""}

</span>


</div>





<a

class="read-more"

href="news-detail.html?id=${news.id}"

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
cardCategory === category
){


card.style.display = "flex";


}

else{


card.style.display = "none";


}



});


});


});
