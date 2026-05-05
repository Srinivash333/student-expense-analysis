import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, Users } from 'lucide-react';

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch students list
    axios.get('http://localhost:5000/api/students')
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetchAnalytics(selectedStudent);
  }, [selectedStudent]);

  const fetchAnalytics = async (studentId) => {
    setLoading(true);
    try {
      const url = studentId 
        ? `http://localhost:5000/api/analytics?student_id=${studentId}`
        : 'http://localhost:5000/api/analytics';
      const res = await axios.get(url);
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSummaryValue = (type) => {
    if (!analytics || !analytics.summary) return 0;
    const item = analytics.summary.find(s => s._id === type);
    return item ? item.totalAmount : 0;
  };

  const income = getSummaryValue('Income');
  const expense = getSummaryValue('Expense');
  const savings = income - expense;

  const categoryData = analytics?.categoryDist.map(item => ({
    name: item._id,
    value: item.total
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-500 mt-2">Overview of income, expenses, and savings.</p>
        </div>
        
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Student</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              className="input-field pl-10"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">All Students (Aggregated)</option>
              {students.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">₹{income.toLocaleString()}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <ArrowUpRight size={24} />
          </div>
        </div>
        
        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Expense</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">₹{expense.toLocaleString()}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <ArrowDownRight size={24} />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Net Savings</p>
            <h3 className={`text-3xl font-bold mt-1 ${savings >= 0 ? 'text-brand-600' : 'text-red-600'}`}>
              ₹{savings.toLocaleString()}
            </h3>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${savings >= 0 ? 'bg-brand-100 text-brand-600' : 'bg-red-100 text-red-600'}`}>
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* Charts */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Income vs Expense</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Summary', Income: income, Expense: expense }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Legend />
                  <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Expense Distribution</h3>
            <div className="h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No expense data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
