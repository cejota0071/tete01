// admin.js - Funções específicas do painel administrativo

// ===== CONFIGURAÇÕES GLOBAIS DO ADMIN =====
let ADMIN_CONFIG = {
    storeName: "QG Marmitas",
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
// Removido ADMIN_COUPONS separado - agora usa getStoredCoupons() para sincronização

// ===== FUNÇÕES DO PAINEL ADMINISTRATIVO =====

// Verificar status de autenticação
async function checkAuthenticationStatus() {
    try {
        const response = await fetch('/api/auth-status');
        const data = await response.json();

        if (!data.authenticated) {
            // Redirecionar para login se não autenticado
            window.location.href = '/login';
            return false;
        }

        return true;
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/login';
        return false;
    }
}

// Inicializar painel admin
async function initializeAdminPage() {
    // Verificar autenticação antes de carregar qualquer coisa
    const isAuthenticated = await checkAuthenticationStatus();
    if (!isAuthenticated) {
        return; // Função será interrompida se não autenticado
    }

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

    if (ADMIN_CONFIG.products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <h3>Nenhum produto cadastrado</h3>
                <p>Adicione seu primeiro produto usando o formulário acima.</p>
            </div>
        `;
        return;
    }

    ADMIN_CONFIG.products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'admin-product-item';
        productItem.innerHTML = `
            <div class="product-header">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <span class="product-category">${getCategoryName(product.category)}</span>
                    ${product.popular ? '<span class="popular-badge"><i class="fas fa-star"></i> Popular</span>' : ''}
                </div>
                <div class="product-actions">
                    <button onclick="editProduct('${product.id}')" class="btn-edit" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct('${product.id}')" class="btn-delete" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>

            <div class="product-content">
                <div class="product-image-section">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-preview">` : '<div class="no-image"><i class="fas fa-image"></i></div>'}
                    ${product.icon ? `<div class="product-icon-preview"><img src="${product.icon}" alt="Ícone" style="width: 32px; height: 32px;"></div>` : ''}
                </div>

                <div class="product-details">
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

                    <div class="form-group">
                        <label>Ícone SVG</label>
                        <input type="url" value="${product.icon || ''}"
                               onchange="updateProductIcon('${product.id}', this.value)">
                    </div>

                    <div class="form-group">
                        <label>Upload de Imagem</label>
                        <input type="file" accept="image/*"
                               onchange="uploadProductImage('${product.id}', this.files[0])">
                    </div>

                    <div class="form-group">
                        <label>Produto Popular</label>
                        <input type="checkbox" ${product.popular ? 'checked' : ''}
                               onchange="updateProductPopular('${product.id}', this.checked)">
                    </div>
                </div>
            </div>

            <div class="product-description">
                <p>${product.description || 'Sem descrição'}</p>
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

// Upload de imagem do produto
function uploadProductImage(productId, file) {
    if (!file) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
        showNotification('Por favor, selecione apenas arquivos de imagem!', 'error');
        return;
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('A imagem deve ter no máximo 5MB!', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        updateProductImage(productId, imageUrl);
        // Recarregar produtos para mostrar a preview
        loadAdminProducts();
    };
    reader.readAsDataURL(file);
}

// Carregar cupons no admin
function loadAdminCoupons() {
    const couponsList = document.getElementById('currentCoupons');
    couponsList.innerHTML = '';

    const coupons = getStoredCoupons();
    Object.entries(coupons).forEach(([code, coupon]) => {
        const couponItem = document.createElement('div');
        couponItem.className = 'coupon-item';
        couponItem.innerHTML = `
            <div>
                <span class="coupon-code">${code}</span>
                <span class="coupon-discount">${coupon.discount}% OFF</span>
            </div>
            <button onclick="removeCoupon('${code}')" class="remove-btn">
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
    if (coupons[code]) {
        showNotification('Este código de cupom já existe!', 'error');
        return;
    }

    coupons[code] = { discount, type: "percent", valid: true };
    saveCoupons(coupons);

    // Limpar formulário
    document.getElementById('newCouponCode').value = '';
    document.getElementById('newCouponDiscount').value = '';

    loadAdminCoupons();
    showNotification('Cupom criado com sucesso!');
}

// Remover cupom
function removeCoupon(code) {
    const coupons = getStoredCoupons();
    delete coupons[code];
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

        // Inicializar filtros e gráficos
        initializeReportFilters();
        loadPaymentMethodChart();
        loadStatusChart();
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
        backgroundColor: '#ffffff',
        coupons: {}
    };

    const stored = localStorage.getItem('ceiaChefAdminSettings');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
}

// Salvar configurações
function saveSettings(settings) {
    localStorage.setItem('ceiaChefAdminSettings', JSON.stringify(settings));
}

// Obter cupons armazenados
function getStoredCoupons() {
    const settings = getStoredSettings();
    return settings.coupons || {};
}

// Salvar cupons
function saveCoupons(coupons) {
    const settings = getStoredSettings();
    settings.coupons = coupons;
    saveSettings(settings);
}

// Salvar configuração do admin
function saveAdminConfig() {
    localStorage.setItem('adminConfig', JSON.stringify(ADMIN_CONFIG));
}

// Função de logout - salvar configurações e limpar sessão (sem resetar tema)
function logout() {
    // Salvar configurações do admin antes de fazer logout
    saveAdminConfig();

    // Preservar configurações do tema antes de limpar
    const themeSettings = {
        primaryColor: document.getElementById('adminPrimaryColor').value,
        secondaryColor: document.getElementById('adminSecondaryColor').value,
        accentColor: document.getElementById('adminAccentColor').value,
        backgroundColor: document.getElementById('adminBackgroundColor').value
    };

    // Limpar dados locais, mas preservar configurações do tema
    const settings = getStoredSettings();
    settings.primaryColor = themeSettings.primaryColor;
    settings.secondaryColor = themeSettings.secondaryColor;
    settings.accentColor = themeSettings.accentColor;
    settings.backgroundColor = themeSettings.backgroundColor;

    // Limpar apenas dados de sessão, não configurações
    sessionStorage.clear();

    // Salvar configurações preservadas
    saveSettings(settings);

    // Redirecionar para página de login
    window.location.href = 'login.html';
}

// ===== SISTEMA DE FILTROS E GRÁFICOS =====

// Inicializar filtros de relatório
function initializeReportFilters() {
    const filterSection = document.createElement('div');
    filterSection.className = 'report-filters';
    filterSection.innerHTML = `
        <div class="filter-section">
            <h3><i class="fas fa-filter"></i> Filtros de Relatório</h3>
            <div class="filter-controls">
                <div class="filter-group">
                    <label>Data Inicial:</label>
                    <input type="date" id="reportStartDate" onchange="applyReportFilters()">
                </div>
                <div class="filter-group">
                    <label>Data Final:</label>
                    <input type="date" id="reportEndDate" onchange="applyReportFilters()">
                </div>
                <div class="filter-group">
                    <label>Status:</label>
                    <select id="reportStatusFilter" onchange="applyReportFilters()">
                        <option value="">Todos</option>
                        <option value="completed">Concluído</option>
                        <option value="pending">Pendente</option>
                        <option value="cancelled">Cancelado</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Pagamento:</label>
                    <select id="reportPaymentFilter" onchange="applyReportFilters()">
                        <option value="">Todos</option>
                        <option value="pix">PIX</option>
                        <option value="cartao">Cartão</option>
                    </select>
                </div>
                <button onclick="resetReportFilters()" class="btn-secondary">
                    <i class="fas fa-undo"></i> Limpar Filtros
                </button>
            </div>
        </div>
    `;

    // Inserir antes da seção de estatísticas
    const statsSection = document.querySelector('.reports-stats');
    if (statsSection) {
        statsSection.parentNode.insertBefore(filterSection, statsSection);
    }

    // Definir datas padrão (últimos 30 dias)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    document.getElementById('reportStartDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('reportEndDate').value = endDate.toISOString().split('T')[0];
}

// Aplicar filtros aos relatórios
function applyReportFilters() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const statusFilter = document.getElementById('reportStatusFilter').value;
    const paymentFilter = document.getElementById('reportPaymentFilter').value;

    let filteredOrders = [...ordersData];

    // Filtrar por data
    if (startDate) {
        const start = new Date(startDate);
        filteredOrders = filteredOrders.filter(order => new Date(order.date) >= start);
    }

    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Fim do dia
        filteredOrders = filteredOrders.filter(order => new Date(order.date) <= end);
    }

    // Filtrar por status
    if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }

    // Filtrar por método de pagamento
    if (paymentFilter) {
        filteredOrders = filteredOrders.filter(order => order.paymentMethod === paymentFilter);
    }

    // Atualizar estatísticas com dados filtrados
    updateFilteredStats(filteredOrders);
    loadFilteredRecentOrders(filteredOrders);
    loadFilteredPopularProducts(filteredOrders);
    loadPaymentMethodChart(filteredOrders);
    loadStatusChart(filteredOrders);
    generateAnalysisCard(filteredOrders);
}

// Resetar filtros
function resetReportFilters() {
    document.getElementById('reportStartDate').value = '';
    document.getElementById('reportEndDate').value = '';
    document.getElementById('reportStatusFilter').value = '';
    document.getElementById('reportPaymentFilter').value = '';

    // Recarregar dados originais
    updateReportsStats();
    loadRecentOrders();
    loadPopularProducts();
    loadPaymentMethodChart();
    loadStatusChart();
    generateAnalysisCard(ordersData);
}

// Atualizar estatísticas com dados filtrados
function updateFilteredStats(filteredOrders) {
    const totalSales = filteredOrders.reduce((total, order) => total + order.total, 0);
    const totalProductsSold = filteredOrders.reduce((total, order) => {
        return total + order.products.reduce((orderTotal, product) => orderTotal + product.quantity, 0);
    }, 0);
    const totalOrders = filteredOrders.length;

    // Calcular produto mais vendido nos dados filtrados
    const productCounts = {};
    filteredOrders.forEach(order => {
        order.products.forEach(product => {
            if (productCounts[product.name]) {
                productCounts[product.name] += product.quantity;
            } else {
                productCounts[product.name] = product.quantity;
            }
        });
    });

    let topProduct = "Nenhum";
    let maxSales = 0;
    for (const [productName, sales] of Object.entries(productCounts)) {
        if (sales > maxSales) {
            maxSales = sales;
            topProduct = productName;
        }
    }

    document.getElementById('totalSales').textContent = `R$ ${totalSales.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalProductsSold').textContent = totalProductsSold;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('topProduct').textContent = topProduct;
}

// Carregar pedidos recentes filtrados
function loadFilteredRecentOrders(filteredOrders) {
    const recentOrdersElement = document.getElementById('recentOrders');

    if (!filteredOrders || filteredOrders.length === 0) {
        recentOrdersElement.innerHTML = `
            <div class="no-data">
                <i class="fas fa-shopping-cart"></i>
                <p>Nenhum pedido encontrado com os filtros aplicados</p>
            </div>
        `;
        return;
    }

    const recentOrders = filteredOrders.slice(0, 5);
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

// Carregar produtos populares filtrados
function loadFilteredPopularProducts(filteredOrders) {
    const popularProductsElement = document.getElementById('popularProducts');

    if (!filteredOrders || filteredOrders.length === 0) {
        popularProductsElement.innerHTML = `
            <div class="no-data">
                <i class="fas fa-box"></i>
                <p>Nenhum produto vendido no período filtrado</p>
            </div>
        `;
        return;
    }

    const productSales = {};
    filteredOrders.forEach(order => {
        order.products.forEach(product => {
            if (productSales[product.name]) {
                productSales[product.name] += product.quantity;
            } else {
                productSales[product.name] = product.quantity;
            }
        });
    });

    const sortedProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

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

// Carregar gráfico de métodos de pagamento
function loadPaymentMethodChart(filteredOrders = ordersData) {
    const chartContainer = document.getElementById('paymentMethodChart');
    if (!chartContainer) return;

    const paymentCounts = {};
    filteredOrders.forEach(order => {
        const method = order.paymentMethod === 'pix' ? 'PIX' : 'Cartão';
        paymentCounts[method] = (paymentCounts[method] || 0) + 1;
    });

    const total = Object.values(paymentCounts).reduce((sum, count) => sum + count, 0);
    const colors = ['#4CAF50', '#2196F3'];

    let chartHTML = '<div class="chart-container">';
    let legendHTML = '<div class="chart-legend">';

    Object.entries(paymentCounts).forEach(([method, count], index) => {
        const percentage = ((count / total) * 100).toFixed(1);
        const color = colors[index];

        chartHTML += `
            <div class="chart-segment" style="
                background: conic-gradient(${color} 0% ${percentage}%, #f0f0f0 ${percentage}% 100%);
                width: 120px;
                height: 120px;
                border-radius: 50%;
            "></div>
        `;

        legendHTML += `
            <div class="legend-item">
                <span class="legend-color" style="background: ${color}"></span>
                <span>${method}: ${count} (${percentage}%)</span>
            </div>
        `;
    });

    chartHTML += '</div>';
    legendHTML += '</div>';

    chartContainer.innerHTML = chartHTML + legendHTML;
}

// Carregar gráfico de status dos pedidos
function loadStatusChart(filteredOrders = ordersData) {
    const chartContainer = document.getElementById('statusChart');
    if (!chartContainer) return;

    const statusCounts = {};
    filteredOrders.forEach(order => {
        const status = order.status === 'completed' ? 'Concluído' :
                      order.status === 'pending' ? 'Pendente' : 'Cancelado';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    const colors = ['#4CAF50', '#FF9800', '#F44336'];

    let chartHTML = '<div class="chart-container">';
    let legendHTML = '<div class="chart-legend">';

    Object.entries(statusCounts).forEach(([status, count], index) => {
        const percentage = ((count / total) * 100).toFixed(1);
        const color = colors[index];

        chartHTML += `
            <div class="chart-segment" style="
                background: conic-gradient(${color} 0% ${percentage}%, #f0f0f0 ${percentage}% 100%);
                width: 120px;
                height: 120px;
                border-radius: 50%;
            "></div>
        `;

        legendHTML += `
            <div class="legend-item">
                <span class="legend-color" style="background: ${color}"></span>
                <span>${status}: ${count} (${percentage}%)</span>
            </div>
        `;
    });

    chartHTML += '</div>';
    legendHTML += '</div>';

    chartContainer.innerHTML = chartHTML + legendHTML;
}

// Gerar card de análise
function generateAnalysisCard(filteredOrders = ordersData) {
    const analysisCard = document.getElementById('analysisCard');
    if (!analysisCard) return;

    // Calcular métricas
    const totalSales = filteredOrders.reduce((total, order) => total + order.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calcular crescimento (comparado com período anterior)
    const currentPeriod = filteredOrders.length;
    const previousPeriod = Math.floor(currentPeriod * 0.8); // Simulação
    const growth = previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod * 100).toFixed(1) : 0;

    // Produto mais vendido
    const productCounts = {};
    filteredOrders.forEach(order => {
        order.products.forEach(product => {
            if (productCounts[product.name]) {
                productCounts[product.name] += product.quantity;
            } else {
                productCounts[product.name] = product.quantity;
            }
        });
    });

    let topProduct = "Nenhum";
    let topProductSales = 0;
    for (const [productName, sales] of Object.entries(productCounts)) {
        if (sales > topProductSales) {
            topProductSales = sales;
            topProduct = productName;
        }
    }

    // Método de pagamento mais usado
    const paymentCounts = {};
    filteredOrders.forEach(order => {
        const method = order.paymentMethod === 'pix' ? 'PIX' : 'Cartão';
        paymentCounts[method] = (paymentCounts[method] || 0) + 1;
    });

    let topPaymentMethod = "Nenhum";
    let topPaymentCount = 0;
    for (const [method, count] of Object.entries(paymentCounts)) {
        if (count > topPaymentCount) {
            topPaymentCount = count;
            topPaymentMethod = method;
        }
    }

    // Status mais comum
    const statusCounts = {};
    filteredOrders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    let topStatus = "Nenhum";
    let topStatusCount = 0;
    for (const [status, count] of Object.entries(statusCounts)) {
        if (count > topStatusCount) {
            topStatusCount = count;
            topStatus = status === 'completed' ? 'Concluído' :
                       status === 'pending' ? 'Pendente' : 'Cancelado';
        }
    }

    analysisCard.innerHTML = `
        <div class="analysis-header">
            <h3><i class="fas fa-chart-line"></i> Análise de Performance</h3>
            <div class="analysis-actions">
                <button onclick="exportAnalysis()" class="btn-primary">
                    <i class="fas fa-download"></i> Exportar
                </button>
                <button onclick="shareAnalysis()" class="btn-secondary">
                    <i class="fas fa-share"></i> Compartilhar
                </button>
            </div>
        </div>

        <div class="analysis-metrics">
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="metric-content">
                    <h4>${totalOrders}</h4>
                    <p>Total de Pedidos</p>
                    <span class="metric-change ${growth >= 0 ? 'positive' : 'negative'}">
                        ${growth >= 0 ? '+' : ''}${growth}% vs período anterior
                    </span>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="metric-content">
                    <h4>R$ ${totalSales.toFixed(2).replace('.', ',')}</h4>
                    <p>Receita Total</p>
                    <span class="metric-change positive">
                        Ticket médio: R$ ${avgOrderValue.toFixed(2).replace('.', ',')}
                    </span>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="metric-content">
                    <h4>${topProduct}</h4>
                    <p>Produto Mais Vendido</p>
                    <span class="metric-change neutral">
                        ${topProductSales} unidades vendidas
                    </span>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-credit-card"></i>
                </div>
                <div class="metric-content">
                    <h4>${topPaymentMethod}</h4>
                    <p>Pagamento Preferido</p>
                    <span class="metric-change neutral">
                        ${topPaymentCount} transações
                    </span>
                </div>
            </div>
        </div>

        <div class="analysis-insights">
            <h4>Insights e Recomendações</h4>
            <div class="insights-list">
                <div class="insight-item">
                    <i class="fas fa-lightbulb"></i>
                    <p>O produto <strong>${topProduct}</strong> representa ${((topProductSales / Object.values(productCounts).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}% das vendas totais.</p>
                </div>
                <div class="insight-item">
                    <i class="fas fa-trend-up"></i>
                    <p>${growth >= 0 ? 'Crescimento positivo' : 'Declínio'} de ${Math.abs(growth)}% no número de pedidos comparado ao período anterior.</p>
                </div>
                <div class="insight-item">
                    <i class="fas fa-clock"></i>
                    <p>A maioria dos pedidos (${((statusCounts.completed || 0) / totalOrders * 100).toFixed(1)}%) são finalizados com sucesso.</p>
                </div>
                <div class="insight-item">
                    <i class="fas fa-money-bill-wave"></i>
                    <p>O método de pagamento mais utilizado é <strong>${topPaymentMethod}</strong>, facilitando o processo de checkout.</p>
                </div>
            </div>
        </div>
    `;
}

// Exportar análise
function exportAnalysis() {
    const analysisData = {
        timestamp: new Date().toISOString(),
        filters: {
            startDate: document.getElementById('reportStartDate').value,
            endDate: document.getElementById('reportEndDate').value,
            status: document.getElementById('reportStatusFilter').value,
            payment: document.getElementById('reportPaymentFilter').value
        },
        metrics: {
            totalSales: document.getElementById('totalSales').textContent,
            totalOrders: document.getElementById('totalOrders').textContent,
            totalProducts: document.getElementById('totalProductsSold').textContent,
            topProduct: document.getElementById('topProduct').textContent
        }
    };

    const dataStr = JSON.stringify(analysisData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `relatorio-analise-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showNotification('Relatório exportado com sucesso!');
}

// Compartilhar análise
function shareAnalysis() {
    const shareData = {
        title: 'Análise de Performance - Ceia do Chef',
        text: `Confira a análise de performance: ${document.getElementById('totalOrders').textContent} pedidos, ${document.getElementById('totalSales').textContent} em vendas.`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData);
    } else {
        // Fallback: copiar para clipboard
        navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        showNotification('Link copiado para a área de transferência!');
    }
}

// Gerar relatório em PDF (placeholder - pode ser implementado com biblioteca externa)
function generateReportCard() {
    // Criar conteúdo do relatório
    const reportData = {
        title: 'Relatório de Performance - Ceia do Chef',
        date: new Date().toLocaleDateString('pt-BR'),
        metrics: {
            totalSales: document.getElementById('totalSales').textContent,
            totalOrders: document.getElementById('totalOrders').textContent,
            totalProducts: document.getElementById('totalProductsSold').textContent,
            topProduct: document.getElementById('topProduct').textContent
        },
        filters: {
            startDate: document.getElementById('reportStartDate')?.value || 'N/A',
            endDate: document.getElementById('reportEndDate')?.value || 'N/A',
            status: document.getElementById('reportStatusFilter')?.value || 'Todos',
            payment: document.getElementById('reportPaymentFilter')?.value || 'Todos'
        }
    };

    // Criar conteúdo HTML para impressão/PDF
    const reportHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #d32f2f; text-align: center;">${reportData.title}</h1>
            <p style="text-align: center; color: #666;">Gerado em: ${reportData.date}</p>

            <h2>Métricas Principais</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
                <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0; color: #d32f2f;">Vendas Totais</h3>
                    <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${reportData.metrics.totalSales}</p>
                </div>
                <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0; color: #d32f2f;">Total de Pedidos</h3>
                    <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${reportData.metrics.totalOrders}</p>
                </div>
                <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0; color: #d32f2f;">Produtos Vendidos</h3>
                    <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${reportData.metrics.totalProducts}</p>
                </div>
                <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0; color: #d32f2f;">Produto Mais Vendido</h3>
                    <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">${reportData.metrics.topProduct}</p>
                </div>
            </div>

            <h2>Filtros Aplicados</h2>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Período:</strong> ${reportData.filters.startDate} até ${reportData.filters.endDate}</p>
                <p><strong>Status:</strong> ${reportData.filters.status}</p>
                <p><strong>Pagamento:</strong> ${reportData.filters.payment}</p>
            </div>

            <div style="text-align: center; margin-top: 40px; color: #666; font-size: 12px;">
                Relatório gerado automaticamente pelo sistema Ceia do Chef
            </div>
        </div>
    `;

    // Abrir em nova janela para impressão
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>${reportData.title}</title>
                <style>
                    body { margin: 0; padding: 20px; }
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                ${reportHTML}
            </body>
        </html>
    `);
    printWindow.document.close();

    // Aguardar carregamento e abrir diálogo de impressão
    printWindow.onload = function() {
        printWindow.print();
    };

    showNotification('Relatório gerado com sucesso! Use Ctrl+P para imprimir ou salvar como PDF.');
}

// ===== NOVAS FUNÇÕES PARA GERENCIAMENTO DE PRODUTOS =====

// ===== FUNÇÕES PARA MODAL DE ADICIONAR PRODUTO =====

// Abrir modal para adicionar produto
function openAddProductModal() {
    // Limpar formulário do modal
    document.getElementById('modalProductName').value = '';
    document.getElementById('modalProductPrice').value = '';
    document.getElementById('modalProductCategory').value = 'ceia';
    document.getElementById('modalProductDescription').value = '';
    document.getElementById('modalProductImage').value = '';
    document.getElementById('modalProductIcon').value = '';
    document.getElementById('modalProductPopular').checked = false;

    // Mostrar modal
    document.getElementById('addProductModal').style.display = 'block';
}

// Salvar novo produto do modal
function saveNewProduct() {
    const name = document.getElementById('modalProductName').value.trim();
    const price = parseFloat(document.getElementById('modalProductPrice').value);
    const category = document.getElementById('modalProductCategory').value;
    const description = document.getElementById('modalProductDescription').value.trim();
    const image = document.getElementById('modalProductImage').value.trim();
    const icon = document.getElementById('modalProductIcon').value.trim();
    const popular = document.getElementById('modalProductPopular').checked;

    // Validação
    if (!name || !price || price <= 0) {
        showNotification('Preencha pelo menos o nome e preço do produto!', 'error');
        return;
    }

    // Gerar ID único
    const productId = 'product' + Date.now();

    // Criar novo produto
    const newProduct = {
        id: productId,
        name: name,
        price: price,
        category: category,
        description: description || '',
        image: image || '',
        icon: icon || '',
        popular: popular
    };

    // Adicionar ao array de produtos
    ADMIN_CONFIG.products.push(newProduct);

    // Salvar configurações
    saveAdminConfig();

    // Fechar modal
    closeModal();

    // Recarregar lista de produtos
    loadAdminProducts();

    showNotification('Produto adicionado com sucesso!');
}

// Adicionar novo produto (função antiga mantida para compatibilidade)
function addNewProduct() {
    const name = document.getElementById('newProductName').value.trim();
    const price = parseFloat(document.getElementById('newProductPrice').value);
    const category = document.getElementById('newProductCategory').value;
    const description = document.getElementById('newProductDescription').value.trim();
    const image = document.getElementById('newProductImage').value.trim();
    const icon = document.getElementById('newProductIcon').value.trim();
    const popular = document.getElementById('newProductPopular').checked;

    // Validação
    if (!name || !price || price <= 0) {
        showNotification('Preencha pelo menos o nome e preço do produto!', 'error');
        return;
    }

    // Gerar ID único
    const productId = 'product' + Date.now();

    // Criar novo produto
    const newProduct = {
        id: productId,
        name: name,
        price: price,
        category: category,
        description: description || '',
        image: image || '',
        icon: icon || '',
        popular: popular
    };

    // Adicionar ao array de produtos
    ADMIN_CONFIG.products.push(newProduct);

    // Salvar configurações
    saveAdminConfig();

    // Limpar formulário
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductPrice').value = '';
    document.getElementById('newProductCategory').value = 'ceia';
    document.getElementById('newProductDescription').value = '';
    document.getElementById('newProductImage').value = '';
    document.getElementById('newProductIcon').value = '';
    document.getElementById('newProductPopular').checked = false;

    // Recarregar lista de produtos
    loadAdminProducts();

    showNotification('Produto adicionado com sucesso!');
}

// Editar produto (abre modal ou formulário inline)
function editProduct(productId) {
    const product = ADMIN_CONFIG.products.find(p => p.id === productId);
    if (!product) return;

    // Criar modal de edição
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> Editar Produto</h3>
                <button onclick="closeModal()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label for="editProductName">Nome do Produto</label>
                        <input type="text" id="editProductName" value="${product.name}">
                    </div>
                    <div class="form-group">
                        <label for="editProductPrice">Preço (R$)</label>
                        <input type="number" id="editProductPrice" step="0.01" value="${product.price}">
                    </div>
                    <div class="form-group">
                        <label for="editProductCategory">Categoria</label>
                        <select id="editProductCategory">
                            <option value="ceia" ${product.category === 'ceia' ? 'selected' : ''}>Ceia</option>
                            <option value="sobremesa" ${product.category === 'sobremesa' ? 'selected' : ''}>Sobremesa</option>
                            <option value="bebida" ${product.category === 'bebida' ? 'selected' : ''}>Bebida</option>
                            <option value="acompanhamento" ${product.category === 'acompanhamento' ? 'selected' : ''}>Acompanhamento</option>
                            <option value="outros" ${product.category === 'outros' ? 'selected' : ''}>Outros</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group full-width">
                        <label for="editProductDescription">Descrição</label>
                        <textarea id="editProductDescription">${product.description || ''}</textarea>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editProductImage">URL da Imagem</label>
                        <input type="url" id="editProductImage" value="${product.image || ''}">
                    </div>
                    <div class="form-group">
                        <label for="editProductIcon">Ícone SVG</label>
                        <input type="url" id="editProductIcon" value="${product.icon || ''}">
                    </div>
                    <div class="form-group">
                        <label for="editProductPopular">Produto Popular</label>
                        <input type="checkbox" id="editProductPopular" ${product.popular ? 'checked' : ''}>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal()" class="btn-secondary">Cancelar</button>
                <button onclick="saveProductEdit('${productId}')" class="btn-primary">Salvar Alterações</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Salvar edição do produto
function saveProductEdit(productId) {
    const product = ADMIN_CONFIG.products.find(p => p.id === productId);
    if (!product) return;

    const name = document.getElementById('editProductName').value.trim();
    const price = parseFloat(document.getElementById('editProductPrice').value);
    const category = document.getElementById('editProductCategory').value;
    const description = document.getElementById('editProductDescription').value.trim();
    const image = document.getElementById('editProductImage').value.trim();
    const icon = document.getElementById('editProductIcon').value.trim();
    const popular = document.getElementById('editProductPopular').checked;

    // Validação
    if (!name || !price || price <= 0) {
        showNotification('Preencha pelo menos o nome e preço do produto!', 'error');
        return;
    }

    // Atualizar produto
    product.name = name;
    product.price = price;
    product.category = category;
    product.description = description;
    product.image = image;
    product.icon = icon;
    product.popular = popular;

    // Salvar configurações
    saveAdminConfig();

    // Fechar modal e recarregar lista
    closeModal();
    loadAdminProducts();

    showNotification('Produto atualizado com sucesso!');
}

// Excluir produto
function deleteProduct(productId) {
    if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
        return;
    }

    // Remover produto do array
    ADMIN_CONFIG.products = ADMIN_CONFIG.products.filter(p => p.id !== productId);

    // Salvar configurações
    saveAdminConfig();

    // Recarregar lista de produtos
    loadAdminProducts();

    showNotification('Produto excluído com sucesso!');
}

// Atualizar ícone do produto
function updateProductIcon(productId, newIcon) {
    const product = ADMIN_CONFIG.products.find(p => p.id === productId);
    if (product) {
        product.icon = newIcon;
        saveAdminConfig();
        showNotification('Ícone atualizado com sucesso!');
    }
}

// Atualizar status popular do produto
function updateProductPopular(productId, isPopular) {
    const product = ADMIN_CONFIG.products.find(p => p.id === productId);
    if (product) {
        product.popular = isPopular;
        saveAdminConfig();
        showNotification(isPopular ? 'Produto marcado como popular!' : 'Produto removido dos populares!');
    }
}

// Fechar modal
function closeModal() {
    const modal = document.querySelector('.admin-modal');
    if (modal) {
        modal.remove();
    }
}

// ===== SISTEMA DE GERENCIAMENTO DE CATEGORIAS =====

// Abrir modal do gerenciador de categorias
function openCategoryManager() {
    loadCategoriesList();
    document.getElementById('categoryManagerModal').style.display = 'block';
}

// Fechar modal do gerenciador de categorias
function closeCategoryManager() {
    document.getElementById('categoryManagerModal').style.display = 'none';
    // Limpar formulário
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryValue').value = '';
}

// Carregar lista de categorias no modal
function loadCategoriesList() {
    const categoriesList = document.getElementById('categoriesList');
    const categories = getStoredCategories();

    categoriesList.innerHTML = '';

    if (Object.keys(categories).length === 0) {
        categoriesList.innerHTML = `
            <div class="no-categories">
                <i class="fas fa-tags"></i>
                <p>Nenhuma categoria personalizada criada ainda.</p>
            </div>
        `;
        return;
    }

    Object.entries(categories).forEach(([value, name]) => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <div class="category-info">
                <div class="category-name">${name}</div>
                <div class="category-value">${value}</div>
            </div>
            <div class="category-actions">
                <button onclick="deleteCategory('${value}')" title="Excluir categoria">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        categoriesList.appendChild(categoryItem);
    });
}

// Adicionar nova categoria
function addNewCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    const value = document.getElementById('newCategoryValue').value.trim().toLowerCase().replace(/\s+/g, '');

    if (!name || !value) {
        showNotification('Preencha nome e valor da categoria!', 'error');
        return;
    }

    // Validar valor (slug)
    if (!/^[a-z0-9]+$/.test(value)) {
        showNotification('O valor deve conter apenas letras minúsculas e números!', 'error');
        return;
    }

    const categories = getStoredCategories();

    // Verificar se já existe
    if (categories[value]) {
        showNotification('Já existe uma categoria com este valor!', 'error');
        return;
    }

    // Adicionar categoria
    categories[value] = name;
    saveCategories(categories);

    // Limpar formulário
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryValue').value = '';

    // Recarregar lista
    loadCategoriesList();

    // Atualizar select de categorias no modal de produto
    updateProductCategorySelect();

    showNotification('Categoria adicionada com sucesso!');
}

// Excluir categoria
function deleteCategory(value) {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Produtos usando esta categoria podem ser afetados.')) {
        return;
    }

    const categories = getStoredCategories();
    delete categories[value];
    saveCategories(categories);

    // Recarregar lista
    loadCategoriesList();

    // Atualizar select de categorias
    updateProductCategorySelect();

    showNotification('Categoria excluída com sucesso!');
}

// Obter categorias armazenadas
function getStoredCategories() {
    const settings = getStoredSettings();
    return settings.categories || {};
}

// Salvar categorias
function saveCategories(categories) {
    const settings = getStoredSettings();
    settings.categories = categories;
    saveSettings(settings);
}

// Atualizar select de categorias no modal de produto
function updateProductCategorySelect() {
    const select = document.getElementById('modalProductCategory');
    if (!select) return;

    const defaultCategories = {
        'ceia': 'Ceia',
        'sobremesa': 'Sobremesa',
        'bebida': 'Bebida',
        'acompanhamento': 'Acompanhamento',
        'outros': 'Outros'
    };

    const customCategories = getStoredCategories();

    // Limpar opções existentes
    select.innerHTML = '';

    // Adicionar categorias padrão
    Object.entries(defaultCategories).forEach(([value, name]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = name;
        select.appendChild(option);
    });

    // Adicionar categorias personalizadas
    Object.entries(customCategories).forEach(([value, name]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = name;
        select.appendChild(option);
    });
}

// Função auxiliar para obter nome da categoria (incluindo personalizadas)
function getCategoryName(category) {
    const defaultCategories = {
        'ceia': 'Ceia',
        'sobremesa': 'Sobremesa',
        'bebida': 'Bebida',
        'acompanhamento': 'Acompanhamento',
        'outros': 'Outros'
    };

    // Primeiro verificar categorias personalizadas
    const customCategories = getStoredCategories();
    if (customCategories[category]) {
        return customCategories[category];
    }

    // Depois categorias padrão
    return defaultCategories[category] || 'Outros';
}

// Inicializar categorias no carregamento da página
function initializeCategories() {
    updateProductCategorySelect();
}

console.log("🔧 admin.js carregado e pronto!");
