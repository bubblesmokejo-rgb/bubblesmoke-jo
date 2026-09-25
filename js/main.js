
const translations = {
    en: {
        logoTitle: 'Bubblesmoke jo',
        ourPackages: 'Our Packages',
        addCart: 'Add to Cart',
        removeFromCart: 'Remove',
        likedProducts: 'Liked Products',
        noLiked: 'No liked products yet.',
        cart: 'Cart',
        total: 'Total',
        checkoutWhatsApp: 'Confirm Order via WhatsApp',
        emptyCart: 'Your cart is empty.',
        currency: ' JD',
        followUs: 'Follow Us',
        viewDetails: 'Click to view details',
        insteadOf: 'instead of '
    },
    ar: {
        logoTitle: 'Bubblesmoke jo',
        ourPackages: 'البكجات',
        addCart: 'أضف للسلة',
        removeFromCart: 'إزالة',
        likedProducts: 'المنتجات المفضلة',
        noLiked: 'لا توجد منتجات مفضلة بعد.',
        cart: 'السلة',
        total: 'الإجمالي',
        checkoutWhatsApp: 'تأكيد الطلب عبر واتساب',
        emptyCart: 'سلة المشتريات فارغة.',
        currency: ' دينار',
        followUs: 'تابعنا',
        viewDetails: 'انقر لعرض التفاصيل',
        insteadOf: 'بدلاً من '
    }
};

let currentLang = localStorage.getItem('lang') || 'ar';
let currentTheme = localStorage.getItem('theme') || 'dark'; 
let currentView = 'home'; 

let cart = [];
try {
    let parsedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if(parsedCart.length > 0 && typeof parsedCart[0] === 'number') {
        cart = parsedCart.map(id => ({id: id, qty: 1}));
    } else {
        cart = parsedCart;
    }
} catch(e) { cart = []; }

let liked = JSON.parse(localStorage.getItem('liked') || '[]');

const WHATSAPP_NUMBER = '0798956920';

function locNum(num) {
    if (currentLang === 'ar') {
        const str = num.toString();
        return str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
    }
    return num.toString();
}


function init() {
        applyLang(currentLang);
    
    updateBadges();
    renderView();
    if(typeof initCanvasAnimation === 'function') initCanvasAnimation();
}


function toggleLang() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    localStorage.setItem('lang', currentLang);
    applyLang(currentLang);
    
    renderView(); 
}

function applyLang(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('lang-btn').innerText = lang === 'ar' ? 'EN' : 'ع';
}

function t(key) {
    return translations[currentLang][key] || key;
}

function updateBadges() {
    const cartCount = document.getElementById('cart-count');
    const likedCount = document.getElementById('liked-count');

    let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (totalQty > 0) {
        cartCount.innerText = locNum(totalQty);
        cartCount.classList.remove('hidden');
    } else {
        cartCount.classList.add('hidden');
    }

    if (liked.length > 0) {
        likedCount.innerText = locNum(liked.length);
        likedCount.classList.remove('hidden');
    } else {
        likedCount.classList.add('hidden');
    }
}


function handleLogoClick() {
    if (currentView.startsWith('admin')) {
        navigate('home');
    } else {
        navigate('admin-login');
    }
}

function navigate(view) {
    if (currentView !== view) {
        currentView = view;
        renderView();
        window.scrollTo(0, 0);
    }
}

function translateStatic() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = t(key);
    });
}

