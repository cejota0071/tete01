// functions.js - VERSÃO REFATORADA PARA LAYOUT HORIZONTAL CLEAN

// ===== CONFIGURAÇÕES GLOBAIS =====
const CONFIG = {
    storeName: "Ceia do Chef",
    whatsappNumber: "5534991400189",
    products: [
        {
            id: "product1",
            name: "Ceia Completa Premium",
            price: 299.90,
            description: "Perfeitamente para 8 pessoas • Pernil, Chester, Farofa, Saladas",
            category: "ceia",
            popular: true
        },
        {
            id: "product2", 
            name: "Ceia Família",
            price: 159.90,
            description: "Para 4 pessoas • Chester, Farofa, Arroz, Salada",
            category: "ceia",
            popular: false
        },
        {
            id: "product3",
            name: "Kit Sobremesas", 
            price: 79.90,
            description: "Panetone, Rabanada, Pudim, Sorvete • Complemente sua ceia",
            category: "sobremesa",
            popular: true
        },
        {
            id: "product4",
            name: "Vinho Tinto Premium", 
            price: 45.90,
            description: "Vinho tinto seco • Garrafa 750ml • Safra 2022",
            category: "bebida",
            popular: false
        },
        {
            id: "product5",
            name: "Farofa Especial", 
            price: 35.90,
            description: "Bacon, calabresa, passas • Pacote 500g • 6 pessoas",
            category: "acompanhamento",
            popular: true
        }
    ]
};

// ===== SISTEMA DE CUPONS =====
const DISCOUNT_COUPONS = {
    "NATAL10": { discount: 10, type: "percent", valid: true },
    "CEIA15": { discount: 15, type: "percent", valid: true },
    "PRIMEIRACOMPRA": { discount: 20, type: "percent", valid: true }
};

// ===== ESTADO GLOBAL =====
let order = {
    items: {},
    paymentMethod: "",
    customerInfo: {},
    totalAmount: 0
};

let activeCategory = 'all';
let activeCoupon = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Iniciando aplicação - Layout Horizontal");
    initializeApp();
    setupEventListeners();
    renderProducts();
    updateCountdown();
});

function initializeApp() {
    // Configurar nome da loja
    const storeNameElement = document.getElementById('storeName');
    if (storeNameElement) {
        storeNameElement.textContent = CONFIG.storeName;
    }
    
    console.log("✅ Aplicação inicializada");
}

// ===== RENDERIZAÇÃO DE PRODUTOS =====
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = CONFIG.products.map(product => `
        <div class="product-card" data-category="${product.category}" data-product-id="${product.id}">
            <div class="product-image">
                <div class="img-placeholder">${getProductIcon(product.category)}</div>
                ${product.popular ? '<div class="product-badge">🔥 Mais Vendido</div>' : ''}
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                <div class="product-actions">
                    <button class="quantity-btn minus" data-product="${product.id}">-</button>
                    <span class="quantity-display" id="qty-${product.id}">0</span>
                    <button class="quantity-btn plus" data-product="${product.id}">+</button>
                </div>
            </div>
        </div>
    `).join('');

    console.log("🎨 Produtos renderizados");
}

function getProductIcon(category) {
    const icons = {
        'ceia': '🍽️',
        'sobremesa': '🍰',
        'bebida': '🍷',
        'acompanhamento': '🥘',
        'entrada': '🥗'
    };
    return icons[category] || '📦';
}

// ===== CONFIGURAÇÃO DE EVENT LISTENERS =====
function setupEventListeners() {
    // Categorias
    setupCategoryListeners();
    
    // Produtos
    setupProductListeners();
    
    // Pesquisa
    setupSearchListener();
    
    // Carrinho
    setupCartListeners();
    
    // Cupons
    setupCouponListeners();
    
    // Checkout
    setupCheckoutListeners();

    console.log("🔧 Event listeners configurados");
}

function setupCategoryListeners() {
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            setActiveCategory(category);
        });
    });
}

function setupProductListeners() {
    // Delegation para botões de quantidade
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn')) {
            const productId = e.target.getAttribute('data-product');
            const change = e.target.classList.contains('plus') ? 1 : -1;
            updateQuantity(productId, change);
        }
    });
}

function setupSearchListener() {
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterProducts(e.target.value);
        });
    }
}

function setupCartListeners() {
    // O toggleCartPanel já está no onclick do HTML
}

function setupCouponListeners() {
    const applyCouponBtn = document.getElementById('applyCoupon');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }
}

function setupCheckoutListeners() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            validateAndSubmitOrder();
        });
    }

    // Listeners para métodos de pagamento
    document.querySelectorAll('.payment-option input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            order.paymentMethod = this.value;
        });
    });
}

// ===== SISTEMA DE CATEGORIAS =====
function setActiveCategory(category) {
    activeCategory = category;
    
    // Atualizar UI
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Filtrar produtos
    filterProducts();
}

