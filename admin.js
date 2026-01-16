// admin.js - Funções específicas do painel administrativo

// ===== CONFIGURAÇÕES GLOBAIS DO ADMIN =====
const ADMIN_CONFIG = {
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

// ===== SISTEMA DE CUPONS DO ADMIN =====
let ADMIN_COUPONS = {
    "NATAL10": { discount: 10, type: "percent", valid: true },
    "CEIA15": { discount: 15, type: "percent", valid: true },
    "PRIMEIRACOMPRA": { discount: 20, type: "percent", valid: true }
};

// ===== FUNÇÕES DO PAINEL ADMINISTRATIVO =====

// Inicializar painel admin
function initializeAdminPage() {
    loadAdminSettings();
    setupAdminTabs();
    loadAdminProducts();
    loadAdminCoupons();
    loadAdminTheme();
    loadAdminReports();
}

// Carregar configurações salvas no admin
function loadAdminSettings() {
    const settings = getStoredSettings();

    // Carregar configurações da loja
    document.getElementById('adminStoreName').value = settings.storeName || 'Ceia do Chef';
    document.getElementById('adminCoverImage').value = settings.coverImage || '';
    document.getElementById('adminProfileImage').value = settings.profileImage || '';

    // Carregar número do WhatsApp
    document.getElementById('adminWhatsappNumber').value = settings.whatsappNumber || '5534999999999';

    // Carregar cores do tema
    document.getElementById('adminPrimaryColor').value = settings.primaryColor || '#d32f2f';
    document.getElementById('adminSecondaryColor').value = settings.secondaryColor || '#2e7d32';
    document.getElementById('adminAccentColor').value = settings.accentColor || '#ffd700';
    document.getElementById('adminBackgroundColor').value = settings.backgroundColor || '#ffffff';

    updateThemePreview();
}

// Configurar navegação por abas
function setupAdminTabs() {
    const tabs = document.querySelectorAll('.admin-nav-tab');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover classe active de todas as abas
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            // Adicionar classe active na aba clicada
            tab.classList.add('active');
            const tabId = tab.dataset.tab;
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
}

// Carregar produtos no admin
function loadAdminProducts() {
    const productsGrid = document.getElementById('adminProductsList');
    productsGrid.innerHTML = '';

    ADMIN_CONFIG.products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'admin-product-item';
        productItem.innerHTML = `
            <h4>${product.name}</h4>
            <div class="form-group">
                <label>Preço (R$)</label>
                <input type="number" step="0.01" value="${product.price}"
                       onchange="updateProductPrice('${product.id}', this.value)">
            </div>
            <div class="form-group">
                <label>URL da Imagem</label>
                <input type="url" value="${product.image || ''}"
                       onchange="updateProductImage('${product.id}', this.value)">
            </div>
        `;
        productsGrid.appendChild(productItem);
    });
}

// Atualizar preço do produto
function updateProductPrice(productId, newPrice) {
    const product = ADMIN_CONFIG.products.find(p => p.id === productId);
    if (product) {
        product.price = parseFloat(newPrice);
        saveAdminConfig();
        showNotification('Preço atualizado com sucesso!');
    }
}

// Atualizar imagem do produto
function updateProductImage(productId, newImage) {
    const product = ADMIN_CONFIG.products.find(p => p.id === productId);
    if (product) {
        product.image = newImage;
        saveAdminConfig();
        showNotification('Imagem atualizada com sucesso!');
    }
}

