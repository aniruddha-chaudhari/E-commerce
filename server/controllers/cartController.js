import pool from '../lib/db.js';

export const getCartProducts = async (req, res) => {
    try {
        const user = req.user;
        console.log(`Fetching cart products for user: ${user.id}`);
        
        // Join cart_items with products table to get complete product information
        const cartProducts = await pool.query(
            `SELECT 
                ci.id as cart_item_id,
                ci.quantity,
                p.id as product_id,
                p.name,
                p.description,
                p.price,
                p.image,
                p.category,
                p.is_featured,
                (p.price * ci.quantity) as total_price
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = $1
            ORDER BY ci.created_at DESC`,
            [user.id]
        );

        console.log(`Cart products fetched successfully for user: ${user.id}`);
        
        // Calculate cart summary
      

        res.status(200).json(cartProducts.rows);
    } catch (error) {
        console.error(`Error fetching cart products for user: ${user.id}`, error.message);
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
};


export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        const existingCartItem = await pool.query('SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2', [user.id, productId]);
        if (existingCartItem.rows.length > 0) {
            const updatedCartItem = await pool.query('UPDATE cart_items SET quantity = quantity + 1 WHERE user_id = $1 AND product_id = $2 RETURNING *', [user.id, productId]);
            return res.status(200).json(updatedCartItem.rows[0]);
        } else {
            const newCartItem = await pool.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *', [user.id, productId, 1]);
            res.status(201).json(newCartItem.rows[0]);
        }

    } catch (error) {
        console.error('Error adding to cart:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;
        if (!productId) {
            res.status(400).json('Some error occurred');
        }
        await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *', [user.id, productId]);
        res.status(200).json('Cart cleared successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;

        const existingCartItem = await pool.query('SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2', [user.id, productId]);

        if (existingCartItem.rows.length > 0) { 
            if (quantity <= 0) {
                await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [user.id, productId]);
                return res.status(200).json('Product removed from cart');
            }
            
            const updatedCartItem = await pool.query('UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *', [quantity, user.id, id]);
            res.status(200).json(updatedCartItem.rows[0]);
        }else{
            res.status(404).json({message: 'Product not found in cart', error: 'Product not found in cart'});
        }


    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};