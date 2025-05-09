
const uniqid = require("uniqid");
const fs = require("fs");
const path = require("path");
const { poolPromise, sql } = require('../db/conn.js');

class Product {
  constructor() {}

  async queryDatabase(query, params = {}) {
    try {
      const pool = await poolPromise;
      const request = pool.request();
  
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          request.input(key, params[key].type, params[key].value);
        }
      }
  
      const lowerCaseQuery = query.trim().toLowerCase();
      const result = await request.query(query);
  
      if (lowerCaseQuery.startsWith('select')) {
        if (!result.recordset || result.recordset.length === 0) {
          throw new Error('No data returned from query');
        }
        console.log("Query result (SELECT):", result.recordset);
        return result.recordset;
      } else if (lowerCaseQuery.startsWith('delete')) {
        console.log("Result object (DELETE):", result); 
        return result.rowsAffected[0];
      } else if (lowerCaseQuery.startsWith('insert') || lowerCaseQuery.startsWith('update')) {
        console.log("Rows affected (INSERT/UPDATE):", result.rowsAffected);
        return result.rowsAffected[0];
      } else {
        console.warn("Unknown query type encountered in queryDatabase:", lowerCaseQuery);
        return result; 
      }
  
  
    } catch (err) {
      console.error("queryDatabase error:", err.message);
      throw new Error("Database query failed: " + err.message);
    }
  }
  
  getProducts = async (req, res) => {
    try {
      const { search_value = "", sort_column = "name", sort_order = "ASC", start_value = 0 } = req.body;
  
      let whereClause = "";
  
      if (search_value.trim() !== "") {
        whereClause = `WHERE name LIKE @searchValue OR description LIKE @searchValue`;
      }
  
      const validColumns = ["name", "description", "gender", "size", "product_stock", "timeStamp"];
      const validOrders = ["ASC", "DESC"];
      let orderClause = "";
  
      if (validColumns.includes(sort_column) && validOrders.includes(sort_order)) {
        orderClause = `ORDER BY ${sort_column} ${sort_order}`;
      }
  
      const productQuery = `SELECT * FROM products
        ${whereClause}
        ${orderClause}
      `;
  
      const params = {};
      if (search_value.trim() !== "") {
        params.searchValue = { type: sql.NVarChar, value: `%${search_value}%` };
      }
      params.startValue = { type: sql.Int, value: parseInt(start_value) };
  
      const products = await this.queryDatabase(productQuery, params);
  
      if (search_value.trim() !== "") {
        return res.send({
          operation: "success",
          message: "Search results fetched",
          info: { products, count: products.length },
        });
      }
  
      const countResult = await this.queryDatabase("SELECT COUNT(*) AS val FROM products");
  
      res.send({
        operation: "success",
        message: "Products fetched",
        info: {
          products,
          count: countResult[0].val,
        },
      });
    } catch (error) {
      console.error("getProducts error:", error);
      res.status(500).send({ operation: "error", message: "Internal server error" });
    }
  };

  getProductsSearch = async (req, res) => {
    try {
      const searchValue = req.body.search_value;
      const query = `SELECT * FROM products WHERE name LIKE @searchValue + '%'`;
      const products = await this.queryDatabase(query, [searchValue]);
      res.send({
        operation: "success",
        message: '10 products fetched',
        info: { products },
      });
    } catch (err) {
      console.log(err);
      res.send({ operation: "error", message: 'Something went wrong' });
    }
  };

  getProductsDetailsById = async (req, res) => {
    try {
      const query = `SELECT * FROM products WHERE product_id IN (@productIdList)`;
      const products = await this.queryDatabase(query, [req.body.product_id_list]);
      res.send({
        operation: "success",
        message: 'Product details fetched successfully',
        info: { products },
      });
    } catch (err) {
      console.log(err);
      res.send({ operation: "error", message: 'Something went wrong' });
    }
  };


  addProduct = async (req, res) => {
    try {
      const { name, type, size, material, category, description, product_stock, f_name, selling_price, purchase_price } = req.body;
      if (!name || !type || !size || !material || !category || !description || !product_stock || !selling_price || !purchase_price) {
        return res.status(400).send({ operation: "error", message: "All fields are required." });
      }
      const productId = uniqid();
   
      const query = `
      INSERT INTO products (product_id, name, type, size, material, category, description, product_stock, image, selling_price, purchase_price)
      VALUES (@productId, @name, @type, @size, @material, @category, @description, @productStock, @image, @sellingPrice, @purchasePrice);
    `;

    const params = {
        productId: { type: sql.VarChar, value: productId },
        name: { type: sql.VarChar, value: name },
        type: { type: sql.VarChar, value: type }, 
        size: { type: sql.VarChar, value: size },
        material: { type: sql.VarChar, value: material },
        category: { type: sql.VarChar, value: category },
        description: { type: sql.Text, value: description },
        productStock: { type: sql.Int, value: product_stock },
        image: { type: sql.VarChar, value: f_name },
        sellingPrice: { type: sql.Decimal, value: selling_price },
        purchasePrice: { type: sql.Decimal, value: purchase_price },
      };

      await this.queryDatabase(query, params);

      res.send({ operation: "success", message: 'Product added successfully', info: { productId } });
    } catch (err) {
      console.error("addProduct error", err);
      res.status(500).send({ operation: "error", message: err.message || 'Something went wrong' });
    }
  };

  // Update product details
  updateProduct = async (req, res) => {
    try {
      const { product_id, name, type, size, material, category, description, product_stock, f_name, selling_price, purchase_price } = req.body; // Changed gender to type

      if (!product_id) {
        return res.status(400).send({ operation: "error", message: "Product ID is required." });
      }

      const params = {
        product_id: { type: sql.VarChar, value: product_id },
        name: { type: sql.VarChar, value: name },
        type: { type: sql.VarChar, value: type },
        size: { type: sql.VarChar, value: size },
        material: { type: sql.VarChar, value: material },
        category: { type: sql.VarChar, value: category },
        description: { type: sql.Text, value: description },
        productStock: { type: sql.Int, value: product_stock },
        sellingPrice: { type: sql.Decimal, value: selling_price },
        purchasePrice: { type: sql.Decimal, value: purchase_price },
      };

      let imageUpdate = '';
      if (f_name) {
        imageUpdate = 'image = @image, ';
        params.image = { type: sql.VarChar, value: f_name };
      }
      const query = `
        UPDATE products SET 
          name = @name, 
          type = @type, 
          size = @size, 
          material = @material, 
          category = @category, 
          description = @description, 
          product_stock = @productStock, 
          ${imageUpdate}
          selling_price = @sellingPrice, 
          purchase_price = @purchasePrice
        WHERE product_id = @product_id
      `;

      await this.queryDatabase(query, params);
      res.send({ operation: "success", message: 'Product updated successfully' });
    } catch (err) {
      console.error("updateProduct error", err);
      res.status(500).send({ operation: "error", message: err.message || 'Something went wrong' }); // Send the error message
    }
  };

  // Delete product and image
  deleteProduct = async (req, res) => {
    try {
      const { product_id } = req.body;

      if (!product_id) {
        return res.status(400).send({ operation: "error", message: "Product ID is required." });
      }
      const params = {
        product_id: {type: sql.VarChar, value: product_id}
      }
      const selectQuery = `SELECT image FROM products WHERE product_id = @product_id`;
      const result = await this.queryDatabase(selectQuery, params);
      const imageToDelete = result[0]?.image;

      const deleteQuery = `DELETE FROM products WHERE product_id = @product_id`;
      console.log("Delete Result (rows affected):", deleteQuery);
      await this.queryDatabase(deleteQuery, params);

      if (imageToDelete) {
        const imagePath = path.join(__dirname, '..', 'public', 'uploads', imageToDelete); 
        try {
          fs.unlinkSync(imagePath);
          console.log(`Deleted image: ${imagePath}`);
        } catch (err) {
          console.error(`Error deleting image: ${imagePath}`, err);
        }
      }

      res.send({ operation: "success", message: 'Product deleted successfully' });
    } catch (err) {
      console.error("deleteProduct error", err);
      res.status(500).send({ operation: "error", message: err.message || 'Something went wrong' }); // Send the error message
    }
  };

  // Delete product image
  deleteProductImage = async (req, res) => {
    try {
      const { product_id } = req.body;
        if (!product_id) {
        return res.status(400).send({ operation: "error", message: "Product ID is required." });
      }

      const params = {
         productId: {type: sql.VarChar, value: product_id}
      }
      // 1. Fetch the image name
      const selectQuery = `SELECT image FROM products WHERE product_id = @productId`;
      const result = await this.queryDatabase(selectQuery, params);
      const imageToDelete = result[0]?.image;

      if (imageToDelete) {
        const imagePath = path.join(__dirname, '..', 'public', 'uploads', imageToDelete);  // Corrected path
        try {
          fs.unlinkSync(imagePath);
          console.log(`Deleted image: ${imagePath}`);
        } catch (err) {
          console.error(`Error deleting image: ${imagePath}`, err);
           return res.status(500).send({ operation: "error", message: "Error deleting image" });
        }

        const updateQuery = `UPDATE products SET image = NULL WHERE product_id = @productId`;
        await this.queryDatabase(updateQuery, params);

        res.send({ operation: "success", message: 'Product image deleted successfully' });
      } else {
        res.send({ operation: "error", message: 'Image not found' });
      }
    } catch (err) {
      console.error("deleteProductImage error", err);
      res.status(500).send({ operation: "error", message: err.message || 'Something went wrong' }); 
    }
  };
}

module.exports = Product;
