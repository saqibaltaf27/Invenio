
const uniqid = require("uniqid");
const fs = require("fs");
const path = require("path");
const { poolPromise, sql } = require('../db/conn.js');

class Product {
  constructor() {}

  async queryDatabase(query, params = {}) {
    try {
      const pool = await poolPromise;
      //console.log("Executing query:", query);
      //console.log("With params:", params);
  
      const result = await pool.request()
        .input('searchValue', sql.NVarChar, params.searchValue) 
        .input('startValue', sql.Int, params.startValue)
        .query(query);
  
      // If no result, throw error
      if (!result.recordset || result.recordset.length === 0) {
        throw new Error('No data returned from query');
      }
  
      console.log("Query result:", result.recordset); // Log result
      return result.recordset;  // Return the records
    } catch (err) {
      console.error("queryDatabase error:", err.message);
      throw new Error("Database query failed: " + err.message); // Provide clear error message
    }
  }
  // Get products with optional search and sorting
  getProducts = async (req, res) => {
  try {
      const { search_value = "", sort_column = "name", sort_order = "ASC", start_value = 0 } = req.body;

      let whereClause = "";
      const values = [];

      // If there's a search value, filter products by name or description
      if (search_value.trim() !== "") {
        whereClause = `WHERE name LIKE @searchValue OR description LIKE @searchValue`;
        values.push(`%${search_value}%`);
      }

      // Validate columns and order for sorting
      const validColumns = ["name", "description", "gender", "size", "product_stock", "timeStamp"];
      const validOrders = ["ASC", "DESC"];
      let orderClause = "";

      if (validColumns.includes(sort_column) && validOrders.includes(sort_order)) {
        orderClause = `ORDER BY ${sort_column} ${sort_order}`;
      }

      // Define the limit for pagination
      const limitClause = `OFFSET @startValue ROWS FETCH NEXT 10 ROWS ONLY`;
      values.push(parseInt(start_value));

      // Construct the query to fetch the products
      const productQuery = `SELECT * FROM products ${whereClause} ${orderClause} ${limitClause}`;

      // Query the database
      const products = await this.queryDatabase(productQuery, {
        searchValue: `%${search_value}%`,
        startValue: parseInt(start_value),
      });

      // If there's a search term, return the filtered products with the count
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
      const { name, gender, size, material, category, description, product_stock, f_name, selling_price, purchase_price } = req.body;

    // Declare the SQL query with parameters
    const query = `
      DECLARE @productId VARCHAR(50) = @productIdValue;
      DECLARE @name VARCHAR(255) = @nameValue;
      DECLARE @gender VARCHAR(50) = @genderValue;
      DECLARE @size VARCHAR(50) = @sizeValue;
      DECLARE @material VARCHAR(100) = @materialValue;
      DECLARE @category VARCHAR(100) = @categoryValue;
      DECLARE @description TEXT = @descriptionValue;
      DECLARE @productStock INT = @productStockValue;
      DECLARE @image VARCHAR(255) = @imageValue;
      DECLARE @sellingPrice DECIMAL(18,2) = @sellingPriceValue;
      DECLARE @purchasePrice DECIMAL(18,2) = @purchasePriceValue;

      -- The actual insert statement
      INSERT INTO products (product_id, name, gender, size, material, category, description, product_stock, image, selling_price, purchase_price)
      VALUES (@productId, @name, @gender, @size, @material, @category, @description, @productStock, @image, @sellingPrice, @purchasePrice);
    `;

    // Generate the unique product ID
    const productId = uniqid();

    // Execute the query with parameterized values
    await this.queryDatabase(query, [
      { name: 'productIdValue', value: productId },
      { name: 'nameValue', value: name },
      { name: 'genderValue', value: gender },
      { name: 'sizeValue', value: size },
      { name: 'materialValue', value: material },
      { name: 'categoryValue', value: category },
      { name: 'descriptionValue', value: description },
      { name: 'productStockValue', value: product_stock },
      { name: 'imageValue', value: f_name },
      { name: 'sellingPriceValue', value: selling_price },
      { name: 'purchasePriceValue', value: purchase_price }
    ]);

      res.send({ operation: "success", message: 'Product added successfully' });
    } catch (err) {
      console.log(err);
      res.send({ operation: "error", message: 'Something went wrong' });
    }
  };

  // Update product details
  updateProduct = async (req, res) => {
    try {
      const { product_id, name, gender, size, material, category, description, product_stock, f_name, selling_price, purchase_price } = req.body;
      let imageUpdate = f_name ? `image = @image` : '';
      const query = `UPDATE products SET name = @name, gender = @gender, size = @size, material = @material, category = @category, 
                     description = @description, product_stock = @productStock, ${imageUpdate} selling_price = @sellingPrice, 
                     purchase_price = @purchasePrice WHERE product_id = @productId`;

      const params = f_name ? [name, gender, size, material, category, description, product_stock, f_name, selling_price, purchase_price, product_id] :
                              [name, gender, size, material, category, description, product_stock, selling_price, purchase_price, product_id];

      const result = await this.queryDatabase(query, params);
      res.send({ operation: "success", message: 'Product updated successfully' });
    } catch (err) {
      console.log(err);
      res.send({ operation: "error", message: 'Something went wrong' });
    }
  };

  // Delete product and image
  deleteProduct = async (req, res) => {
    try {
      const productId = req.body.product_id;
  
      // Query to fetch the product details using the provided product_id
      const query = `
        SELECT * FROM products WHERE product_id = @productId;
      `;
  
      // Execute the query and pass the productId as a parameter
      const result = await this.queryDatabase(query, [productId]);
  
      if (result[0]?.image) {
        // If the product has an image, delete it from the filesystem
        const imagePath = path.join(__dirname, 'public', 'uploads', result[0].image);
        fs.unlinkSync(imagePath); // Synchronously delete the image
      }
  
      // Now, delete the product from the database using the product_id
      const deleteQuery = `
        DELETE FROM products WHERE product_id = @productId;
      `;
      
      // Execute the delete query with the productId
      await this.queryDatabase(deleteQuery, [productId]);
  
      // Send success response
      res.send({ operation: "success", message: 'Product deleted successfully' });
    } catch (err) {
      console.log(err);
      // Send error response in case of failure
      res.send({ operation: "error", message: 'Something went wrong' });
    }
  };

  // Delete product image
  deleteProductImage = async (req, res) => {
    try {
      const productId = req.body.product_id;
      const query = `SELECT * FROM products WHERE product_id = @productId`;
      const result = await this.queryDatabase(query, [productId]);

      if (result[0]?.image) {
        const imagePath = path.join(__dirname, 'public', 'uploads', result[0].image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Use fs.unlinkSync for synchronous deletion
        }

        const updateQuery = `UPDATE products SET image = NULL WHERE product_id = @productId`;
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
