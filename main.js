const products = [
    { id: 'bid12', name: 'Bidón x 12 litros', qty: 0 },
    { id: 'bid20', name: 'Bidón x 20 litros', qty: 0 },
    { id: 'hie2', name: 'Hielo x 2 kilos', qty: 0 },
    { id: 'hie10', name: 'Hielo x 10 kilos', qty: 0 },
    { id: 'bol4', name: 'Bolsón x 4 unidades', qty: 0 }
];

let customerLocation = null;

const productsContainer = document.getElementById('products-container');
const btnOrder = document.getElementById('btnOrder');
const nameInput = document.getElementById('customerName');
const addressInput = document.getElementById('customerAddress');
const btnLocation = document.getElementById('btnLocation');
const locationStatus = document.getElementById('locationStatus');
const itemsCount = document.getElementById('itemsCount');
const btnRequestWeb = document.getElementById('btnRequestWeb');

// Render products
function renderProducts() {
    productsContainer.innerHTML = '';
    products.forEach((product) => {
        const card = document.createElement('div');
        card.className = `product-card ${product.qty > 0 ? 'active' : ''}`;
        card.innerHTML = `
            <div class="product-info">
                <div class="product-name">${product.name}</div>
            </div>
            <div class="quantity-control">
                <button class="btn-qty btn-minus" data-id="${product.id}"><i class="fas fa-minus"></i></button>
                <div class="qty-value">${product.qty}</div>
                <button class="btn-qty btn-plus" data-id="${product.id}"><i class="fas fa-plus"></i></button>
            </div>
        `;
        productsContainer.appendChild(card);
    });

    // Add event listeners
    document.querySelectorAll('.btn-minus').forEach(btn => {
        btn.addEventListener('click', (e) => updateQty(e.currentTarget.dataset.id, -1));
    });
    document.querySelectorAll('.btn-plus').forEach(btn => {
        btn.addEventListener('click', (e) => updateQty(e.currentTarget.dataset.id, 1));
    });
}

function updateQty(id, change) {
    const product = products.find(p => p.id === id);
    if (product) {
        product.qty += change;
        if (product.qty < 0) product.qty = 0;

        // Haptic feedback if supported
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }

        renderProducts();
        updateSummary();
        checkOrderValidation();
    }
}

function updateSummary() {
    const totalItems = products.reduce((sum, p) => sum + p.qty, 0);
    itemsCount.textContent = `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;

    // Add simple animation
    itemsCount.style.transform = 'scale(1.1)';
    setTimeout(() => {
        itemsCount.style.transform = 'scale(1)';
    }, 200);
}

function checkOrderValidation() {
    // La validación ahora se hace al presionar el botón de enviar
}

nameInput.addEventListener('input', checkOrderValidation);
addressInput.addEventListener('input', checkOrderValidation);

// Request Web Link
if (btnRequestWeb) {
    btnRequestWeb.addEventListener('click', async () => {
        const link = "https://wold-marketplaces.github.io/Agua-purificada-Del-Norte-App/";
        
        try {
            await navigator.clipboard.writeText(link);
            // Cambiar texto del botón temporalmente
            const originalText = btnRequestWeb.innerHTML;
            btnRequestWeb.innerHTML = '<i class="fas fa-check" style="font-size: 1.2em;"></i> ¡Copiado!';
            btnRequestWeb.style.background = '#128c7e';
            
            setTimeout(() => {
                btnRequestWeb.innerHTML = originalText;
                btnRequestWeb.style.background = '#25D366';
            }, 2000);
        } catch (err) {
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = link;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            const originalText = btnRequestWeb.innerHTML;
            btnRequestWeb.innerHTML = '<i class="fas fa-check" style="font-size: 1.2em;"></i> ¡Copiado!';
            btnRequestWeb.style.background = '#128c7e';
            
            setTimeout(() => {
                btnRequestWeb.innerHTML = originalText;
                btnRequestWeb.style.background = '#25D366';
            }, 2000);
        }
    });
}

// Geolocation
btnLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
        locationStatus.textContent = "Tu navegador no soporta geolocalización.";
        locationStatus.className = "location-status";
        return;
    }

    btnLocation.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Obteniendo ubicación...';
    btnLocation.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            customerLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            btnLocation.innerHTML = '<i class="fas fa-check-circle"></i> Ubicación obtenida';
            btnLocation.classList.add('active');
            locationStatus.textContent = "Ubicación lista para enviar al repartidor.";
            locationStatus.className = "location-status success";
            btnLocation.disabled = false;
        },
        (error) => {
            btnLocation.innerHTML = '<i class="fas fa-location-crosshairs"></i> Compartir mi ubicación actual';
            btnLocation.disabled = false;
            let msg = "Error al obtener ubicación.";
            if (error.code === 1) msg = "Por favor, permite el acceso a tu ubicación en tu navegador para usar esta función.";
            else if (window.location.protocol === 'file:') msg = "El GPS requiere que accedas desde un enlace válido o servidor (HTTPS), no funciona directamente desde el archivo.";

            locationStatus.textContent = msg;
            locationStatus.className = "location-status";
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
});

// Order Generation
btnOrder.addEventListener('click', () => {
    const hasItems = products.some(p => p.qty > 0);
    if (!hasItems) {
        alert("¡Hola! Por favor, selecciona al menos un producto antes de enviar.");
        return;
    }

    if (nameInput.value.trim().length === 0) {
        alert("Por favor, ingresa tu Nombre y Apellido.");
        nameInput.focus();
        return;
    }

    if (addressInput.value.trim().length === 0 && !customerLocation) {
        alert("Por favor, ingresa tu Dirección o Referencia, o bien comparte tu ubicación GPS.");
        addressInput.focus();
        return;
    }

    // Both numbers are provided, using mobile number for WhatsApp
    const WHATSAPP_NUMBER = "5491134724532";

    let message = `*NUEVO PEDIDO - Agua Purificada Del Norte* 💧\n\n`;

    message += `👤 *Cliente:* ${nameInput.value.trim()}\n`;
    message += `📍 *Dirección:* ${addressInput.value.trim()}\n\n`;

    message += `*📝 Detalle del pedido:*\n`;
    products.filter(p => p.qty > 0).forEach(product => {
        message += `✅ ${product.qty}x ${product.name}\n`;
    });

    if (customerLocation) {
        const mapsUrl = `https://www.google.com/maps?q=${customerLocation.lat},${customerLocation.lng}`;
        message += `\n*🗺️ Ubicación GPS exacta para el repartidor:* \n${mapsUrl}`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Redirect
    window.open(whatsappUrl, '_blank');
});

// Initialize
renderProducts();
updateSummary();
checkOrderValidation();
