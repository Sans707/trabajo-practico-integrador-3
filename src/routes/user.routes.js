
import { Router } from "express";
import { body, param } from "express-validator";

import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from "../controllers/user.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { validateFields } from "../middlewares/validation.middleware.js";

export const userRouter = Router();


const validateUserId = [
    param("id")
        .isMongoId()
        .withMessage("El ID del usuario no es válido"),

    validateFields
];


const updateUserValidations = [
    body("username")
        .optional()
        .isString()
        .withMessage("El username debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage("El username debe tener entre 3 y 20 caracteres")
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage("El username debe ser alfanumérico"),

    body("email")
        .optional()
        .isString()
        .withMessage("El email debe ser texto")
        .bail()
        .trim()
        .isEmail()
        .withMessage("Email inválido")
        .bail()
        .toLowerCase(),

    body("password")
        .optional()
        .isString()
        .withMessage("La contraseña debe ser texto")
        .bail()
        .isLength({ min: 8 })
        .withMessage("Mínimo 8 caracteres")
        .matches(/[A-Z]/)
        .withMessage("Debe contener una mayúscula")
        .matches(/[a-z]/)
        .withMessage("Debe contener una minúscula")
        .matches(/[0-9]/)
        .withMessage("Debe contener un número"),

    body("role")
        .optional()
        .isIn(["user", "admin"])
        .withMessage("El rol debe ser user o admin"),

    body("profile")
        .optional()
        .isObject()
        .withMessage("El perfil debe ser un objeto"),

    body("profile.firstName")
        .optional()
        .isString()
        .withMessage("El nombre debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Nombre entre 2 y 50 caracteres")
        .matches(/^[\p{L} ]+$/u)
        .withMessage("El nombre solo puede contener letras"),

    body("profile.lastName")
        .optional()
        .isString()
        .withMessage("El apellido debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Apellido entre 2 y 50 caracteres")
        .matches(/^[\p{L} ]+$/u)
        .withMessage("El apellido solo puede contener letras"),

    body("profile.birthDate")
        .optional()
        .isISO8601({ strict: true })
        .withMessage("Fecha de nacimiento inválida"),

    body("profile.phone")
        .optional()
        .isString()
        .withMessage("El teléfono debe ser texto")
        .bail()
        .trim()
        .matches(/^[0-9]{8,15}$/)
        .withMessage("El teléfono debe tener entre 8 y 15 dígitos"),

    validateFields
];

userRouter.use(authMiddleware, adminMiddleware);


userRouter.get(
    "/",
    getAllUsers
);


userRouter.get(
    "/:id",
    validateUserId,
    getUserById
);


userRouter.put(
    "/:id",
    validateUserId,
    updateUserValidations,
    updateUser
);


userRouter.delete(
    "/:id",
    validateUserId,
    deleteUser
);
