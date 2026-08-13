// ===============================
// SORAVIN NEWS SYSTEM
// AUTO NEWS DISPLAY VERSION 4
// IRANIAN SOURCES + 7-2-1 CARD ORDER
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
    // Separate Iranian and foreign news
    const iranianNews = data.filter(item => item.lang === 'fa' || (item.source && ['Zoomit', 'Digiato', 'Peivast', 'GadgetNews'].includes(item.source)));
    const foreignNews = data.filter(item => item.lang === 'en' || (item.source && ['TechCrunch', 'The Verge'].includes(item.source)));
    
    // Sort each by date descending
    iranianNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    foreignNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create ordered array: 7 Iranian + 2 Foreign + Special Iranian to make 9 total
    let orderedNews = [];
    
    // First 7: Latest Iranian news
    orderedNews = orderedNews.concat(iranianNews.slice(0, 7));
    
    // Next 2: Latest foreign news
    orderedNews = orderedNews.concat(foreignNews.slice(0, 2));
    
    // Add remaining news for archive
    const remainingIranian = iranianNews.slice(7);
    const remainingForeign = foreignNews.slice(2);
    orderedNews = orderedNews.concat(remainingIranian, remainingForeign);
    
    newsData = orderedNews;
    displayedCount = 0;
    createNewsCards(newsData.slice(0, 9));
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

// ===============================
// ARCHIVE SECTION - Load from news-archive.json
// ===============================

let archiveData = [];
let displayedArchiveCount = 0;
const ARCHIVE_ITEMS_PER_PAGE = 30;

fetch("data/news-archive.json")
.then(response => {
    if(!response.ok){
        throw new Error("news-archive.json not found");
    }
    return response.json();
})
.then(data => {
    archiveData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    displayedArchiveCount = 0;
    renderArchiveItems(archiveData.slice(0, ARCHIVE_ITEMS_PER_PAGE));
    updateArchiveLoadMoreButton();
})
.catch(error => {
    console.log("Archive loading error:", error);
});

function renderArchiveItems(data){
    const archiveList = document.getElementById("archiveList");
    if(!archiveList){
        return;
    }
    
    data.forEach(news => {
        const item = document.createElement("div");
        item.className = "archive-item";
        item.innerHTML = `
            <img src="${news.image || 'assets/image/ai-news.jpg'}" alt="${news.title}">
            <h4>${news.title_fa || news.title}</h4>
            <span class="archive-date">${news.date ? new Date(news.date).toLocaleDateString("fa-IR") : ""}</span>
        `;
        item.style.cursor = "pointer";
        item.addEventListener("click", () => {
            window.location.href = `news-detail.html?id=${news.id}`;
        });
        archiveList.appendChild(item);
        displayedArchiveCount++;
    });
    
    updateArchiveLoadMoreButton();
}

function updateArchiveLoadMoreButton(){
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if(loadMoreBtn){
        if(displayedArchiveCount >= archiveData.length){
            loadMoreBtn.style.display = "none";
        } else {
            loadMoreBtn.style.display = "block";
        }
    }
}

document.getElementById("loadMoreBtn")?.addEventListener("click", () => {
    const start = displayedArchiveCount;
    const end = Math.min(start + ARCHIVE_ITEMS_PER_PAGE, archiveData.length);
    const moreArchive = archiveData.slice(start, end);
    renderArchiveItems(moreArchive);
});
