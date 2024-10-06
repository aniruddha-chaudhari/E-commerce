import cloudinary from "../lib/cloudinary";
import pool from "../lib/db";
import redis from "../lib/redis";

export const getAllproducts = async (req, res) => {
    try {
        const products = await pool.query('SELECT * FROM products');
        res.status(200).json(products.rows);
    }
    catch (error) {
        res.status(500).json('Server Error', error.message);
    }
};

export const getfeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = redis.get('featured_Products');
        if (featuredProducts) {
            res.status(200).json(json.parse(featuredProducts));
        }

        featuredProducts = await pool.query('SELECT * FROM products WHERE is_featured = true');

        if (!featuredProducts.rows.length > 0) {
            return res.status(404).json('No featured products found');
        }

        await redis.set('featured_Products', JSON.stringify(featuredProducts.rows), 'EX', 60);

        res.status(200).json(featuredProducts.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json('Server Error', error.message);
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category, is_featured } = req.body;

        let cloudinaryResponse = null;

        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: 'products' });
        }

        const imgurl = cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : null;

        const newProduct = await pool.query('INSERT INTO products (name, description, price, image,category, is_featured) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, description, price, imgurl, category, is_featured]);
        res.status(201).json(newProduct.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json('Server Error', error.message);
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (product.rowCount === 0) {
            return res.status(404).json('Product not found');
        }

        if (product.rows[0].image) {
            const public_id = product.rows[0].image.split('/').pop().split('.')[0];
            try {
                await cloudinary.uploader.destroy(`products/${public_id}`);
                console.log('Image deleted from cloudinary');
            } catch (error) {
                console.error('Error deleting image from cloudinary', error.message);
            }
            res.status(200).json('Product deleted');

        }
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json('Server Error', error.message);
    }
};

export const getRecommendedProducts = async (req, res) => {
    try {
        const recommendedProducts = await pool.query('SELECT * FROM products order by random() limit 5');

        if (recommendedProducts.rows.length === 0) {
            return res.status(404).json('No recommended products found');
        }

        res.status(200).json(recommendedProducts.rows);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json('Server Error', error.message);
    }
};

export const getProductsByCategory = async (req, res) => {

    try {
        const { category } = req.params;
        const products = await pool.query('SELECT * FROM products WHERE category = $1', [category]);

        if (products.rows.length === 0) {
            return res.status(404).json('No products found');
        }

        res.status(200).json(products.rows);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json('Server Error', error.message);
    }
};

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

        if (product.rows.length === 0) {
            return res.status(404).json('Product not found');
        }

        const is_featured = !product.rows[0].is_featured;

        const updatedProduct = await pool.query('UPDATE products SET is_featured = $1 WHERE id = $2 RETURNING *', [is_featured, id]);
        await updatedfeaturedproduct();
        res.status(200).json(updatedProduct.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json('Server Error', error.message);
    }
};

async function updatedfeaturedproduct() {
    try {
        const featuredProducts = await pool.query('SELECT * FROM products WHERE is_featured = true');
        await redis.set('featured_Products', JSON.stringify(featuredProducts.rows), 'EX', 60);
    } catch (error) {
        console.log(error);
    }
}