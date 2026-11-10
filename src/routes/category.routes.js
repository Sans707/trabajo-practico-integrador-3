
import { Router } from "express";
import { body, param } from "express-validator";

import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from "../controllers/category.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { validateFields } from "../middlewares/validation.middleware.js";

export const categoryRouter = Router();


const validateCategoryId = [
    param("id")
        .isMongoId()
        .withMessage("El ID de la categoría no es válido"),

    validateFields
];

const createCategoryValidations = [
    body("name")
        .isString()
        .withMessage("El nombre debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 2, max: 30 })
        .withMessage("El nombre debe tener entre 2 y 30 caracteres"),

    body("description")
        .optional()
        .isString()
        .withMessage("La descripción debe ser texto")
        .bail()
        .trim()
        .isLength({ max: 200 })
        .withMessage("La descripción no puede superar 200 caracteres"),

    validateFields
];


const updateCategoryValidations = [
    body("name")
        .optional()
        .isString()
        .withMessage("El nombre debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 2, max: 30 })
        .withMessage("El nombre debe tener entre 2 y 30 caracteres"),

    body("description")
        .optional()
        .isString()
        .withMessage("La descripción debe ser texto")
        .bail()
        .trim()
        .isLength({ max: 200 })
        .withMessage("La descripción no puede superar 200 caracteres"),

    validateFields
];


categoryRouter.use(authMiddleware);


categoryRouter.post(
    "/",
    adminMiddleware,
    createCategoryValidations,
    createCategory
);


categoryRouter.get(
    "/",
    getAllCategories
);


categoryRouter.get(
    "/:id",
    validateCategoryId,
    getCategoryById
);


categoryRouter.put(
    "/:id",
    adminMiddleware,
    validateCategoryId,
    updateCategoryValidations,
    updateCategory
);


categoryRouter.delete(
    "/:id",
    adminMiddleware,
    validateCategoryId,
    deleteCategory
);
