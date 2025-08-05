import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema({
    loginAt: {
        type: Date,
        default: Date.now
    },
    loginMethod: {
        type: String
    },
    ipAddress: {
        type: String,
        required: true
    },
    device: {
        type: String
    },
    browser: {
        type: String
    },
    operatingSystem: {
        type: String
    },
    location: {
        country: { type: String },
        city: { type: String },
        region: { type: String },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    isSuccessful: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        default: null
    },
    address: {
        type: String,
        trim: true,
        default: null
    },
    age: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: function() {
            return this.authProvider === 'local';
        }
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        required: true,
        default: 'local'
    },
    lastPasswordChange: {
        type: Date,
        default: Date.now
    },
    verifyOtp: { 
        type: String,
         default: '' 
    },
    verifyToken: { 
        type: String 
    }, 
    verifyOtpExpiresAt: { 
        type: Number, 
        default: 0 
    },
    resetPasswordOtp: {
        type: String,
        default: ''
    },
    resetPasswordToken:{
        type: String,
        default: ''
    },
    resetPasswordExpires: {
        type: Number,
        default: 0
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: null
    },
    imagePublicId: {
        type: String,
        default: null
      },
    isPremium: {
        type: Boolean,
        default: false
    },
    isTrial: {
        type: Boolean,
        default: false
    },
    trialEndDate: {
        type: Date,
        default: null
    },
    subscriptionEndDate: {
        type: Date,
        default: null
    },
    subscriptionType: {
        type: String,
        enum: ['none', 'trial', 'monthly', 'annually'],
        default: 'none'
    },
    isOnboardingComplete: {
        type: Boolean,
        default: false
    },
    isFirstLogin: {
        type: Boolean,
        default: false
    },
    loginStreak: {
        type: Number,
        default: 0
    },
    lastLogin: {
        type: Date,
        default: null
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isDeactivated: {
        type: Boolean,
        default: false
    },
    accountDeletionDate: {
        type: Date,
        default: null
    },
    onboardingData: {
        employmentStatus: {
            type: String
        },
        yearlyIncome: {
            type: Number,
            default: 0
        },
        customIncomeCategories: [{
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            name: String
        }],
        customExpenseCategories: [{
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            name: String
        }],
        monthlyBudgets: [{
            month: {
                type: Number,
                required: true,
                min: 1,
                max: 12
            },
            year: {
                type: Number,
                required: true
            },
            amount: {
                type: Number,
                default: 0,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        savingsGoal: {
            type: Number,
            default: 0
        },
        financialGoals: [{
            type: String
        }],
        financialHabits: [{
            type: String
        }],
        isCurrentlyInvesting: {
            type: Boolean,
            default: false
        },
        investmentTypes: [{
            type: String
        }],
        wantsInvestmentRecommendations: {
            type: Boolean,
            default: false
        },
        riskLevel: {
            type: String,
            enum: ["Low", "Moderate", "High"],
            default: "Moderate"
        }
    },
    loginHistory: {
        type: [loginHistorySchema],
        validate: {
            validator: function(v) {
                return v.length <= 3;
            },
            message: 'Login history can have a maximum of 3 entries'
        }
    },
    deviceTokens: [{
        token: {
            type: String,
            unique: true
        },
        device: {
            type: String
        },
        lastUsed: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

userSchema.index(
    { phone: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { phone: { $ne: null } } 
    }
);

userSchema.pre('save', function(next) {

    if (this.isModified('loginHistory') && this.loginHistory.length > 3) {
        this.loginHistory = this.loginHistory.slice(-3);
    }


    if (this.isDeactivated && this.isModified('lastLogin')) {
        this.isDeactivated = false;
        this.accountDeletionDate = null;
    }

    next();
});

const userModel = mongoose.model('Users', userSchema);

export default userModel;