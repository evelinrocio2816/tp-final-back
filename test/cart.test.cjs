const request = require('supertest');
const app = require('../src/app.js');
const requester = request("http://localhost:8080");

async function importChai() {
  return await import('chai');
}


describe("Testeamos la App Tienda de ropas", function(){
  let chai, expect
  before(async function() { 
    chai = await importChai(); 
    expect = chai.expect; 

  })
  describe("Testeamos carritos", function (){

    it("Endpoint GET api/carts/:cid que debe devolver un status code 404 si no se encuentra el carrito en la base de datos", async () => { 
      const invalidCartID = '665d370a908b996d7406f77f'
      const response = await requester.get(`/api/carts/${invalidCartID}`) 
      expect(response.status).to.equal(404) 
      expect(response.body).to.have.property('error', 'Carrito no encontrado')
    }).timeout(10000); 
  });
  it("Endpoint POST /api/cart crea un nuevo carrito correctamente", async () => {
    const response = await requester.post('/api/carts');
    expect(response.status).to.equal(200); 
    expect(response.body).to.have.property('_id'); 
  }).timeout(10000);
});

