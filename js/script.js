// ==========================================
// VARIÁVEIS GLOBAIS E ESTADO
// ==========================================
let cartItems = [];
let cartTotalAmount = 0;
let slideIndex = 1;
let slideInterval;
let codigoPedidoAtual = "";

// Variações selecionadas no Modal
let variacaoCor = "Prata";
let variacaoTamanho = "";
let produtoAtualCategoria = "";

document.addEventListener('DOMContentLoaded', () => {
    loadCartFromMemory();
    iniciarCarrossel();
});

// ==========================================
// MODAL DE PRODUTO E VARIAÇÕES
// ==========================================
function openModal(itemName, itemPrice, imageSrc) {
    const modal = document.getElementById('productModal');

    // Reseta as escolhas ao abrir a janela
    variacaoCor = "Prata";
    variacaoTamanho = "";
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.color-btn[title="Prata"]').classList.add('active');
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));

    // Descobre a categoria lendo o HTML do card
    const card = document.querySelector(`.card[data-nome="${itemName}"]`);
    produtoAtualCategoria = card ? card.getAttribute('data-category') : 'outros';

    // Mostra as opções apenas se for anel
    if (produtoAtualCategoria === 'aneis') {
        document.getElementById('modalOptions').style.display = 'block';
    } else {
        document.getElementById('modalOptions').style.display = 'none';
        // Se não for anel, define tamanho como "Único" para o carrinho não dar erro
        variacaoTamanho = "Único";
    }

    document.getElementById('modalTitle').innerText = itemName;
    document.getElementById('modalPrice').innerText = 'R$ ' + itemPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    document.getElementById('modalImg').src = imageSrc;

    const modalBtn = document.getElementById('modalBtnComprar');
    modalBtn.onclick = function() {
        addToCart(itemName, itemPrice, imageSrc);
    };

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == document.getElementById('productModal')) { closeModal(); }
}

