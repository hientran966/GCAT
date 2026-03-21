const mysql = require("mysql2/promise");
const config = require("../config");

class MySQL {
    static pool = null;

    static async init() {
        if (this.pool) return this.pool;

        let retries = 5;

        while (retries) {
            try {
                this.pool = mysql.createPool({
                    host: config.db.host,
                    port: config.db.port,
                    user: config.db.username,
                    password: config.db.password,
                    database: config.db.database,
                    waitForConnections: true,
                    connectionLimit: 10,
                });

                // test connection
                const conn = await this.pool.getConnection();
                conn.release();

                console.log("MySQL pool connected!");
                return this.pool;
            } catch (err) {
                console.log("MySQL not ready, retrying...");
                retries--;
                await new Promise(res => setTimeout(res, 3000));
            }
        }

        throw new Error("Cannot connect to MySQL");
    }

    static async query(sql, params = []) {
        if (!this.pool) {
            throw new Error("MySQL pool not initialized");
        }
        const [rows] = await this.pool.execute(sql, params);
        return rows;
    }

    static async transaction(callback) {
        if (!this.pool) {
            throw new Error("MySQL pool not initialized");
        }

        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }
}

module.exports = MySQL;