import Cache from '../cache/cache';

export default class UserRepository {
    /*
    user Schema --
     userId,
     mobile,
     email,
     countryCode,
     isActive
    */
    public static create(data: { mobile; email; countryCode; isActive;}) {
        const { mobile, email, countryCode, isActive } = data;
        const uniqueUserId = Date.now();

        // using node cache to mock a database
        Cache.setData(uniqueUserId, { mobile, email, countryCode , isActive });
        return uniqueUserId;
    }

    public static get(userId) {
        const response = Cache.getData(userId);
        return response;
    }

    public static update(userId, updateData) {
        const userData = UserRepository.get(userId);
        if (!userId) return {
            isValid: false,
            completed: false
        };

        const updateKeys = Object.keys(updateData);

        updateKeys.forEach(key => {
            userData[key] = updateData[key];
        });
        Cache.setData(userId, userData);
        return {
            isValid: true,
            completed: true
        };
    }
}