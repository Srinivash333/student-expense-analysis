import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const Predictions = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/students')
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  }, []);

  const handlePredict = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    setError(null);
    setPredictionData(null);
    setChartData([]);

    try {
      // Fetch historical for chart
      const historyRes = await axios.get(`http://localhost:5000/api/transactions?student_id=${selectedStudent}&type=Expense`);
      
      // Fetch prediction
      const predRes = await axios.get(`http://localhost:5000/api/predictions?student_id=${selectedStudent}`);
      
      if (predRes.data.error) {
        setError(predRes.data.error);
        return;
      }
      
      setPredictionData(predRes.data);

      // Process historical data for chart (group by month)
      const monthlyData = {};
      historyRes.data.forEach(t => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[key]) monthlyData[key] = 0;
        monthlyData[key] += t.amount;
      });

      const sortedKeys = Object.keys(monthlyData).sort();
      let cData = sortedKeys.map((k, i) => ({
        month: k,
        actual: monthlyData[k],
        predicted: null
      }));

      // Add prediction node
      if (cData.length > 0) {
        const lastMonth = new Date(cData[cData.length - 1].month + '-01');
        lastMonth.setMonth(lastMonth.getMonth() + 1);
        const nextMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
        
        cData.push({
          month: nextMonthKey,
          actual: null,
          predicted: predRes.data.predicted_expense
        });
      }

      setChartData(cData);

    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Expense Forecasting</h1>
        <p className="text-gray-500 mt-2">Machine Learning (Linear Regression) predicts future spending based on past trends.</p>
      </header>

      <div className="glass-panel p-6 flex flex-wrap gap-4 items-end">
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              className="input-field pl-10"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="" disabled>Choose a student...</option>
              {students.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <button 
          onClick={handlePredict} 
          disabled={!selectedStudent || loading}
          className="btn-primary inline-flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <TrendingUp size={18} />
          )}
          {loading ? 'Running Model...' : 'Run Prediction'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="text-red-500" size={24} />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {predictionData && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="glass-panel p-8 flex flex-col items-center justify-center text-center h-full bg-gradient-to-b from-brand-50 to-white">
              <p className="text-sm font-bold text-brand-600 uppercase tracking-wider">Next Month Forecast</p>
              <h2 className="text-5xl font-black text-gray-900 mt-4 mb-2">
                ₹{predictionData.predicted_expense.toLocaleString()}
              </h2>
              <p className="text-gray-500 text-sm mt-4">Predicted total expenses for the upcoming month using Linear Regression model.</p>
            </div>
          </div>
          
          <div className="md:col-span-2 glass-panel p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Historical Trend & Forecast</h3>
            <div className="h-72">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Actual Expense" />
                    <Line type="dashed" dataKey="predicted" stroke="#22c55e" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 6 }} name="Forecasted Expense" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">Loading chart...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predictions;
