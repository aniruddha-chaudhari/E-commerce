import jwt from 'jsonwebtoken';
import pool from '../lib/db.js';
import redis from '../lib/redis.js';
import bcrypt from 'bcryptjs';


const generateTokens = async (id) => {
    const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' });

    return { accessToken, refreshToken };
}

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
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (!name || !email || !password) {
            return res.status(400).json('Please fill in all fields');
        };
        if (user.rows.length > 0) {
            return res.status(400).json('User already exists');
        };

        if (password.length < 6) {
            return res.status(400).json('Password must be at least 6 characters long');
        };

        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);
        const newUser = await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name, email, bcryptPassword]);
        const { accessToken, refreshToken } = await generateTokens(newUser.rows[0].id);
        await storeRefreshToken(newUser.rows[0].id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        res.status(201).json({
            id: newUser.rows[0].id,
            name: newUser.rows[0].name,
            email: newUser.rows[0].email,
        });


    } catch (error) {
        console.error(error.message);
    };
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json('Please fill in all fields');
        };
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json('Invalid Credentials');
        };
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json('Invalid Credentials');
        };

        if(user.rows.length > 0 && validPassword) {
            const { accessToken, refreshToken } = await generateTokens(user.rows[0].id);
            await storeRefreshToken(user.rows[0].id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            res.status(200).json({
                id: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email,
            });
        }else{
            res.status(400).json('Invalid Credentials');
        }

    } catch {
        res.status(500).json('Server Error', error.message);
    }
};


export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET);
            await redis.del(`refresh_token_${decoded.id}`);
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json('Logged out');
    } catch {
        res.status(500).json('Server Error', error.message);
    }
};

export const refreshtoken = async (req, res) => { 
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(401).json('Access Denied');
        };
        const decoded = jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET);
        const token = await redis.get(`refresh_token_${decoded.id}`);
        if (token !== refreshToken) {
            return res.status(401).json('Access Denied');
        };
        const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'strict', secure: true, maxAge: 15 * 60 * 1000 });

      
		res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProfile = async (req, res) => {
try{
    res.status(200).json(req.user);
}catch(error){
    console.error(error.message);
    res.status(500).json('Server Error', error.message);
}};