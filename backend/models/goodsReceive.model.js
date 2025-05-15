const sql = require('mssql');
const { poolPromise } = require('../db/conn.js');
const PDFDocument = require('pdfkit');
const fs = require("fs");
const path = require("path");
const axios = require("axios");


const calculateTotalAmount = (items) => {
    return items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.purchase_price * (1 + (item.tax_rate || 0) / 100);
        return sum + itemTotal;
    }, 0);
};

const createGoodsReceive = async (req, res) => {
    const { supplier_id, items, invoice_number, notes } = req.body;

    console.log("Received data:", { supplier_id, items, invoice_number, notes }); // Add this line

    if (!supplier_id || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            operation: 'error',
            message: 'Supplier ID and at least one item are required.'
        });
    }

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const sanitizedSupplierId = supplier_id ? String(supplier_id).trim() : null;

            if (!sanitizedSupplierId || sanitizedSupplierId.length === 0) {
                throw new Error('Invalid supplier_id: must be a non-empty string.');
            }
            // 1. Insert into goods_receives
            const grResult = await transaction.request()
                .input('supplier_id', sql.NVarChar(255), sanitizedSupplierId)
                .input('invoice_number', sql.NVarChar, invoice_number || null)
                .input('notes', sql.NVarChar, notes || null)
                .query(`
                    INSERT INTO goods_receives (supplier_id, invoice_number, notes)
                    OUTPUT INSERTED.gr_id
                    VALUES (@supplier_id, @invoice_number, @notes)
                `);

            if (!grResult.recordset || grResult.recordset.length === 0) {
                throw new Error('Failed to insert into goods_receives – no gr_id returned.');
            }
            const gr_id = grResult.recordset[0].gr_id;
            const totalAmount = calculateTotalAmount(items);

            // 2. Insert each item and update inventory
            for (const item of items) {
                console.log("Processing item:", item); // Add this line
                const { product_id, quantity, purchase_price, tax_rate, expiry_date } = item;
                const itemTotal = quantity * purchase_price * (1 + (tax_rate || 0) / 100);

                // Add validation for each item field.
                if (!product_id || typeof product_id !== 'string') {
                    throw new Error('Invalid product_id: must be a non-empty string.');
                }
                if (typeof quantity !== 'number' || quantity <= 0) {
                    throw new Error('Invalid quantity: must be a positive number.');
                }
                if (typeof purchase_price !== 'number' || purchase_price <= 0) {
                    throw new Error('Invalid purchase_price: must be a positive number.');
                }
                if (tax_rate && typeof tax_rate !== 'number') {
                    throw new Error('Invalid tax_rate: must be a number.');
                }
                if (expiry_date && typeof expiry_date !== 'string') {
                    throw new Error('Invalid expiry_date: must be a string.');
                }
                await transaction.request()
                    .input('gr_id', sql.Int, gr_id)
                    .input('product_id', sql.NVarChar, product_id)    
                    .input('quantity', sql.Int, quantity)
                    .input('purchase_price', sql.Decimal(18, 2), purchase_price)
                    .input('tax_rate', sql.Decimal(5, 2), tax_rate || 0)
                    .input('item_total', sql.Decimal(18, 2), itemTotal)
                    .input('expiry_date', sql.Date, expiry_date || null)
                    .query(`
                        INSERT INTO goods_receive_items (gr_id, product_id, quantity, purchase_price, tax_rate, item_total, expiry_date)
                        VALUES (@gr_id, @product_id, @quantity, @purchase_price, @tax_rate, @item_total, @expiry_date)
                    `);

                await transaction.request()
                    .input('product_id', sql.NVarChar, product_id)    
                    .input('quantity', sql.Int, quantity)
                    .input('purchase_price', sql.Decimal(18, 2), purchase_price)
                    .query(`
                        UPDATE products
                        SET product_stock = ISNULL(product_stock, 0) + @quantity,
                        purchase_price = CASE 
                                                WHEN @purchase_price > ISNULL(purchase_price, 0) THEN @purchase_price
                                                ELSE purchase_price END
                        WHERE product_id = @product_id
                    `);
            }

            await transaction.request()
                .input('gr_id', sql.Int, gr_id)
                .input('total_amount', sql.Decimal(18, 2), totalAmount)
                .query(`
                    UPDATE goods_receives
                    SET total_amount = @total_amount, updated_at = GETDATE()
                    WHERE gr_id = @gr_id
                `);

            await transaction.commit();

            res.status(201).json({
                operation: 'success',
                message: 'Goods Receive created successfully',
                gr_id
            });

        } catch (err) {
            await transaction.rollback();
            console.error('Error creating Goods Receive:', err);
            res.status(500).json({
                operation: 'error',
                message: 'Failed to create Goods Receive',
                error: err.message
            });
        }

    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({
            operation: 'error',
            message: 'Database connection error',
            error: err.message
        });
    }
};


