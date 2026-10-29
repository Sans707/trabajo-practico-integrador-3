import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 50,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 50,
            trim: true
        },

        birthDate: {
            type: Date,
            required: false
        },

        phone: {
            type: String,
            required: false,
            trim: true
        }
    },
    {
        _id: false
    }
);

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 20,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        profile: {
            type: profileSchema,
            required: true
        },

        deletedAt: {
            type: Date,
            default: null
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

userSchema.virtual("events", {
    ref: "Event",
    localField: "_id",
    foreignField: "organizer"
});

export const UserModel = mongoose.model("User", userSchema);