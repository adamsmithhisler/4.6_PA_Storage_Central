
/*
    Author: Adam Smithhisler
    Date: 11/1/2026
    Purpose: SDC260 Assignment 4.6 - Storage Central.
    Manage handmade craft products, shopping cart,
    stock availability, checkout, and browser storage
    using localStorage, sessionStorage, and cookies.
*/

/* =========================================
   PRODUCT DATA
========================================= */

const defaultProducts = [
    {
        id: 1,
        name: "Handcrafted Ceramic Mug",
        description: "A handmade ceramic mug with a rustic finish, perfect for coffee or tea.",
        price: 28.00,
        stock: 6,
        image: "images/mug.png",
        alt: "Handcrafted ceramic coffee mug"
    },
    {
        id: 2,
        name: "Macrame Wall Hanging",
        description: "A decorative woven wall hanging made with natural cotton cord.",
        price: 48.00,
        stock: 4,
        image: "images/macrame.png",
        alt: "Handmade macrame wall hanging"
    },
    {
        id: 3,
        name: "Artisan Scented Candle",
        description: "A hand-poured scented candle designed to bring warmth and comfort to any room.",
        price: 22.00,
        stock: 8,
        image: "images/candle.png",
        alt: "Hand-poured artisan scented candle"
    },
    {
        id: 4,
        name: "Handmade Coaster Set",
        description: "A set of handcrafted coasters that adds a natural touch to your home.",
        price: 18.00,
        stock: 10,
        image: "images/coasters.png",
        alt: "Set of handmade decorative coasters"
    },
    {
        id: 5,
        name: "Handwoven Scarf",
        description: "A soft, handmade scarf designed for comfort and everyday style.",
        price: 42.00,
        stock: 5,
        image: "images/scarf.png",
        alt: "Handwoven artisan scarf"
    },
    {
        id: 6,
        name: "Pressed Flower Bookmark",
        description: "A decorative handmade bookmark featuring a delicate botanical design.",
        price: 12.00,
        stock: 12,
        image: "images/bookmark.png",
        alt: "Handmade botanical bookmark"
    }
];

/* =========================================
   BROWSER STORAGE SETUP
========================================= */

// localStorage preserves inventory and cart data
// when the browser is closed and reopened.

const PRODUCTS_KEY = "willowPineProducts";
const CART_KEY = "willowPineCart";

// sessionStorage tracks how many products have
// been added during the current browser session.

const SESSION_KEY = "willowPineSessionAdds";

// Cookies remember the products last purchased.

const COOKIE_NAME = "willowPineLastPurchase";

// Retrieve saved inventory or use default products.

let products = JSON.parse(
    localStorage.getItem(PRODUCTS_KEY)
) || defaultProducts.map(product => ({ ...product }));

// Retrieve the saved shopping cart.

let cart = JSON.parse(
    localStorage.getItem(CART_KEY)
) || [];

// Retrieve the number of items added this session.

let sessionAddCount = Number(
    sessionStorage.getItem(SESSION_KEY)
) || 0;

/* =========================================
   DOM REFERENCES
========================================= */

const productGrid = document.getElementById("product-grid");

const cartItems = document.getElementById("cart-items");

const cartItemCount = document.getElementById("cart-item-count");

const cartTotal = document.getElementById("cart-total");

const headerCartCount = document.getElementById("header-cart-count");

const headerCartTotal = document.getElementById("header-cart-total");

const checkoutBtn = document.getElementById("checkout-btn");

const clearCartBtn = document.getElementById("clear-cart-btn");

const sessionCountDisplay = document.getElementById("session-add-count");

const lastPurchasedDisplay = document.getElementById("last-purchased-items");

const notification = document.getElementById("cart-notification");

const outOfStockTooltip = document.getElementById("out-of-stock-tooltip");

/* =========================================
   HELPER FUNCTIONS
========================================= */

// Format prices consistently throughout the store.

function formatPrice(amount) {
    return `$${amount.toFixed(2)}`;
}

// Find a product using its unique ID.

function findProduct(id) {
    return products.find(product => product.id === id);
}

// Count the total number of products in the cart.

function getCartCount() {
    return cart.reduce(
        (total, item) => total + item.quantity,
        0
    );
}

// Calculate the total cost of the cart.

function getCartTotal() {
    return cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
}

/* =========================================
   SAVE INVENTORY AND CART
   localStorage
========================================= */

function saveData() {

    // Save updated product inventory.

    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(products)
    );

    // Save the shopping cart.

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}

/* =========================================
   TRACK SESSION ADDITIONS
   sessionStorage
========================================= */

function updateSessionCount() {

    sessionCountDisplay.textContent = sessionAddCount;
}

function recordSessionAddition() {

    // Increase the session counter whenever
    // a product is successfully added.

    sessionAddCount++;

    // Preserve the count during this browsing session.

    sessionStorage.setItem(
        SESSION_KEY,
        String(sessionAddCount)
    );

    updateSessionCount();
}

/* =========================================
   COOKIE FUNCTIONS
   LAST PURCHASED PRODUCTS
========================================= */

// Save the most recent purchase for 30 days.

