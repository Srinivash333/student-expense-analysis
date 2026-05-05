import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, PlusCircle } from 'lucide-react';

const UploadData = () => {
  const [activeTab, setActiveTab] = useState('csv'); // 'csv' or 'manual'
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    student_id: '',
    date: '',
    type: 'Expense',
    category: 'Food',
    amount: '',
    payment_method: 'Cash',
    notes: ''
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    const data = new FormData();
    data.append('file', file);
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/data/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload data');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/transactions', formData);
      setResult({ message: 'Transaction added successfully!', manual: true });
      setFormData({ ...formData, amount: '', notes: '' }); // reset some fields
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Add Transactions</h1>
        <p className="text-gray-500 mt-2">Import your messy CSV file or add a single transaction manually.</p>
      </header>

      <div className="flex gap-4 border-b border-gray-200 pb-px">
        <button 
          onClick={() => { setActiveTab('csv'); setResult(null); setError(null); }}
          className={`pb-2 px-4 font-semibold text-sm transition-all ${activeTab === 'csv' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Bulk CSV Upload
        </button>
        <button 
          onClick={() => { setActiveTab('manual'); setResult(null); setError(null); }}
          className={`pb-2 px-4 font-semibold text-sm transition-all ${activeTab === 'manual' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Manual Entry
        </button>
      </div>

      <div className="glass-panel p-8">
        {activeTab === 'csv' ? (
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all hover:border-brand-500 hover:bg-brand-50/50">
              <Upload className="text-brand-500 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-800">Select CSV File</h3>
              <p className="text-sm text-gray-500 mt-2 mb-6">Must be a .csv file exported from the data generator.</p>
              
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="hidden" 
                id="file-upload" 
              />
              <label 
                htmlFor="file-upload" 
                className="btn-primary cursor-pointer inline-flex items-center gap-2"
              >
                <FileText size={18} />
                {file ? file.name : 'Browse Files'}
              </label>
            </div>

            {file && (
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleUpload} 
                  disabled={loading}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {loading ? <Loader className="animate-spin" size={18} /> : <Upload size={18} />}
                  {loading ? 'Processing...' : 'Upload & Clean'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input required type="text" name="student_id" value={formData.student_id} onChange={handleInputChange} className="input-field" placeholder="e.g. STU001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange} className="input-field">
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="input-field">
                  {formData.type === 'Expense' ? (
                    <>
                      <option value="Food">Food</option>
                      <option value="Travel">Travel</option>
                      <option value="Rent">Rent</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills</option>
                      <option value="Others">Others</option>
                    </>
                  ) : (
                    <>
                      <option value="Pocket Money">Pocket Money</option>
                      <option value="Scholarship">Scholarship</option>
                      <option value="Part-time Job">Part-time Job</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input required type="number" min="1" step="0.01" name="amount" value={formData.amount} onChange={handleInputChange} className="input-field" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select name="payment_method" value={formData.payment_method} onChange={handleInputChange} className="input-field">
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Wallet">Wallet</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} className="input-field" placeholder="e.g. Lunch at canteen" />
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-100">
               <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2">
                 {loading ? <Loader className="animate-spin" size={18} /> : <PlusCircle size={18} />}
                 {loading ? 'Adding...' : 'Add Transaction'}
               </button>
            </div>
           </form>
        )}
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4">
          <CheckCircle className="text-green-500 mt-1" size={24} />
          <div>
            <h4 className="text-lg font-semibold text-green-900">Success</h4>
            <p className="text-green-800 mt-1">{result.message}</p>
            {!result.manual && result.rawCount && (
              <div className="mt-4 flex gap-4">
                <div className="bg-white px-4 py-2 rounded-lg border border-green-100 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Raw Records</p>
                  <p className="text-xl font-bold text-gray-900">{result.rawCount}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-green-100 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Cleaned Records</p>
                  <p className="text-xl font-bold text-brand-600">{result.cleanedCount}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="text-red-500" size={24} />
          <div>
            <h4 className="text-lg font-semibold text-red-900">Upload Failed</h4>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadData;
