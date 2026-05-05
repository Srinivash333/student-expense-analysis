import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lightbulb, AlertTriangle, ShieldCheck, Info, UserCheck, TrendingDown, Users } from 'lucide-react';

const Recommendations = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/students')
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  }, []);

  const fetchRecommendations = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await axios.get(`http://localhost:5000/api/recommendations?student_id=${selectedStudent}`);
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'Alert': return <AlertTriangle className="text-red-500" size={24} />;
      case 'Warning': return <TrendingDown className="text-amber-500" size={24} />;
      case 'Insight': return <Info className="text-blue-500" size={24} />;
      default: return <Lightbulb className="text-brand-500" size={24} />;
    }
  };

  const getBgForType = (type) => {
    switch (type) {
      case 'Alert': return 'bg-red-50 border-red-200';
      case 'Warning': return 'bg-amber-50 border-amber-200';
      case 'Insight': return 'bg-blue-50 border-blue-200';
      default: return 'bg-brand-50 border-brand-200';
    }
  };

  const renderClassification = (classification) => {
    let color = '';
    let icon = null;
    let desc = '';

    if (classification === 'Saver') {
      color = 'text-green-600';
      icon = <ShieldCheck size={48} className={color} />;
      desc = 'You spend significantly less than you earn. Great job building your savings!';
    } else if (classification === 'Balanced') {
      color = 'text-blue-600';
      icon = <UserCheck size={48} className={color} />;
      desc = 'You manage to keep expenses below your income but should monitor unnecessary spending.';
    } else {
      color = 'text-red-600';
      icon = <AlertTriangle size={48} className={color} />;
      desc = 'You tend to spend more than or very close to your income. Budgeting is highly recommended.';
    }

    return (
      <div className="flex flex-col items-center text-center p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
        <div className={`p-4 rounded-full bg-opacity-10 mb-4 ${color.replace('text-', 'bg-')}`}>
          {icon}
        </div>
        <h3 className={`text-2xl font-bold ${color}`}>Student Profile: {classification}</h3>
        <p className="text-gray-600 mt-2 max-w-sm">{desc}</p>
        <p className="text-xs text-gray-400 mt-4 uppercase tracking-wide font-semibold">Predicted via Decision Tree</p>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Intelligent Insights</h1>
        <p className="text-gray-500 mt-2">Personalized financial recommendations driven by ML behavioral analysis.</p>
      </header>

      <div className="glass-panel p-6 flex flex-wrap gap-4 items-end">
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Analyze Student</label>
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
          onClick={fetchRecommendations} 
          disabled={!selectedStudent || loading}
          className="btn-primary inline-flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Lightbulb size={18} />
          )}
          {loading ? 'Analyzing...' : 'Generate Insights'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <AlertTriangle className="text-red-500" size={24} />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {data && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            {renderClassification(data.classification)}
            
            <div className="mt-6 glass-panel p-6">
               <h4 className="font-semibold text-gray-800 mb-4">Financial Summary</h4>
               <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-gray-500">Income</span>
                    <span className="font-bold text-green-600">₹{data.totalIncome.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-500">Expenses</span>
                    <span className="font-bold text-red-500">₹{data.totalExpense.toLocaleString()}</span>
                 </div>
                 <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                    <span className="text-gray-800 font-medium">Net Savings</span>
                    <span className={`font-bold ${data.savings >= 0 ? 'text-brand-600' : 'text-red-600'}`}>
                      ₹{data.savings.toLocaleString()}
                    </span>
                 </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Suggestions</h3>
            
            {data.insights.length === 0 ? (
              <div className="glass-panel p-8 text-center text-gray-500">
                <ShieldCheck size={48} className="mx-auto text-green-400 mb-3" />
                <p>Your finances look perfect! No urgent recommendations at this time.</p>
              </div>
            ) : (
              data.insights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className={`border rounded-2xl p-5 flex items-start gap-4 transition-all hover:shadow-md ${getBgForType(insight.type)}`}
                >
                  <div className="mt-1">{getIconForType(insight.type)}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{insight.type}</h4>
                    <p className="text-gray-700 mt-1">{insight.message}</p>
                  </div>
                </div>
              ))
            )}
            
            {/* Added Budgeting Rule of Thumb */}
            {data.classification === 'Overspender' && (
               <div className="glass-panel p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mt-6">
                 <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                   <Lightbulb size={20} className="text-blue-600" />
                   Action Plan: The 50/30/20 Rule
                 </h4>
                 <p className="text-blue-800 text-sm">
                   Consider applying the 50/30/20 rule to your income (₹{data.totalIncome.toLocaleString()}):
                 </p>
                 <ul className="mt-3 space-y-2 text-sm text-blue-800">
                   <li><strong className="text-blue-900">50% Needs (Rent, Bills, Food):</strong> ₹{(data.totalIncome * 0.5).toLocaleString()}</li>
                   <li><strong className="text-blue-900">30% Wants (Entertainment, Shopping):</strong> ₹{(data.totalIncome * 0.3).toLocaleString()}</li>
                   <li><strong className="text-blue-900">20% Savings:</strong> ₹{(data.totalIncome * 0.2).toLocaleString()}</li>
                 </ul>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
