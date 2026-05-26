const mysql = require('mysql2/promise');

async function run() {
    try {
        console.log("Connecting to professor's database...");
        const connection = await mysql.createConnection({
            host: '153.92.15.31',
            user: 'u875409848_2026_1',
            password: 's*3o^*xCA',
            database: 'u875409848_2026_1'
        });
        
        console.log("Setting aldrieabais12@gmail.com to Admin and verifying...");
        const [result] = await connection.execute(
            "UPDATE accounts SET role = 'Admin', verified = NOW() WHERE email = 'aldrieabais12@gmail.com'"
        );
        
        console.log("Update Success:", result.info || result);
    } catch (err) {
        console.error("Error:", err);
    }
    process.exit();
}
run();
