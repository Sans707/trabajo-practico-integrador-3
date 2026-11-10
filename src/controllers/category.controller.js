
import { matchedData } from "express-validator";
import { CategoryModel } from "../models/category.model.js";
import { EventModel } from "../models/event.model.js";


// CREAR CATEGORÍA
export const createCategory = async (req, res) => {
    try {
        const { name, description } = matchedData(req, {
            locations: ["body"]
        });

        // Verificar si ya existe una categoría con ese nombre
        const existingCategory = await CategoryModel.findOne({
            name
        });

        if (existingCategory) {
            return res.status(409).json({
                msg: "Ya existe una categoría con ese nombre"
            });
        }

        // Crear categoría
        const newCategory = await CategoryModel.create({
            name,
            description
        });

        return res.status(201).json({
            msg: "Categoría creada correctamente",
            data: newCategory
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                msg: "Ya existe una categoría con ese nombre"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                msg: "Datos de categoría inválidos",
                error: error.message
            });
        }

        console.error("Error al crear categoría:", error);

        return res.status(500).json({
            msg: "Error interno al crear categoría"
        });
    }
};


// OBTENER TODAS LAS CATEGORÍAS
export const getAllCategories = async (req, res) => {
    try {
        // Obtener categorías ordenadas alfabéticamente
        const categories = await CategoryModel.find()
            .sort({ name: 1 });

        return res.status(200).json({
            msg: "Categorías obtenidas correctamente",
            total: categories.length,
            data: categories
        });

    } catch (error) {
        console.error("Error al obtener categorías:", error);

        return res.status(500).json({
            msg: "Error interno al obtener categorías"
        });
    }
};


// OBTENER CATEGORÍA POR ID CON VIRTUAL POPULATE
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar categoría con sus eventos relacionados
        const category = await CategoryModel.findById(id)
            .populate({
                path: "events",
                populate: {
                    path: "organizer",
                    select: "username email"
                }
            });

        if (!category) {
            return res.status(404).json({
                msg: "Categoría no encontrada"
            });
        }

        return res.status(200).json({
            msg: "Categoría obtenida correctamente",
            data: category
        });

    } catch (error) {
        console.error("Error al buscar categoría:", error);

        return res.status(500).json({
            msg: "Error interno al buscar categoría"
        });
    }
};


// ACTUALIZAR CATEGORÍA
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const { name, description } = matchedData(req, {
            locations: ["body"]
        });

        // Verificar que se haya enviado algún campo
        if (name === undefined && description === undefined) {
            return res.status(400).json({
                msg: "Debés enviar al menos un campo para actualizar"
            });
        }

        // Buscar categoría existente
        const category = await CategoryModel.findById(id);

        if (!category) {
            return res.status(404).json({
                msg: "Categoría no encontrada"
            });
        }

        // Verificar que el nuevo nombre no esté ocupado
        if (name !== undefined && name !== category.name) {
            const existingCategory = await CategoryModel.findOne({
                _id: { $ne: id },
                name
            });

            if (existingCategory) {
                return res.status(409).json({
                    msg: "Ya existe otra categoría con ese nombre"
                });
            }

            category.name = name;
        }

        // Actualizar descripción si fue enviada
        if (description !== undefined) {
            category.description = description;
        }

        // Guardar cambios
        await category.save();

        return res.status(200).json({
            msg: "Categoría actualizada correctamente",
            data: category
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                msg: "El nombre de categoría ya existe"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                msg: "Datos de categoría inválidos",
                error: error.message
            });
        }

        console.error("Error al actualizar categoría:", error);

        return res.status(500).json({
            msg: "Error interno al actualizar categoría"
        });
    }
};


// ELIMINAR CATEGORÍA CON CASCADA
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que la categoría exista
        const category = await CategoryModel.findById(id);

        if (!category) {
            return res.status(404).json({
                msg: "Categoría no encontrada"
            });
        }

        // Quitar la referencia de todos los eventos asociados
        const result = await EventModel.updateMany(
            { categories: category._id },
            {
                $pull: {
                    categories: category._id
                }
            }
        );

        // Eliminar físicamente la categoría
        await CategoryModel.deleteOne({
            _id: category._id
        });

        return res.status(200).json({
            msg: "Categoría eliminada correctamente",
            data: {
                id: category._id,
                updatedEvents: result.modifiedCount
            }
        });

    } catch (error) {
        console.error("Error al eliminar categoría:", error);

        return res.status(500).json({
            msg: "Error interno al eliminar categoría"
        });
    }
};
