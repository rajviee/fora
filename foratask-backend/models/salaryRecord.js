const mongoose = require('mongoose');

const salaryRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    // Period
    month: {
        type: Number,
        required: true,
        min: 0,
        max: 11
    },
    year: {
        type: Number,
        required: true
    },
    // Attendance summary
    attendance: {
        workingDays: { type: Number, default: 0 },
        presentDays: { type: Number, default: 0 },
        absentDays: { type: Number, default: 0 },
        halfDays: { type: Number, default: 0 },
        paidLeaveDays: { type: Number, default: 0 },
        unpaidLeaveDays: { type: Number, default: 0 },
        holidays: { type: Number, default: 0 },
        weekends: { type: Number, default: 0 },
        totalWorkingHours: { type: Number, default: 0 },
        overtimeHours: { type: Number, default: 0 },
        lateDays: { type: Number, default: 0 },
        earlyLeaveDays: { type: Number, default: 0 }
    },
    // Salary breakdown
    earnings: {
        basicSalary: { type: Number, default: 0 },
        components: [{
            name: { type: String },
            amount: { type: Number }
        }],
        overtimePay: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 }
    },
    deductions: {
        components: [{
            name: { type: String },
            amount: { type: Number }
        }],
        lossOfPay: { type: Number, default: 0 }, // Deduction for absences
        pf: { type: Number, default: 0 },
        esi: { type: Number, default: 0 },
        professionalTax: { type: Number, default: 0 },
        tds: { type: Number, default: 0 },
        totalDeductions: { type: Number, default: 0 }
    },
    // Final amounts
    grossSalary: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    // Payment status
    paymentStatus: {
        type: String,
        enum: ['pending', 'processed', 'paid', 'on-hold'],
        default: 'pending'
    },
    paymentDate: {
        type: Date,
        default: null
    },
    paymentMode: {
        type: String,
        enum: ['bank-transfer', 'cheque', 'cash', null],
        default: null
    },
    transactionId: {
        type: String,
        default: null
    },
    // Approval
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    // Notes
    notes: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

salaryRecordSchema.index({ user: 1, year: 1, month: 1 }, { unique: true });
salaryRecordSchema.index({ company: 1, year: 1, month: 1 });

module.exports = mongoose.model('SalaryRecord', salaryRecordSchema);
