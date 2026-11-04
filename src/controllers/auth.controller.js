
import { matchedData } from "express-validator";
import { UserModel } from "../models/user.model.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";

// REGISTRAR USUARIO
export const register = async (req, res) => {
    try {
        const { username, email, password, profile } = matchedData(req);

        // Verificar si ya existe el username o email
        const existingUser = await UserModel.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(409).json({
                msg: "El nombre de usuario o email ya está registrado"
            });
        }

        // Hashear contraseña
        const hashedPassword = await hashPassword(password);

        // Crear usuario
        const newUser = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            profile,
            role: "user"
        });

        return res.status(201).json({
            msg: "Usuario registrado correctamente",
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                profile: newUser.profile
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                msg: "El username o email ya existe"
            });
        }

        console.error("Error en registro:", error);

        return res.status(500).json({
            msg: "Error interno al registrar usuario"
        });
    }
};

// INICIAR SESIÓN
export const login = async (req, res) => {
    try {
        const { email, password } = matchedData(req);

        // Buscar usuario activo
        const user = await UserModel.findOne({
            email,
            deletedAt: null
        });

        if (!user) {
            return res.status(401).json({
                msg: "Credenciales incorrectas"
            });
        }

        // Comparar contraseña
        const validPassword = await comparePassword(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                msg: "Credenciales incorrectas"
            });
        }

        // Generar JWT
        const token = generateToken({
            id: user._id.toString(),
            role: user.role
        });

        // Guardar JWT en una cookie httpOnly
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            msg: "Inicio de sesión exitoso",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Error en login:", error);

        return res.status(500).json({
            msg: "Error interno al iniciar sesión"
        });
    }
};
