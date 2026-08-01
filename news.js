// ===============================
// SORAVIN NEWS SYSTEM
// Dynamic News Updater
// ===============================


let newsData = [];


// دریافت اخبار JSON

fetch("data/news.json")

.then(response => response.json())

.then(data => {

    newsData = data;

    updateNewsCards(newsData);

})

.catch(error => {

    console.log("News loading error:", error);

});





// آپدیت کارت‌های موجود
function updateNewsCards(data){


const cards = document.querySelectorAll(".tech-card");


cards.forEach((card,index)=>{


if(!data[index]) return;


const news = data[index];



const img = card.querySelector(".news-image img");

const category = card.querySelector(".category");

const title = card.querySelector("h2,h3");

const desc = card.querySelector(".news-content p");

const meta = card.querySelector(".news-meta");

const link = card.querySelector(".read-more");





if(img){

img.src = news.image;

img.alt = news.title;

}




if(category){

category.innerHTML = news.tag;

category.className = "category " + news.category;

}




if(title){

title.innerHTML = news.title;

}




if(desc){

desc.innerHTML = news.description;

}




if(meta){

meta.innerHTML = `

<span>

${news.tag}

</span>


<span>

${news.date}

</span>

`;

}




if(link){

link.href = news.link || "#";

}



});


}






// ===============================
// FILTER SYSTEM
// ===============================


const filterButtons =
document.querySelectorAll(".news-filter button");



filterButtons.forEach(button=>{


button.addEventListener("click",()=>{


const category =
button.dataset.category;



filterButtons.forEach(btn=>{

btn.classList.remove("active");

});


button.classList.add("active");





const cards =
document.querySelectorAll(".tech-card");



cards.forEach((card,index)=>{


if(!newsData[index]) return;


if(
category==="all" ||
newsData[index].category===category
){

card.style.display="flex";

}

else{


card.style.display="none";


}



});



});


});
