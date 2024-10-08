import express from express;
import pool from "../lib/db";

export const createpaymentsession = async (req, res) => {

        const { products, couponCode } = req.body;
        

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Invalid or empty products array" });
        }



        const productIds = products.map(p => p.id);
        const productQuery = `
            SELECT id, name, price, image
            FROM products
            WHERE id = ANY($1::int[]);
        `;
        const { rows: productRows } = await client.query(productQuery, [productIds]);

        const productMap = new Map(productRows.map(p => [p.id, p]));

        let totalAmount = 0;
        const lineItems = products.map(product => {
            const dbProduct = productMap.get(product.id);
            if (!dbProduct) {
                throw new Error(`Product with id ${product.id} not found`);
            }

            const amount = Math.round(dbProduct.price * 100);
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: dbProduct.name,
                        images: [dbProduct.image],
                    },
                    unit_amount: amount,
                },
                quantity: product.quantity || 1,
            };
        });

    
};