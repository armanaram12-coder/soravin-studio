// site-header.js - Unified Site Header Module for Soravin Studio
// Handles: auth cleanup, header rendering, Supabase auth state, cart badge

import { supabase } from './supabase.js';

// ===========================
// 1. Clean up old auth keys (not cart/wishlist)
// ===========================
function cleanupOldAuthKeys() {
    const oldAuthKeys = ['currentUser', 'soravin_user', 'user_token', 'auth_token'];
    oldAuthKeys.forEach(key => localStorage.removeItem(key));
}

// Run cleanup immediately
cleanupOldAuthKeys();

// ===========================
// 2. Render unified header
// ===========================
function renderHeader() {
    const headerEl = document.getElementById('siteHeader');
    if (!headerEl) return;

    const menuItems = [
        { href: 'index.html', text: 'خانه' },
        { 
            href: '#services', 
            text: 'خدمات',
            dropdown: [
                { href: 'index.html#logo-design', text: 'پکیج طراحی لوگو' },
                { href: 'index.html#teaser', text: 'تیزر تبلیغاتی' },
                { href: 'index.html#brand-book', text: 'بوک برند' },
                { href: 'index.html#3d-design', text: 'طراحی سه‌بعدی' }
            ]
        },
        { href: 'shop.html', text: 'فروشگاه' },
        { href: 'tech-news.html', text: 'اخبار فناوری' },
        { 
            href: '#ai-tools', 
            text: 'ابزار هوش مصنوعی',
            dropdown: [
                { href: 'ai-tools.html#name-gen', text: 'ایده‌ساز نام برند' },
                { href: 'ai-tools.html#slogan-gen', text: 'شعارساز' },
                { href: 'ai-tools.html#palette-gen', text: 'پالت رنگ برند' },
                { href: 'ai-tools.html#hashtag-gen', text: 'هشتگ‌ساز' }
            ]
        },
        { href: 'ai-learning.html', text: 'دانشنامه' }
    ];

    headerEl.innerHTML = `
<header class="site-header-inner">
    <div class="logo">
        SORAVIN<span>Ai</span>
    </div>
    
    <nav id="mainNav" class="main-nav">
        ${menuItems.map(item => {
            if (item.dropdown) {
                return `
                <div class="dropdown">
                    <a href="${item.href}" class="dropbtn">
                        ${item.text}
                        <svg class="arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </a>
                    <div class="dropdown-content">
                        ${item.dropdown.map(sub => `<a href="${sub.href}">${sub.text}</a>`).join('')}
                    </div>
                </div>`;
            }
            return `<a href="${item.href}">${item.text}</a>`;
        }).join('')}
        
        <div class="header-actions">
            <button class="cart-icon-btn" id="cartIconBtn" aria-label="سبد خرید">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span class="cart-badge" id="cartBadge">0</span>
            </button>
            <div id="authContainer"></div>
        </div>
    </nav>
    
    <button class="mobile-toggle" id="mobileToggle" aria-label="منو">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    </button>
</header>

<div class="mobile-menu" id="mobileMenu">
    <nav>
        ${menuItems.map(item => {
            if (item.dropdown) {
                return `
                <div class="accordion-item">
                    <button class="accordion-btn">${item.text}</button>
                    <div class="accordion-content">
                        ${item.dropdown.map(sub => `<a href="${sub.href}">${sub.text}</a>`).join('')}
                    </div>
                </div>`;
            }
            return `<a href="${item.href}">${item.text}</a>`;
        }).join('')}
        <a href="login.html" id="mobileAuthLink">ورود / ثبت‌نام</a>
    </nav>
</div>
`;

    // Apply styles
    applyHeaderStyles();
    
    // Initialize functionality
    initHeaderFunctionality();
    updateCartBadge();
}

