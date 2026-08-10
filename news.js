// ===============================
// SORAVIN NEWS SYSTEM
// AUTO NEWS DISPLAY VERSION 3
// COMPACT CARDS + LOAD MORE + ARCHIVE
// ===============================

let newsData = [];
let displayedCount = 0;
const ITEMS_PER_PAGE = 30;

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
    newsData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    displayedCount = 0;
    createNewsCards(newsData.slice(0, ITEMS_PER_PAGE));
    updateLoadMoreButton();
})
.catch(error => {
    console.log("News loading error:", error);
});

// ===============================
// CREATE NEWS CARDS (COMPACT LIST STYLE)
// ===============================

function createNewsCards(data){
    const newsGrid = document.getElementById("newsGrid");
    const featuredGrid = document.getElementById("featuredGrid");
    
    if(!newsGrid){
        return;
    }

    // Clear only on first load
    if(displayedCount === 0){
        newsGrid.innerHTML = "";
        if(featuredGrid) featuredGrid.innerHTML = "";
    }

    data.forEach(news => {
        const card = createCard(news);
        
        if(news.featured === true && featuredGrid){
            featuredGrid.appendChild(card.cloneNode(true));
        }
        
        newsGrid.appendChild(card);
        displayedCount++;
    });
    
    updateLoadMoreButton();
}

// ===============================
// CREATE COMPACT CARD
// ===============================

function createCard(news){
    const card = document.createElement("div");
    card.className = "news-card";
    card.dataset.category = (news.category || "technology").toLowerCase();

    card.innerHTML = `
    <div class="news-card-image">
        <img src="${news.image || 'assets/image/ai-news.jpg'}" alt="${news.title}">
    </div>
    <div class="news-card-content">
        <div class="news-card-category ${card.dataset.category}">${news.tag || news.category || "Technology"}</div>
        <h3 class="news-card-title">${news.title_fa || news.title}</h3>
        <div class="news-card-meta">
            <span>${news.source || "Soravin Tech"}</span>
            <span>${news.date ? new Date(news.date).toLocaleDateString("fa-IR") : ""}</span>
        </div>
        <a class="read-more" href="news-detail.html?id=${news.id}">مطالعه بیشتر</a>
    </div>
    `;

    return card;
}

// ===============================
// LOAD MORE BUTTON
// ===============================

function updateLoadMoreButton(){
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if(loadMoreBtn){
        if(displayedCount >= newsData.length){
            loadMoreBtn.style.display = "none";
        } else {
            loadMoreBtn.style.display = "block";
        }
    }
}

document.getElementById("loadMoreBtn")?.addEventListener("click", () => {
    const start = displayedCount;
    const end = Math.min(start + ITEMS_PER_PAGE, newsData.length);
    const moreNews = newsData.slice(start, end);
    createNewsCards(moreNews);
});

// ===============================
// FILTER SYSTEM
// ===============================

const filterButtons = document.querySelectorAll(".news-filter button");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        const category = button.dataset.category;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        const cards = document.querySelectorAll(".news-card");

        cards.forEach(card => {
            const cardCategory = card.dataset.category;

            if(category === "all" || cardCategory === category){
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    });
});
