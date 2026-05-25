import { expressjwt } from 'express-jwt'; // <-- Fixed the import syntax
import config from '../config.json';
import db from '../_helpers/db';

const secret = process.env.JWT_SECRET || config.secret;

export default function authorize(roles: any = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.auth)
        expressjwt({ secret, algorithms: ['HS256'] }), // <-- Changed jwt() to expressjwt()

        // authorize based on user role
        async (req: any, res: any, next: any) => {
            // Note: Newer express-jwt versions attach the token payload to req.auth instead of req.user
            const userId = req.auth?.id || req.user?.id;
            const account = await db.Account.findByPk(userId);

            if (!account || (roles.length && !roles.includes(account.role))) {
                // account no longer exists or role not authorized
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // authentication and authorization successful
            req.user = req.user || {};
            req.user.id = userId;
            req.user.role = account.role;

            const refreshTokens = await account.getRefreshTokens();
            req.user.ownsToken = (token: any) => !!refreshTokens.find((x: any) => x.token === token);
            next();
        }
    ];
}