// Carregar cupons no admin
function loadAdminCoupons() {
    const couponsList = document.getElementById('currentCoupons');
    couponsList.innerHTML = '';

    const coupons = getStoredCoupons();
    coupons.forEach(coupon => {
        const couponItem = document.createElement('div');
        couponItem.className = 'coupon-item';
        couponItem.innerHTML = `
            <div>
                <span class="coupon-code">${coupon.code}</span>
                <span class="coupon-discount">${coupon.discount}% OFF</span>
            </div>
            <button onclick="removeCoupon('${coupon.code}')" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        couponsList.appendChild(couponItem);
    });
}

// Adicionar novo cupom
function addNewCoupon() {
    const code = document.getElementById('newCouponCode').value.toUpperCase().trim();
    const discount = parseInt(document.getElementById('newCouponDiscount').value);

    if (!code || !discount || discount < 1 || discount > 100) {
        showNotification('Preencha todos os campos corretamente!', 'error');
        return;
    }

    const coupons = getStoredCoupons();

    // Verificar se o cupom já existe
    if (coupons.some(c => c.code === code)) {
        showNotification('Este código de cupom já existe!', 'error');
        return;
    }

    coupons.push({ code, discount });
    saveCoupons(coupons);

    // Limpar formulário
    document.getElementById('newCouponCode').value = '';
    document.getElementById('newCouponDiscount').value = '';

    loadAdminCoupons();
    showNotification('Cupom criado com sucesso!');
}

// Remover cupom
function removeCoupon(code) {
    const coupons = getStoredCoupons().filter(c => c.code !== code);
    saveCoupons(coupons);
    loadAdminCoupons();
    showNotification('Cupom removido com sucesso!');
}

// Carregar configurações do tema
function loadAdminTheme() {
    const settings = getStoredSettings();

    // Aplicar cores atuais no preview
    updateThemePreview();
}

// ===== CONFIGURAÇÕES DOS RELATÓRIOS =====
const REPORTS_CONFIG = {
    MAX_ORDERS: 50,
    CACHE_DURATION: 300000, // 5 minutos
    STORAGE_KEY: 'ceia_reports_data'
};

// ===== VARIÁVEIS GLOBAIS DOS RELATÓRIOS =====
let ordersData = [];

// ===== SISTEMA DE RELATÓRIOS =====

// Carregar relatórios
function loadAdminReports() {
    // Carregar dados dos pedidos
    loadOrdersData().then(() => {
        // Atualizar estatísticas
        updateReportsStats();

        // Carregar pedidos recentes
        loadRecentOrders();

        // Carregar produtos populares
        loadPopularProducts();
    });
}

// Carregar dados dos pedidos (simulação com dados mock)
async function loadOrdersData() {
    try {
        // Tentar carregar do cache primeiro
        const cached = getCachedOrdersData();
        if (cached) {
            ordersData = cached;
            return;
        }

        // Gerar dados simulados (até 50 pedidos)
        ordersData = generateMockOrders(REPORTS_CONFIG.MAX_ORDERS);

        // Salvar no cache
        saveOrdersData();

    } catch (error) {
        console.error('Erro ao carregar dados dos pedidos:', error);
        ordersData = [];
    }
}

// Gerar dados simulados de pedidos
function generateMockOrders(count) {
    const customers = [
        "João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa",
        "Carlos Ferreira", "Luciana Almeida", "Roberto Lima", "Fernanda Souza"
    ];

    const products = ADMIN_CONFIG.products;
    const statuses = ['completed', 'pending', 'cancelled'];

    const orders = [];

    for (let i = 1; i <= count; i++) {
        // Gerar data aleatória dos últimos 30 dias
        const daysAgo = Math.floor(Math.random() * 30);
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - daysAgo);

        // Selecionar produtos aleatórios (1-3 produtos por pedido)
        const numProducts = Math.floor(Math.random() * 3) + 1;
        const selectedProducts = [];
        let totalAmount = 0;

        for (let j = 0; j < numProducts; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const itemTotal = product.price * quantity;

            selectedProducts.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                total: itemTotal
            });

            totalAmount += itemTotal;
        }

        orders.push({
            id: `PED${String(i).padStart(4, '0')}`,
            customer: customers[Math.floor(Math.random() * customers.length)],
            date: orderDate.toISOString(),
            products: selectedProducts,
            total: totalAmount,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            paymentMethod: Math.random() > 0.5 ? 'pix' : 'cartao'
        });
    }

    // Ordenar por data (mais recentes primeiro)
    return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Obter dados do cache
function getCachedOrdersData() {
    const cached = localStorage.getItem(REPORTS_CONFIG.STORAGE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();

    // Verificar se o cache ainda é válido
    if (now - data.timestamp > REPORTS_CONFIG.CACHE_DURATION) {
        localStorage.removeItem(REPORTS_CONFIG.STORAGE_KEY);
        return null;
    }

    return data.orders;
}

// Salvar dados no cache
function saveOrdersData() {
    const data = {
        orders: ordersData,
        timestamp: Date.now()
    };
    localStorage.setItem(REPORTS_CONFIG.STORAGE_KEY, JSON.stringify(data));
}

// Atualizar estatísticas dos relatórios
function updateReportsStats() {
    // Calcular vendas totais
    const totalSales = calculateTotalSales();
    document.getElementById('totalSales').textContent = `R$ ${totalSales.toFixed(2).replace('.', ',')}`;

    // Calcular produtos vendidos
    const totalProductsSold = calculateTotalProductsSold();
    document.getElementById('totalProductsSold').textContent = totalProductsSold;

    // Calcular número de pedidos
    const totalOrders = calculateTotalOrders();
    document.getElementById('totalOrders').textContent = totalOrders;

    // Obter produto mais vendido
    const topProduct = getTopProduct();
    document.getElementById('topProduct').textContent = topProduct;
}

// Calcular vendas totais
function calculateTotalSales() {
    if (!ordersData || ordersData.length === 0) return 0;
    return ordersData.reduce((total, order) => total + order.total, 0);
}

// Calcular produtos vendidos
function calculateTotalProductsSold() {
    if (!ordersData || ordersData.length === 0) return 0;

    return ordersData.reduce((total, order) => {
        return total + order.products.reduce((orderTotal, product) => orderTotal + product.quantity, 0);
    }, 0);
}

// Calcular número de pedidos
function calculateTotalOrders() {
    return ordersData ? ordersData.length : 0;
}

// Obter produto mais vendido
function getTopProduct() {
    if (!ordersData || ordersData.length === 0) return "Nenhum";

    const productCounts = {};

    // Contar vendas por produto
    ordersData.forEach(order => {
        order.products.forEach(product => {
            if (productCounts[product.name]) {
                productCounts[product.name] += product.quantity;
            } else {
                productCounts[product.name] = product.quantity;
            }
        });
    });

    // Encontrar produto mais vendido
    let topProduct = "Nenhum";
    let maxSales = 0;

    for (const [productName, sales] of Object.entries(productCounts)) {
        if (sales > maxSales) {
            maxSales = sales;
            topProduct = productName;
        }
    }

    return topProduct;
}

// Carregar pedidos recentes
function loadRecentOrders() {
    const recentOrdersElement = document.getElementById('recentOrders');

    if (!ordersData || ordersData.length === 0) {
        recentOrdersElement.innerHTML = `
            <div class="no-data">
                <i class="fas fa-shopping-cart"></i>
                <p>Nenhum pedido recente encontrado</p>
            </div>
        `;
        return;
    }

    // Mostrar os 5 pedidos mais recentes
    const recentOrders = ordersData.slice(0, 5);
    const ordersHTML = recentOrders.map(order => {
        const orderDate = new Date(order.date).toLocaleDateString('pt-BR');
        const statusClass = order.status === 'completed' ? 'status-completed' :
                           order.status === 'pending' ? 'status-pending' : 'status-cancelled';
        const statusText = order.status === 'completed' ? 'Concluído' :
                          order.status === 'pending' ? 'Pendente' : 'Cancelado';

        return `
            <div class="recent-order-item">
                <div class="order-header">
                    <span class="order-id">${order.id}</span>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
                <div class="order-details">
                    <span class="order-customer">${order.customer}</span>
                    <span class="order-date">${orderDate}</span>
                </div>
                <div class="order-total">R$ ${order.total.toFixed(2).replace('.', ',')}</div>
            </div>
        `;
    }).join('');

    recentOrdersElement.innerHTML = ordersHTML;
}

// Carregar produtos populares
function loadPopularProducts() {
    const popularProductsElement = document.getElementById('popularProducts');

    if (!ordersData || ordersData.length === 0) {
        popularProductsElement.innerHTML = `
            <div class="no-data">
                <i class="fas fa-box"></i>
                <p>Nenhum produto vendido ainda</p>
            </div>
        `;
        return;
    }

    // Calcular vendas por produto
    const productSales = {};

    ordersData.forEach(order => {
        order.products.forEach(product => {
            if (productSales[product.name]) {
                productSales[product.name] += product.quantity;
            } else {
                productSales[product.name] = product.quantity;
            }
        });
    });

    // Ordenar produtos por vendas (mais vendidos primeiro)
    const sortedProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5); // Top 5 produtos

    const productsHTML = sortedProducts.map(([productName, sales]) => {
        return `
            <div class="popular-product-item">
                <div class="product-info">
                    <span class="product-name">${productName}</span>
                    <span class="product-sales">${sales} vendido${sales !== 1 ? 's' : ''}</span>
                </div>
                <div class="product-bar">
                    <div class="product-bar-fill" style="width: ${(sales / sortedProducts[0][1]) * 100}%"></div>
                </div>
            </div>
        `;
    }).join('');

    popularProductsElement.innerHTML = productsHTML;
}

// Atualizar preview do tema
function updateThemePreview() {
    const primary = document.getElementById('adminPrimaryColor').value;
    const accent = document.getElementById('adminAccentColor').value;

    const previewHeader = document.querySelector('.preview-header');
    const previewButton = document.querySelector('.preview-content button');

    if (previewHeader) previewHeader.style.background = primary;
    if (previewButton) {
        previewButton.style.background = accent;
        previewButton.style.color = primary;
    }
}

// Atualizar configurações da loja
function updateStoreSettings() {
    const settings = getStoredSettings();

    settings.storeName = document.getElementById('adminStoreName').value.trim();
    settings.coverImage = document.getElementById('adminCoverImage').value.trim();
    settings.profileImage = document.getElementById('adminProfileImage').value.trim();

    saveSettings(settings);
    showNotification('Configurações da loja salvas!');
}

// Atualizar número do WhatsApp
function updateWhatsappNumber() {
    const settings = getStoredSettings();
    settings.whatsappNumber = document.getElementById('adminWhatsappNumber').value.trim();

    saveSettings(settings);
    showNotification('Número do WhatsApp atualizado!');
}

// Atualizar cores do tema
function updateThemeColors() {
    const settings = getStoredSettings();

    settings.primaryColor = document.getElementById('adminPrimaryColor').value;
    settings.secondaryColor = document.getElementById('adminSecondaryColor').value;
    settings.accentColor = document.getElementById('adminAccentColor').value;
    settings.backgroundColor = document.getElementById('adminBackgroundColor').value;

    saveSettings(settings);
    updateThemePreview();
    showNotification('Tema atualizado! Recarregue a página para ver as mudanças.');
}

// Restaurar tema padrão
function resetTheme() {
    document.getElementById('adminPrimaryColor').value = '#d32f2f';
    document.getElementById('adminSecondaryColor').value = '#2e7d32';
    document.getElementById('adminAccentColor').value = '#ffd700';
    document.getElementById('adminBackgroundColor').value = '#ffffff';

    updateThemeColors();
    showNotification('Tema restaurado para o padrão!');
}

// Mostrar notificação
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    notificationText.textContent = message;
    notification.className = `notification ${type}`;

    // Mostrar notificação
    notification.style.display = 'block';

    // Esconder após 3 segundos
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// ===== FUNÇÕES DE ARMAZENAMENTO PARA ADMIN =====

// Obter configurações armazenadas
function getStoredSettings() {
    const defaultSettings = {
        storeName: 'Ceia do Chef',
        coverImage: '',
        profileImage: '',
        whatsappNumber: '5534999999999',
        primaryColor: '#d32f2f',
        secondaryColor: '#2e7d32',
        accentColor: '#ffd700',
        backgroundColor: '#ffffff'
    };

    const stored = localStorage.getItem('adminSettings');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
}

// Salvar configurações
function saveSettings(settings) {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
}

// Obter cupons armazenados
function getStoredCoupons() {
    const stored = localStorage.getItem('discountCoupons');
    return stored ? JSON.parse(stored) : [];
}

// Salvar cupons
function saveCoupons(coupons) {
    localStorage.setItem('discountCoupons', JSON.stringify(coupons));
}

// Salvar configuração do admin
function saveAdminConfig() {
    localStorage.setItem('adminConfig', JSON.stringify(ADMIN_CONFIG));
}

console.log("🔧 admin.js carregado e pronto!");