function saveLastPurchase(purchasedItems) {

    const purchaseData = purchasedItems.map(item => ({
        name: item.name,
        quantity: item.quantity
    }));

    const cookieValue = encodeURIComponent(
        JSON.stringify(purchaseData)
    );

    const maxAge = 60 * 60 * 24 * 30;

    document.cookie =
        `${COOKIE_NAME}=${cookieValue}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

// Retrieve the last purchase cookie.

function getLastPurchase() {

    const cookies = document.cookie.split(";");

    const savedCookie = cookies
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith(`${COOKIE_NAME}=`));

    if (!savedCookie) {
        return null;
    }

    try {

        const storedValue = savedCookie.substring(
            COOKIE_NAME.length + 1
        );

        return JSON.parse(
            decodeURIComponent(storedValue)
        );

    } catch (error) {

        console.error("Unable to read purchase cookie:", error);
        return null;
    }
}

// Display the previous purchase on the storefront.

function displayLastPurchase() {

    const lastPurchase = getLastPurchase();

    if (!lastPurchase || lastPurchase.length === 0) {

        lastPurchasedDisplay.textContent =
            "No previous purchases recorded.";

        return;
    }

    const purchasedNames = lastPurchase.map(
        item => `${item.name} (x${item.quantity})`
    );

    lastPurchasedDisplay.textContent =
        purchasedNames.join(", ");
}

/* =========================================
   ADD TO CART NOTIFICATION
========================================= */

let notificationTimeout;

function showNotification() {

    // Visual indication required by the assignment:
    // A temporary notification confirms a successful
    // Add to Cart action.

    notification.classList.add("show");

    clearTimeout(notificationTimeout);

    notificationTimeout = setTimeout(() => {

        notification.classList.remove("show");

    }, 1800);
}

/* =========================================
   OUT OF STOCK TOOLTIP
========================================= */

function showOutOfStockTooltip(event) {

    outOfStockTooltip.style.left =
        `${event.clientX + 15}px`;

    outOfStockTooltip.style.top =
        `${event.clientY + 15}px`;

    outOfStockTooltip.classList.add("show");
}

function hideOutOfStockTooltip() {

    outOfStockTooltip.classList.remove("show");
}

/* =========================================
   DISPLAY HANDMADE PRODUCTS
========================================= */

function displayProducts() {

    // Clear the existing product cards.

    productGrid.innerHTML = "";

    // Build one card for each product.

    products.forEach(product => {

        const card = document.createElement("article");

        card.classList.add("product-card");

        // Apply the out-of-stock appearance.

        if (product.stock === 0) {

            card.classList.add("out-of-stock");

            card.addEventListener(
                "mousemove",
                showOutOfStockTooltip
            );

            card.addEventListener(
                "mouseleave",
                hideOutOfStockTooltip
            );
        }

        // Add the product image, description,
        // price, stock quantity, and button.

        card.innerHTML = `
            <img
                src="${product.image}"
                alt="${product.alt}"
            >

            <div class="product-content">

                <h3>${product.name}</h3>

                <p>${product.description}</p>

                <p class="product-price">
                    ${formatPrice(product.price)}
                </p>

                <p class="stock">
                    Available: ${product.stock}
                </p>

                <button
                    type="button"
                    class="add-to-cart-btn"
                    data-add-id="${product.id}"
                    ${product.stock === 0 ? "disabled" : ""}
                >
                    ${product.stock === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                </button>

            </div>
        `;

        productGrid.appendChild(card);
    });
}

/* =========================================
   ADD A PRODUCT TO THE CART
========================================= */

function addToCart(id) {

    const product = findProduct(id);

    // Prevent adding a product with no stock.

    if (!product || product.stock <= 0) {
        return;
    }

    // Reduce available stock.

    product.stock--;

    // Check whether the item is already in the cart.

    const existingItem = cart.find(
        item => item.id === id
    );

    if (existingItem) {

        // Increase quantity for an existing item.

        existingItem.quantity++;

    } else {

        // Add a new product with quantity one.

        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    // Save persistent inventory and cart information.

    saveData();

    // Record this addition in sessionStorage.

    recordSessionAddition();

    // Refresh the website.

    displayProducts();
    displayCart();

    // Confirm the successful action.

    showNotification();
}

/* =========================================
   CHANGE CART ITEM QUANTITY
========================================= */

function updateQuantity(id, change) {

    const cartItem = cart.find(
        item => item.id === id
    );

    const product = findProduct(id);

    if (!cartItem || !product) {
        return;
    }

    // Increase quantity if inventory is available.

    if (change > 0) {

        if (product.stock <= 0) {
            return;
        }

        cartItem.quantity++;
        product.stock--;

        // Count successful increases as additions.

        recordSessionAddition();
        showNotification();
    }

    // Decrease quantity and restore inventory.

    if (change < 0) {

        cartItem.quantity--;
        product.stock++;
    }

    // Remove an item when its quantity reaches zero.

    if (cartItem.quantity <= 0) {

        cart = cart.filter(
            item => item.id !== id
        );
    }

    // Save and refresh the displays.

    saveData();

    displayProducts();
    displayCart();
}

/* =========================================
   DISPLAY SHOPPING CART
========================================= */

function displayCart() {

    // Clear the previous cart display.

    cartItems.innerHTML = "";

    // Calculate item count and total cost.

    const totalItems = getCartCount();
    const totalCost = getCartTotal();

    // Display an empty-cart message when necessary.

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="empty-cart-message">
                Your shopping cart is empty.
            </p>
        `;

    } else {

        // Build each shopping cart item.

        cart.forEach(item => {

            const product = findProduct(item.id);

            const itemSubtotal =
                item.price * item.quantity;

            const section = document.createElement("section");

            section.classList.add("cart-item");

            section.innerHTML = `
                <div class="cart-item-details">

                    <h3>${item.name}</h3>

                    <p>
                        Price: ${formatPrice(item.price)}
                    </p>

                    <p>
                        Subtotal:
                        ${formatPrice(itemSubtotal)}
                    </p>

                </div>

                <div class="quantity-controls">

                    <button
                        type="button"
                        class="quantity-btn decrease-btn"
                        data-cart-action="decrease"
                        data-cart-id="${item.id}"
                        aria-label="Decrease quantity of ${item.name}"
                    >
                        -
                    </button>

                    <span class="quantity-value">
                        ${item.quantity}
                    </span>

                    <button
                        type="button"
                        class="quantity-btn increase-btn"
                        data-cart-action="increase"
                        data-cart-id="${item.id}"
                        aria-label="Increase quantity of ${item.name}"
                        ${!product || product.stock === 0
                            ? "disabled"
                            : ""}
                    >
                        +
                    </button>

                </div>
            `;

            cartItems.appendChild(section);
        });
    }

    // Update totals inside the cart panel.

    cartItemCount.textContent = totalItems;

    cartTotal.textContent = formatPrice(totalCost);

    // Update the shopping cart summary in the header.

    headerCartCount.textContent = totalItems;

    headerCartTotal.textContent = formatPrice(totalCost);

    // Enable or disable checkout and clear buttons.

    checkoutBtn.disabled = cart.length === 0;

    clearCartBtn.disabled = cart.length === 0;
}

