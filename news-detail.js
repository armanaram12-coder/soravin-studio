// ===============================
// SORAVIN NEWS DETAIL PAGE
// ===============================

const urlParams = new URLSearchParams(window.location.search);
const newsId = urlParams.get('id');

let newsData = [];

// Load news archive
fetch("data/auto-news.json")
.then(response => response.json())
.then(data => {
    newsData = data;
    if (newsId) {
        const news = newsData.find(n => n.id == newsId || String(n.id) === newsId);
        if (news) {
            renderNewsDetail(news);
        } else {
            showNotFound();
        }
    }
})
.catch(error => {
    console.log("Error loading news:", error);
    showNotFound();
});

function renderNewsDetail(news) {
    const container = document.getElementById('newsDetail');
    if (!container) return;
    
    const title = news.title_fa || news.title;
    const summary = news.summary_fa || news.summary_en || news.description;
    const date = news.date ? new Date(news.date).toLocaleDateString('fa-IR') : '';
    const category = news.category || 'technology';
    const source = news.source || 'Soravin Tech';
    
    container.innerHTML = `
        <div class="news-detail-image">
            <img src="${news.image || 'assets/image/ai-news.jpg'}" alt="${title}">
        </div>
        <div class="news-detail-content">
            <div class="news-detail-header">
                <span class="news-detail-category ${category.toLowerCase()}">${category.toUpperCase()}</span>
                <span class="news-detail-date">${date}</span>
            </div>
            <h1 class="news-detail-title">${title}</h1>
            <div class="news-detail-meta">
                <span class="news-detail-source">${source}</span>
            </div>
            <div class="news-detail-summary">
                ${summary || '<p style="color:#6b7280">خلاصه‌ای ثبت نشده</p>'}
            </div>
            <a href="${news.link}" target="_blank" rel="noopener noreferrer" class="btn gold news-source-btn">
                مطالعه کامل در منبع اصلی
            </a>
        </div>
    `;
    
    document.title = `${title} | Soravin Tech`;
}

function showNotFound() {
    const container = document.getElementById('newsDetail');
    if (!container) return;
    
    container.innerHTML = `
        <div class="news-not-found">
            <h2>خبر یافت نشد</h2>
            <p>متأسفانه خبری با این شناسه پیدا نشد.</p>
            <a href="tech-news.html" class="btn gold">بازگشت به اخبار</a>
        </div>
    `;
}
