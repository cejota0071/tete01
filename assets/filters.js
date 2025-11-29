// 📋 SISTEMA DE PESQUISA E FILTROS AVANÇADO

class ProductSearch {
    constructor() {
        this.searchTerm = '';
        this.activeFilter = 'all';
        this.sortBy = 'name';
        this.products = [];
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.updateResultsCount();
    }

    loadProducts() {
        // Coletar todos os produtos da página
        this.products = Array.from(document.querySelectorAll('.product'));
    }

    setupEventListeners() {
        // Pesquisa em tempo real
        document.getElementById('productSearch').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterProducts();
        });

        // Filtros por categoria
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target.getAttribute('data-filter'));
            });
        });

        // Ordenação
        document.getElementById('sortProducts').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.sortProducts();
        });
    }

    setActiveFilter(filter) {
        this.activeFilter = filter;
        
        // Atualizar botões ativos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.filterProducts();
    }

    filterProducts() {
        let visibleCount = 0;

        this.products.forEach(product => {
            const name = product.querySelector('.product-name').textContent.toLowerCase();
            const description = product.querySelector('.product-description').textContent.toLowerCase();
            const category = product.getAttribute('data-category');
            const matchesSearch = name.includes(this.searchTerm) || description.includes(this.searchTerm);
            const matchesFilter = this.activeFilter === 'all' || category === this.activeFilter;

            if (matchesSearch && matchesFilter) {
                product.style.display = 'block';
                visibleCount++;
                
                // Destacar termo pesquisado
                if (this.searchTerm) {
                    this.highlightSearchTerm(product);
                }
            } else {
                product.style.display = 'none';
            }
        });

        this.toggleNoProductsMessage(visibleCount);
        this.updateResultsCount(visibleCount);
    }

    highlightSearchTerm(product) {
        const nameElement = product.querySelector('.product-name');
        const descriptionElement = product.querySelector('.product-description');
        
        const originalName = nameElement.textContent;
        const originalDescription = descriptionElement.textContent;
        
        const highlightedName = originalName.replace(
            new RegExp(this.searchTerm, 'gi'),
            match => `<span class="highlight">${match}</span>`
        );
        
        const highlightedDescription = originalDescription.replace(
            new RegExp(this.searchTerm, 'gi'),
            match => `<span class="highlight">${match}</span>`
        );
        
        nameElement.innerHTML = highlightedName;
        descriptionElement.innerHTML = highlightedDescription;
    }

    sortProducts() {
        const container = document.getElementById('productsContainer');
        const visibleProducts = this.products.filter(p => p.style.display !== 'none');
        
        const sortedProducts = [...visibleProducts].sort((a, b) => {
            switch (this.sortBy) {
                case 'price-low':
                    return parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price'));
                case 'price-high':
                    return parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price'));
                case 'popular':
                    const aPopular = a.getAttribute('data-popular') === 'true';
                    const bPopular = b.getAttribute('data-popular') === 'true';
                    return bPopular - aPopular;
                case 'name':
                default:
                    return a.querySelector('.product-name').textContent.localeCompare(
                        b.querySelector('.product-name').textContent
                    );
            }
        });

        // Reordenar no DOM
        sortedProducts.forEach(product => {
            container.appendChild(product);
        });
    }

    toggleNoProductsMessage(visibleCount) {
        const noProducts = document.getElementById('noProducts');
        if (visibleCount === 0) {
            noProducts.style.display = 'block';
        } else {
            noProducts.style.display = 'none';
        }
    }

    updateResultsCount(visibleCount = null) {
        // Criar ou atualizar contador
        let counter = document.getElementById('resultsCounter');
        if (!counter) {
            counter = document.createElement('div');
            counter.id = 'resultsCounter';
            counter.className = 'results-count';
            document.querySelector('.search-filters').appendChild(counter);
        }

        const total = this.products.length;
        const visible = visibleCount !== null ? visibleCount : total;
        
        counter.textContent = `${visible} de ${total} produtos encontrados`;
    }
}

// 🔧 FUNÇÕES GLOBAIS
function clearSearch() {
    document.getElementById('productSearch').value = '';
    productSearch.searchTerm = '';
    productSearch.setActiveFilter('all');
    document.getElementById('sortProducts').value = 'name';
    productSearch.sortBy = 'name';
    productSearch.filterProducts();
    productSearch.sortProducts();
}

function quickSearch(term) {
    document.getElementById('productSearch').value = term;
    productSearch.searchTerm = term.toLowerCase();
    productSearch.filterProducts();
}
// No objeto CONFIG, adicionar categorias:
const CONFIG = {
    // ... configurações anteriores ...
    
    categories: {
        'ceia': '🍽️ Ceias Completas',
        'sobremesa': '🍰 Sobremesas', 
        'bebida': '🍷 Bebidas',
        'acompanhamento': '🥘 Acompanhamentos',
        'entrada': '🥗 Entradas',
        'principal': '🍗 Pratos Principais'
    }
};

// Na inicialização, adicionar:
function initializeApp() {
    // ... código anterior ...
    
    // Inicializar sistema de busca se existir
    if (typeof productSearch !== 'undefined') {
        setTimeout(() => productSearch.loadProducts(), 100);
    }
}

// 📦 INICIALIZAÇÃO
let productSearch;

document.addEventListener('DOMContentLoaded', function() {
    productSearch = new ProductSearch();
    
    // Adicionar CSS para highlight
    const style = document.createElement('style');
    style.textContent = `
        .highlight {
            background: #fff3e0;
            padding: 2px 4px;
            border-radius: 4px;
            font-weight: bold;
            color: #e65100;
        }
    `;
    document.head.appendChild(style);
});