function renderView() {
    const main = document.getElementById('main-content');
    main.innerHTML = '';

    if (currentView === 'home') {
        const tpl = document.getElementById('tpl-home').content.cloneNode(true);
        main.appendChild(tpl);
        translateStatic();
        const container = document.getElementById('products-container');
        productsData.forEach(p => container.appendChild(createProductCard(p)));
    } else if (currentView === 'liked') {
        const tpl = document.getElementById('tpl-liked').content.cloneNode(true);
        main.appendChild(tpl);
        translateStatic();
        
        document.getElementById('back-icon-liked').className = currentLang === 'ar' ? 'fas fa-chevron-right text-xl' : 'fas fa-chevron-left text-xl';
        
        const container = document.getElementById('liked-container');
        const emptyState = document.getElementById('empty-liked');
        
        if (liked.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            liked.forEach(id => {
                const p = productsData.find(prod => prod.id === id);
                if(p) container.appendChild(createProductCard(p));
            });
        }
    } else if (currentView === 'cart') {
        const tpl = document.getElementById('tpl-cart').content.cloneNode(true);
        main.appendChild(tpl);
        translateStatic();
        
        document.getElementById('back-icon-cart').className = currentLang === 'ar' ? 'fas fa-chevron-right text-xl' : 'fas fa-chevron-left text-xl';
        
        const container = document.getElementById('cart-container');
        const emptyState = document.getElementById('empty-cart');
        const summary = document.getElementById('cart-summary');
        const totalEl = document.getElementById('cart-total');
        
        if (cart.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            summary.classList.remove('hidden');
            let total = 0;
            cart.forEach(cItem => {
                const p = productsData.find(prod => prod.id === cItem.id);
                if(p) {
                    total += p.price * cItem.qty;
                    container.appendChild(createCartItem(p, cItem.qty));
                }
            });
            totalEl.innerText = currentLang === "ar" ? `JD ${locNum(total.toFixed(2))}` : `${locNum(total.toFixed(2))} JD`;
        }
    } else if (currentView === 'admin-login') {
        const tpl = document.getElementById('tpl-admin-login').content.cloneNode(true);
        main.appendChild(tpl);
        translateStatic();
    } else if (currentView === 'admin-dashboard') {
        const tpl = document.getElementById('tpl-admin-dashboard').content.cloneNode(true);
        main.appendChild(tpl);
        translateStatic();
        renderAdminProducts();
    }
}

function createProductCard(product) {
    const tpl = document.getElementById('tpl-product').content.cloneNode(true);
    const card = tpl.querySelector('div');
    
    card.onclick = () => openModal(product);

    tpl.querySelector('.product-img').src = product.image;
    tpl.querySelector('.product-name').innerText = currentLang === 'en' ? product.nameEn : product.nameAr;
    tpl.querySelector('.product-price').innerText = currentLang === "ar" ? `JD ${locNum(product.price)}` : `${locNum(product.price)} JD`;
    
    if (product.oldPrice) {
        tpl.querySelector('.product-old-price-container').classList.remove('hidden');
        tpl.querySelector('.instead-of-text').innerText = t('insteadOf');
        tpl.querySelector('.product-old-price').innerText = currentLang === "ar" ? `JD ${locNum(product.oldPrice)}` : `${locNum(product.oldPrice)} JD`;
          tpl.querySelector('.product-old-price-container').dir = currentLang === 'en' ? 'ltr' : 'rtl';
    }
    
    
    
    
    const likeBtn = tpl.querySelector('.like-btn');
    const isLiked = liked.includes(product.id);
    if(isLiked) {
        likeBtn.querySelector('i').className = 'fas fa-heart text-xl text-red-500';
    } else {
        likeBtn.querySelector('i').className = 'far fa-heart text-xl text-gray-400';
    }
    likeBtn.onclick = (e) => {
        e.stopPropagation();
        toggleLike(product.id);
    };

    const cartBtn = tpl.querySelector('.add-to-cart-btn');
    const cItem = cart.find(i => i.id === product.id);
    if(cItem) {
        cartBtn.querySelector('span').innerText = t('removeFromCart');
        cartBtn.classList.add('bg-red-600');
    } else {
        cartBtn.querySelector('span').innerText = t('addCart');
        cartBtn.classList.add('bg-green-600');
    }
    
    cartBtn.onclick = (e) => {
        e.stopPropagation();
        if(cItem) {
            removeFromCart(product.id);
        } else {
            addToCart(product.id);
        }
    };
    
    return card;
}