// Funções de clique nas cores e tamanhos
function selecionarCor(cor, btn) {
    variacaoCor = cor;
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function selecionarTamanho(tamanho, btn) {
    if (btn.classList.contains('disabled')) return;
    variacaoTamanho = tamanho;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ==========================================
// LÓGICA DO CARRINHO (ADICIONAR/ATUALIZAR)
// ==========================================
function addToCart(itemName, itemPrice, itemImage) {
    // Validação de segurança
    if (produtoAtualCategoria === 'aneis' && variacaoTamanho === "") {
        alert("Por favor, selecione o aro do anel antes de adicionar ao carrinho!");
        return;
    }

    // Procura se EXATAMENTE a mesma joia (mesma cor e mesmo aro) já está no carrinho
    let existingItem = cartItems.find(item =>
        item.name === itemName && item.color === variacaoCor && item.size === variacaoTamanho
    );

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cartItems.push({
            name: itemName, price: itemPrice, qty: 1, image: itemImage,
            color: variacaoCor, size: variacaoTamanho
        });
    }

    updateCart();
    showToast();
    closeModal();
}

function updateCart() {
    let totalQty = 0; cartTotalAmount = 0;
    cartItems.forEach(item => {
        totalQty += item.qty; cartTotalAmount += (item.price * item.qty);
    });

    document.getElementById('cartCount').innerText = totalQty;
    document.getElementById('cartTotal').innerText = cartTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('sidebarTotal').innerText = cartTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    renderCartItems(); saveCartToMemory();
}

// ==========================================
// DESENHAR ITENS NA GAVETA (Com Detalhes)
// ==========================================
function renderCartItems() {
    const container = document.getElementById('cartItemsContainer');
    container.innerHTML = '';

    if (cartItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; margin-top: 20px;">Seu carrinho está vazio.</p>'; return;
    }

    cartItems.forEach((item, index) => {
        let detalhesText = "";
        if (item.size !== "Único") {
            detalhesText = `<span style="display:block; font-size:11px; color:#aaa; margin-bottom:5px;">Cor: ${item.color} | Aro: ${item.size}</span>`;
        } else {
            // Se for colar/pulseira e tiver escolhido a cor Prata (padrão) não precisa mostrar.
            // Mostra apenas se escolheu Dourado/Rosé (caso você expanda as cores para outras categorias futuramente)
            if(item.color !== "Prata") {
                detalhesText = `<span style="display:block; font-size:11px; color:#aaa; margin-bottom:5px;">Cor: ${item.color}</span>`;
            }
        }

        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 15px; border: 1px solid #444;">
                <div class="cart-item-info" style="flex-grow: 1;">
                    <h4>${item.name}</h4>
                    ${detalhesText}
                    <div class="cart-item-price">R$ ${(item.price * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>

                <div class="cart-qty-controls" style="display: flex; align-items: center; gap: 10px; margin-left: 15px;">
                    <button class="btn-qty" onclick="diminuirQuantidade(${index})" style="background: transparent; border: 1px solid var(--card-border); color: var(--text-light); width: 25px; height: 25px; border-radius: 4px; cursor: pointer; font-weight: bold;">-</button>
                    <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.qty}</span>
                    <button class="btn-qty" onclick="aumentarQuantidade(${index})" style="background: transparent; border: 1px solid var(--card-border); color: var(--text-light); width: 25px; height: 25px; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
                </div>
            </div>
        `;
    });
}

function aumentarQuantidade(index) { cartItems[index].qty += 1; updateCart(); }
function diminuirQuantidade(index) {
    if (cartItems[index].qty > 1) { cartItems[index].qty -= 1; } else { cartItems.splice(index, 1); }
    updateCart();
}

function saveCartToMemory() { localStorage.setItem('jewelryStoreCartData', JSON.stringify(cartItems)); }
function loadCartFromMemory() {
    const savedData = localStorage.getItem('jewelryStoreCartData');
    if (savedData) { cartItems = JSON.parse(savedData); updateCart(); }
}

function openCart() { document.getElementById('cartSidebar').classList.add('open'); document.getElementById('cartOverlay').classList.add('open'); }
function closeCart() { document.getElementById('cartSidebar').classList.remove('open'); document.getElementById('cartOverlay').classList.remove('open'); }

// ==========================================
// CHECKOUT E WHATSAPP
// ==========================================
function finalizePurchase() {
    if (cartItems.length === 0) { alert("Seu carrinho está vazio!"); return; }
    closeCart();

    codigoPedidoAtual = Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(100 + Math.random() * 900);
    document.getElementById('checkoutCodigo').innerText = codigoPedidoAtual;
    document.getElementById('checkoutData').innerText = new Date().toLocaleDateString('pt-BR');
    document.getElementById('checkoutTotalValue').innerText = 'R$ ' + cartTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    const container = document.getElementById('checkoutItemsContainer');
    container.innerHTML = '';

    cartItems.forEach(item => {
        let subtotal = item.price * item.qty;
        let detalhesCheckout = item.size !== "Único" ? `Cor: ${item.color} | Aro: ${item.size}` : `Cor: ${item.color}`;

        container.innerHTML += `
            <div class="checkout-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="checkout-item-details">
                    <p class="checkout-item-name">${item.name}</p>
                    <span class="checkout-item-qty" style="display:block; font-size:12px; color:#888; margin-top:3px;">${detalhesCheckout}</span>
                    <span class="checkout-item-qty">(${item.qty} itens)</span>
                </div>
                <div class="checkout-item-price">R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
        `;
    });
    document.getElementById('checkoutScreen').style.display = 'block';
}

function fecharCheckout() { document.getElementById('checkoutScreen').style.display = 'none'; }

function enviarParaWhatsAppReal() {
    const numeroWhatsApp = "5511966230844";
    let mensagem = `*REI DA PRATA | PEDIDO #${codigoPedidoAtual}*\n\n`;

    cartItems.forEach(item => {
        let detalhesWhats = item.size !== "Único" ? `(${item.color}, Aro ${item.size})` : `(${item.color})`;
        mensagem += `- *${item.qty}x* ${item.name} ${detalhesWhats}\n`;
    });

    mensagem += `\n*TOTAL: R$ ${cartTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
    mensagem += `_Pedido gerado pelo catálogo digital._`;

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');

    cartItems = []; updateCart(); fecharCheckout();
}

// ==========================================
// OUTROS (FILTROS, CARROSSEL, TOAST, ETC)
// ==========================================
function filtrarCategoria(categoria, botaoClicado) {
    const botoes = document.querySelectorAll('.filter-btn');
    botoes.forEach(btn => btn.classList.remove('active'));
    botaoClicado.classList.add('active');

    const produtos = document.querySelectorAll('.card');
    produtos.forEach(produto => {
        const categoriaProduto = produto.getAttribute('data-category');
        if (categoria === 'todos' || categoriaProduto === categoria) { produto.style.display = 'block'; } else { produto.style.display = 'none'; }
    });
}

function pesquisarProdutos() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    const produtos = document.querySelectorAll('.card');
    produtos.forEach(produto => {
        const nomeProduto = produto.getAttribute('data-nome');
        if(nomeProduto) {
             if (nomeProduto.toLowerCase().includes(termo)) { produto.style.display = 'block'; } else { produto.style.display = 'none'; }
        }
    });
}

function compartilharCatalogo() {
    if (navigator.share) { navigator.share({ title: 'Nosso Catálogo de Joias', text: 'Lançamentos Rei da Prata!', url: window.location.href }).catch(err => console.log('Erro', err));
    } else { alert('Copie o link:\n\n' + window.location.href); }
}

function iniciarCarrossel() { mostrarSlides(slideIndex); slideInterval = setInterval(function() { mudarSlide(1); }, 5000); }
function mudarSlide(n) { mostrarSlides(slideIndex += n); clearInterval(slideInterval); slideInterval = setInterval(function() { mudarSlide(1); }, 5000); }
function mostrarSlides(n) {
    let i; let slides = document.getElementsByClassName("carousel-slide");
    if (slides.length === 0) return;
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) { slides[i].className = slides[i].className.replace(" active", ""); }
    slides[slideIndex-1].className += " active";
}

function showToast() {
    const toast = document.getElementById("toast"); toast.className = "toast show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}