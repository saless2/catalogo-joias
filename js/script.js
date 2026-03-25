// Agora usamos uma lista (Array) para guardar os itens reais
let cartItems = [];
let cartTotalAmount = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadCartFromMemory();
});

function addToCart(itemName, itemPrice) {
    // Verifica se o item já existe no carrinho
    let existingItem = cartItems.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.qty += 1; // Se existir, só aumenta a quantidade
    } else {
        // Se não existir, adiciona o item na lista
        cartItems.push({ name: itemName, price: itemPrice, qty: 1 });
    }

    updateCart();
    showToast();
    closeModal();
}

function updateCart() {
    let totalQty = 0;
    cartTotalAmount = 0;

    // Recalcula os totais varrendo a lista de itens
    cartItems.forEach(item => {
        totalQty += item.qty;
        cartTotalAmount += (item.price * item.qty);
    });

    // Atualiza o Header
    document.getElementById('cartCount').innerText = totalQty;
    document.getElementById('cartTotal').innerText = cartTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('sidebarTotal').innerText = cartTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    renderCartItems(); // Desenha os itens na gaveta
    saveCartToMemory();
}

// Função que desenha o HTML dos itens dentro da gaveta
function renderCartItems() {
    const container = document.getElementById('cartItemsContainer');
    container.innerHTML = ''; // Limpa a gaveta antes de desenhar

    if (cartItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; margin-top: 20px;">Seu carrinho está vazio.</p>';
        return;
    }

    cartItems.forEach((item, index) => {
        container.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.qty}x ${item.name}</h4>
                    <div class="cart-item-price">R$ ${(item.price * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <button class="btn-remover" onclick="removeFromCart(${index})">Remover</button>
            </div>
        `;
    });
}

// Remove um item específico clicando em "Remover"
function removeFromCart(index) {
    cartItems.splice(index, 1);
    updateCart();
}

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

// --- Funções da Gaveta do Carrinho ---
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

    // Simulação da compra
    alert(`Redirecionando para o pagamento seguro...\nValor total a pagar: R$ ${cartTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

    // Limpa o carrinho após simular a compra
    cartItems = [];
    updateCart();
    closeCart();
}

// --- Funções do Modal ---
function openModal(itemName, itemPrice, imageSrc) {
    const modal = document.getElementById('productModal');
    document.getElementById('modalTitle').innerText = itemName;
    document.getElementById('modalPrice').innerText = 'R$ ' + itemPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    document.getElementById('modalImg').src = imageSrc;

    // Configura o botão do modal para adicionar o item correto
    const modalBtn = document.getElementById('modalBtnComprar');
    modalBtn.onclick = function() {
        addToCart(itemName, itemPrice);
    };

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Fecha o modal se o usuário clicar fora da caixa branca
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target == modal) {
        closeModal();
    }
}

// --- Função do Toast (Notificação) ---
function showToast() {
    const toast = document.getElementById("toast");
    toast.className = "toast show";

    // Remove a classe após 3 segundos para esconder o aviso
    setTimeout(function(){
        toast.className = toast.className.replace("show", "");
    }, 3000);
}