const jwt = require('jsonwebtoken');

const accessTokenSecret = 'cfc3042fc6631c2106f65dfb810a9ecb5a91f1fa4d385a5c16a7796fe8bb5a5e';
const refreshTokenSecret = 'cfc3042fc6631c2106f65dfb810a9ecb5a91f1fa4d385a5c16a7796fe8bb5a5e';

module.exports = (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) return res.status(401).send({ operation: 'error', message: 'No token found' });

    jwt.verify(token, accessTokenSecret, (err, payload) => {
        if (err) {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(403).send({ operation: 'error', message: 'No refresh token found' });
            }

            jwt.verify(refreshToken, refreshTokenSecret, (err, refreshPayload) => {
                if (err) {
                    console.error('Refresh Token Error:', err);
                    return res.status(403).send({ operation: 'error', message: 'Invalid refresh token' });
                }

                const newAccessToken = jwt.sign({ user_id: user.user_id }, accessTokenSecret, { expiresIn: '1h' });

                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 3600 * 1000
                });

                req.userId = refreshPayload.user_id; // ✅ SET userId
                next();
            });
        } else {
            req.userId = payload.user_id; // ✅ SET userId
            next();
        }
    });
};
