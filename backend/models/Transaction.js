const mongoose = require('mongoose');

const baseTransactionSchema = {
    student_id: { type: String, required: true },
    date: { type: Date },
    type: { type: String, enum: ['Income', 'Expense', ''] },
    category: { type: String },
    amount: { type: Number },
    payment_method: { type: String },
    balance: { type: Number },
    notes: { type: String }
};

// Raw schema: everything is a string or mixed to allow messy data inserts without crash
const rawTransactionSchema = new mongoose.Schema({
    student_id: String,
    date: mongoose.Schema.Types.Mixed,
    type: String,
    category: String,
    amount: mongoose.Schema.Types.Mixed,
    payment_method: String,
    balance: mongoose.Schema.Types.Mixed,
    notes: String
}, { timestamps: true });

// Clean schema: strictly typed
const cleanTransactionSchema = new mongoose.Schema({
    student_id: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['Income', 'Expense'], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    payment_method: { type: String },
    balance: { type: Number },
    notes: { type: String }
}, { timestamps: true });

const RawTransaction = mongoose.model('RawTransaction', rawTransactionSchema);
const CleanTransaction = mongoose.model('CleanTransaction', cleanTransactionSchema);

module.exports = { RawTransaction, CleanTransaction };
