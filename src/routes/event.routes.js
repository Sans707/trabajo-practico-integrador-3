
import { Router } from "express";
import { body, param } from "express-validator";
import mongoose from "mongoose";

import {
    createEvent,
    getAllEvents,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent
} from "../controllers/event.controller.js";

import { CategoryModel } from "../models/category.model.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ownerOrAdminMiddleware } from "../middlewares/ownerOrAdmin.middleware.js";
import { validateFields } from "../middlewares/validation.middleware.js";

export const eventRouter = Router();


const validateEventId = [
    param("id")
        .isMongoId()
        .withMessage("El ID del evento no es válido"),

    validateFields
];


const validateCategories = () => {
    return body("categories")
        .optional()
        .isArray()
        .withMessage("Las categorías deben ser un array")
        .bail()
        .custom((ids) => {
            return ids.every(
                id => typeof id === "string" &&
                    mongoose.isValidObjectId(id)
            );
        })
        .withMessage("Las categorías deben contener ObjectIds válidos")
        .bail()
        .custom((ids) => {
            const uniqueIds = new Set(
                ids.map(id => id.toLowerCase())
            );

            return uniqueIds.size === ids.length;
        })
        .withMessage("No se permiten categorías repetidas")
        .bail()
        .custom(async (ids) => {
            const count = await CategoryModel.countDocuments({
                _id: { $in: ids }
            });

            if (count !== ids.length) {
                throw new Error(
                    "Una o más categorías no existen"
                );
            }

            return true;
        });
};


const createEventValidations = [
    body("title")
        .isString()
        .withMessage("El título debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 3, max: 150 })
        .withMessage("El título debe tener entre 3 y 150 caracteres"),

    body("description")
        .isString()
        .withMessage("La descripción debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 20 })
        .withMessage("La descripción debe tener mínimo 20 caracteres"),

    body("startDate")
        .isISO8601({ strict: true })
        .withMessage("La fecha de inicio no es válida"),

    body("endDate")
        .isISO8601({ strict: true })
        .withMessage("La fecha de finalización no es válida"),

    body("capacity")
        .isInt({ min: 1 })
        .withMessage("La capacidad debe ser un entero mayor o igual a 1")
        .toInt(),

    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("El precio debe ser mayor o igual a 0")
        .toFloat(),

    body("status")
        .optional()
        .isIn(["scheduled", "cancelled", "finished"])
        .withMessage("Estado no permitido"),

    body("location.venue")
        .isString()
        .withMessage("El lugar es obligatorio")
        .bail()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("El lugar debe tener entre 3 y 100 caracteres"),

    body("location.address")
        .isString()
        .withMessage("La dirección es obligatoria")
        .bail()
        .trim()
        .isLength({ min: 5, max: 150 })
        .withMessage("La dirección debe tener entre 5 y 150 caracteres"),

    body("location.city")
        .isString()
        .withMessage("La ciudad es obligatoria")
        .bail()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

    validateCategories(),

    validateFields
];


const updateEventValidations = [
    body("title")
        .optional()
        .isString()
        .withMessage("El título debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 3, max: 150 })
        .withMessage("El título debe tener entre 3 y 150 caracteres"),

    body("description")
        .optional()
        .isString()
        .withMessage("La descripción debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 20 })
        .withMessage("La descripción debe tener mínimo 20 caracteres"),

    body("startDate")
        .optional()
        .isISO8601({ strict: true })
        .withMessage("Fecha de inicio inválida"),

    body("endDate")
        .optional()
        .isISO8601({ strict: true })
        .withMessage("Fecha de finalización inválida"),

    body("capacity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("La capacidad debe ser un entero mayor o igual a 1")
        .toInt(),

    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("El precio debe ser mayor o igual a 0")
        .toFloat(),

    body("status")
        .optional()
        .isIn(["scheduled", "cancelled", "finished"])
        .withMessage("Estado no permitido"),

    body("location.venue")
        .optional()
        .isString()
        .withMessage("El lugar debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("El lugar debe tener entre 3 y 100 caracteres"),

    body("location.address")
        .optional()
        .isString()
        .withMessage("La dirección debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 5, max: 150 })
        .withMessage("La dirección debe tener entre 5 y 150 caracteres"),

    body("location.city")
        .optional()
        .isString()
        .withMessage("La ciudad debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

    validateCategories(),

    validateFields
];


eventRouter.use(authMiddleware);


eventRouter.post(
    "/",
    createEventValidations,
    createEvent
);


eventRouter.get(
    "/",
    getAllEvents
);


eventRouter.get(
    "/mine",
    getMyEvents
);


eventRouter.get(
    "/:id",
    validateEventId,
    getEventById
);


eventRouter.put(
    "/:id",
    validateEventId,
    ownerOrAdminMiddleware,
    updateEventValidations,
    updateEvent
);


eventRouter.delete(
    "/:id",
    validateEventId,
    ownerOrAdminMiddleware,
    deleteEvent
);
