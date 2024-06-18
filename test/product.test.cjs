const request = require('supertest');
const app = require('../src/app.js');
const requester = request(app);

async function importChai() {
  return await import('chai');
}

describe("Testeamos la App Tienda de ropas", function() {
  let chai, expect;
  before(async function() {
    chai = await importChai();
    expect = chai.expect;
  
  })
  describe("Testeamos productos", function (){
    it("Endpoint POST /api/products que debe devolver status 201 si se crea un producto sin problemas", async () => {
  
        const newProduct = { 
          title:"Café",
          description:"Café negro",
          price:7000,
          code: "CFE",
          stock: 36,
          category: "Bebidas e infusiones"
  
        }
        const response = await requester.post('/api/products').send(newProduct); 
        expect(response.status).to.equal(201);
 }).timeout(10000); 
})

it("Endpoint GET /api/products devuelve una lista de productos", async () => {
    const response = await requester.get('/api/products');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object').that.has.property('docs').that.is.an('array').that.is.not.empty;

  }).timeout(10000); 
})