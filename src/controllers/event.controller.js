
import { matchedData } from "express-validator";
import { EventModel } from "../models/event.model.js";


const populateEvent = [
    {
        path: "organizer",
        select: "username email"
    },
    {
        path: "categories",
        select: "name description"
    }
];


const validDateRange = (startDate, endDate) => {
    return new Date(endDate).getTime() >
        new Date(startDate).getTime();
};


const handleError = (res, error, action) => {
    if (error.code === 11000) {
        return res.status(409).json({
            msg: "Ya existe un evento con ese título"
        });
    }

    if (error.name === "ValidationError" ||
        error.name === "CastError") {
        return res.status(400).json({
            msg: "Datos del evento inválidos",
            error: error.message
        });
    }

    console.error(`Error al ${action}:`, error);

    return res.status(500).json({
        msg: `Error interno al ${action}`
    });
};


export const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            startDate,
            endDate,
            capacity,
            price,
            status,
            location,
            categories = []
        } = matchedData(req, {
            locations: ["body"]
        });

        if (!validDateRange(startDate, endDate)) {
            return res.status(400).json({
                msg: "La fecha de finalización debe ser posterior a la de inicio"
            });
        }

        const newEvent = await EventModel.create({
            title,
            description,
            startDate,
            endDate,
            capacity,
            price,
            status,
            location: {
                venue: location.venue,
                address: location.address,
                city: location.city
            },
            organizer: req.user._id,
            categories
        });

        await newEvent.populate(populateEvent);

        return res.status(201).json({
            msg: "Evento creado correctamente",
            data: newEvent
        });

    } catch (error) {
        return handleError(res, error, "crear evento");
    }
};


export const getAllEvents = async (req, res) => {
    try {
        const events = await EventModel.find()
            .populate(populateEvent)
            .sort({ startDate: 1 });

        return res.status(200).json({
            msg: "Eventos obtenidos correctamente",
            total: events.length,
            data: events
        });

    } catch (error) {
        return handleError(res, error, "obtener eventos");
    }
};


export const getMyEvents = async (req, res) => {
    try {
        const events = await EventModel.find({
            organizer: req.user._id
        })
            .populate(populateEvent)
            .sort({ startDate: 1 });

        return res.status(200).json({
            msg: "Mis eventos obtenidos correctamente",
            total: events.length,
            data: events
        });

    } catch (error) {
        return handleError(res, error, "obtener mis eventos");
    }
};


export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await EventModel.findById(id)
            .populate(populateEvent);

        if (!event) {
            return res.status(404).json({
                msg: "Evento no encontrado"
            });
        }

        return res.status(200).json({
            msg: "Evento obtenido correctamente",
            data: event
        });

    } catch (error) {
        return handleError(res, error, "buscar evento");
    }
};


export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const data = matchedData(req, {
            locations: ["body"]
        });

        const event = await EventModel.findById(id);

        if (!event) {
            return res.status(404).json({
                msg: "Evento no encontrado"
            });
        }

        const allowedFields = [
            "title",
            "description",
            "startDate",
            "endDate",
            "capacity",
            "price",
            "status",
            "categories"
        ];

        const locationFields = [
            "venue",
            "address",
            "city"
        ];

        const fieldsToUpdate = allowedFields.filter(
            field => data[field] !== undefined
        );

        const locationToUpdate = locationFields.filter(
            field => data.location?.[field] !== undefined
        );

        if (fieldsToUpdate.length === 0 &&
            locationToUpdate.length === 0) {
            return res.status(400).json({
                msg: "Debés enviar al menos un campo válido para actualizar"
            });
        }

        if (data.title !== undefined &&
            data.title !== event.title) {
            const existingEvent = await EventModel.findOne({
                _id: { $ne: id },
                title: data.title
            });

            if (existingEvent) {
                return res.status(409).json({
                    msg: "Ya existe otro evento con ese título"
                });
            }
        }

        for (const field of fieldsToUpdate) {
            event.set(field, data[field]);
        }

        for (const field of locationToUpdate) {
            event.set(`location.${field}`, data.location[field]);
        }

        if (!validDateRange(event.startDate, event.endDate)) {
            return res.status(400).json({
                msg: "La fecha de finalización debe ser posterior a la de inicio"
            });
        }

        await event.save();

        await event.populate(populateEvent);

        return res.status(200).json({
            msg: "Evento actualizado correctamente",
            data: event
        });

    } catch (error) {
        return handleError(res, error, "actualizar evento");
    }
};


export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await EventModel.findByIdAndDelete(id);

        if (!event) {
            return res.status(404).json({
                msg: "Evento no encontrado"
            });
        }

        return res.status(200).json({
            msg: "Evento eliminado correctamente",
            data: {
                id: event._id,
                title: event.title
            }
        });

    } catch (error) {
        return handleError(res, error, "eliminar evento");
    }
};
