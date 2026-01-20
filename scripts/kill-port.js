import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to server/.env
const envPath = path.join(__dirname, '../server/.env');

const killPort = (port) => {
    return new Promise((resolve) => {
        exec(`lsof -i :${port} -t`, async (err, stdout) => {
            if (err) {
                // Command failed or no process found (exit code 1)
                if (err.code === 1) {
                    console.log(`No process running on port ${port}.`);
                } else {
                    console.error(`Error checking for process on port ${port}:`, err);
                }
                resolve();
                return;
            }

            const pids = stdout.trim().split('\n');
            if (pids.length > 0) {
                console.log(`Found processes on port ${port}: ${pids.join(', ')}`);
                const killPromises = pids.map(pid => {
                    return new Promise((resolveKill) => {
                        console.log(`Killing process ${pid} on port ${port}...`);
                        exec(`kill -9 ${pid}`, (killErr) => {
                            if (killErr) {
                                console.error(`Failed to kill process ${pid} on port ${port}:`, killErr);
                            } else {
                                console.log(`Process ${pid} on port ${port} killed successfully.`);
                            }
                            resolveKill();
                        });
                    });
                });
                await Promise.all(killPromises);
                resolve();
            } else {
                resolve();
            }
        });
    });
};

const main = async () => {
    const portsToKill = [8080]; // Always kill frontend port

    try {
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/^PORT=(\d+)/m);

            if (match && match[1]) {
                const port = parseInt(match[1], 10);
                console.log(`Found PORT=${port} in server/.env`);
                portsToKill.push(port);
            } else {
                console.log('PORT not defined in server/.env');
            }
        } else {
            console.log('server/.env file not found');
        }
    } catch (error) {
        console.error('Error reading .env file:', error);
    }

    for (const port of portsToKill) {
        await killPort(port);
    }
};

main();
