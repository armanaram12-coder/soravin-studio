// ===============================
// SORAVIN NEWS FETCHER
// Fetch RSS feeds + Translate to Persian
// ===============================

const https = require('https');
const fs = require('fs');
const path = require('path');

const ARCHIVE_PATH = path.join(__dirname, '../data/news-archive.json');
const AUTO_NEWS_PATH = path.join(__dirname, '../data/auto-news.json');

// RSS Sources
const RSS_FEEDS = [
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', lang: 'en' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', lang: 'en' }
];

// Simple XML parser for RSS
function parseRSS(xml, sourceName, lang) {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];
        
        const titleMatch = itemXml.match(/<title>([^<]*)<\/title>/);
        const descMatch = itemXml.match(/<description>([^<]*)<\/description>/) || 
                         itemXml.match(/<content:encoded>([^<]*)<\/content:encoded>/);
        const linkMatch = itemXml.match(/<link>([^<]*)<\/link>/);
        const pubDateMatch = itemXml.match(/<pubDate>([^<]*)<\/pubDate>/);
        const imgMatch = itemXml.match(/<media:content[^>]*url="([^"]*)"/) ||
                        itemXml.match(/<enclosure[^>]*url="([^"]*)"/);
        
        if (titleMatch && linkMatch) {
            items.push({
                title: titleMatch[1].trim(),
                summary: descMatch ? descMatch[1].trim() : '',
                link: linkMatch[1].trim(),
                date: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
                image: imgMatch ? imgMatch[1] : '',
                source: sourceName,
                lang: lang
            });
        }
    }
    
    return items;
}

// Translate text using Google Translate API (free endpoint)
async function translateText(text, targetLang = 'fa') {
    if (!text || text.length === 0) return '';
    
    // Limit text length for translation API
    const maxLength = 500;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;
    
    const encodedText = encodeURIComponent(truncatedText);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodedText}`;
    
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result && result[0]) {
                        const translated = result[0].map(t => t[0]).join('');
                        resolve(translated);
                    } else {
                        resolve(text); // Return original on error
                    }
                } catch (e) {
                    resolve(text); // Return original on parse error
                }
            });
        }).on('error', () => {
            resolve(text); // Return original on network error
        });
    });
}

// Load existing archive
function loadArchive() {
    try {
        if (fs.existsSync(ARCHIVE_PATH)) {
            return JSON.parse(fs.readFileSync(ARCHIVE_PATH, 'utf8'));
        }
    } catch (e) {
        console.log('Archive not found or invalid, starting fresh');
    }
    return [];
}

// Save archive
function saveArchive(archive) {
    fs.writeFileSync(ARCHIVE_PATH, JSON.stringify(archive, null, 2), 'utf8');
    // Also copy to auto-news.json for backward compatibility
    fs.writeFileSync(AUTO_NEWS_PATH, JSON.stringify(archive, null, 2), 'utf8');
}

// Main fetch function
async function fetchNews() {
    console.log('Starting news fetch...');
    let archive = loadArchive();
    const existingLinks = new Set(archive.map(item => item.link));
    
    let translatedCount = 0;
    const MAX_TRANSLATIONS = 20;
    
    for (const feed of RSS_FEEDS) {
        console.log(`Fetching ${feed.name}...`);
        
        const xml = await new Promise((resolve, reject) => {
            https.get(feed.url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', reject);
        });
        
        const items = parseRSS(xml, feed.name, feed.lang);
        console.log(`Found ${items.length} items from ${feed.name}`);
        
        for (const item of items) {
            // Skip duplicates
            if (existingLinks.has(item.link)) {
                continue;
            }
            
            // Determine category based on content
            let category = 'technology';
            const lowerTitle = item.title.toLowerCase();
            const lowerDesc = item.summary.toLowerCase();
            
            if (lowerTitle.includes('ai') || lowerTitle.includes('artificial intelligence') || 
                lowerDesc.includes('ai ') || lowerDesc.includes('artificial intelligence')) {
                category = 'ai';
            } else if (lowerTitle.includes('mobile') || lowerTitle.includes('phone') || 
                       lowerTitle.includes('iphone') || lowerTitle.includes('android')) {
                category = 'mobile';
            } else if (lowerTitle.includes('pc') || lowerTitle.includes('computer') || 
                       lowerTitle.includes('laptop') || lowerTitle.includes('desktop')) {
                category = 'pc';
            }
            
            // Create archive entry
            const entry = {
                id: Date.now() + Math.random(),
                title: item.title,
                title_fa: '',
                summary_en: item.summary,
                summary_fa: '',
                description: item.summary,
                source: item.source,
                lang: item.lang,
                category: category,
                tag: category.toUpperCase(),
                date: item.date,
                image: item.image || 'assets/image/ai-news.jpg',
                link: item.link,
                featured: false,
                status: 'published'
            };
            
            // Translate if under limit
            if (translatedCount < MAX_TRANSLATIONS && feed.lang === 'en') {
                console.log(`Translating (${translatedCount + 1}/${MAX_TRANSLATIONS}): ${entry.title.substring(0, 50)}...`);
                
                try {
                    entry.title_fa = await translateText(entry.title);
                    entry.summary_fa = await translateText(entry.summary.substring(0, 300));
                    translatedCount++;
                    
                    // Small delay to avoid rate limiting
                    await new Promise(r => setTimeout(r, 200));
                } catch (e) {
                    console.log('Translation failed, keeping original');
                    entry.title_fa = entry.title;
                    entry.summary_fa = entry.summary;
                }
            } else {
                entry.title_fa = entry.title;
                entry.summary_fa = entry.summary;
            }
            
            archive.push(entry);
            existingLinks.add(entry.link);
        }
    }
    
    // Sort by date descending
    archive.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Save
    saveArchive(archive);
    console.log(`Done! Total items in archive: ${archive.length}, New translations: ${translatedCount}`);
}

// Run
fetchNews().catch(console.error);
