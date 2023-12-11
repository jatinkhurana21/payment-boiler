const jwt = require('jsonwebtoken');

export const isAuthenticated = async (accessToken): Promise<{ isValid, id, role }> => {
    const TOKEN_SECRET = 'validSecret';
    const invalidResponse = {
        isValid: false,
        id: null,
        role: null
    };
    if (!accessToken) {
        return invalidResponse;
    }

    const decoded: any = await jwt.verify(accessToken, TOKEN_SECRET);

    if (decoded.id && decoded.role) {
        return {
            isValid: true,
            id: decoded.id,
            role: decoded.role
        };
    }


    return invalidResponse;

};