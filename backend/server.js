import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import router from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import Chatrouter from "./routes/aiChatRoutes.js";
import { startCronJobs } from "./sender/cronJobs.js";
// Import your package.json to get the version number
import packageJson from './package.json' with { type: 'json' };

const app = express();

const frontendUrls = process.env.FRONTEND_URLS;

const allowedOrigins = frontendUrls ? frontendUrls.split(',').map(url => url.trim()) : [];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

connectDB();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => { res.send("API Working") });

// --- UPDATED HEALTH CHECK ROUTE ---
app.get("/health", (req, res) => {
    const uptimeInSeconds = process.uptime();
    const uptime = {
        days: Math.floor(uptimeInSeconds / (3600 * 24)),
        hours: Math.floor(uptimeInSeconds % (3600 * 24) / 3600),
        minutes: Math.floor(uptimeInSeconds % 3600 / 60),
        seconds: Math.floor(uptimeInSeconds % 60)
    };

    const memoryUsage = process.memoryUsage();

    const healthCheckResponse = {
        status: "UP",
        version: packageJson.version,
        uptime,
        node: {
            version: process.version
        },
        memory: {
            rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`
        },
        timestamp: new Date().toISOString()
    };

    res.status(200).json(healthCheckResponse);
});

app.get('/ping', (req, res) => res.send('pong'));

app.use("/api/auth", router);
app.use("/api/user", userRouter);
app.use("/api/userchat/", Chatrouter);

startCronJobs();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started at port ${PORT}`);
});