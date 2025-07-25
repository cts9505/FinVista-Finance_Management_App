import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    adminReply: {
        content: {
            type: String,
            default: null
        },
        repliedAt: {
            type: Date,
            default: null
        },
        repliedBy: {
            type: String,
            default: null
        }
    }
}, {
    timestamps: true
});

// Virtual field to populate user info
reviewSchema.virtual('user', {
    ref: 'Users',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Make sure virtuals are included when converting to JSON
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

const reviewModel = mongoose.model('Reviews', reviewSchema);

export default reviewModel;