// ===========================
// 3. Apply header styles (black/gold theme)
// ===========================
function applyHeaderStyles() {
    const styleId = 'site-header-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
/* Site Header Styles - Black/Gold Theme */
#siteHeader {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(5, 5, 5, 0.98);
    border-bottom: 1px solid rgba(201, 164, 75, 0.15);
}

.site-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 30px;
    max-width: 1400px;
    margin: 0 auto;
}

.logo {
    font-size: 24px;
    font-weight: 700;
    color: #eaf4ff;
    letter-spacing: 2px;
}

.logo span {
    color: #c9a44b;
    margin-right: 4px;
}

.main-nav {
    display: flex;
    align-items: center;
    gap: 28px;
}

.main-nav > a,
.main-nav .dropbtn {
    color: #a0a0a0;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.3s;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
}

.main-nav > a:hover,
.main-nav .dropbtn:hover {
    color: #c9a44b;
}

.arrow {
    transition: transform 0.3s;
}

.dropdown:hover .arrow {
    transform: rotate(180deg);
}

.dropdown {
    position: relative;
}

.dropdown-content {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    background: rgba(11, 11, 11, 0.98);
    border: 1px solid rgba(201, 164, 75, 0.2);
    border-radius: 12px;
    min-width: 200px;
    padding: 10px 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    z-index: 1001;
}

.dropdown:hover .dropdown-content {
    display: block;
}

.dropdown-content a {
    display: block;
    padding: 10px 20px;
    color: #a0a0a0;
    text-decoration: none;
    font-size: 13px;
    transition: all 0.3s;
}

.dropdown-content a:hover {
    background: rgba(201, 164, 75, 0.1);
    color: #c9a44b;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 15px;
}

.cart-icon-btn {
    position: relative;
    background: none;
    border: none;
    color: #c9a44b;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cart-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #c9a44b;
    color: #111;
    font-size: 10px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.auth-greeting {
    position: relative;
    cursor: pointer;
}

.auth-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    background: rgba(11, 11, 11, 0.98);
    border: 1px solid rgba(201, 164, 75, 0.2);
    border-radius: 12px;
    min-width: 180px;
    padding: 10px 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    z-index: 1001;
    display: none;
}

.auth-greeting:hover .auth-dropdown {
    display: block;
}

.auth-dropdown a {
    display: block;
    padding: 10px 20px;
    color: #a0a0a0;
    text-decoration: none;
    font-size: 13px;
    transition: all 0.3s;
}

.auth-dropdown a:hover {
    background: rgba(201, 164, 75, 0.1);
    color: #c9a44b;
}

