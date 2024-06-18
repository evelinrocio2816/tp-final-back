const { Public_key } = require("../../config/config");

document.addEventListener('DOMContentLoaded', function() {
    const mp = new MercadoPago(Public_key, {
      locale: 'es-AR'
    });
  
    const checkoutForm = document.getElementById('checkout-form');
  
    checkoutForm.addEventListener('submit', async function(e) {
      e.preventDefault();
  
      const title = document.getElementById('title').value;
      const price = document.getElementById('price').value;
  
      const response = await fetch('/checkout/create_preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, price })
      });
  
      const data = await response.json();
  
      const bricksBuilder = mp.bricks();
  
      const renderComponent = async (bricksBuilder) => {
        await bricksBuilder.create(
          'wallet',
          'payment-button',
          {
            initialization: {
              preferenceId: data.id,
            },
          }
        );
      };
  
      renderComponent(bricksBuilder);
    });
  });
  