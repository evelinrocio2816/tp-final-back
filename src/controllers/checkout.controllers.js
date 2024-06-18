
const { MercadoPagoConfig, Preference } = require("mercadopago");
const { Access_token } = require("../config/config.js");

const client = new MercadoPagoConfig ({access_token: Access_token});


const createPreference = async (req, res) => {
  let body = {
    items: [
      {
        title: req.body.title,
        unit_price: parseFloat(req.body.price),
        quantity: 1,
      },
    ],
    back_urls: {
      success: 'http://localhost:3000/checkout/success',
      failure: 'http://localhost:3000/checkout/failure',
      pending: 'http://localhost:3000/checkout/pending',
    },
    auto_return: 'approved',
  };

  try {
    const preference = new Preference(client);
    const result = await preference.create({body});
    res.json({ id: result.id });
  } catch (error) {
    res.status(500).send({message:"Error al crear la preferencia", error: error.message})
  }
};

const success = (req, res) => {
  res.send('Pago exitoso');
};

const failure = (req, res) => {
  res.send('Pago fallido');
};

const pending = (req, res) => {
  res.send('Pago pendiente');
};

module.exports= {
    createPreference,
    success,
    failure,
    pending,
  };
