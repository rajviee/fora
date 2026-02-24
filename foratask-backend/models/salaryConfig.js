const mongoose = require('mongoose');

// Custom salary component schema
const salaryComponentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['earning', 'deduction'],
        required: true
    },
    amount: { type: Number, default: 0 },
    isPercentage: { type: Boolean, default: false }, // If true, amount is % of basic
    isFixed: { type: Boolean, default: true } // If false, calculated based on attendance
}, { _id: true });

const salaryConfigSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    // Basic salary
    basicSalary: {
        type: Number,
        default: 0
    },
    // Custom components (can be earnings or deductions)
    components: [salaryComponentSchema],
    // Standard deductions
    standardDeductions: {
        pf: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 12 } },
        esi: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0.75 } },
        professionalTax: { enabled: { type: Boolean, default: false }, amount: { type: Number, default: 200 } },
        tds: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } }
    },
    // Bank details
    bankDetails: {
        accountNumber: { type: String, default: null },
        ifscCode: { type: String, default: null },
        bankName: { type: String, default: null },
        accountHolderName: { type: String, default: null }
    },
    // Per day salary (calculated)
    perDaySalary: {
        type: Number,
        default: 0
    },
    // Per hour salary (for overtime)
    perHourSalary: {
        type: Number,
        default: 0
    },
    // Effective from date
    effectiveFrom: {
        type: Date,
        default: Date.now
    },
    // Status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Calculate gross salary
salaryConfigSchema.methods.calculateGrossSalary = function() {
    let gross = this.basicSalary;
    
    this.components.forEach(comp => {
        if (comp.type === 'earning') {
            if (comp.isPercentage) {
                gross += (this.basicSalary * comp.amount / 100);
            } else {
                gross += comp.amount;
            }
        }
    });
    
    return gross;
};

// Calculate deductions
salaryConfigSchema.methods.calculateDeductions = function() {
    let deductions = 0;
    const gross = this.calculateGrossSalary();
    
    // Custom deductions
    this.components.forEach(comp => {
        if (comp.type === 'deduction') {
            if (comp.isPercentage) {
                deductions += (gross * comp.amount / 100);
            } else {
                deductions += comp.amount;
            }
        }
    });
    
    // Standard deductions
    if (this.standardDeductions.pf.enabled) {
        deductions += (this.basicSalary * this.standardDeductions.pf.percentage / 100);
    }
    if (this.standardDeductions.esi.enabled) {
        deductions += (gross * this.standardDeductions.esi.percentage / 100);
    }
    if (this.standardDeductions.professionalTax.enabled) {
        deductions += this.standardDeductions.professionalTax.amount;
    }
    if (this.standardDeductions.tds.enabled) {
        deductions += (gross * this.standardDeductions.tds.percentage / 100);
    }
    
    return deductions;
};

// Calculate net salary
salaryConfigSchema.methods.calculateNetSalary = function() {
    return this.calculateGrossSalary() - this.calculateDeductions();
};

// Pre-save hook to calculate per day/hour salary
salaryConfigSchema.pre('save', function(next) {
    const gross = this.calculateGrossSalary();
    this.perDaySalary = gross / 30; // Assuming 30 days month
    this.perHourSalary = this.perDaySalary / 8; // Assuming 8 hours day
    next();
});

module.exports = mongoose.model('SalaryConfig', salaryConfigSchema);
