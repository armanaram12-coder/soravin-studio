// Shop Page JavaScript - Soravin Store

import { auth, db, collection, addDoc, onAuthStateChanged } from './js/firebase.js';

document.addEventListener('DOMContentLoaded', function() {
    // State
    let products = [];
    let cart = JSON.parse(localStorage.getItem('soravinCart')) || [];
    let wishlist = JSON.parse(localStorage.getItem('soravinWishlist')) || [];
    let flashSaleEnd = Date.now() + 6 * 60 * 60 * 1000;
    let currentUser = null;
    
    // Listen for auth changes
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
    });

    // Load current user
    async function loadUser() {
        try {
            const response = await fetch('js/supabase.js');
            const supabaseModule = await import('./js/supabase.js');
            currentUser = await supabaseModule.getUserInfo();
        } catch (error) {
            console.error('Error loading user:', error);
        }
    }

    // DOM Elements
    const productsGrid = document.getElementById('productsGrid');
    const productSearch = document.getElementById('productSearch');
    const categoryChips = document.getElementById('categoryChips');
    const sortSelect = document.getElementById('sortSelect');
    const flashProduct = document.getElementById('flashProduct');
    const quickViewModal = document.getElementById('quickViewModal');
    const quickViewBody = document.getElementById('quickViewBody');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartBadge = document.getElementById('cartBadge');
    const mobileCartCount = document.getElementById('mobileCartCount');
    const checkoutModal = document.getElementById('checkoutModal');
    const successOverlay = document.getElementById('successOverlay');

    // Load Products
    async function loadProducts() {
        try {
            const response = await fetch('products.json');
            const data = await response.json();
            products = data.products;
            renderProducts(products);
            setupFlashSale();
        } catch (error) {
            console.error('Error loading products:', error);
            productsGrid.innerHTML = '<p style="color: var(--text); text-align: center;">خطا در بارگذاری محصولات</p>';
        }
    }

    // Format Price
    function formatPrice(price) {
        if (price === null) return 'تماس بگیرید';
        return price.toLocaleString('fa-IR') + ' تومان';
    }

    // Render Product Card
    function createProductCard(product) {
        const isInWishlist = wishlist.includes(product.id);
        const isSoon = product.price === null;

        return `
            <div class="product-card" data-id="${product.id}" data-category="${product.category}">
                <div class="product-image-wrapper">
                    <div class="product-image" style="background: ${product.image};"></div>
                    <div class="product-badges">
                        ${isSoon ? '<span class="product-badge badge-soon">به‌زودی</span>' : ''}
                    </div>
                    <button class="product-wishlist ${isInWishlist ? 'active' : ''}" onclick="toggleWishlist(${product.id})">
                        <svg viewBox="0 0 24 24" fill="${isInWishlist ? '#e74c3c' : 'none'}" stroke="${isInWishlist ? '#e74c3c' : 'currentColor'}" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-category">${getCategoryName(product.category)}</div>
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-prices">
                        ${product.price !== null ? `<span class="product-price">${formatPrice(product.price)}</span>` : '<span class="product-price" style="color: var(--gray);">تماس بگیرید</span>'}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="addToCart(${product.id})" ${isSoon ? 'disabled style="background: #666; cursor: not-allowed;"' : ''}>افزودن به سبد</button>
                    </div>
                </div>
            </div>
        `;
    }

    function getCategoryName(cat) {
        const names = {
            'design': 'طراحی',
            'ai': 'هوش مصنوعی',
            'education': 'آموزش',
            'digital': 'دیجیتال'
        };
        return names[cat] || cat;
    }

    // Render Products
    function renderProducts(productsToRender) {
        productsGrid.innerHTML = productsToRender.map(createProductCard).join('');
    }

    // Filter and Sort
    function filterAndSort() {
        let filtered = [...products];
        const searchTerm = productSearch.value.toLowerCase();
        const activeChip = categoryChips.querySelector('.chip.active');
        const category = activeChip?.dataset.category || 'all';
        const sortValue = sortSelect.value;

        // Search
        if (searchTerm) {
            filtered = filtered.filter(p => p.title.toLowerCase().includes(searchTerm));
        }

        // Category
        if (category !== 'all') {
            filtered = filtered.filter(p => p.category === category);
        }

        // Sort
        switch (sortValue) {
            case 'price-asc':
                filtered.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
                break;
            case 'price-desc':
                filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'newest':
                filtered.sort((a, b) => b.id - a.id);
                break;
        }

        renderProducts(filtered);
    }

    // Setup Flash Sale
    function setupFlashSale() {
        const saleProducts = products.filter(p => p.price !== null && p.price > 0);
        if (saleProducts.length > 0) {
            const randomProduct = saleProducts[Math.floor(Math.random() * saleProducts.length)];
            flashProduct.innerHTML = `
                <div class="flash-product-card">
                    <div class="flash-product-image" style="background: ${randomProduct.image};"></div>
                </div>
                <div class="flash-product-info">
                    <h4 class="flash-product-title">${randomProduct.title}</h4>
                    <div class="flash-prices">
                        <span class="flash-price">${formatPrice(randomProduct.price)}</span>
                    </div>
                    <div class="flash-timer">پیشنهاد ویژه</div>
                </div>
            `;
            startCountdown();
        }
    }

    // Countdown Timer
    function startCountdown() {
        const updateCountdown = () => {
            const now = Date.now();
            const diff = Math.max(0, flashSaleEnd - now);

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

            if (diff > 0) {
                requestAnimationFrame(updateCountdown);
            }
        };
        updateCountdown();
    }

    // Cart Functions
    function saveCart() {
        localStorage.setItem('soravinCart', JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);

        cartBadge.textContent = totalItems.toLocaleString('fa-IR');
        mobileCartCount.textContent = totalItems.toLocaleString('fa-IR');
        cartTotal.textContent = formatPrice(totalPrice);

        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="color: var(--gray); text-align: center; padding: 40px;">سبد خرید خالی است</p>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image" style="background: ${item.image};"></div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <div class="cart-item-price">${formatPrice(item.price)}</div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                            <span>${item.quantity.toLocaleString('fa-IR')}</span>
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `).join('');
        }
    }

    window.addToCart = function(productId) {
        const product = products.find(p => p.id === productId);
        if (!product || product.price === null) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCart();

        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ افزوده شد';
        btn.style.background = '#27ae60';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1500);
    };

    window.updateQuantity = function(productId, change) {
        const item = cart.find(i => i.id === productId);
        if (!item) return;

        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
        }
    };

    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
    };

    // Wishlist
    window.toggleWishlist = function(productId) {
        const index = wishlist.indexOf(productId);
        const btn = event.currentTarget;

        if (index === -1) {
            wishlist.push(productId);
            btn.classList.add('active');
            btn.querySelector('svg').setAttribute('fill', '#e74c3c');
            btn.querySelector('svg').setAttribute('stroke', '#e74c3c');
        } else {
            wishlist.splice(index, 1);
            btn.classList.remove('active');
            btn.querySelector('svg').setAttribute('fill', 'none');
            btn.querySelector('svg').setAttribute('stroke', 'currentColor');
        }

        localStorage.setItem('soravinWishlist', JSON.stringify(wishlist));
    };

    // UI Event Listeners
    productSearch?.addEventListener('input', filterAndSort);

    categoryChips?.addEventListener('click', (e) => {
        if (e.target.classList.contains('chip')) {
            categoryChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            filterAndSort();
        }
    });

    sortSelect?.addEventListener('change', filterAndSort);

    // Cart Sidebar
    const cartIconBtn = document.getElementById('cartIconBtn');
    const cartClose = document.getElementById('cartClose');
    const mobileCartBtn = document.getElementById('mobileCartBtn');

    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    }

    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }

    cartIconBtn?.addEventListener('click', openCart);
    mobileCartBtn?.addEventListener('click', openCart);
    cartClose?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);

    // Checkout - check auth first
    document.getElementById('btnCheckout')?.addEventListener('click', async () => {
        if (cart.length === 0) {
            alert('سبد خرید خالی است');
            return;
        }
        
        // Check if user is logged in
        const supabaseModule = await import('./js/supabase.js');
        const loggedIn = await supabaseModule.isLoggedIn();
        
        if (!loggedIn) {
            // Redirect to login with message
            localStorage.setItem('checkoutRedirect', 'true');
            window.location.href = 'login.html';
            return;
        }
        
        closeCart();
        checkoutModal.classList.add('active');
    });

    document.getElementById('checkoutClose')?.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
    });

    checkoutModal?.addEventListener('click', (e) => {
        if (e.target === checkoutModal) checkoutModal.classList.remove('active');
    });

    // Order Submission - save to Firestore
    document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const order = {
            uid: currentUser ? currentUser.uid : 'anonymous',
            email: currentUser ? currentUser.email : document.getElementById('customerEmail').value,
            items: [...cart],
            total: cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0),
            code: 'ORD-' + Date.now().toString().slice(-6),
            status: 'pending',
            date: new Date().toISOString(),
            customer: {
                name: document.getElementById('customerName').value,
                phone: document.getElementById('customerPhone').value,
                email: document.getElementById('customerEmail').value,
                address: document.getElementById('customerAddress').value
            }
        };

        try {
            await addDoc(collection(db, 'orders'), order);
        } catch (error) {
            console.error('Error saving order to Firestore:', error);
        }

        cart = [];
        saveCart();

        checkoutModal.classList.remove('active');
        successOverlay.classList.add('active');
    });

    document.getElementById('closeSuccess')?.addEventListener('click', () => {
        successOverlay.classList.remove('active');
    });

    document.getElementById('applyDiscount')?.addEventListener('click', () => {
        const code = document.getElementById('discountCode').value.trim();
        if (code) {
            alert('کد تخفیف اعمال شد (نمایشی)');
        }
    });

    // Initialize
    loadProducts();
    updateCartUI();
});