function createCartItem(product, qty) {
    const tpl = document.getElementById('tpl-cart-item').content.cloneNode(true);
    const item = tpl.querySelector('div');
    
    const imgEl = tpl.querySelector('.cart-item-img');
    const nameEl = tpl.querySelector('.cart-item-name');
    imgEl.src = product.image;
    nameEl.innerText = currentLang === 'en' ? product.nameEn : product.nameAr;
    
    // Make clickable
    tpl.querySelector('.cart-item-img-container').onclick = () => openModal(product);
    nameEl.onclick = () => openModal(product);
    
    tpl.querySelector('.cart-item-price').innerText = currentLang === "ar" ? `JD ${locNum(product.price)}` : `${locNum(product.price)} JD`;
    tpl.querySelector('.cart-item-qty').innerText = locNum(qty);
    
    tpl.querySelector('.qty-minus').onclick = () => updateQuantity(product.id, -1);
    tpl.querySelector('.qty-plus').onclick = () => updateQuantity(product.id, 1);
    tpl.querySelector('.remove-cart-btn').onclick = () => removeFromCart(product.id);
    
    return item;
}

function toggleLike(id) {
    const idx = liked.indexOf(id);
    if (idx > -1) {
        liked.splice(idx, 1);
    } else {
        liked.push(id);
    }
    localStorage.setItem('liked', JSON.stringify(liked));
    updateBadges();
    renderView();
}

function addToCart(id) {
    let cItem = cart.find(i => i.id === id);
    if (cItem) {
        cItem.qty += 1;
    } else {
        cart.push({id: id, qty: 1});
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateBadges();
    renderView();
    updateModalCartState(id);
}

function removeFromCart(id) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx > -1) {
        cart.splice(idx, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateBadges();
        renderView();
        updateModalCartState(id);
    }
}

function updateQuantity(id, delta) {
    let cItem = cart.find(i => i.id === id);
    if (cItem) {
        cItem.qty += delta;
        if (cItem.qty <= 0) {
            removeFromCart(id);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateBadges();
            renderView();
        }
    }
}

function checkoutWhatsApp() {
    if (cart.length === 0) return;
    
    const productNames = cart.map(cItem => {
        const p = productsData.find(prod => prod.id === cItem.id);
        const name = currentLang === 'en' ? p.nameEn : p.nameAr;
        return `${locNum(cItem.qty)}x ${name}`;
    }).join('%0A- ');

    const messageEn = `Hello,%0AI would like to place an order for the following:%0A- ${productNames}`;
    const messageAr = `مرحباً،%0Aأود طلب الباقات التالية:%0A- ${productNames}`;
    
    const msg = currentLang === 'en' ? messageEn : messageAr;
    
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    window.open(url, '_blank');
}

// Modal Logic
function zoomImage(e, container) {
    const img = container.querySelector('img');
    if(!img) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    img.style.transformOrigin = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
    img.style.transform = 'scale(2)';
}

function resetZoom(container) {
    const img = container.querySelector('img');
    if(img) {
        img.style.transform = 'scale(1)';
    }
}