/* =========================================
   CLEAR SHOPPING CART
========================================= */

function clearCart() {

    // Restore all reserved quantities to inventory.

    cart.forEach(item => {

        const product = findProduct(item.id);

        if (product) {

            product.stock += item.quantity;
        }
    });

    // Remove all shopping cart entries.

    cart = [];

    // Save the restored inventory and empty cart.

    saveData();

    // Refresh the storefront and shopping cart.

    displayProducts();
    displayCart();
}

/* =========================================
   CHECKOUT
========================================= */

function checkout() {

    // Prevent checkout when the cart is empty.

    if (cart.length === 0) {

        alert("Your shopping cart is empty.");
        return;
    }

    // Calculate purchase information.

    const totalItems = getCartCount();

    const totalCost = getCartTotal();

    // Display the required checkout alert.

    alert(
        `Purchase Confirmed!\n\n` +
        `Total Items Purchased: ${totalItems}\n` +
        `Total Cost: ${formatPrice(totalCost)}\n\n` +
        `Thank you for shopping at Willow & Pine Crafts!`
    );

    // Store purchased product names in a cookie.

    saveLastPurchase(cart);

    // Purchased products stay deducted from inventory.
    // Do not restore stock during checkout.

    // Clear the completed shopping cart.

    cart = [];

    // Save the empty cart and remaining inventory.

    saveData();

    // Refresh all relevant displays.

    displayProducts();
    displayCart();
    displayLastPurchase();
}

/* =========================================
   PRODUCT BUTTON EVENT LISTENER
========================================= */

// Handle all Add to Cart buttons through
// the product-grid container.

productGrid.addEventListener("click", event => {

    const button = event.target.closest(
        "[data-add-id]"
    );

    if (!button || button.disabled) {
        return;
    }

    const id = Number(button.dataset.addId);

    addToCart(id);
});

/* =========================================
   CART QUANTITY EVENT LISTENER
========================================= */

// Handle quantity buttons inside the cart panel.

cartItems.addEventListener("click", event => {

    const button = event.target.closest(
        "[data-cart-action]"
    );

    if (!button || button.disabled) {
        return;
    }

    const id = Number(button.dataset.cartId);

    const action = button.dataset.cartAction;

    if (action === "increase") {

        updateQuantity(id, 1);

    } else if (action === "decrease") {

        updateQuantity(id, -1);
    }
});

/* =========================================
   CHECKOUT AND CLEAR CART BUTTONS
========================================= */

checkoutBtn.addEventListener("click", checkout);

clearCartBtn.addEventListener("click", clearCart);

/* =========================================
   INITIALIZATION
========================================= */

// Make sure product and cart data are available
// in localStorage for browser Console testing.

saveData();

// Initialize session storage and its display.

sessionStorage.setItem(
    SESSION_KEY,
    String(sessionAddCount)
);

updateSessionCount();

// Render the storefront products.

displayProducts();

// Render saved shopping cart information.

displayCart();

// Display previously purchased items from cookies.

displayLastPurchase();
