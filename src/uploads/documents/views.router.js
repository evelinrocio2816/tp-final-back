const express = require("express");
const ProductModels = require("../Dao/models/product.model");
const ProductManager = require("../Dao/database/Product-manager.db");
const productManager = new ProductManager();
const router = express.Router()
const fs = require('fs').promises;


router.get("/", async (req, res) => {
  res.render("home",{title:"home"})
 });

 
router.get("/chat", async (req, res) => {
   res.render("chat",{title:"chat"})
  });

    
 //router.get("/products",async(req, res)=>{
 //  const products = await ProductManager.getProducts()
 //  const productList = products.map(product => {
 //     return {
 //         id: product._id,
 //         title:product.title,
 //         description: product.description,
 //         filename: product.filename,
 //         path: product.path
 //     }
 // })
 // 
 // res.render("/products", {products: productList, title: "products"} )
 // console.log(productList)
 // })
 router.get("/products", async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 5;
  try {
      const productList = await productManager.getProducts(limit, page );
      console.log(productList);

      res.render("products",{
          productList: productList.docs,
          hasPrevPage: productList.hasPrevPage,
          hasNextPage: productList.hasNextPage,
          prevPage: productList.prevPage,
          nextPage: productList.nextPage,
          currentPage: productList.page,
          totalPages: productList.totalPages,
          limit: productList.limit
      });
      
  } catch (error) {
      console.error("Error al obtener productos", error);
      res.status(500).json({ error: "error interno del servidor" });
  }
});
 module.exports = router;