function openModal(product) {
    const root = document.getElementById('modal-root');
    root.innerHTML = ''; 
    
    const tpl = document.getElementById('tpl-modal').content.cloneNode(true);
    
    const mainImg = tpl.querySelector('#modal-img-main');
    mainImg.src = product.image;
    
    const container = tpl.querySelector('#modal-img-main-container');
    container.onmouseleave = () => resetZoom(container);
    
    const thumbContainer = tpl.querySelector('#modal-thumbnails-container');
    const images = [product.image];
    if (product.detailsImage) images.push(product.detailsImage);
    
    images.forEach((src, idx) => {
        const th = document.createElement('div');
        th.className = `w-20 shrink-0 aspect-square relative bg-white rounded-xl flex items-center justify-center p-2 cursor-pointer transition-all ${idx === 0 ? 'border-2 border-luxury' : 'border border-white/10 opacity-60 hover:opacity-100'}`;
        const img = document.createElement('img');
        img.src = src;
        img.className = 'max-w-full max-h-full object-contain';
        th.appendChild(img);
        
        th.onclick = () => {
            mainImg.src = src;
            Array.from(thumbContainer.children).forEach(child => {
                child.className = 'w-20 shrink-0 aspect-square relative bg-white rounded-xl flex items-center justify-center p-2 cursor-pointer transition-all border border-white/10 opacity-60 hover:opacity-100';
            });
            th.className = 'w-20 shrink-0 aspect-square relative bg-white rounded-xl flex items-center justify-center p-2 cursor-pointer transition-all border-2 border-luxury';
        };
        thumbContainer.appendChild(th);
    });
    
    tpl.querySelector('#modal-title').innerText = currentLang === 'en' ? product.nameEn : product.nameAr;
    tpl.querySelector('#modal-price').innerText = currentLang === "ar" ? `JD ${locNum(product.price)}` : `${locNum(product.price)} JD`;
    
    const oldPriceContainer = tpl.querySelector('#modal-old-price-container');
    if (product.oldPrice && oldPriceContainer) {
        tpl.querySelector('#modal-instead-of').innerText = t('insteadOf');
        tpl.querySelector('#modal-old-price').innerText = currentLang === "ar" ? `JD ${locNum(product.oldPrice)}` : `${locNum(product.oldPrice)} JD`;
        oldPriceContainer.classList.remove('hidden');
        oldPriceContainer.dir = currentLang === 'en' ? 'ltr' : 'rtl';
    }

    const descEl = tpl.querySelector('#modal-desc');
      descEl.innerText = currentLang === 'en' ? product.descriptionEn : product.descriptionAr;
      descEl.dir = currentLang === 'en' ? 'ltr' : 'rtl';
    
    const addBtn = tpl.querySelector('#modal-add-cart');
    addBtn.dataset.productId = product.id;
    
    root.appendChild(tpl);
    updateModalCartState(product.id);
    document.body.style.overflow = 'hidden'; 
}

function updateModalCartState(id) {
    const modalBtn = document.getElementById('modal-add-cart');
    if(modalBtn && modalBtn.dataset.productId == id) {
        let cItem = cart.find(i => i.id === id);
        if(cItem) {
            modalBtn.querySelector('span').innerText = t('removeFromCart');
            modalBtn.className = 'w-full py-4 rounded-2xl font-bold transition-all duration-300 active:scale-95 shadow-lg flex items-center justify-center text-white bg-red-600 text-lg';
            modalBtn.onclick = () => removeFromCart(id);
        } else {
            modalBtn.querySelector('span').innerText = t('addCart');
            modalBtn.className = 'w-full py-4 rounded-2xl font-bold transition-all duration-300 active:scale-95 shadow-lg flex items-center justify-center text-white bg-green-600 text-lg';
            modalBtn.onclick = () => addToCart(id);
        }
    }
}

function closeModal() {
    document.getElementById('modal-root').innerHTML = '';
    document.body.style.overflow = '';
}

