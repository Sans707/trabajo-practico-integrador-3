
import mongoose from "mongoose";
import { verifyToken } from "../helpers/jwt.helper.js";
import { UserModel } from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                msg: "No autorizado. Token no encontrado"
            });
        }

        let decoded;

        try {
            decoded = verifyToken(token);
        } catch (error) {
            return res.status(401).json({
                msg: "Token inválido o expirado"
            });
        }

        if (!decoded?.id || !mongoose.isValidObjectId(decoded.id)) {
            return res.status(401).json({
                msg: "Token inválido"
            });
        }

        const user = await UserModel.findOne({
            _id: decoded.id,
            deletedAt: null
        }).select("-password");

        if (!user) {
            return res.status(401).json({
                msg: "Usuario no encontrado o inactivo"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        console.error("Error en autenticación:", error);

        return res.status(500).json({
            msg: "Error interno de autenticación"
        });
    }
};
