import cloudinary from "../lib/cloudinary.js";
import pool from "../lib/db.js";
import redis from "../lib/redis.js";

export const getAllproducts = async (req, res) => {
    try {
        const products = await pool.query('SELECT * FROM products');
        res.status(200).json(products.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
};

export const getfeaturedProducts = async (req, res) => {
    try {
        const cachedProducts = await redis.get('featured_Products');
        if (cachedProducts) {
            return res.status(200).json(JSON.parse(cachedProducts));
        }

        const featuredProducts = await pool.query('SELECT * FROM products WHERE is_featured = true');

        if (featuredProducts.rows.length === 0) {
            return res.status(404).json({ error: 'No featured products found' });
        }

        await redis.set('featured_Products', JSON.stringify(featuredProducts.rows), 'EX', 60);
        res.status(200).json(featuredProducts.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;
        let { is_featured } = req.body;
        console.log(req.body);

        let imgurl = null;
        let cloudinaryResponse = null;

        if(!is_featured){
            is_featured = false;
        }

        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: 'products' });
            imgurl = cloudinaryResponse.secure_url;
        }

        const newProduct = await pool.query(
            'INSERT INTO products (name, description, price, image, category, is_featured) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, price, imgurl, category, is_featured]
        );
        console.log(newProduct.rows[0]);
        res.status(201).json(newProduct.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

        if (product.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.rows[0].image) {
            const public_id = product.rows[0].image.split('/').pop().split('.')[0];
            try {
                await cloudinary.uploader.destroy(`products/${public_id}`);
                console.log('Image deleted from cloudinary');
            } catch (error) {
                console.error('Error deleting image from cloudinary:', error.message);
            }
        }

        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.status(200).json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
};

export const getRecommendedProducts = async (req, res) => {
    try {
        const recommendedProducts = await pool.query('SELECT * FROM products ORDER BY RANDOM() LIMIT 5');

        if (recommendedProducts.rows.length === 0) {
            return res.status(404).json({ error: 'No recommended products found' });
        }

        res.status(200).json(recommendedProducts.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
};

export const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await pool.query('SELECT * FROM products WHERE category = $1', [category]);

        if (products.rows.length === 0) {
            return res.status(404).json({ error: 'No products found in this category' });
        }

        res.status(200).json(products.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
};

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

        if (product.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const is_featured = !product.rows[0].is_featured;
        const updatedProduct = await pool.query(
            'UPDATE products SET is_featured = $1 WHERE id = $2 RETURNING *',
            [is_featured, id]
        );

        await updateFeaturedProducts();
        res.status(200).json(updatedProduct.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
};

async function updateFeaturedProducts() {
    try {
        const featuredProducts = await pool.query('SELECT * FROM products WHERE is_featured = true');
        await redis.set('featured_Products', JSON.stringify(featuredProducts.rows), 'EX', 60);
    } catch (error) {
        console.error('Error updating featured products cache:', error);
    }
}