import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to server/.env
const envPath = path.join(__dirname, '../server/.env');

try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/^PORT=(\d+)/m);

        if (match && match[1]) {
            const port = match[1];
            console.log(`Found PORT=${port} in server/.env`);

            // Find process using the port
            exec(`lsof -i :${port} -t`, (err, stdout) => {
                if (err) {
                    // Command failed or no process found (exit code 1)
                    if (err.code === 1) {
                        console.log(`No process running on port ${port}.`);
                    } else {
                        console.error('Error checking for process:', err);
                    }
                    return;
                }

                const pid = stdout.trim();
                if (pid) {
                    console.log(`Killing process ${pid} on port ${port}...`);
                    exec(`kill -9 ${pid}`, (killErr) => {
                        if (killErr) {
                            console.error(`Failed to kill process ${pid}:`, killErr);
                        } else {
                            console.log('Process killed successfully.');
                        }
                    });
                }
            });
        } else {
            console.log('PORT not defined in server/.env');
        }
    } else {
        console.log('server/.env file not found');
    }
} catch (error) {
    console.error('Error reading .env file:', error);
}
