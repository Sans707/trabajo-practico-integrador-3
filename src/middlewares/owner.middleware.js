
import mongoose from "mongoose";
import { EventModel } from "../models/event.model.js";


export const ownerOrAdminMiddleware = async (req, res, next) => {
    try {
        
        if (!req.user) {
            return res.status(401).json({
                msg: "No autorizado. Debes iniciar sesión"
            });
        }

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                msg: "El ID del evento no es válido"
            });
        }

        const event = await EventModel.findById(id);

        if (!event) {
            return res.status(404).json({
                msg: "Evento no encontrado"
            });
        }

        const isAdmin = req.user.role === "admin";

        const isOwner =
            event.organizer.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                msg: "Acceso denegado. Solo el organizador o un administrador puede realizar esta acción"
            });
        }

        next();

    } catch (error) {
        console.error("Error al verificar permisos:", error);

        return res.status(500).json({
            msg: "Error interno al verificar permisos del evento"
        });
    }
};
