document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-button');
    const productCards = document.querySelectorAll('.product-card');
    const productSections = document.querySelectorAll('.category-section');

    function performSearch(searchTerm) {
        searchTerm = searchTerm.toLowerCase().trim();
        let hasResults = false;

        productCards.forEach(card => {
            const productName = card.querySelector('h3').textContent.toLowerCase();
            const productDetails = card.querySelector('.product-details')?.textContent.toLowerCase() || '';
            const productDescription = card.querySelector('p:not(.price)')?.textContent.toLowerCase() || '';
            
            const matchesSearch = 
                productName.includes(searchTerm) || 
                productDetails.includes(searchTerm) || 
                productDescription.includes(searchTerm);

            // Show/hide products
            card.style.display = matchesSearch ? 'flex' : 'none';
            
            if (matchesSearch) hasResults = true;
        });

        // Show/hide category sections based on whether they have visible products
        productSections.forEach(section => {
            const visibleProducts = section.querySelectorAll('.product-card[style="display: flex"]');
            section.style.display = visibleProducts.length > 0 ? 'block' : 'none';
        });

        // Show no results message
        updateNoResultsMessage(hasResults, searchTerm);
    }

    function updateNoResultsMessage(hasResults, searchTerm) {
        let noResultsMessage = document.querySelector('.no-results-message');
        
        if (!hasResults && searchTerm !== '') {
            if (!noResultsMessage) {
                noResultsMessage = document.createElement('div');
                noResultsMessage.className = 'no-results-message';
                document.querySelector('#product-categories').appendChild(noResultsMessage);
            }
            
            noResultsMessage.innerHTML = `
                <p>No products found matching "${searchTerm}"</p>
                <div class="suggestion">
                    <p>Suggestions:</p>
                    <ul>
                        <li>Check your spelling</li>
                        <li>Try more general terms</li>
                        <li>Try different keywords</li>
                    </ul>
                    <button class="contact-support">Contact Support</button>
                </div>
            `;
        } else if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }

    // Real-time search as user types
    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
        highlightSearchTerms(e.target.value);
    });

    // Search on button click
    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
        highlightSearchTerms(searchInput.value);
    });

    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
            highlightSearchTerms(searchInput.value);
        }
    });

    // Clear search
    searchInput.addEventListener('search', () => {
        if (searchInput.value === '') {
            clearSearch();
        }
    });

    function clearSearch() {
        // Show all products
        productCards.forEach(card => card.style.display = 'flex');
        // Show all sections
        productSections.forEach(section => section.style.display = 'block');
        // Remove highlights
        removeHighlights();
        // Remove no results message
        const noResultsMessage = document.querySelector('.no-results-message');
        if (noResultsMessage) noResultsMessage.remove();
    }

    function highlightSearchTerms(searchTerm) {
        removeHighlights();
        
        if (!searchTerm.trim()) return;

        productCards.forEach(card => {
            const textElements = card.querySelectorAll('h3, .product-details p, .product-details li');
            
            textElements.forEach(element => {
                const text = element.textContent;
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                element.innerHTML = text.replace(regex, '<span class="highlight">$1</span>');
            });
        });
    }

    function removeHighlights() {
        document.querySelectorAll('.highlight').forEach(highlight => {
            const parent = highlight.parentNode;
            parent.textContent = parent.textContent;
        });
    }

    // Add these styles to highlight search matches
    const style = document.createElement('style');
    style.textContent = `
        .search-highlight {
            background-color: rgba(33, 150, 243, 0.1);
            padding: 0 2px;
            border-radius: 2px;
        }
    `;
    document.head.appendChild(style);

    // Cart state
    let cart = {
        items: [],
        total: 0
    };

    // Initialize cart from localStorage if exists
    const savedCart = localStorage.getItem('biomtekCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }

    // Cart modal HTML
    const cartModalHTML = `
        <div id="cart-modal" class="cart-modal">
            <div class="cart-content">
                <div class="cart-header">
                    <h2>Shopping Cart</h2>
                    <button class="close-cart">&times;</button>
                </div>
                <div class="cart-items">
                    <!-- Cart items will be inserted here -->
                </div>
                <div class="cart-footer">
                    <div class="cart-total">Total: $<span>0</span></div>
                    <button class="checkout-button">Proceed to Checkout</button>
                </div>
            </div>
        </div>
    `;

    // Insert cart modal into the DOM
    document.body.insertAdjacentHTML('beforeend', cartModalHTML);

    // Cart elements
    const cartModal = document.getElementById('cart-modal');
    const cartButton = document.querySelector('.cart-button');
    const closeCart = document.querySelector('.close-cart');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.querySelector('.cart-total span');
    const checkoutButton = document.querySelector('.checkout-button');

    // Add to cart functionality
    const buyButtons = document.querySelectorAll('.buy-button');
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const product = {
                id: Date.now(), // Unique ID for the cart item
                name: productCard.querySelector('h3').textContent,
                price: productCard.querySelector('.price').textContent,
                quantity: 1
            };

            addToCart(product);
        });
    });

    // Cart functions
    function addToCart(product) {
        const existingItem = cart.items.find(item => item.name === product.name);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.items.push(product);
        }
        
        updateCart();
        showNotification('Item added to cart');
    }

    function removeFromCart(productId) {
        cart.items = cart.items.filter(item => item.id !== productId);
        updateCart();
    }

    function updateQuantity(productId, newQuantity) {
        const item = cart.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, newQuantity);
            updateCart();
        }
    }

    function updateCart() {
        // Update localStorage
        localStorage.setItem('biomtekCart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Update cart modal content
        renderCartItems();
        
        // Update total
        calculateTotal();
    }

    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = cart.items.length ? cart.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>${item.price}</p>
                </div>
                <div class="item-controls">
                    <button class="quantity-btn minus">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus">+</button>
                    <button class="remove-item">Remove</button>
                </div>
            </div>
        `).join('') : '<p class="empty-cart">Your cart is empty</p>';

        // Add event listeners to new cart items
        attachCartItemListeners();
    }

    function calculateTotal() {
        cart.total = cart.items.reduce((sum, item) => {
            const price = parseFloat(item.price.replace(/[^0-9.-]+/g, "")) || 0;
            return sum + (price * item.quantity);
        }, 0);
        cartTotalElement.textContent = cart.total.toFixed(2);
    }

    function attachCartItemListeners() {
        // Quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const cartItem = this.closest('.cart-item');
                const productId = parseInt(cartItem.dataset.id);
                const currentQuantity = parseInt(cartItem.querySelector('.quantity').textContent);
                
                if (this.classList.contains('plus')) {
                    updateQuantity(productId, currentQuantity + 1);
                } else if (this.classList.contains('minus')) {
                    updateQuantity(productId, currentQuantity - 1);
                }
            });
        });

        // Remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.closest('.cart-item').dataset.id);
                removeFromCart(productId);
            });
        });
    }

    // Cart modal toggle
    cartButton.addEventListener('click', () => {
        cartModal.classList.add('active');
    });

    closeCart.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });

    // Checkout button
    checkoutButton.addEventListener('click', () => {
        if (cart.items.length > 0) {
            proceedToCheckout(cart.items, cart.total);
        } else {
            showNotification('Your cart is empty!', 'error');
        }
    });

    // Notification system
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2000);
        }, 100);
    }

    // Mobile menu toggle
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    
    if (window.innerWidth <= 768) {
        const menuButton = document.createElement('button');
        menuButton.classList.add('menu-toggle');
        menuButton.innerHTML = '<i class="fas fa-bars"></i>';
        navbar.insertBefore(menuButton, navbar.firstChild);

        menuButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Toggle menu icon
            const icon = menuButton.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = menuButton.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuButton.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            });
        });
    }

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        const cartModal = document.getElementById('cart-modal');
        const cartButton = document.querySelector('.cart-button');
        if (!cartModal.contains(e.target) && !cartButton.contains(e.target) && cartModal.classList.contains('active')) {
            cartModal.classList.remove('active');
        }
    });

    // Form submission handling
    const quoteButton = document.querySelector('.quote-button');
    if (quoteButton) {
        quoteButton.addEventListener('click', function() {
            // Add quote request logic here
            alert('Quote request submitted!');
        });
    }

    // Newsletter subscription handling
    const subscribeButton = document.querySelector('.subscribe-button');
    if (subscribeButton) {
        subscribeButton.addEventListener('click', function() {
            const emailInput = document.querySelector('.newsletter-form input');
            if (emailInput.value) {
                alert('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    // Bulk order form handling
    const bulkOrderForm = document.getElementById('bulk-order-form');
    if (bulkOrderForm) {
        bulkOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = {
                institution: document.getElementById('institution').value,
                contactPerson: document.getElementById('contact-person').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                groupSize: document.getElementById('group-size').value,
                components: {
                    arduinoUno: document.getElementById('arduino-uno').value,
                    arduinoNano: document.getElementById('arduino-nano').value,
                    esp32: document.getElementById('esp32').value,
                    sensors: document.getElementById('sensors').value
                },
                additionalNotes: document.getElementById('additional-notes').value,
                deliveryDate: document.getElementById('delivery-date').value
            };

            // Validate that at least one component is selected
            const hasComponents = Object.values(formData.components).some(value => parseInt(value) > 0);
            
            if (!hasComponents) {
                alert('Please select at least one component');
                return;
            }

            // Here you would typically send this data to your server
            console.log('Bulk order request:', formData);
            
            // Show success message
            showNotification('Bulk order request submitted successfully!');
            
            // Reset form
            bulkOrderForm.reset();
        });
    }

    // Add these payment functions to your existing JavaScript
    function proceedToCheckout(cartItems, total) {
        const paymentModal = document.getElementById('payment-modal');
        const closePayment = document.querySelector('.close-payment');
        const orderItems = document.querySelector('.order-items');
        const orderTotal = document.querySelector('.order-total span');
        const paymentOptions = document.querySelectorAll('.payment-option');

        // Display order items
        orderItems.innerHTML = cartItems.map(item => `
            <div class="order-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>${item.price}</span>
            </div>
        `).join('');

        // Update total
        orderTotal.textContent = total.toFixed(2);

        // Show modal
        paymentModal.classList.add('active');

        // Handle payment method selection
        paymentOptions.forEach(option => {
            option.addEventListener('click', async () => {
                const method = option.dataset.method;
                
                try {
                    switch(method) {
                        case 'paypal':
                            await initiatePayPalPayment(cartItems, total);
                            break;
                        case 'pesapal':
                            await initiatePesaPalPayment(cartItems, total);
                            break;
                        case 'card':
                            await initiateCardPayment(cartItems, total);
                            break;
                    }
                } catch (error) {
                    console.error('Payment error:', error);
                    showNotification('Payment failed. Please try again.', 'error');
                }
            });
        });

        // Close modal
        closePayment.addEventListener('click', () => {
            paymentModal.classList.remove('active');
        });
    }

    // PayPal integration
    async function initiatePayPalPayment(items, total) {
        try {
            // Initialize PayPal client
            const paypalClient = await paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: total.toFixed(2)
                            },
                            description: 'BIOMTEK Arduino Components'
                        }]
                    });
                },
                onApprove: async (data, actions) => {
                    const order = await actions.order.capture();
                    handleSuccessfulPayment(order);
                },
                onError: err => {
                    console.error('PayPal error:', err);
                    showNotification('PayPal payment failed. Please try again.', 'error');
                }
            });

            // Render PayPal buttons
            await paypalClient.render('#paypal-button-container');
        } catch (error) {
            console.error('PayPal initialization error:', error);
            throw error;
        }
    }

    // PesaPal integration
    async function initiatePesaPalPayment(items, total) {
        try {
            // Create payment request
            const response = await fetch('/api/create-pesapal-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: total,
                    description: 'BIOMTEK Arduino Components',
                    type: 'MERCHANT',
                    reference: Date.now().toString(),
                    email: 'customer@email.com',
                    items: items
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create PesaPal order');
            }

            const { redirect_url } = await response.json();
            window.location.href = redirect_url;

        } catch (error) {
            console.error('PesaPal error:', error);
            throw error;
        }
    }

    // Card payment integration
    async function initiateCardPayment(items, total) {
        try {
            // Initialize Stripe
            const stripe = Stripe('your_publishable_key');
            
            // Create payment intent
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: total * 100, // Convert to cents
                    currency: 'usd',
                    items: items
                })
            });

            const { clientSecret } = await response.json();

            // Confirm payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement('card'),
                    billing_details: {
                        name: 'Customer Name'
                    }
                }
            });

            if (result.error) {
                throw result.error;
            }

            handleSuccessfulPayment(result.paymentIntent);

        } catch (error) {
            console.error('Card payment error:', error);
            throw error;
        }
    }

    // Handle successful payment
    function handleSuccessfulPayment(paymentDetails) {
        // Clear cart
        cart.items = [];
        updateCart();
        
        // Show success message
        showNotification('Payment successful! Thank you for your purchase.', 'success');
        
        // Close payment modal
        const paymentModal = document.getElementById('payment-modal');
        paymentModal.classList.remove('active');
        
        // You might want to redirect to a success page
        // window.location.href = '/order-confirmation';
    }

    // Create floating slogan
    const floatingSlogan = document.createElement('div');
    floatingSlogan.className = 'floating-slogan';
    floatingSlogan.textContent = 'Building the Future, Powered by BIOMTEK';
    document.body.appendChild(floatingSlogan);

    // Show/hide floating slogan on scroll
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 300) { // Show after scrolling 300px
            if (scrollTop > lastScrollTop) {
                // Scrolling down
                floatingSlogan.classList.remove('show');
            } else {
                // Scrolling up
                floatingSlogan.classList.add('show');
            }
        } else {
            floatingSlogan.classList.remove('show');
        }
        
        lastScrollTop = scrollTop;
    });

    // Add image loading handler
    const productImages = document.querySelectorAll('.product-image img');
    
    productImages.forEach(img => {
        img.addEventListener('load', function() {
            this.parentElement.classList.add('loaded');
        });
        
        img.addEventListener('error', function() {
            // If image fails to load, show placeholder
            this.src = 'images/placeholder.jpg';
        });
    });

    // Product Information System
    const searchInput = document.querySelector('.search-input');
    const categoryFilters = document.querySelectorAll('.category-filter');
    const products = document.querySelectorAll('.product-card');

    // Search functionality
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterProducts(searchTerm);
    });

    function filterProducts(searchTerm) {
        products.forEach(product => {
            const productName = product.querySelector('h3').textContent.toLowerCase();
            const productDescription = product.querySelector('.product-details').textContent.toLowerCase();
            
            if (productName.includes(searchTerm) || productDescription.includes(searchTerm)) {
                product.style.display = 'flex';
            } else {
                product.style.display = 'none';
            }
        });
    }

    // Product Information Modal
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('buy-button')) {
                showProductDetails(this.dataset.productId);
            }
        });
    });

    function showProductDetails(productId) {
        // Create and show modal with detailed product information
        const modal = document.createElement('div');
        modal.className = 'product-modal';
        // Add modal content based on product ID
        document.body.appendChild(modal);
    }

    // Contact Form for Missing Products
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Handle form submission
        const formData = new FormData(this);
        // Send inquiry to backend
        
        showNotification('Your inquiry has been sent. We\'ll contact you shortly!');
    });
});

// Scroll to contact section
function scrollToContact() {
    document.querySelector('#contact').scrollIntoView({
        behavior: 'smooth'
    });
}
