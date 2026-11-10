
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { connectDB } from "./src/config/database.js";

import { authRouter } from "./src/routes/auth.routes.js";
import { userRouter } from "./src/routes/user.routes.js";
import { categoryRouter } from "./src/routes/category.routes.js";
import { eventRouter } from "./src/routes/event.routes.js";

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/events", eventRouter);


app.get("/", (req, res) => {
    return res.status(200).json({
        message: "API Trabajo Práctico Integrador III"
    });
});


const PORT = process.env.PORT || 3000;


const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
                `Servidor ejecutándose en http://localhost:${PORT}`
            );
        });

    } catch (error) {
        console.error(
            "Error al iniciar el servidor:",
            error.message
        );

        process.exit(1);
    }
};

startServer();
