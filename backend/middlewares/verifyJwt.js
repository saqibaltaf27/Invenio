const jwt = require('jsonwebtoken');

const accessTokenSecret = 'cfc3042fc6631c2106f65dfb810a9ecb5a91f1fa4d385a5c16a7796fe8bb5a5e';
const refreshTokenSecret = 'cfc3042fc6631c2106f65dfb810a9ecb5a91f1fa4d385a5c16a7796fe8bb5a5e';

module.exports = (req, res, next) => {
    const token = req.cookies.accessToken;
    
    if (!token) return res.status(401).send({ operation: 'error', message: 'No token found' });
    // Verify the access token
    jwt.verify(token, accessTokenSecret, (err, payload) => {
        if (err) {
            // If access token is invalid, try refreshing with refresh token
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(403).send({ operation: 'error', message: 'No refresh token found' });
            }

            // Try verifying refresh token
            jwt.verify(refreshToken, refreshTokenSecret, (err, refreshPayload) => {
                if (err) {
					console.error('Access Token Error: ', err);
                    return res.status(403).send({ operation: 'error', message: 'Invalid refresh token' });
                } else {
					console.log('Access Token payload: ', payload);
					req.user = payload;
					next();
				}

                // Generate a new access token from the refresh token payload
                const newAccessToken = jwt.sign({ id: refreshPayload.id }, accessTokenSecret, { expiresIn: '1h' });

                // Set the new access token in a cookie
                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // Ensure secure cookies in production
                    maxAge: 3600 * 1000 // 1 hour
                });

                req.user = refreshPayload;
                return next();
            });
        } else {
            // If the access token is valid, proceed
            req.user = payload;
            next();
        }
    });
};
