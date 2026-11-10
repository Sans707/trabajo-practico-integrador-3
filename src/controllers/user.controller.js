
import { matchedData } from "express-validator";
import { UserModel } from "../models/user.model.js";
import { EventModel } from "../models/event.model.js";
import { hashPassword } from "../helpers/bcrypt.helper.js";

// DEVOLVER DATOS SIN EXPONER LA CONTRASEÑA
const formatUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    profile: user.profile,
    events: user.events || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});


// LISTAR TODOS LOS USUARIOS ACTIVOS
export const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find({
            deletedAt: null
        })
        .select("-password")
        .populate("events");

        return res.status(200).json({
            msg: "Usuarios obtenidos correctamente",
            total: users.length,
            data: users.map(formatUser)
        });

    } catch (error) {
        console.error("Error al obtener usuarios:", error);

        return res.status(500).json({
            msg: "Error interno al obtener usuarios"
        });
    }
};


// OBTENER USUARIO POR ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await UserModel.findOne({
            _id: id,
            deletedAt: null
        })
        .select("-password")
        .populate("events");

        if (!user) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }

        return res.status(200).json({
            msg: "Usuario obtenido correctamente",
            data: formatUser(user)
        });

    } catch (error) {
        console.error("Error al buscar usuario:", error);

        return res.status(500).json({
            msg: "Error interno al buscar usuario"
        });
    }
};


// ACTUALIZAR USUARIO
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const data = matchedData(req, {
            locations: ["body"]
        });

        const {
            username,
            email,
            password,
            role,
            profile
        } = data;

        // Buscar usuario activo
        const user = await UserModel.findOne({
            _id: id,
            deletedAt: null
        });

        if (!user) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }

        // Verificar campos permitidos del perfil
        const profileFields = [
            "firstName",
            "lastName",
            "birthDate",
            "phone"
        ];

        const validProfileFields = profileFields.filter(
            field => profile &&
                Object.prototype.hasOwnProperty.call(profile, field)
        );

        // Comprobar que existan datos para actualizar
        const hasChanges =
            username !== undefined ||
            email !== undefined ||
            password !== undefined ||
            role !== undefined ||
            validProfileFields.length > 0;

        if (!hasChanges) {
            return res.status(400).json({
                msg: "Debés enviar al menos un campo válido para actualizar"
            });
        }

        // Verificar unicidad de username y email
        const uniqueFilters = [];

        if (username !== undefined) {
            uniqueFilters.push({ username });
        }

        if (email !== undefined) {
            uniqueFilters.push({ email });
        }

        if (uniqueFilters.length > 0) {
            const existingUser = await UserModel.findOne({
                _id: { $ne: id },
                $or: uniqueFilters
            });

            if (existingUser) {
                return res.status(409).json({
                    msg: "El username o email ya pertenece a otro usuario"
                });
            }
        }

        // Actualizar datos generales
        if (username !== undefined) {
            user.username = username;
        }

        if (email !== undefined) {
            user.email = email;
        }

        if (role !== undefined) {
            user.role = role;
        }

        // Hashear contraseña nueva
        if (password !== undefined) {
            user.password = await hashPassword(password);
        }

        // Actualizar perfil embebido
        for (const field of validProfileFields) {
            user.set(`profile.${field}`, profile[field]);
        }

        // Guardar cambios
        await user.save();

        // Obtener eventos organizados por el usuario
        await user.populate("events");

        return res.status(200).json({
            msg: "Usuario actualizado correctamente",
            data: formatUser(user)
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                msg: "El username o email ya existe"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                msg: "Datos del usuario inválidos",
                error: error.message
            });
        }

        console.error("Error al actualizar usuario:", error);

        return res.status(500).json({
            msg: "Error interno al actualizar usuario"
        });
    }
};


// ELIMINACIÓN LÓGICA Y EN CASCADA
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar usuario activo
        const user = await UserModel.findOne({
            _id: id,
            deletedAt: null
        });

        if (!user) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }

        // Eliminar físicamente los eventos organizados
        const deletedEvents = await EventModel.deleteMany({
            organizer: user._id
        });

        // Realizar eliminación lógica del usuario
        user.deletedAt = new Date();

        await user.save();

        return res.status(200).json({
            msg: "Usuario eliminado lógicamente y eventos eliminados en cascada",
            data: {
                id: user._id,
                deletedAt: user.deletedAt,
                deletedEvents: deletedEvents.deletedCount
            }
        });

    } catch (error) {
        console.error("Error al eliminar usuario:", error);

        return res.status(500).json({
            msg: "Error interno al eliminar usuario"
        });
    }
};
