import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
    {
        venue: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 100,
            trim: true
        },

        address: {
            type: String,
            required: true,
            minlength: 5,
            maxlength: 150,
            trim: true
        },

        city: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 50,
            trim: true
        }
    },
    {
        _id: false
    }
);

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 150,
            trim: true
        },

        description: {
            type: String,
            required: true,
            minlength: 20,
            trim: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        capacity: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "La capacidad debe ser un número entero"
            }
        },

        price: {
            type: Number,
            min: 0,
            default: 0
        },

        status: {
            type: String,
            enum: ["scheduled", "cancelled", "finished"],
            default: "scheduled"
        },

        location: {
            type: locationSchema,
            required: true
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category"
            }
        ]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const EventModel = mongoose.model(
    "Event",
    eventSchema
);