
import { Router } from "express";
import { body } from "express-validator";

import { register, login } from "../controllers/auth.controller.js";
import { validateFields } from "../middlewares/validation.middleware.js";

export const authRouter = Router();

// REGISTRO
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
            .withMessage("Nombre entre 2 y 50 caracteres")
            .matches(/^[\p{L} ]+$/u)
            .withMessage("El nombre debe contener solo letras"),

        body("profile.lastName")
            .isString()
            .withMessage("El apellido es obligatorio")
            .bail()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("Apellido entre 2 y 50 caracteres")
            .matches(/^[\p{L} ]+$/u)
            .withMessage("El apellido debe contener solo letras"),

        body("profile.birthDate")
            .optional()
            .isISO8601({ strict: true })
            .withMessage("Fecha de nacimiento inválida"),

        body("profile.phone")
            .optional()
            .isString()
            .bail()
            .trim()
            .matches(/^[0-9]{8,15}$/)
            .withMessage("El teléfono debe tener entre 8 y 15 números"),

        body("role")
            .not()
            .exists()
            .withMessage("No se puede asignar un rol en el registro público"),

        validateFields
    ],
    register
);

// LOGIN
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
