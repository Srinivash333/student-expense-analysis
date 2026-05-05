const { spawn } = require('child_process');
const path = require('path');
const { CleanTransaction } = require('../models/Transaction');

const runPythonScript = (action, studentId) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../../data_science/ml_models.py');
        const pythonProcess = spawn('python', [scriptPath, action, studentId]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(errorString || 'Python script exited with error'));
            }
            try {
                const result = JSON.parse(dataString);
                if (result.error) reject(new Error(result.error));
                else resolve(result);
            } catch (e) {
                reject(new Error('Failed to parse Python output'));
            }
        });
    });
};

exports.getPredictions = async (req, res) => {
    try {
        const { student_id } = req.query;
        if (!student_id) return res.status(400).json({ error: 'student_id is required' });

        const result = await runPythonScript('predict', student_id);
        res.json(result);
    } catch (error) {
        console.error("Prediction Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getRecommendations = async (req, res) => {
    try {
        const { student_id } = req.query;
        if (!student_id) return res.status(400).json({ error: 'student_id is required' });

        // 1. Get ML Classification
        const classificationData = await runPythonScript('classify', student_id);
        const classification = classificationData.classification;

        // 2. Build Smart Insights
        // Fetch student's data
        const transactions = await CleanTransaction.find({ student_id });
        if (transactions.length === 0) {
            return res.status(404).json({ error: 'No data found for this student' });
        }

        let totalIncome = 0;
        let totalExpense = 0;
        let categoryExpenses = {};
        let weekendExpense = 0;
        let weekdayExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'Income') totalIncome += t.amount;
            if (t.type === 'Expense') {
                totalExpense += t.amount;
                categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
                
                const day = t.date.getDay();
                if (day === 0 || day === 6) weekendExpense += t.amount;
                else weekdayExpense += t.amount;
            }
        });

        const insights = [];

        // Overspending Detection
        if (totalExpense > totalIncome && totalIncome > 0) {
            insights.push({
                type: 'Alert',
                message: `You are overspending! Total expenses (₹${totalExpense}) exceed total income (₹${totalIncome}).`
            });
        }

        // Category-wise spending
        if (totalIncome > 0) {
            for (const [cat, amt] of Object.entries(categoryExpenses)) {
                const percentage = (amt / totalIncome) * 100;
                if (percentage > 40) {
                    insights.push({
                        type: 'Warning',
                        message: `You spend ${percentage.toFixed(1)}% of your income on ${cat}. Consider reducing it.`
                    });
                }
            }
        }

        // Weekend vs Weekday
        const weekendRatio = weekendExpense / (totalExpense || 1);
        if (weekendRatio > 0.4) {
             insights.push({
                type: 'Insight',
                message: `Your weekend spending is relatively high (${(weekendRatio*100).toFixed(1)}% of total). Plan weekend activities better.`
            });
        }

        res.json({
            student_id,
            classification,
            totalIncome,
            totalExpense,
            savings: totalIncome - totalExpense,
            insights
        });

    } catch (error) {
        console.error("Recommendations Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};