const generateGRInvoice = async (req, res) => {
    const { gr_id } = req.params;

    try {
        const pool = await poolPromise;

        const grResult = await pool.request()
            .input('gr_id', sql.Int, gr_id)
            .query(`
                SELECT gr.*, s.name AS supplier_name, s.address AS supplier_address,
                       gr.notes AS gr_notes,
                       gr.invoice_number,
                       s.phone AS supplier_phone
                FROM goods_receives gr
                INNER JOIN suppliers s ON gr.supplier_id = s.supplier_id
                WHERE gr.gr_id = @gr_id
            `);

        const gr = grResult.recordset[0];

        const itemsResult = await pool.request()
            .input('gr_id', sql.Int, gr_id)
            .query(`
                SELECT gri.quantity, gri.purchase_price, p.name AS product_name, p.size
                FROM goods_receive_items gri
                INNER JOIN products p ON gri.product_id = p.product_id
                WHERE gri.gr_id = @gr_id
            `);

        const items = itemsResult.recordset.map(item => ({
            ...item,
            quantity: Number(item.quantity),
            purchase_price: Number(item.purchase_price),
        }));

        if (!gr || items.length === 0) {
            return res.status(404).json({ operation: 'error', message: 'Goods Receive not found' });
        }

        // --- PDF Setup ---
        const doc = new PDFDocument({ margin: 50 });
        const invoiceFileName = `Purchase_Invoice_${gr_id}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${invoiceFileName}"`);
        doc.pipe(res);

        // --- Header ---
        const companyName = 'Shinwari Jongara Restaurant';
        const companyAddress = 'Shafi Market Saddar Peshawar';

        const themePrimary = '#2c3e50'; // Dark Blue
        const themeAccent = '#ecf0f1';   // Light Gray
        const tableHeaderBg = '#bdc3c7';
        const tableRowAltBg = '#f2f2f2';

        doc.rect(0, 30, doc.page.width, 60).fill(themePrimary);
        doc.fillColor('#ffffff').fontSize(20).text(companyName, 50, 40, { align: 'left' });
        doc.fontSize(12).text(companyAddress, 50, 65, { align: 'left' });
        doc.fontSize(16).text(`Purchase Invoice`, -50, 40, { align: 'right' });
        doc.fontSize(12).text(`GR ID: ${gr.gr_id}`, -50, 65, { align: 'right' });
        doc.text(`Date: ${new Date(gr.gr_date).toLocaleDateString()}`, -50, 80, { align: 'right' });
        doc.text(`Invoice No: ${gr.invoice_number || '-'}`, -50, 95, { align: 'right' });

        doc.moveDown();

        // --- Supplier Info ---
        doc.fillColor('black');
        doc.moveDown(1).fontSize(12).text(`Supplier: ${gr.supplier_name}`, 50);
        doc.text(`Address: ${gr.supplier_address}`, 50);
        doc.text(`Phone: ${gr.supplier_phone}`, 50);;

        // --- Table Header ---
        const tableTop = doc.y + 20;
        const columnStart = [50, 150, 350, 400, 450, 520];
        const headers = ['S.No', 'Product', 'Qty', 'Size', 'Price', 'Total'];

        doc.rect(50, tableTop, 500, 20).fill(tableHeaderBg);
        doc.fillColor('black').font('Helvetica-Bold');
        headers.forEach((header, i) => {
            doc.text(header, columnStart[i], tableTop + 5);
        });

        doc.font('Helvetica').fillColor('black');;

        // --- Table Rows ---
        let totalAmount = 0;
        items.forEach((item, index) => {
            const y = tableTop + 25 + index * 20;
            const quantity = Number(item.quantity);
            const price = Number(item.purchase_price);
            const itemTotal = quantity * price;

            if (index % 2 !== 0) {
                doc.rect(50, y - 2, 500, 20).fill(tableRowAltBg);
                doc.fillColor('black');
            }

            doc.text(index + 1, columnStart[0], y);
            doc.text(item.product_name, columnStart[1], y);
            doc.text(quantity, columnStart[2], y);
            doc.text(item.size || '-', columnStart[3], y);
            doc.text(price.toFixed(2), columnStart[4], y);
            doc.text(itemTotal.toFixed(2), columnStart[5], y);

            totalAmount += itemTotal;
        });

        // Total Amount Section
        doc.moveDown(2).fontSize(14).fillColor(themePrimary).font('Helvetica-Bold')
            .text(`Total Amount: ${totalAmount.toFixed(2)}`, 400, doc.y, { align: 'right' });
        doc.fillColor('black').font('Helvetica');

        // Notes
        if (gr.gr_notes) {
            doc.moveDown(2).fontSize(10).text(`Notes: ${gr.gr_notes}`, 50, doc.y);
        }

        // Signature Section
        const signatureLineY = doc.y + 30;
        doc.fontSize(12).text('Approved By:', 50, signatureLineY);
        doc.lineCap('butt')
            .moveTo(130, signatureLineY + 10)
            .lineTo(250, signatureLineY + 10)
            .stroke();

        // Finalize
        doc.end();

    } catch (err) {
        console.error('Error generating GR invoice:', err);
        res.status(500).json({
            operation: 'error',
            message: 'Failed to generate GR invoice',
            error: err.message
        });
    }
};

