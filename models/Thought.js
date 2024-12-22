import mongoose from "mongoose";

const { Schema } = mongoose;

const thoughtSchema = new Schema({
    message: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 140,
    },
    hearts: {
        type: Number,
        default: 0,
        immutable: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
});

export const Thought = mongoose.model("Thought", thoughtSchema);
