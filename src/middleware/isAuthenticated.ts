const jwt = require('jsonwebtoken');

export const isAuthenticated = async (accessToken) => {
    const TOKEN_SECRET = 'validSecret';
    const invalidResponse = {
        isValid: false,
        id: null
    };
    if (!accessToken) {
        return invalidResponse;
    }

    const decoded: any = await jwt.verify(accessToken, TOKEN_SECRET);

    if (decoded.id) {
        return {
            isValid: true,
            id: decoded.id
        };
    }


    return invalidResponse;
    
};