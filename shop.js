// Shop Page JavaScript - Soravin Store

document.addEventListener('DOMContentLoaded', function() {
    // State
    let products = [];
    let cart = JSON.parse(localStorage.getItem('soravinCart')) || [];
    let wishlist = JSON.parse(localStorage.getItem('soravinWishlist')) || [];
    let flashSaleEnd = Date.now() + 6 * 60 * 60 * 1000; // 6 hours from now

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
        return price.toLocaleString('fa-IR') + ' تومان';
    }

    // Generate Stars SVG
    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
        }
        if (hasHalf && fullStars < 5) {
            stars += '<svg viewBox="0 0 24 24" fill="currentColor"><defs><linearGradient id="halfGrad"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon fill="url(#halfGrad)" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
        }
        while (stars.split('<svg').length - 1 < 5) {
            stars += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
        }
        return stars;
    }

    // Render Product Card
    function createProductCard(product) {
        const isInWishlist = wishlist.includes(product.id);
        const badgeText = product.badge === 'sale' ? 'تخفیف' : product.badge === 'new' ? 'جدید' : 'ویژه';
        
        return `
            <div class="product-card" data-id="${product.id}" data-category="${product.category}">
                <div class="product-image-wrapper">
                    <div class="product-image" style="background: ${product.image};"></div>
                    <div class="product-badges">
                        ${product.badge ? `<span class="product-badge badge-${product.badge}">${badgeText}</span>` : ''}
                    </div>
                    <button class="product-wishlist ${isInWishlist ? 'active' : ''}" onclick="toggleWishlist(${product.id})">
                        <svg viewBox="0 0 24 24" fill="${isInWishlist ? '#e74c3c' : 'none'}" stroke="${isInWishlist ? '#e74c3c' : 'currentColor'}" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-category">${getCategoryName(product.category)}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">
                        <div class="stars">${generateStars(product.rating)}</div>
                        <span class="rating-count">(${product.reviews.toLocaleString('fa-IR')})</span>
                    </div>
                    <div class="product-prices">
                        <span class="product-price">${formatPrice(product.price)}</span>
                        ${product.oldPrice ? `<span class="product-old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="addToCart(${product.id})">افزودن به سبد</button>
                        <button class="btn-quick-view" onclick="openQuickView(${product.id})">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
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
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
        }

        // Category
        if (category !== 'all') {
            filtered = filtered.filter(p => p.category === category);
        }

        // Sort
        switch (sortValue) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                filtered.sort((a, b) => b.id - a.id);
                break;
        }

        renderProducts(filtered);
    }

    // Setup Flash Sale
    function setupFlashSale() {
        if (products.length > 0) {
            const saleProducts = products.filter(p => p.oldPrice);
            if (saleProducts.length > 0) {
                const randomProduct = saleProducts[Math.floor(Math.random() * saleProducts.length)];
                flashProduct.innerHTML = `
                    <div class="flash-product-card">
                        <div class="flash-product-image" style="background: ${randomProduct.image};"></div>
                    </div>
                    <div class="flash-product-info">
                        <h4 class="flash-product-title">${randomProduct.name}</h4>
                        <div class="flash-prices">
                            <span class="flash-price">${formatPrice(randomProduct.price)}</span>
                            <span class="flash-old-price">${formatPrice(randomProduct.oldPrice)}</span>
                        </div>
                        <div class="flash-timer">تا پایان پیشنهاد شگفت‌انگیز:</div>
                    </div>
                `;
                startCountdown();
            }
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

    // Quick View
    window.openQuickView = function(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const specsHtml = Object.entries(product.specs)
            .map(([key, value]) => `<div class="spec-item"><span class="spec-label">${key}:</span><span class="spec-value">${value}</span></div>`)
            .join('');

        const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
        const relatedHtml = relatedProducts.map(p => `
            <div class="product-card" style="font-size: 0.9rem;">
                <div class="product-image-wrapper" style="height: 120px;">
                    <div class="product-image" style="background: ${p.image};"></div>
                </div>
                <div class="product-info" style="padding: 12px;">
                    <h4 style="color: var(--white); margin: 0 0 8px; font-size: 0.85rem;">${p.name}</h4>
                    <div style="color: var(--gold-light); font-weight: 600;">${formatPrice(p.price)}</div>
                </div>
            </div>
        `).join('');

        quickViewBody.innerHTML = `
            <div class="quick-view-image">
                <div style="width: 100%; height: 350px; background: ${product.image}; border-radius: 12px;"></div>
            </div>
            <div class="quick-view-details">
                <h2>${product.name}</h2>
                <div class="product-rating" style="margin-bottom: 16px;">
                    <div class="stars">${generateStars(product.rating)}</div>
                    <span class="rating-count">(${product.reviews.toLocaleString('fa-IR')} نظر)</span>
                </div>
                <p class="quick-view-description">${product.description}</p>
                <div class="quick-view-specs">
                    ${specsHtml}
                </div>
                <div class="quick-view-price">${formatPrice(product.price)}${product.oldPrice ? ` <span style="font-size: 1rem; color: var(--gray); text-decoration: line-through; margin-right: 10px;">${formatPrice(product.oldPrice)}</span>` : ''}</div>
                <div class="quick-view-actions">
                    <button class="btn-add-cart" style="flex: 1; padding: 14px;" onclick="addToCart(${product.id}); closeQuickView()">افزودن به سبد خرید</button>
                </div>
                ${relatedProducts.length > 0 ? `
                    <div class="related-products">
                        <h3>محصولات مرتبط</h3>
                        <div class="related-grid">${relatedHtml}</div>
                    </div>
                ` : ''}
            </div>
        `;

        quickViewModal.classList.add('active');
    };

    window.closeQuickView = function() {
        quickViewModal.classList.remove('active');
    };

    // Cart Functions
    function saveCart() {
        localStorage.setItem('soravinCart', JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
                        <h4 class="cart-item-title">${item.name}</h4>
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
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCart();
        
        // Show feedback
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

    // Modal Controls
    document.getElementById('modalClose')?.addEventListener('click', closeQuickView);
    quickViewModal?.addEventListener('click', (e) => {
        if (e.target === quickViewModal) closeQuickView();
    });

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

    // Checkout
    document.getElementById('btnCheckout')?.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('سبد خرید خالی است');
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

    // Order Submission
    document.getElementById('checkoutForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const order = {
            id: Date.now(),
            date: new Date().toISOString(),
            customer: {
                name: document.getElementById('customerName').value,
                phone: document.getElementById('customerPhone').value,
                email: document.getElementById('customerEmail').value,
                address: document.getElementById('customerAddress').value
            },
            items: [...cart],
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        // Save to localStorage
        const orders = JSON.parse(localStorage.getItem('soravinOrders')) || [];
        orders.push(order);
        localStorage.setItem('soravinOrders', JSON.stringify(orders));

        // Clear cart
        cart = [];
        saveCart();

        // Show success
        checkoutModal.classList.remove('active');
        successOverlay.classList.add('active');
    });

    document.getElementById('closeSuccess')?.addEventListener('click', () => {
        successOverlay.classList.remove('active');
    });

    // Discount Code (placeholder)
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
