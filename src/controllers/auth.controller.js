
import { matchedData } from "express-validator";
import { UserModel } from "../models/user.model.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";


export const register = async (req, res) => {
    try {
        const { username, email, password, profile } = matchedData(req);

        const existingUser = await UserModel.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(409).json({
                msg: "El nombre de usuario o email ya está registrado"
            });
        }

        const hashedPassword = await hashPassword(password);

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

        if (error.name === "ValidationError") {
            return res.status(400).json({
                msg: "Datos de usuario inválidos",
                error: error.message
            });
        }

        console.error("Error en registro:", error);

        return res.status(500).json({
            msg: "Error interno al registrar usuario"
        });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = matchedData(req);

     
        const user = await UserModel.findOne({
            email,
            deletedAt: null
        });

        if (!user) {
            return res.status(401).json({
                msg: "Credenciales incorrectas"
            });
        }

       
        const validPassword = await comparePassword(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                msg: "Credenciales incorrectas"
            });
        }

        
        const token = generateToken({
            id: user._id.toString(),
            role: user.role
        });

      
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


export const getProfile = async (req, res) => {
    try {
        const user = req.user;

        return res.status(200).json({
            msg: "Perfil obtenido correctamente",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error("Error al obtener perfil:", error);

        return res.status(500).json({
            msg: "Error interno al obtener el perfil"
        });
    }
};



export const updateProfile = async (req, res) => {
    try {
        const { profile = {} } = matchedData(req);

      
        if (Object.keys(profile).length === 0) {
            return res.status(400).json({
                msg: "Debés enviar al menos un campo del perfil"
            });
        }

        const user = req.user;

      
        for (const [field, value] of Object.entries(profile)) {
            user.set(`profile.${field}`, value);
        }

      
        await user.save();

        return res.status(200).json({
            msg: "Perfil actualizado correctamente",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                msg: "Datos del perfil inválidos",
                error: error.message
            });
        }

        console.error("Error al actualizar perfil:", error);

        return res.status(500).json({
            msg: "Error interno al actualizar el perfil"
        });
    }
};



export const logout = async (req, res) => {
    try {
        
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return res.status(200).json({
            msg: "Sesión cerrada correctamente"
        });

    } catch (error) {
        console.error("Error al cerrar sesión:", error);

        return res.status(500).json({
            msg: "Error interno al cerrar sesión"
        });
    }
};
