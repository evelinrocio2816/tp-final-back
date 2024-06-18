const request = require('supertest');
const app = require('../src/app.js');  // Ensure this path is correct
const requester = request("http://localhost:8080");

async function importChai() {
  return await import('chai');
}

describe("Testeamos la App Tienda de ropas", function() {
  let chai, expect;
  
  before(async function() { 
    chai = await importChai(); 
    expect = chai.expect; 
  });

  describe("Testeamos los usuarios", function () {
    it("Endpoint POST /api/user/register debe registrar un nuevo usuario", async () => {
      const userMock = {
        first_name: "Sebastian",
        last_name: "R",
        email: "SebaAirbag@gmail.com",
        password: "1234"
      };

      const response = await requester.post('/api/user/register').send(userMock);
      expect(response.status).to.equal(302);
    }).timeout(10000);

    it("Endpoint POST /api/user/login debe loguear un usuario existente", async () => {
      const userLogin = {
        email: "SebaAirbag@gmail.com",
        password: "1234"
      };

      const response = await requester.post('/api/user/login').send(userLogin);
      console.log(response.status, response.body, response.headers);  // Log the response details
      expect(response.status).to.equal(302);
      expect(response.headers['set-cookie']).to.not.be.undefined;  // Check if the cookie is set
    }).timeout(10000);

    it("Endpoint POST /api/user/login debe fallar con credenciales incorrectas", async () => {
      const userLogin = {
        email: "SebaAirbag@gmail.com",
        password: "wrongpassword"
      };

      const response = await requester.post('/api/user/login').send(userLogin);
      console.log(response.status, response.text);  // Log the response details
      expect(response.status).to.equal(401); 
      expect(response.text).to.equal("Contraseña incorrecta");
    }).timeout(10000);

    it("Endpoint POST /api/user/login debe fallar con usuario inexistente", async () => {
      const userLogin = {
        email: "nonexistentuser@gmail.com",
        password: "1234"
      };

      const response = await requester.post('/api/user/login').send(userLogin);
      console.log(response.status, response.text);  // Log the response details
      expect(response.status).to.equal(401); 
      expect(response.text).to.equal("Usuario no válido");
    }).timeout(10000);
  });
});
