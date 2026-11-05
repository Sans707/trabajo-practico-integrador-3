
import { Router } from "express";
import { body } from "express-validator";

import {
    register,
    login,
    getProfile,
    updateProfile,
    logout
} from "../controllers/auth.controller.js";

import { validateFields } from "../middlewares/validation.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const authRouter = Router();



authRouter.post(
    "/register",
    [
        body("username")
            .isString()
            .withMessage("El username debe ser texto")
            .bail()
            .trim()
            .isLength({ min: 3, max: 20 })
            .withMessage("El username debe tener entre 3 y 20 caracteres")
            .matches(/^[a-zA-Z0-9]+$/)
            .withMessage("El username debe ser alfanumérico"),

        body("email")
            .isString()
            .withMessage("El email debe ser texto")
            .bail()
            .trim()
            .isEmail()
            .withMessage("Email inválido")
            .bail()
            .toLowerCase(),

        body("password")
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

        body("profile.firstName")
            .isString()
            .withMessage("El nombre es obligatorio")
            .bail()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("El nombre debe tener entre 2 y 50 caracteres")
            .matches(/^[\p{L} ]+$/u)
            .withMessage("El nombre solo debe contener letras"),

        body("profile.lastName")
            .isString()
            .withMessage("El apellido es obligatorio")
            .bail()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("El apellido debe tener entre 2 y 50 caracteres")
            .matches(/^[\p{L} ]+$/u)
            .withMessage("El apellido solo debe contener letras"),

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
            .withMessage("El teléfono debe tener entre 8 y 15 números"),

        body("role")
            .not()
            .exists()
            .withMessage("No se puede asignar un rol desde el registro público"),

        validateFields
    ],
    register
);



authRouter.post(
    "/login",
    [
        body("email")
            .isEmail()
            .withMessage("Email inválido")
            .bail()
            .toLowerCase(),

        body("password")
            .isString()
            .withMessage("La contraseña es obligatoria")
            .bail()
            .notEmpty()
            .withMessage("La contraseña es obligatoria"),

        validateFields
    ],
    login
);



authRouter.get(
    "/profile",
    authMiddleware,
    getProfile
);



authRouter.put(
    "/profile",
    authMiddleware,
    [
        body("profile.firstName")
            .optional()
            .isString()
            .withMessage("El nombre debe ser texto")
            .bail()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("El nombre debe tener entre 2 y 50 caracteres")
            .matches(/^[\p{L} ]+$/u)
            .withMessage("El nombre solo puede contener letras"),

        body("profile.lastName")
            .optional()
            .isString()
            .withMessage("El apellido debe ser texto")
            .bail()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("El apellido debe tener entre 2 y 50 caracteres")
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
            .withMessage("El teléfono debe tener entre 8 y 15 números"),

        validateFields
    ],
    updateProfile
);



authRouter.post(
    "/logout",
    authMiddleware,
    logout
);
