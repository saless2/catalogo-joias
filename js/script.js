// ==========================================
// VARIÁVEIS GLOBAIS
// ==========================================
let cartItems = [];
let cartTotalAmount = 0;
let slideIndex = 1;
let slideInterval;

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromMemory();
    iniciarCarrossel();
});

// ==========================================
// LÓGICA DO CARRINHO (ADICIONAR/ATUALIZAR)
// ==========================================
function addToCart(itemName, itemPrice) {
    let existingItem = cartItems.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cartItems.push({ name: itemName, price: itemPrice, qty: 1 });
    }

    updateCart();
    showToast();
    closeModal();
}

function updateCart() {
    let totalQty = 0;
    cartTotalAmount = 0;

    cartItems.forEach(item => {
        totalQty += item.qty;
        cartTotalAmount += (item.price * item.qty);
    });

    document.getElementById('cartCount').innerText = totalQty;
    document.getElementById('cartTotal').innerText = cartTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('sidebarTotal').innerText = cartTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    renderCartItems();
    saveCartToMemory();
}

// ==========================================
// DESENHAR ITENS NA GAVETA (COM BOTÕES + E -)
// ==========================================
function renderCartItems() {
    const container = document.getElementById('cartItemsContainer');
    container.innerHTML = '';

    if (cartItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; margin-top: 20px;">Seu carrinho está vazio.</p>';
        return;
    }

    cartItems.forEach((item, index) => {
        container.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info" style="flex-grow: 1;">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">R$ ${(item.price * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>

                <div class="cart-qty-controls" style="display: flex; align-items: center; gap: 10px; margin-left: 15px;">
                    <button class="btn-qty" onclick="diminuirQuantidade(${index})" style="background: #eee; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer; font-weight: bold;">-</button>
                    <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.qty}</span>
                    <button class="btn-qty" onclick="aumentarQuantidade(${index})" style="background: #eee; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer; font-weight: bold;">+</button>
                </div>
            </div>
        `;
    });
}

// Controles de quantidade na gaveta
function aumentarQuantidade(index) {
    cartItems[index].qty += 1;
    updateCart();
}

function diminuirQuantidade(index) {
    if (cartItems[index].qty > 1) {
        cartItems[index].qty -= 1;
    } else {
        cartItems.splice(index, 1);
    }
    updateCart();
}

// ==========================================
// MEMÓRIA LOCAL (LOCALSTORAGE)
// ==========================================
function saveCartToMemory() {
    localStorage.setItem('jewelryStoreCartData', JSON.stringify(cartItems));
}

function loadCartFromMemory() {
    const savedData = localStorage.getItem('jewelryStoreCartData');
    if (savedData) {
        cartItems = JSON.parse(savedData);
        updateCart();
    }
}

// ==========================================
// ABRIR/FECHAR GAVETA DO CARRINHO
// ==========================================
function openCart() {
    document.getElementById('cartSidebar').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
}

function finalizePurchase() {
    if (cartItems.length === 0) {
        alert("Seu carrinho está vazio! Adicione algumas joias primeiro.");
        return;
    }
    alert(`Redirecionando para o pagamento seguro...\nValor total a pagar: R$ ${cartTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    cartItems = [];
    updateCart();
    closeCart();
}

// ==========================================
// FILTROS, PESQUISA E COMPARTILHAMENTO
// ==========================================
function filtrarCategoria(categoria, botaoClicado) {
    const botoes = document.querySelectorAll('.filter-btn');
    botoes.forEach(btn => btn.classList.remove('active'));
    botaoClicado.classList.add('active');

    const produtos = document.querySelectorAll('.card');
    produtos.forEach(produto => {
        const categoriaProduto = produto.getAttribute('data-category');
        if (categoria === 'todos' || categoriaProduto === categoria) {
            produto.style.display = 'block';
        } else {
            produto.style.display = 'none';
        }
    });
}

function pesquisarProdutos() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    const produtos = document.querySelectorAll('.card');

    produtos.forEach(produto => {
        const nomeProduto = document.getAttribute('data-nome');
        // Checagem de segurança caso o elemento não tenha data-nome
        if(nomeProduto) {
             if (nomeProduto.toLowerCase().includes(termo)) {
                 produto.style.display = 'block';
             } else {
                 produto.style.display = 'none';
             }
        }
    });
}

function compartilharCatalogo() {
    if (navigator.share) {
        navigator.share({
            title: 'Nosso Catálogo de Joias',
            text: 'Dá uma olhada nos lançamentos em Prata 925!',
            url: window.location.href
        }).catch((error) => console.log('Erro ao compartilhar', error));
    } else {
        alert('Copie o link para compartilhar com seus clientes:\n\n' + window.location.href);
    }
}

// ==========================================
// CARROSSEL (BANNER ROTATIVO)
// ==========================================
function iniciarCarrossel() {
    mostrarSlides(slideIndex);
    slideInterval = setInterval(function() { mudarSlide(1); }, 5000);
}

function mudarSlide(n) {
    mostrarSlides(slideIndex += n);
    clearInterval(slideInterval);
    slideInterval = setInterval(function() { mudarSlide(1); }, 5000);
}

function mostrarSlides(n) {
    let i;
    let slides = document.getElementsByClassName("carousel-slide");

    if (slides.length === 0) return;

    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].className = slides[i].className.replace(" active", "");
    }
    slides[slideIndex-1].className += " active";
}

// ==========================================
// MODAL DE PRODUTO
// ==========================================
function openModal(itemName, itemPrice, imageSrc) {
    const modal = document.getElementById('productModal');
    document.getElementById('modalTitle').innerText = itemName;
    document.getElementById('modalPrice').innerText = 'R$ ' + itemPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    document.getElementById('modalImg').src = imageSrc;

    const modalBtn = document.getElementById('modalBtnComprar');
    modalBtn.onclick = function() {
        addToCart(itemName, itemPrice);
    };

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target == modal) {
        closeModal();
    }
}

// ==========================================
// TOAST (NOTIFICAÇÃO FLUTUANTE)
// ==========================================
function showToast() {
    const toast = document.getElementById("toast");
    toast.className = "toast show";
    setTimeout(function(){
        toast.className = toast.className.replace("show", "");
    }, 3000);
}