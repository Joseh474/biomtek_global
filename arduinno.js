// Initialize an empty cart
let cart = [];

// Function to add a product to the cart
function addToCart(productName) {
    const product = cart.find(item => item.name === productName);

    if (product) {
        product.quantity += 1;
    } else {
        cart.push({ name: productName, quantity: 1 });
    }

    updateCartDisplay();
    alert(`${productName} added to your cart.`);
}

// Function to clear the cart
function clearCart() {
    cart = [];
    updateCartDisplay();
    alert('Cart has been cleared.');
}

// Function to remove a specific item from the cart
function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCartDisplay();
}

// Function to update the cart display
function updateCartDisplay() {
    const cartDisplay = document.getElementById('cart-display');

    if (cart.length === 0) {
        cartDisplay.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        cartDisplay.innerHTML = `
            <ul>
                ${cart.map(item => `
                    <li>
                        ${item.name} (x${item.quantity})
                        <button onclick="removeFromCart('${item.name}')">Remove</button>
                    </li>`).join('')}
            </ul>
        `;
    }
}

// Function to submit the cart data
function submitCart() {
    if (cart.length === 0) {
        alert('Your cart is empty! Add items before submitting.');
        return;
    }

    const cartDataInput = document.getElementById('cart-data');
    cartDataInput.value = JSON.stringify(cart);

    const form = document.getElementById('cart-form');
    form.submit();
}

// Populate categories dynamically (if needed)
function populateCategories() {
    const categories = ['Arduino Boards', 'Sensors', 'Components', 'Kits'];
    const categorySection = document.getElementById('categories');
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.onclick = () => filterCategory(category.toLowerCase());
        categorySection.appendChild(button);
    });

    // Add "All" button for showing all products
    const allButton = document.createElement('button');
    allButton.textContent = 'All';
    allButton.onclick = () => filterCategory('all');
    categorySection.appendChild(allButton);
}

// On document load, populate categories and set up initial cart display
document.addEventListener('DOMContentLoaded', () => {
    populateCategories();
    updateCartDisplay();
});
