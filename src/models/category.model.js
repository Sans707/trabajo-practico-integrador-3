import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            minlength: 2,
            maxlength: 30,
            trim: true
        },

        description: {
            type: String,
            required: false,
            maxlength: 200,
            trim: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

categorySchema.virtual("events", {
    ref: "Event",
    localField: "_id",
    foreignField: "categories"
});

export const CategoryModel = mongoose.model(
    "Category",
    categorySchema
);