const getAllGoodsReceives = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT gr.gr_id, gr.po_id, gr.supplier_id, s.name as supplier_name,
                   gr.gr_date, gr.total_amount, gr.created_by
            FROM goods_receives gr
            JOIN suppliers s ON gr.supplier_id = s.supplier_id
            ORDER BY gr.gr_date DESC
        `);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Error fetching goods receives:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch goods receives' });
    }
};

const getGoodsReceiveDetails = async (req, res) => {
    const { gr_id } = req.body;

    if (!gr_id) {
        return res.status(400).json({ success: false, message: 'Missing gr_id' });
    }

    try {
        const pool = await poolPromise;

        // --- Fetch GR Header Info ---
        const headerQuery = await pool.request()
            .input('gr_id', sql.Int, gr_id)
            .query(`
                SELECT gr.*, s.name AS supplier_name
                FROM goods_receives gr
                JOIN suppliers s ON gr.supplier_id = s.supplier_id
                WHERE gr.gr_id = @gr_id
            `);

        if (!headerQuery.recordset || headerQuery.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Goods Receive not found' });
        }

        const grHeader = headerQuery.recordset[0];

        // --- Fetch GR Item Details ---
        const detailQuery = await pool.request()
            .input('gr_id', sql.Int, gr_id)
            .query(`
                SELECT gri.*, p.name AS product_name
                FROM goods_receive_items gri
                JOIN products p ON gri.product_id = p.product_id
                WHERE gri.gr_id = @gr_id
            `);

        res.status(200).json({
            success: true,
            data: {
                header: grHeader,
                items: detailQuery.recordset
            }
        });
    } catch (error) {
        console.error('Error fetching GR details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch GR details' });
    }
};

const getGoodsReceiveLogs = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT
                gr.gr_id,
                gr.gr_date AS created_at,
                s.name AS supplier_info,
                gr.invoice_number,
                gri.product_id,
                p.name AS product_name,
                gri.quantity,
                gri.purchase_price,
                gri.tax_rate,
                cast(gri.expiry_date as date) as expiry_date
            FROM goods_receives gr
            JOIN suppliers s ON gr.supplier_id = s.supplier_id
            JOIN goods_receive_items gri ON gr.gr_id = gri.gr_id
            JOIN products p ON gri.product_id = p.product_id
            ORDER BY gr.gr_date DESC
        `);

        // Format the data into the structure expected by the React component
        const formattedLogs = [];
        const logMap = new Map();

        for (const row of result.recordset) {
            const logId = row.gr_id;
            if (!logMap.has(logId)) {
                logMap.set(logId, {
                    gr_id: logId,
                    created_at: row.created_at,
                    supplier_info: row.supplier_info,
                    invoice_number: row.invoice_number,
                    items: []
                });
            }
            const log = logMap.get(logId);
            log.items.push({
                product_id: row.product_id,
                product_name: row.product_name,
                quantity: row.quantity,
                purchase_price: row.purchase_price,
                tax_rate: row.tax_rate,
                expiry_date: row.expiry_date
            });
        }

        formattedLogs.push(...logMap.values());
        res.status(200).json(formattedLogs);
    } catch (error) {
        console.error('Error fetching goods receive logs:', error);
        res.status(500).json({
            operation: 'error',
            message: 'Failed to fetch goods receive logs',
            error: error.message,
        });
    }
};

module.exports = {
    createGoodsReceive,
    generateGRInvoice,
    getAllGoodsReceives,
    getGoodsReceiveDetails,
    getGoodsReceiveLogs
};