// ===== SISTEMA DE FILTROS =====
function filterProducts(searchTerm = '') {
    const products = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    products.forEach(product => {
        const productCategory = product.getAttribute('data-category');
        const productName = product.querySelector('.product-title').textContent.toLowerCase();
        const productDesc = product.querySelector('.product-description').textContent.toLowerCase();
        
        const matchesCategory = activeCategory === 'all' || productCategory === activeCategory;
        const matchesSearch = searchTerm === '' || 
                            productName.includes(searchTerm.toLowerCase()) || 
                            productDesc.includes(searchTerm.toLowerCase());
        
        if (matchesCategory && matchesSearch) {
            product.style.display = 'block';
            visibleCount++;
        } else {
            product.style.display = 'none';
        }
    });
    
    // Mostrar estado vazio se necessário
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

function resetFilters() {
    setActiveCategory('all');
    const searchInput = document.getElementById('productSearch');
    if (searchInput) searchInput.value = '';
    filterProducts();
}

// ===== GERENCIAMENTO DE QUANTIDADES =====
function updateQuantity(productId, change) {
    const currentQty = order.items[productId] || 0;
    const newQty = Math.max(0, currentQty + change);
    
    order.items[productId] = newQty;
    
    // Atualizar display
    const qtyDisplay = document.getElementById(`qty-${productId}`);
    if (qtyDisplay) {
        qtyDisplay.textContent = newQty;
    }
    
    updateCartUI();
    console.log(`🔄 ${productId}: ${newQty} unidades`);
}

// ===== SISTEMA DE CARRINHO =====
function updateCartUI() {
    const totals = calculateTotals();
    const floatingCart = document.getElementById('floatingCart');
    const cartItems = document.getElementById('cartItems');
    
    // Atualizar carrinho flutuante
    if (floatingCart) {
        const totalItems = Object.values(order.items).reduce((sum, qty) => sum + qty, 0);
        
        if (totalItems > 0) {
            floatingCart.classList.add('active');
            floatingCart.querySelector('.cart-count').textContent = 
                `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
            floatingCart.querySelector('.cart-total').textContent = 
                `R$ ${totals.total.toFixed(2).replace('.', ',')}`;
        } else {
            floatingCart.classList.remove('active');
        }
    }
    
    // Atualizar itens do carrinho
    if (cartItems) {
        cartItems.innerHTML = CONFIG.products.map(product => {
            const qty = order.items[product.id] || 0;
            if (qty > 0) {
                const itemTotal = product.price * qty;
                return `
                    <div class="cart-item">
                        <span>${product.name}</span>
                        <span>${qty}x R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                `;
            }
            return '';
        }).join('');
    }
    
    // Atualizar resumo
    updateCartSummary(totals);
}

function updateCartSummary(totals) {
    const subtotalElement = document.getElementById('subtotalPrice');
    const discountElement = document.getElementById('discountRow');
    const totalElement = document.getElementById('totalPrice');
    
    if (subtotalElement) {
        subtotalElement.textContent = `R$ ${totals.subtotal.toFixed(2).replace('.', ',')}`;
    }
    
    if (discountElement) {
        if (totals.discount > 0) {
            discountElement.style.display = 'flex';
            discountElement.querySelector('span:last-child').textContent = 
                `- R$ ${totals.discount.toFixed(2).replace('.', ',')}`;
        } else {
            discountElement.style.display = 'none';
        }
    }
    
    if (totalElement) {
        totalElement.textContent = `R$ ${totals.total.toFixed(2).replace('.', ',')}`;
    }
}

function calculateTotals() {
    let subtotal = 0;
    
    CONFIG.products.forEach(product => {
        const qty = order.items[product.id] || 0;
        if (qty > 0) {
            subtotal += product.price * qty;
        }
    });
    
    let discount = 0;
    if (activeCoupon && activeCoupon.type === "percent") {
        discount = (subtotal * activeCoupon.discount) / 100;
    }
    
    order.totalAmount = subtotal - discount;
    
    return {
        subtotal: subtotal,
        discount: discount,
        total: order.totalAmount
    };
}

// ===== CONTROLE DE INTERFACE =====
function toggleCartPanel() {
    const cartPanel = document.getElementById('cartPanel');
    if (cartPanel) {
        cartPanel.classList.toggle('active');
    }
}

function openCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    const cartPanel = document.getElementById('cartPanel');
    
    if (cartPanel) cartPanel.classList.remove('active');
    if (checkoutModal) checkoutModal.classList.add('active');
}

function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.classList.remove('active');
    }
}

// ===== SISTEMA DE CUPONS =====
function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    const feedbackElement = document.getElementById('couponFeedback');
    
    if (!couponInput || !feedbackElement) return;
    
    const couponCode = couponInput.value.trim().toUpperCase();
    
    if (!couponCode) {
        showCouponFeedback('❌ Digite um código de cupom', 'error');
        return;
    }
    
    const coupon = DISCOUNT_COUPONS[couponCode];
    
    if (coupon && coupon.valid) {
        activeCoupon = coupon;
        showCouponFeedback(`✅ Cupom aplicado! ${coupon.discount}% de desconto`, 'success');
        updateCartUI();
    } else {
        activeCoupon = null;
        showCouponFeedback('❌ Cupom inválido ou expirado', 'error');
        updateCartUI();
    }
}

function showCouponFeedback(message, type) {
    const feedbackElement = document.getElementById('couponFeedback');
    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.className = `coupon-feedback ${type}`;
    }
}

// ===== PROCESSAMENTO DE PEDIDOS =====
function validateAndSubmitOrder() {
    // Coletar dados do formulário
    order.customerInfo = {
        name: document.getElementById('customerName')?.value.trim() || '',
        phone: document.getElementById('customerPhone')?.value.trim() || '',
        address: document.getElementById('customerAddress')?.value.trim() || '',
        notes: document.getElementById('customerNotes')?.value.trim() || ''
    };

    // Validação
    const errors = validateOrder();
    if (errors.length > 0) {
        showValidationError(errors);
        return;
    }

    // Processar pedido
    processOrder();
}

function validateOrder() {
    const errors = [];
    
    if (!order.customerInfo.name) errors.push("Nome completo");
    if (!order.customerInfo.phone) errors.push("Telefone");
    if (!order.customerInfo.address) errors.push("Endereço de entrega");
    if (!order.paymentMethod) errors.push("Forma de pagamento");
    
    const totals = calculateTotals();
    if (totals.total === 0) errors.push("Adicione itens ao pedido");

    return errors;
}

function showValidationError(errors) {
    alert(`❌ Por favor, preencha:\n• ${errors.join('\n• ')}`);
}

function processOrder() {
    const message = generateOrderMessage();
    sendToWhatsApp(message);
    closeCheckout();
    resetOrder();
}

function generateOrderMessage() {
    const totals = calculateTotals();
    
    let message = `🍗 *PEDIDO - ${CONFIG.storeName.toUpperCase()}* 🎄\n\n`;
    
    // Informações do cliente
    message += `*👤 DADOS DO CLIENTE:*\n`;
    message += `Nome: ${order.customerInfo.name}\n`;
    message += `Telefone: ${order.customerInfo.phone}\n\n`;
    
    // Itens do pedido
    message += `*🛒 ITENS DO PEDIDO:*\n`;
    CONFIG.products.forEach(product => {
        const qty = order.items[product.id] || 0;
        if (qty > 0) {
            const itemTotal = product.price * qty;
            message += `➤ ${product.name}\n`;
            message += `   ${qty}x R$ ${product.price.toFixed(2).replace('.', ',')} = R$ ${itemTotal.toFixed(2).replace('.', ',')}\n\n`;
        }
    });
    
    // Resumo financeiro
    message += `*💰 RESUMO FINANCEIRO:*\n`;
    message += `Subtotal: R$ ${totals.subtotal.toFixed(2).replace('.', ',')}\n`;
    if (totals.discount > 0) {
        message += `Desconto: -R$ ${totals.discount.toFixed(2).replace('.', ',')}\n`;
    }
    message += `*TOTAL: R$ ${totals.total.toFixed(2).replace('.', ',')}*\n\n`;
    
    // Informações de entrega
    message += `*📍 ENTREGA:*\n`;
    message += `${order.customerInfo.address}\n`;
    if (order.customerInfo.notes) {
        message += `Observações: ${order.customerInfo.notes}\n`;
    }
    message += `\n`;
    
    // Pagamento
    message += `*💳 PAGAMENTO:*\n`;
    const paymentMethods = {
        'pix': 'PIX',
        'cartao': 'Cartão', 
        'dinheiro': 'Dinheiro'
    };
    message += `${paymentMethods[order.paymentMethod]}\n\n`;
    
    // Rodapé
    message += `_*Pedido via ${CONFIG.storeName}*_\n`;
    message += `_*${new Date().toLocaleString('pt-BR')}*_`;

    return message;
}

// Função plugável: basta ter CONFIG.whatsappNumber e uma função que retorne a mensagem
function sendToWhatsApp(message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`;
    
    // Tentar WhatsApp Web primeiro
    window.open(whatsappUrl, '_blank');
    
    // Fallback após delay
    setTimeout(() => {
        const fallbackUrl = `https://web.whatsapp.com/send?phone=${CONFIG.whatsappNumber}&text=${encodedMessage}`;
        window.open(fallbackUrl, '_blank');
    }, 500);
}

function resetOrder() {
    order.items = {};
    order.paymentMethod = "";
    order.customerInfo = {};
    order.totalAmount = 0;
    activeCoupon = null;
    
    // Resetar UI
    document.querySelectorAll('.quantity-display').forEach(display => {
        display.textContent = '0';
    });
    
    updateCartUI();
    closeCheckout();
    
    console.log("🔄 Pedido resetado");
}

// ===== UTILITÁRIOS =====
function updateCountdown() {
    const now = new Date();
    const christmas = new Date(now.getFullYear(), 11, 24);
    const diff = christmas - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        countdownElement.textContent = `⏰ Faltam ${days} dias para o Natal!`;
    }
}

// Atualizar contador a cada minuto
setInterval(updateCountdown, 60000);

console.log("🔧 functions.js carregado e pronto!");