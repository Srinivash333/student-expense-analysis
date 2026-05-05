const { RawTransaction, CleanTransaction } = require('../models/Transaction');
const csv = require('csv-parser');
const fs = require('fs');

const parseDate = (dateStr) => {
    if (!dateStr) return null;
    // Handle YYYY-MM-DD
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    // Handle DD/MM/YYYY or DD-MM-YYYY
    let parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
        if (parts[2].length === 4) {
            // Check if DD/MM/YYYY vs MM/DD/YYYY based on value > 12
            if (parseInt(parts[0]) > 12) {
                 d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // YYYY-MM-DD
                 if (!isNaN(d.getTime())) return d;
            } else {
                 // assume MM/DD/YYYY or DD/MM/YYYY. Let's try MM/DD/YYYY
                 d = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`); 
                 if (!isNaN(d.getTime())) return d;
                 d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); 
                 if (!isNaN(d.getTime())) return d;
            }
        }
    }
    return null;
};

const standardizeCategory = (cat) => {
    if (!cat) return "Others";
    cat = cat.trim().toLowerCase();
    if (cat === "fooding") return "Food";
    if (cat === "allowance") return "Pocket Money";
    // Capitalize first letter of each word
    return cat.replace(/\b\w/g, c => c.toUpperCase());
};

const cleanData = (rawRecords) => {
    const cleaned = [];
    const seen = new Set();

    rawRecords.forEach(record => {
        try {
            // 1. Missing values check
            if (!record.student_id || !record.date || !record.type || !record.amount) return;

            // 2. Parse Date
            const parsedDate = parseDate(record.date);
            if (!parsedDate) return;

            // 3. Amount parsing and outliers
            let amt = parseFloat(record.amount);
            if (isNaN(amt) || amt <= 0 || amt > 50000) return; // Drop negative, zero, and huge outliers

            // 4. Normalize Categories
            const cleanCat = standardizeCategory(record.category);

            // 5. Type normalization
            let type = record.type.trim();
            if (type !== 'Income' && type !== 'Expense') return;

            const cleanRecord = {
                student_id: record.student_id,
                date: parsedDate,
                type: type,
                category: cleanCat,
                amount: amt,
                payment_method: record.payment_method || "Unknown",
                balance: parseFloat(record.balance) || 0,
                notes: record.notes || ""
            };

            // 6. Duplicate checking
            const uniqueKey = `${cleanRecord.student_id}-${cleanRecord.date.toISOString()}-${cleanRecord.amount}-${cleanRecord.category}`;
            if (seen.has(uniqueKey)) return;
            seen.add(uniqueKey);

            cleaned.push(cleanRecord);
        } catch (e) {
            // Skip problematic records
        }
    });

    return cleaned;
};

exports.uploadData = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Save raw data
                await RawTransaction.insertMany(results);

                // Clean data
                const cleanedData = cleanData(results);

                // Save cleaned data
                await CleanTransaction.deleteMany({}); // Optional: clear old data
                await CleanTransaction.insertMany(cleanedData);

                // Cleanup uploaded file
                fs.unlinkSync(req.file.path);

                res.json({ 
                    message: 'Upload and cleaning successful', 
                    rawCount: results.length, 
                    cleanedCount: cleanedData.length 
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to process data' });
            }
        });
};

exports.getTransactions = async (req, res) => {
    try {
        const { student_id, type } = req.query;
        let query = {};
        if (student_id) query.student_id = student_id;
        if (type) query.type = type;

        const transactions = await CleanTransaction.find(query).sort({ date: -1 }).limit(100); // limit to 100 for ui
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const { student_id } = req.query;
        let matchStage = {};
        if (student_id) matchStage.student_id = student_id;

        const summary = await CleanTransaction.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$type",
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        const categoryDist = await CleanTransaction.aggregate([
            { $match: { ...matchStage, type: "Expense" } },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" }
                }
            }
        ]);

        res.json({
            summary,
            categoryDist
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await CleanTransaction.distinct("student_id");
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

exports.createTransaction = async (req, res) => {
    try {
        const record = req.body;
        
        // Save to raw
        const rawEntry = new RawTransaction(record);
        await rawEntry.save();

        // Clean
        const cleanedArray = cleanData([record]);
        if (cleanedArray.length === 0) {
             return res.status(400).json({ error: 'Invalid data provided or validation failed.' });
        }

        // Save to clean
        const cleanEntry = new CleanTransaction(cleanedArray[0]);
        await cleanEntry.save();

        res.json({ message: 'Transaction saved successfully', transaction: cleanEntry });
    } catch (error) {
        console.error("Create Transaction Error: ", error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
};