.btn-outline-small {
    padding: 8px 18px;
    background: transparent;
    border: 1px solid rgba(201, 164, 75, 0.4);
    border-radius: 20px;
    color: #c9a44b;
    font-size: 13px;
    font-family: 'Vazirmatn', Tahoma, sans-serif;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-outline-small:hover {
    background: rgba(201, 164, 75, 0.1);
}

.mobile-toggle {
    display: none;
    background: none;
    border: none;
    color: #eaf4ff;
    cursor: pointer;
    padding: 8px;
}

.mobile-menu {
    display: none;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: rgba(5, 5, 5, 0.98);
    border-bottom: 1px solid rgba(201, 164, 75, 0.15);
    padding: 20px;
    z-index: 999;
}

.mobile-menu.active {
    display: block;
}

.mobile-menu nav {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.mobile-menu a {
    color: #a0a0a0;
    text-decoration: none;
    font-size: 14px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(201, 164, 75, 0.1);
}

.accordion-item {
    border-bottom: 1px solid rgba(201, 164, 75, 0.1);
}

.accordion-btn {
    width: 100%;
    text-align: right;
    background: none;
    border: none;
    color: #a0a0a0;
    font-size: 14px;
    padding: 10px 0;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.accordion-content {
    display: none;
    flex-direction: column;
    gap: 8px;
    padding: 10px 0;
}

.accordion-content.show {
    display: flex;
}

.accordion-content a {
    color: #888;
    font-size: 13px;
    padding: 5px 0;
    border: none;
}

@media (max-width: 992px) {
    .main-nav {
        display: none;
    }
    
    .mobile-toggle {
        display: block;
    }
}
`;
    document.head.appendChild(style);
}

// ===========================
// 4. Initialize header functionality
// ===========================
async function initHeaderFunctionality() {
    // Mobile toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }
    
    // Mobile accordion
    const accordionBtns = mobileMenu?.querySelectorAll('.accordion-btn');
    accordionBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const content = btn.nextElementSibling;
            content?.classList.toggle('show');
        });
    });
    
    // Cart icon click - open sidebar if exists
    const cartIconBtn = document.getElementById('cartIconBtn');
    cartIconBtn?.addEventListener('click', () => {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartSidebar) {
            cartSidebar.classList.add('active');
            cartOverlay?.classList.add('active');
        } else {
            // If on shop page, cart sidebar should exist
            console.log('Cart clicked - navigate to shop?');
        }
    });
    
    // Update auth UI
    await updateAuthUI();
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
            cleanupOldAuthKeys();
        }
        await updateAuthUI();
        updateCartBadge();
    });
}

// ===========================
// 5. Update auth UI based on Supabase session
// ===========================
async function updateAuthUI() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const authContainer = document.getElementById('authContainer');
        const mobileAuthLink = document.getElementById('mobileAuthLink');
        
        if (session) {
            // Get user's full_name from users table
            let fullName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
            
            // Try to fetch from users table
            try {
                const { data: userData } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', session.user.id)
                    .single();
                
                if (userData?.full_name) {
                    fullName = userData.full_name;
                }
            } catch (e) {
                // Fall back to metadata
            }
            
            const greeting = `سلام ${fullName}`;
            
            if (authContainer) {
                authContainer.innerHTML = `
                    <div class="auth-greeting">
                        <a href="dashboard.html" class="auth-greeting-link" style="color: #c9a44b; text-decoration: none; font-size: 14px;">${greeting}</a>
                        <div class="auth-dropdown">
                            <a href="dashboard.html">پنل کاربری</a>
                            <a href="dashboard.html#orders">سفارش‌های من</a>
                            <a href="index.html">صفحه اصلی</a>
                            <a href="#" id="logoutLink">خروج</a>
                        </div>
                    </div>
                `;
                
                // Attach logout handler
                const logoutLink = document.getElementById('logoutLink');
                if (logoutLink) {
                    logoutLink.addEventListener('click', async (e) => {
                        e.preventDefault();
                        await supabase.auth.signOut();
                        cleanupOldAuthKeys();
                        window.location.href = 'index.html';
                    });
                }
            }
            
            if (mobileAuthLink) {
                mobileAuthLink.textContent = greeting;
                mobileAuthLink.href = 'dashboard.html';
            }
        } else {
            if (authContainer) {
                authContainer.innerHTML = `
                    <a href="login.html" class="btn-outline-small">ورود / ثبت‌نام</a>
                `;
            }
            if (mobileAuthLink) {
                mobileAuthLink.textContent = 'ورود / ثبت‌نام';
                mobileAuthLink.href = 'login.html';
            }
        }
    } catch (error) {
        console.error('Auth UI update error:', error);
    }
}

// ===========================
// 6. Update cart badge from 'soravin_cart' key
// ===========================
function updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    if (!cartBadge) return;
    
    try {
        const cartData = localStorage.getItem('soravin_cart');
        const cart = cartData ? JSON.parse(cartData) : [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartBadge.textContent = totalItems.toLocaleString('fa-IR');
    } catch (e) {
        cartBadge.textContent = '0';
    }
}

// Export for use in other modules
export { cleanupOldAuthKeys, updateAuthUI, updateCartBadge };

// Auto-render when module loads
renderHeader();
