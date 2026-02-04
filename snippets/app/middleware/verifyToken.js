import axios from 'axios';
const {VERIFY_TOKEN_URL} = process.env;
export const verifyToken = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Referrer-Policy');
        res.header('Access-Control-Allow-Credentials', true);
        return res.status(200).end();
    }
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Referrer-Policy');
    res.header('Access-Control-Allow-Credentials', true);
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token is missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const {data, status} = await axios.get(`${VERIFY_TOKEN_URL}/user/profile`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
        if (status === 200) {
            req.body.userProfile = data;
            next();
        } else {
            res.status(status).send('Unauthorized');
        }
    } catch (error) {
        return res.status(403).json({ error: 'Forbidden' });
    }
}