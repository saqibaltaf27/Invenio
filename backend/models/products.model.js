const db = require('../db/conn.js');
const uniqid = require("uniqid");
const fs = require("fs");
const path = require("path");

class Product {
  constructor() {
    //console.log('Product object initialized');
  }

  // Helper function to handle database queries
  async queryDatabase(query, params = []) {
    try {
      const result = await db.query(query, {
        replacements: params,
        type: db.QueryTypes.SELECT,
      });
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  getProducts = async (req, res) => {
    try {
      if (!req.session || !req.session.email) {
        return res.status(401).send({ message: "Unauthorized" });
      }
  
      const { search_value = "", sort_column = "name", sort_order = "ASC", start_value = 0 } = req.body;
  
      let whereClause = "";
      const values = [];
  
      if (search_value.trim() !== "") {
        whereClause = `WHERE name LIKE @searchValue OR description LIKE @searchValue`;
        values.push(`%${search_value}%`);
      }
  
      const validColumns = ["name", "description", "gender", "size", "product_stock", "timeStamp"];
      const validOrders = ["ASC", "DESC"];
      let orderClause = "";
  
      if (validColumns.includes(sort_column) && validOrders.includes(sort_order)) {
        orderClause = `ORDER BY ${sort_column} ${sort_order}`;
      }
  
      const limitClause = `OFFSET @startValue ROWS FETCH NEXT 10 ROWS ONLY`;
      values.push(parseInt(start_value));
  
      const productQuery = `SELECT * FROM products ${whereClause} ${orderClause} ${limitClause}`;
  
      const products = await this.queryDatabase(productQuery, {
        searchValue: `%${search_value}%`,
        startValue: parseInt(start_value),
      });
  
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
      const products = await this.queryDatabase(query, { searchValue });
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
      const query = `SELECT * FROM products WHERE product_id IN (?)`;
      const products = await this.queryDatabase(query, [req.body.product_id_list]);
      res.send({
        operation: "success",
        message: 'Success',
        info: { products },
      });
    } catch (err) {
      console.log(err);
      res.send({ operation: "error", message: 'Something went wrong' });
    }
  };

  addProduct = async (req, res) => {
    try {
      const { name, gender, size, material, category, description, product_stock, f_name, selling_price, purchase_price } = req.body;
      const query = `INSERT INTO products (product_id, name, gender, size, material, category, description, product_stock, image, selling_price, purchase_price) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const result = await this.queryDatabase(query, [
        uniqid(), name, gender, size, material, category, description, product_stock, f_name, selling_price, purchase_price,
      ]);
      res.send({ operation: "success", message: 'Product added successfully' });
    } catch (err) {
      console.log(err);
      res.send({ operation: "error", message: 'Something went wrong' });
    }
  };

  updateProduct = async (req, res) => {
    try {
      const { product_id, name, gender, size, material, category, description, product_stock, f_name, selling_price, purchase_price } = req.body;
      let imageUpdate = f_name ? `image = ?` : '';
      const query = `UPDATE products SET name = ?, gender = ?, size = ?, material = ?, category = ?, description = ?, product_stock = ?, ${imageUpdate} selling_price = ?, purchase_price = ? WHERE product_id = ?`;

      const params = f_name ? [name, gender, size, material, category, description, product_stock, f_name, selling_price, purchase_price, product_id] :
                              [name, gender, size, material, category, description, product_stock, selling_price, purchase_price, product_id];

      const result = await this.queryDatabase(query, params);
      res.send({ operation: "success", message: 'Product updated successfully' });
    } catch (err) {
      console.log(err);
      res.send({ operation: "error", message: 'Something went wrong' });
    }
  };

  deleteProduct = async (req, res) => {
    try {
      const productId = req.body.product_id;
      const query = `SELECT * FROM products WHERE product_id = ?`;
      const result = await this.queryDatabase(query, [productId]);

      if (result[0]?.image) {
        const imagePath = path.join(__dirname, 'public', 'uploads', result[0].image);
        fs.unlinkSync(imagePath); // Use fs.unlinkSync for synchronous deletion
      }

      const deleteQuery = `DELETE FROM products WHERE product_id = ?`;
      await this.queryDatabase(deleteQuery, [productId]);

      res.send({ operation: "success", message: 'Product deleted successfully' });
    } catch (err) {
      console.log(err);
      res.send({ operation: "error", message: 'Something went wrong' });
    }
  };

  deleteProductImage = async (req, res) => {
    try {
      const productId = req.body.product_id;
      const query = `SELECT * FROM products WHERE product_id = ?`;
      const result = await this.queryDatabase(query, [productId]);

      if (result[0]?.image) {
        const imagePath = path.join(__dirname, 'public', 'uploads', result[0].image);
        fs.unlinkSync(imagePath); // Use fs.unlinkSync for synchronous deletion

        const updateQuery = `UPDATE products SET image = NULL WHERE product_id = ?`;
        await this.queryDatabase(updateQuery, [productId]);
        res.send({ operation: "success", message: 'Product image deleted successfully' });
      } else {
        res.send({ operation: "error", message: 'Image not found' });
      }
    } catch (err) {
      console.log(err);
      res.send({ operation: "error", message: 'Something went wrong' });
    }
  };
}

module.exports = Product;
