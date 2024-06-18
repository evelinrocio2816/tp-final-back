const logger = require("../../utils/loggers");

const decrementButton = document.getElementById('decrementButton');
    const incrementButton = document.getElementById('incrementButton');
    const quantityInput = document.getElementById('quantity');

    decrementButton.addEventListener('click', () => {
        let quantity = parseInt(quantityInput.value);
        if (quantity > 1) {
            quantity--;
            quantityInput.value = quantity;
        }
    });

    incrementButton.addEventListener('click', () => {
        let quantity = parseInt(quantityInput.value);
        quantity++;
        quantityInput.value = quantity;
    });

    function postProductToCart(cartId, productId) {
        const quantity = document.getElementById("quantity").value
        fetch(`/api/carts/${cartId}/product/${productId}`, {
           method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
          body: JSON.stringify({quantity:quantity})
        })
        .then(response => {
                if (response.ok) {
                  return window.location.href= `/carts/${cartId}`;
                }
                throw new Error('Error en la solicitud POST');
            })
            .catch(error => {
                logger.error('Error:', error);
            });

    }