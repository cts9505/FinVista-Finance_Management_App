import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useGlobalContext } from '../context/GlobalContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const ReceiptScanner = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditTransaction, setCurrentEditTransaction] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [inputState, setInputState] = useState({
    title: '',
    amount: '',
    date: new Date(),
    category: '',
    description: '',
    type: 'expense',
    status: 'pending'
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI - Online');
  const [autoCategorize, setAutoCategorize] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const { addExpense, addIncome } = useGlobalContext();

  // Payment methods for dropdown
  const paymentMethods = ['UPI - Online', 'PhonePe', 'Google Pay', 'Paytm', 'Amazon Pay'];

  useEffect(() => {
    fetchPendingTransactions();
    fetchAllTransactions();
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/auth/pending-transactions`);
      setPendingTransactions(response.data.pendingTransactions.map(tx => ({
        ...tx,
        amount: `₹${parseFloat(tx.amount).toFixed(2)}`,
        rawAmount: parseFloat(tx.amount),
        formattedDate: formatDate(new Date(tx.date)),
      })));
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
    }
  };

  const fetchAllTransactions = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/auth/all-transactions`,);
      setAllTransactions(response.data.transactions.map(tx => ({
        ...tx,
        amount: `₹${parseFloat(tx.amount).toFixed(2)}`,
        rawAmount: parseFloat(tx.amount),
        formattedDate: formatDate(new Date(tx.date)),
      })));
    } catch (error) {
      console.error("Error fetching all transactions:", error);
    }
  };

  const formatDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return "Unknown";
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('paymentMethod', selectedPaymentMethod || 'UPI - Online');
      formData.append('autoCategorize', autoCategorize.toString());

      const response = await axios.post(`${backendUrl}/api/auth/process-ocr-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Accept": "application/json",
        },
      });

      const apiData = response.data;
      if (apiData.success && apiData.transactions && apiData.transactions.length > 0) {
        const dataToProcess = apiData.transactions;
        const processedTransactions = dataToProcess.map((item, index) => ({
          id: item.id,
          title: item.title,
          amount: item.amount,
          rawAmount: parseFloat(item.amount),
          date: item.date,
          formattedDate: formatDate(new Date(item.date)),
          category: item.category,
          description: item.description,
          status: item.status,
          type: item.type,
        }));
        setTransactions(processedTransactions);
      } else {
        console.warn("No transactions processed:", apiData.message);
        setTransactions([]);
      }
      fetchAllTransactions();
      fetchPendingTransactions();
    } catch (error) {
      console.error("Error processing receipt:", error.response ? error.response.data : error.message);
      alert("Error processing receipt. Please try again.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const verifyTransaction = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const transactionFromAll = allTransactions.find((tx) => tx.id === id);
      const transactionFromExtracted = transactions.find((tx) => tx.id === id);
      const transaction = transactionFromAll || transactionFromExtracted;
  
      if (transaction) {
        const updatedData = {
          status: 'verified',
        };
  
        await axios.put(
          `${backendUrl}/api/auth/update-transaction/${id}`,
          updatedData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        setAllTransactions((prevTransactions) =>
          prevTransactions.map((tx) =>
            tx.id === id ? { ...tx, status: 'verified' } : tx
          )
        );
  
        setTransactions((prevTransactions) =>
          prevTransactions.map((tx) =>
            tx.id === id ? { ...tx, status: 'verified' } : tx
          )
        );
  
        fetchAllTransactions();
        fetchPendingTransactions();
      } else {
        console.warn(`Transaction with id ${id} not found`);
        alert('Transaction not found');
      }
    } catch (error) {
      console.error('Error verifying transaction:', error.response?.data || error.message);
      alert(`Failed to verify transaction: ${error.response?.data?.message || error.message}`);
    }
  };

  const verifyAllTransactions = async () => {
    try {
      // Filter transactions that are not already verified
      const editableTxs = allTransactions.filter(
        (tx) =>
          tx.status === 'pending' ||
          tx.status === 'error' ||
          tx.status === 'duplicate' ||
          tx.status === 'failed'
      );
  
      // Update only the status to 'verified' for each transaction
      for (const tx of editableTxs) {
        const updatedData = {
          status: 'verified',
        };
  
        await axios.put(
          `${backendUrl}/api/auth/update-transaction/${tx.id}`,
          updatedData
        );
      }
  
      // Update local state to reflect all filtered transactions as verified
      setAllTransactions((prevTransactions) =>
        prevTransactions.map((tx) =>
          editableTxs.find((editableTx) => editableTx.id === tx.id)
            ? { ...tx, status: 'verified' }
            : tx
        )
      );
  
      // Refresh data from server
      fetchAllTransactions();
      fetchPendingTransactions();
      toast.success('All transactions verified successfully!');
    } catch (error) {
      console.error('Error verifying all transactions:', error);
      toast.error('Failed to verify all transactions. Please try again.');
    }
  };
  
  const verifyAll = async () => {
    try {
      // Update only the status to 'verified' for each transaction
      for (const tx of transactions) {
        const updatedData = {
          status: 'verified',
        };
  
        await axios.put(
          `${backendUrl}/api/auth/update-transaction/${tx.id}`,
          updatedData
        );
      }
  
      // Update local state immediately
      setTransactions((prevTransactions) =>
        prevTransactions.map((tx) => ({ ...tx, status: 'verified' }))
      );
  
      // Refresh data from server
      fetchAllTransactions();
      fetchPendingTransactions();
      toast.success('All Extracted transactions verified successfully!');
    } catch (error) {
      console.error('Error verifying all transactions:', error);
      toast.error('Failed to verify all transactions. Please try again.');
    }
  };
  
  const deleteTransaction = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const transaction = allTransactions.find(tx => tx.id === id) || 
                          transactions.find(tx => tx.id === id);
      
      if (transaction) {
        await axios.delete(`${backendUrl}/api/auth/delete-transaction/${id}`, {
          headers: { "Authorization": `Bearer ${token}` },
          data: { type: transaction.type }
        });
        
        // Update local state immediately
        setAllTransactions(prevTransactions => 
          prevTransactions.filter(tx => tx.id !== id)
        );
        
        setTransactions(prevTransactions => 
          prevTransactions.filter(tx => tx.id !== id)
        );
        
        // Refresh pending transactions
        fetchPendingTransactions();
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    }
  };

  const deleteAllDuplicates = async () => {
    try {
      await axios.post(`${backendUrl}/api/auth/delete-all-duplicates`, {});
      fetchAllTransactions();
      fetchPendingTransactions();
      toast.success('All duplicate transactions deleted successfully!');
    } catch (error) {
      console.error("Error deleting all duplicates:", error);
      toast.error("Failed to delete duplicates. Please try again.");
    }
  };

  const handleEditTransaction = (transaction) => {
    // Make sure we have the correct rawAmount
    const rawAmount = transaction.rawAmount || 
                     (transaction.amount ? parseFloat(transaction.amount.replace('₹', '')) : 0);
                     
    setCurrentEditTransaction(transaction);
    setInputState({
      title: transaction.title,
      amount: rawAmount.toString(),
      date: transaction.date ? new Date(transaction.date) : new Date(),
      category: transaction.category,
      description: transaction.description,
      type: transaction.type,
      status: transaction.status
    });
    setShowEditModal(true);
    setIsEditMode(true);
  };

  const handleInput = (name) => (e) => {
    setInputState({ ...inputState, [name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setInputState({ ...inputState, date });
  };

  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
  };

  const handleAutoCategorizeChange = (e) => {
    setAutoCategorize(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentEditTransaction) {
      try {
        const updatedData = {
          title: inputState.title,
          amount: parseFloat(inputState.amount),
          date: inputState.date.toISOString(),
          category: inputState.category,
          description: inputState.description,
          type: inputState.type,
          status: inputState.status
        };
        
        await axios.put(`${backendUrl}/api/auth/update-transaction/${currentEditTransaction.id}`, updatedData);
        
        // Update local state immediately
        const updatedTx = {
          ...currentEditTransaction,
          title: inputState.title,
          rawAmount: parseFloat(inputState.amount),
          amount: parseFloat(inputState.amount).toFixed(2),
          date: inputState.date,
          formattedDate: formatDate(inputState.date),
          category: inputState.category,
          description: inputState.description,
          type: inputState.type,
          status: inputState.status
        };
        
        setAllTransactions(prevTransactions => 
          prevTransactions.map(tx => 
            tx.id === currentEditTransaction.id ? updatedTx : tx
          )
        );
        
        setTransactions(prevTransactions => 
          prevTransactions.map(tx => 
            tx.id === currentEditTransaction.id ? updatedTx : tx
          )
        );
        
        // Refresh data from server
        fetchAllTransactions();
        fetchPendingTransactions();
        
        // If the transaction was marked as verified, add it to expenses/income
        if (inputState.status === 'verified') {
          if (inputState.type === 'income') {
            addIncome(updatedData);
          } else {
            addExpense(updatedData);
          }
        }
      } catch (error) {
        console.error("Error updating transaction:", error);
        toast.error("Failed to update transaction. Please try again.");
      }
    }
    
    setShowEditModal(false);
    setCurrentEditTransaction(null);
    setIsEditMode(false);
    setInputState({
      title: '',
      amount: '',
      date: new Date(),
      category: '',
      description: '',
      type: 'expense',
      status: 'pending'
    });
  };

  return (
    <>
      <Sidebar onToggle={setIsSidebarCollapsed} />
      <div className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64 max-w-full'}`}>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold">Receipt Scanner</h1>
              <p className="text-gray-500 text-sm mt-1">Upload receipts to extract transactions</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Upload Receipt</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Payment Method</label>
                <select
                  value={selectedPaymentMethod}
                  onChange={handlePaymentMethodChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  {paymentMethods.map((method, index) => (
                    <option key={index} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoCategorize}
                  onChange={handleAutoCategorizeChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Auto-categorize transactions</label>
              </div>
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                onClick={() => document.getElementById('fileInput').click()}
              >
                <div className="text-5xl text-blue-400 mb-4">📄</div>
                <h3 className="font-medium mb-2">Drag & Drop Receipt Image</h3>
                <p className="text-gray-500 mb-4">or click to browse files</p>
                <button
                  className="bg-white border border-gray-200 py-2 px-4 rounded-lg font-medium text-sm"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Select Image"}
                </button>
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-blue-600">
              <div className="text-gray-500 text-sm mb-2">Total Transactions</div>
              <div className="text-2xl font-semibold">{allTransactions.length}</div>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-green-500">
              <div className="text-gray-500 text-sm mb-2">Verified</div>
              <div className="text-2xl font-semibold">{allTransactions.filter(tx => tx.status === 'verified').length}</div>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-yellow-500">
              <div className="text-gray-500 text-sm mb-2">Pending Verification</div>
              <div className="text-2xl font-semibold">{pendingTransactions.length}</div>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-red-500">
              <div className="text-gray-500 text-sm mb-2">Errors/Failed/Duplicates</div>
              <div className="text-2xl font-semibold">{allTransactions.filter(tx => tx.status === 'error' || tx.status === 'failed' || tx.status === 'duplicate').length}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Extracted Transactions</h2>
              {transactions.length > 0 && (
                <button
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center"
                  onClick={verifyAll}
                >
                  <span className="mr-2">✓</span> Verify All
                </button>
              )}
            </div>
            <div className="p-5">
              {loading ? (
                <div className="text-center py-16">
                  <p className="text-gray-500">Processing your receipt...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500">No transactions extracted yet. Upload a receipt to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {transactions.map(transaction => (
                    <div key={transaction.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className={`px-4 py-3 border-b border-gray-200 flex justify-between items-center ${
                        transaction.status === 'verified' ? 'bg-green-50' : 
                        transaction.status === 'error' ? 'bg-red-50' : 
                        transaction.status === 'failed' ? 'bg-red-100' : 
                        transaction.status === 'duplicate' ? 'bg-orange-100' : 'bg-yellow-50'
                      }`}>
                        <div className="font-medium">{transaction.formattedDate}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'verified' ? 'bg-green-100 text-green-800' : 
                          transaction.status === 'error' ? 'bg-red-100 text-red-800' : 
                          transaction.status === 'failed' ? 'bg-red-200 text-red-800' : 
                          transaction.status === 'duplicate' ? 'bg-orange-200 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Title</div>
                          <div className="text-sm">{transaction.title}</div>
                        </div>
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Amount</div>
                          <div className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount}
                            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {transaction.type === 'income' ? '↑ Income' : '↓ Expense'}
                            </span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Category</div>
                          <div className="text-sm">{transaction.category}</div>
                        </div>
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Description</div>
                          <div className="text-sm">{transaction.description}</div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between">
                        <div className="flex gap-2">
                          <button
                            className="text-xs p-1.5 border border-gray-200 bg-white rounded"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            ✏
                          </button>
                          <button
                            className={`text-xs p-1.5 border border-gray-200 bg-white rounded ${
                              transaction.status === 'verified' ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => transaction.status !== 'verified' && verifyTransaction(transaction.id)}
                            disabled={transaction.status === 'verified'}
                          >
                            ✓
                          </button>
                        </div>
                        <button
                          className="text-xs p-1.5 border border-gray-200 bg-white rounded"
                          onClick={() => deleteTransaction(transaction.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">All Transactions from Database</h2>
              <div className="flex gap-2">
                <button
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center"
                  onClick={verifyAllTransactions}
                >
                  <span className="mr-2">✓</span> Verify All
                </button>
                <button
                  className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center"
                  onClick={deleteAllDuplicates}
                >
                  <span className="mr-2">🗑</span> Delete All Duplicates
                </button>
              </div>
            </div>
            <div className="p-5">
              {allTransactions.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500">No transactions in database.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {allTransactions.map(transaction => (
                    <div key={transaction.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className={`px-4 py-3 border-b border-gray-200 flex justify-between items-center ${
                        transaction.status === 'verified' ? 'bg-green-50' : 
                        transaction.status === 'error' ? 'bg-red-50' : 
                        transaction.status === 'failed' ? 'bg-red-100' : 
                        transaction.status === 'duplicate' ? 'bg-orange-100' : 'bg-yellow-50'
                      }`}>
                        <div className="font-medium">{transaction.formattedDate}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'verified' ? 'bg-green-100 text-green-800' : 
                          transaction.status === 'error' ? 'bg-red-100 text-red-800' : 
                          transaction.status === 'failed' ? 'bg-red-200 text-red-800' : 
                          transaction.status === 'duplicate' ? 'bg-orange-200 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Title</div>
                          <div className="text-sm">{transaction.title}</div>
                        </div>
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Amount</div>
                          <div className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount}
                            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {transaction.type === 'income' ? '↑ Income' : '↓ Expense'}
                            </span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Category</div>
                          <div className="text-sm">{transaction.category}</div>
                        </div>
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Description</div>
                          <div className="text-sm">{transaction.description}</div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between">
                        <div className="flex gap-2">
                          <button
                            className="text-xs p-1.5 border border-gray-200 bg-white rounded"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            ✏
                          </button>
                          <button
                            className={`text-xs p-1.5 border border-gray-200 bg-white rounded ${
                              transaction.status === 'verified' ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => transaction.status !== 'verified' && verifyTransaction(transaction.id)}
                            disabled={transaction.status === 'verified'}
                          >
                            ✓
                          </button>
                        </div>
                        <button
                          className="text-xs p-1.5 border border-gray-200 bg-white rounded"
                          onClick={() => deleteTransaction(transaction.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {showEditModal && (
            <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full relative border-2 border-blue-300">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setIsEditMode(false);
                    setCurrentEditTransaction(null);
                  }}
                  className="absolute top-4 right-4 text-2xl"
                >
                  ✖️
                </button>
                <h2 className="text-2xl font-bold mb-4 text-blue-600">Edit Transaction</h2>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={inputState.title}
                      name="title"
                      placeholder="Transaction Title"
                      onChange={handleInput('title')}
                      className="w-full p-2 border rounded"
                      required
                    />
                    <input
                      type="number"
                      value={inputState.amount}
                      name="amount"
                      placeholder="Amount"
                      onChange={handleInput('amount')}
                      className="w-full p-2 border rounded"
                      required
                      step="0.01"
                    />
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="expense"
                          checked={inputState.type === 'expense'}
                          onChange={() => setInputState({ ...inputState, type: 'expense' })}
                          className="mr-2"
                        />
                        Expense
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="income"
                          checked={inputState.type === 'income'}
                          onChange={() => setInputState({ ...inputState, type: 'income' })}
                          className="mr-2"
                        />
                        Income
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Date</label>
                      <DatePicker
                        selected={inputState.date}
                        onChange={handleDateChange}
                        className="w-full p-2 border rounded"
                        dateFormat="dd/MM/yyyy"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      value={inputState.category}
                      name="category"
                      placeholder="Category"
                      onChange={handleInput('category')}
                      className="w-full p-2 border rounded"
                      required
                    />
                    <textarea
                      value={inputState.description}
                      name="description"
                      placeholder="Description (read-only)"
                      onChange={handleInput('description')}
                      className="w-full p-2 border rounded h-20"
                      
                    />
                    <select
                      value={inputState.status}
                      onChange={handleInput('status')}
                      className="w-full p-2 border rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="error">Error</option>
                      <option value="verified">Verified</option>
                      <option value="failed">Failed</option>
                      <option value="duplicate">Duplicate</option>
                    </select>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center"
                    >
                      Update Transaction
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReceiptScanner;