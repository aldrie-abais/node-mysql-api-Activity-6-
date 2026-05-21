import config from '../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};


// Helper function to safely load config and fix initialization order
function getDatabaseConfig() {
    const fileConfig = process.env.NODE_ENV === 'production' ? {} : config;
    const databaseConfig = (fileConfig as any).database || {};

    return {
        host: process.env.DB_HOST || databaseConfig.host,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : (databaseConfig.port || 3306),
        user: process.env.DB_USER || databaseConfig.user,
        password: process.env.DB_PASSWORD || databaseConfig.password,
        database: process.env.DB_NAME || databaseConfig.database,
        ssl: process.env.DB_SSL === 'true'
    };
}

initialize();

async function initialize() {
    // Extract variables safely
    const { host, port, user, password, database, ssl } = getDatabaseConfig();

    // Only attempt to create the database locally, never in production
    if (process.env.NODE_ENV !== 'production' && host === 'localhost') {
        const connection = await mysql.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    }


const sequelize = new Sequelize(
    database, 
    user, 
    password, 
    {
        host: host,
        port: port, 
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            }
        }
    }
);

    // Initialize models and add them to the exported db object
    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    // Define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    // Sync all models with database
    await sequelize.sync();
}

export default db;