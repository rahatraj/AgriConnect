import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowDownUp, Search, Loader } from 'lucide-react';
import ErrorComponent from '../../components/common/ErrorComponent';
import { fetchAlltransactions } from '../../redux/slices/transactionSlice';

const ManageTransactions = () => {
  const dispatch = useDispatch();
  const { allTransaction, loading, errors, pagination, stats } = useSelector((state) => state.transactions);
  
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('transactionDate');
  const [order, setOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Transaction type options
  const transactionTypes = {
    '': 'All Transactions',
    'Bid': 'Bid Transactions',
    'Wallet': 'Wallet Transactions',
    'Storage': 'Storage Transactions'
  };

  // Fetch transactions when filters change
  useEffect(() => {
    dispatch(fetchAlltransactions({
      page: currentPage,
      limit,
      sortBy,
      order,
      type: selectedType,
      search: searchQuery
    }));
  }, [dispatch, currentPage, sortBy, order, selectedType, searchQuery]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  // Reset filters
  const handleReset = () => {
    setSelectedType('');
    setSearchQuery('');
    setSortBy('transactionDate');
    setOrder('desc');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  if (errors) {
    return <ErrorComponent message={errors} />;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Transaction Management</h2>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-primary">
          <h3 className="text-gray-500 text-sm">Total Transactions</h3>
          <p className="text-2xl font-bold">{stats?.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-success">
          <h3 className="text-gray-500 text-sm">Completed</h3>
          <p className="text-2xl font-bold">{stats?.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-warning">
          <h3 className="text-gray-500 text-sm">Pending</h3>
          <p className="text-2xl font-bold">{stats?.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-info">
          <h3 className="text-gray-500 text-sm">Total Amount</h3>
          <p className="text-2xl font-bold">₹{stats?.totalAmount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            {/* Transaction Type Filter */}
            <select 
              className="select select-bordered"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
            >
              {Object.entries(transactionTypes)?.map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by reference ID..."
                className="input input-bordered pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Reset Filters */}
          <button 
            className="btn btn-ghost"
            onClick={handleReset}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th onClick={() => handleSort('referenceId')} className="cursor-pointer">
                Reference {sortBy === 'referenceId' && <ArrowDownUp className="inline ml-1" size={16} />}
              </th>
              <th onClick={() => handleSort('transactionDate')} className="cursor-pointer">
                Date {sortBy === 'transactionDate' && <ArrowDownUp className="inline ml-1" size={16} />}
              </th>
              <th>User</th>
              <th onClick={() => handleSort('transactionType')} className="cursor-pointer">
                Type {sortBy === 'transactionType' && <ArrowDownUp className="inline ml-1" size={16} />}
              </th>
              <th onClick={() => handleSort('amount')} className="cursor-pointer">
                Amount {sortBy === 'amount' && <ArrowDownUp className="inline ml-1" size={16} />}
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allTransaction?.length > 0 ? (
              allTransaction?.map((tx) => (
                <tr key={tx._id}>
                  <td>{tx.referenceId}</td>
                  <td>{new Date(tx.transactionDate).toLocaleDateString()}</td>
                  <td>{tx?.user?.fullName || 'N/A'}</td>
                  <td>{tx?.transactionType}</td>
                  <td className="font-semibold">₹{tx.amount}</td>
                  <td>
                    <span className={`badge ${
                      tx.status === 'Completed' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {tx?.status || 'Completed'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="btn-group">
            <button 
              className="btn btn-sm" 
              disabled={!pagination.hasPrevPage}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            {[...Array(pagination.totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`btn btn-sm ${currentPage === index + 1 ? 'btn-active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button 
              className="btn btn-sm"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTransactions;