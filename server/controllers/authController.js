import jwt from 'jsonwebtoken';
import pool from '../lib/db.js';
import redis from '../lib/redis.js';
import bcrypt from 'bcryptjs';

const generateTokens = async (id) => {
    const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
    return { accessToken, refreshToken };
};

const invalidateOldToken = async (userId) => {
    await redis.del(`refresh_token_${userId}`);
};

const storeRefreshToken = async (id, refreshToken) => {
    await redis.set(`refresh_token_${id}`, refreshToken, 'EX', 30 * 24 * 60 * 60);
};

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'strict', secure: true, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            console.error('Validation Error: Missing fields');
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length > 0) {
            console.error('Validation Error: User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        if (password.length < 6) {
            console.error('Validation Error: Password too short');
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, bcryptPassword]
        );

        const { accessToken, refreshToken } = await generateTokens(newUser.rows[0].id);
        await invalidateOldToken(newUser.rows[0].id);
        await storeRefreshToken(newUser.rows[0].id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        return res.status(201).json({
            id: newUser.rows[0].id,
            name: newUser.rows[0].name,
            email: newUser.rows[0].email,
            role: newUser.rows[0].role,
        });
    } catch (error) {
        console.error('Server Error:', error.message);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const { accessToken, refreshToken } = await generateTokens(user.rows[0].id);
        await invalidateOldToken(user.rows[0].id);
        await storeRefreshToken(user.rows[0].id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        return res.status(200).json({
            id: user.rows[0].id,
            name: user.rows[0].name,
            email: user.rows[0].email,
            role: user.rows[0].role,
        });
    } catch (error) {
        console.error('Server Error:', error.message);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token_${decoded.id}`);
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error.message);
        console.error('Stack Trace:', error.stack);
        return res.status(500).json({message: 'Server Error', error: error.message });
    }
};

export const refreshtoken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Access Denied' });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const token = await redis.get(`refresh_token_${decoded.id}`);
        
        if (token !== refreshToken) {
            console.log('Token not found in redis');
            return res.status(401).json({ message: 'Access Denied' });
        }

        const accessToken = jwt.sign(
            { id: decoded.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({ message: 'Token refreshed successfully' });
    } catch (error) {
        console.error('Refresh Token Error:', error.message);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (error) {
        console.error('Profile Error:', error.message);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};