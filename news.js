// ===============================
// SORAVIN NEWS SYSTEM
// TECH-NEWS.HTML VERSION - 4 ROWS x 3 CARDS
// CATEGORY-BASED LAYOUT WITH FILTERING
// ===============================

let newsData = [];
let archiveData = [];
let displayedArchiveCount = 0;
const ARCHIVE_ITEMS_PER_PAGE = 30;

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
    // Sort by date descending
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    newsData = data;
    
    // Render all 4 category rows
    renderCategoryRows(newsData);
})
.catch(error => {
    console.log("News loading error:", error);
});

// ===============================
// MAP CATEGORY TO PERSIAN LABELS
// ===============================

function getCategoryLabel(cat){
    const labels = {
        'ai': 'هوش مصنوعی',
        'computer': 'کامپیوتر',
        'mobile': 'موبایل',
        'future': 'فناوری آینده'
    };
    return labels[cat] || cat;
}

// ===============================
// NORMALIZE CATEGORY FROM NEWS
// ===============================

function normalizeCategory(news){
    const cat = (news.category || news.tag || 'technology').toLowerCase();
    if(cat.includes('ai') || cat.includes('artificial') || cat.includes('intelligence')) return 'ai';
    if(cat.includes('computer') || cat.includes('pc') || cat.includes('laptop') || cat.includes('hardware')) return 'computer';
    if(cat.includes('mobile') || cat.includes('phone') || cat.includes('smartphone')) return 'mobile';
    return 'future';
}

// ===============================
// RENDER 4 CATEGORY ROWS
// ===============================

function renderCategoryRows(allNews){
    const newsGrid = document.getElementById("newsGrid");
    if(!newsGrid) return;
    
    newsGrid.innerHTML = "";
    
    // Define 4 categories in order
    const categories = ['ai', 'computer', 'mobile', 'future'];
    
    // Track used news IDs to avoid duplicates when filling
    const usedIds = new Set();
    
    categories.forEach(cat => {
        // Get news for this category (sorted by date already)
        let catNews = allNews.filter(n => normalizeCategory(n) === cat);
        
        // Mark these as used
        catNews.forEach(n => usedIds.add(n.id));
        
        // If less than 3, fill from general pool (excluding already used)
        if(catNews.length < 3){
            const otherNews = allNews.filter(n => !usedIds.has(n.id));
            const needed = 3 - catNews.length;
            const fillers = otherNews.slice(0, needed);
            fillers.forEach(n => usedIds.add(n.id));
            catNews = catNews.concat(fillers);
        }
        
        // Take only first 3
        catNews = catNews.slice(0, 3);
        
        // Create row section
        const rowSection = document.createElement('div');
        rowSection.className = 'category-row';
        rowSection.dataset.category = cat;
        
        // Row title
        const rowTitle = document.createElement('h3');
        rowTitle.className = 'row-title';
        rowTitle.textContent = getCategoryLabel(cat);
        rowSection.appendChild(rowTitle);
        
        // Row grid
        const rowGrid = document.createElement('div');
        rowGrid.className = 'row-grid';
        
        catNews.forEach(news => {
            const card = createCard(news);
            rowGrid.appendChild(card);
        });
        
        rowSection.appendChild(rowGrid);
        newsGrid.appendChild(rowSection);
    });
}

// ===============================
// CREATE COMPACT CARD
// ===============================

function createCard(news){
    const card = document.createElement("div");
    card.className = "news-card";
    card.dataset.category = normalizeCategory(news);

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
// FILTER SYSTEM
// ===============================

const filterButtons = document.querySelectorAll(".news-filters .filter-btn");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const rows = document.querySelectorAll(".category-row");
        
        rows.forEach(row => {
            const rowCat = row.dataset.category;
            if(filter === 'all' || rowCat === filter){
                row.style.display = 'block';
            } else {
                row.style.display = 'none';
            }
        });
    });
});

// ===============================
// ARCHIVE SECTION - Load from news-archive.json
// ===============================

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