function loginAdmin(e) {
    e.preventDefault();
    const user = document.getElementById('admin-user').value.toLowerCase();
    const pass = document.getElementById('admin-pass').value;
    if (user === 'admin' && pass === '2332') {
        navigate('admin-dashboard');
    } else {
        alert(currentLang === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials');
    }
}


function renderAdminProducts() {
    const list = document.getElementById('admin-product-list');
    if (!list) return;
    list.innerHTML = '';
    productsData.forEach(p => {
        const div = document.createElement('div');
        div.className = 'bg-[#151515] p-4 rounded-xl flex justify-between items-center border border-white/5 gap-4';
        div.innerHTML = `
            <div class="flex-1">
                <span class="font-bold text-white block">${p.nameEn}</span>
                <span class="text-gray-400 text-sm">${p.nameAr}</span>
            </div>
            <span class="text-luxury font-bold whitespace-nowrap">${locNum(p.price)} JD</span>
            <button class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors shrink-0" onclick="editProduct(${p.id})">Edit</button>
        `;
        list.appendChild(div);
    });
}

function editProduct(id) {
    const p = productsData.find(prod => prod.id === id);
    if (!p) return;
    const form = document.getElementById('admin-product-form');
    if (!form) return;
    
    document.getElementById('edit-id').value = p.id;
    form.nameEn.value = p.nameEn;
    form.nameAr.value = p.nameAr;
    form.price.value = p.price;
    form.oldPrice.value = p.oldPrice || '';
    form.descEn.value = p.descriptionEn || '';
      form.descAr.value = p.descriptionAr || '';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function saveProduct(e) {
    e.preventDefault();
    const form = e.target;
    const editId = document.getElementById('edit-id').value;
    
    const files = document.getElementById('admin-images').files;
    
    if (editId) {
        // Editing existing product
        const idx = productsData.findIndex(p => p.id == editId);
        if (idx > -1) {
            productsData[idx].nameEn = form.nameEn.value;
            productsData[idx].nameAr = form.nameAr.value;
            productsData[idx].price = parseFloat(form.price.value);
            productsData[idx].oldPrice = parseFloat(form.oldPrice.value);
            productsData[idx].descriptionEn = form.descEn.value;
              productsData[idx].descriptionAr = form.descAr.value;
            
            if (files.length > 0) {
                productsData[idx].image = URL.createObjectURL(files[0]);
                if (files.length > 1) {
                    productsData[idx].detailsImage = URL.createObjectURL(files[1]);
                }
            }
            alert(currentLang === 'ar' ? 'تم تحديث المنتج بنجاح!' : 'Product updated successfully!');
        }
    } else {
        // Adding new product
        let mainImg = "img/placeholder.jpg";
        if (files.length > 0) {
            mainImg = URL.createObjectURL(files[0]);
        }
        
        const newProduct = {
            id: Date.now(),
            nameAr: form.nameAr.value,
            nameEn: form.nameEn.value,
            price: parseFloat(form.price.value),
            oldPrice: parseFloat(form.oldPrice.value),
            descriptionEn: form.descEn.value,
              descriptionAr: form.descAr.value,
            image: mainImg,
            detailsImage: files.length > 1 ? URL.createObjectURL(files[1]) : mainImg
        };
        productsData.push(newProduct);
        alert(currentLang === 'ar' ? 'تم إضافة المنتج بنجاح!' : 'Product added successfully!');
    }
    
    document.getElementById('edit-id').value = '';
    form.reset();
    renderAdminProducts();
}

function initCanvasAnimation() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let bubbles = [];
    let mouse = { x: null, y: null };

    const bubbleImg = new Image();
    bubbleImg.src = 'img/custom-bubble.png';

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();

    class Bubble {
        constructor() {
            this.reset(true);
        }
        
        reset(randomY = false) {
            this.radius = Math.random() * 60 + 30; 
            this.x = Math.random() * width;
            this.y = randomY ? Math.random() * height : height + this.radius + 50;
            this.speedY = Math.random() * 0.8 + 0.3; 
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        }
        
        update() {
            this.y -= this.speedY;
            this.x += Math.sin(this.wobble) * 0.4;
            this.wobble += this.wobbleSpeed;
            
            if (mouse.x !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < this.radius + 100) {
                    this.x -= dx * 0.01;
                    this.y -= dy * 0.01;
                }
            }
            
            if (this.y < -this.radius * 2) this.reset();
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.globalCompositeOperation = 'screen';
            ctx.translate(this.x, this.y);
            
            let scaleX = 1 + Math.sin(this.wobble) * 0.03;
            let scaleY = 1 + Math.cos(this.wobble) * 0.03;
            ctx.scale(scaleX, scaleY);
            
            if (bubbleImg.complete && bubbleImg.naturalHeight !== 0) { ctx.drawImage(bubbleImg, -this.radius, -this.radius, this.radius * 2, this.radius * 2); } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(212, 175, 55, 0.8)';
                ctx.stroke();
            }
            
            ctx.restore();
        }
    }

    for(let i=0; i<15; i++) {
        bubbles.push(new Bubble());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        let bgGrad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
            bgGrad.addColorStop(0, 'rgba(30, 20, 5, 1)');
            bgGrad.addColorStop(1, 'rgba(5, 5, 5, 1)');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);
        
        bubbles.forEach(b => {
            b.update();
            b.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Initialize
init();
