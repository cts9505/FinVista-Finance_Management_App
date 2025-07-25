import React, { useState, useEffect, useContext } from 'react';
import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import FooterContainer from '../components/Footer';
import {
  FaStar,
  FaRegStar,
  FaUser,
  FaClock,
  FaReply,
  FaThumbtack,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaFilter,
  FaSort,
  FaSearch,
  FaChartBar,
} from 'react-icons/fa';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-6 text-center text-red-600">Something went wrong. Please try again later.</div>;
    }
    return this.props.children;
  }
}

const AdminReviewPage = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, isLoggedin } = useContext(AppContent);

  // State for reviews management
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    averageRating: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    hasMore: false,
  });

  // Reply form state
  const [replyForm, setReplyForm] = useState({
    reviewId: null,
    replyText: '',
  });

  // Filter and sort state
  const [filters, setFilters] = useState({
    status: 'all',
    minRating: '1',
    search: '',
  });

  const [sortOption, setSortOption] = useState('newest');

  // UI state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [expandedReview, setExpandedReview] = useState(null);

  // Check if user is admin on page load
  useEffect(() => {
    if (isLoggedin) {
      if (!userData?.isAdmin) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
      } else {
        fetchReviews();
        fetchStats();
      }
    } else {
      navigate('/login');
    }
  }, [isLoggedin, userData, navigate]);

  // Fetch reviews based on filters and pagination
  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: pagination.limit,
        status: filters.status,
        minRating: filters.minRating,
        search: filters.search,
        sort: sortOption,
      });
      console.log('Fetching reviews with params:', queryParams.toString()); // Debug log

      const { data } = await axios.get(
        `${backendUrl}/api/auth/admin?${queryParams.toString()}`,
        { withCredentials: true }
      );

      if (data.success) {
        setReviews(data.reviews);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Fetch review statistics
  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/admin/stats`, {
        withCredentials: true,
      });

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchReviews(1);
    setShowFilterPanel(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      minRating: '1',
      search: '',
    });
    setSortOption('newest');
    fetchReviews(1);
    setShowFilterPanel(false);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    fetchReviews(1); // Refresh reviews on sort change
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Approve review
  const handleApprove = async (id, currentStatus) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/auth/admin/approve/${id}`,
        { isApproved: !currentStatus },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setReviews((prev) =>
          prev.map((review) =>
            review._id === id ? { ...review, isApproved: !currentStatus } : review
          )
        );
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating review approval:', error);
      toast.error(error.response?.data?.message || 'Failed to update review');
    }
  };

  // Toggle pin review
  const handleTogglePin = async (id, currentPinned) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/auth/admin/pin/${id}`,
        { isPinned: !currentPinned },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setReviews((prev) =>
          prev.map((review) =>
            review._id === id ? { ...review, isPinned: !currentPinned } : review
          )
        );
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
      toast.error(error.response?.data?.message || 'Failed to update review');
    }
  };

  // Delete review
  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const { data } = await axios.delete(`${backendUrl}/api/auth/delete/${id}`, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success(data.message);
        setReviews((prev) => prev.filter((review) => review._id !== id));
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  // Open reply form
  const handleOpenReplyForm = (review) => {
    setReplyForm({
      reviewId: review._id,
      replyText: review.adminReply?.content || '',
    });
    setExpandedReview(review._id);
  };

  // Handle reply form change
  const handleReplyChange = (e) => {
    setReplyForm((prev) => ({
      ...prev,
      replyText: e.target.value,
    }));
  };

  // Submit reply
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    const trimmedReply = replyForm.replyText.trim();
    if (!trimmedReply) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/admin/reply/${replyForm.reviewId}`,
        { reply: trimmedReply },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setReviews((prev) =>
          prev.map((review) =>
            review._id === replyForm.reviewId
              ? {
                  ...review,
                  adminReply: {
                    content: trimmedReply,
                    repliedAt: new Date().toISOString(),
                    repliedBy: userData?.name || 'Admin',
                  },
                }
              : review
          )
        );
        setReplyForm({
          reviewId: null,
          replyText: '',
        });
        setExpandedReview(null);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error(error.response?.data?.message || 'Failed to submit reply');
    }
  };

  // Delete reply
  const handleDeleteReply = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/auth/admin/reply/${reviewId}`,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setReviews((prev) =>
          prev.map((review) =>
            review._id === reviewId ? { ...review, adminReply: null } : review
          )
        );
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error(error.response?.data?.message || 'Failed to delete reply');
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (pagination.hasMore) {
      fetchReviews(pagination.currentPage + 1);
    }
  };

  // Calculate percentage for rating bars
  const calculatePercentage = (count) => {
    const total = Object.values(stats.distribution).reduce((a, b) => a + b, 0);
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  // Toggle review expansion
  const toggleExpandReview = (id) => {
    setExpandedReview(expandedReview === id ? null : id);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 p-6 overflow-auto mt-15">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Review Management</h1>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowStatsPanel(!showStatsPanel)}
                  className="flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200"
                >
                  <FaChartBar className="mr-2" />
                  <span>Statistics</span>
                </button>
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  <FaFilter className="mr-2" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={(e) => {
                    handleFilterChange(e);
                    if (e.target.value === '') {
                      setFilters((prev) => ({ ...prev, search: '' }));
                      fetchReviews(1);
                    }
                  }}
                  placeholder="Quick search by name, title or content..."
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      applyFilters();
                    }
                  }}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                {filters.search && (
                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, search: '' }));
                      fetchReviews(1);
                    }}
                    className="absolute inset-y-0 right-10 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
                <button
                  onClick={applyFilters}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500 hover:text-blue-700"
                >
                  <FaSearch />
                </button>
              </div>
            </div>


            {/* Statistics Panel */}
            {showStatsPanel && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Review Statistics</h2>
                  <button
                    onClick={() => setShowStatsPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-sm text-blue-500 mb-1">Total Reviews</div>
                    <div className="text-2xl font-bold text-blue-700">{stats.totalReviews}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="text-sm text-green-500 mb-1">Approved Reviews</div>
                    <div className="text-2xl font-bold text-green-700">{stats.approvedReviews}</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                    <div className="text-sm text-yellow-500 mb-1">Pending Reviews</div>
                    <div className="text-2xl font-bold text-yellow-700">{stats.pendingReviews}</div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-md font-semibold text-gray-700 mb-3">Rating Distribution</h3>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center">
                          <div className="w-12 flex items-center">
                            <span className="text-gray-700 mr-1">{rating}</span>
                            <FaStar className="text-yellow-400" />
                          </div>
                          <div className="flex-grow">
                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400 rounded-full"
                                style={{ width: `${calculatePercentage(stats.distribution[rating])}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-16 text-right text-gray-600">
                            {stats.distribution[rating] || 0} (
                            {calculatePercentage(stats.distribution[rating])}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-yellow-500 mb-2">
                        {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                      </div>
                      <div className="flex justify-center text-yellow-400 text-xl mb-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < Math.round(stats.averageRating) ? <FaStar /> : <FaRegStar />}
                          </span>
                        ))}
                      </div>
                      <div className="text-gray-500">Average Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Panel */}
            {showFilterPanel && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Filter Reviews</h2>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Reviews</option>
                      <option value="approved">Approved Only</option>
                      <option value="pending">Pending Only</option>
                      <option value="pinned">Pinned Only</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="minRating"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Minimum Rating
                    </label>
                    <select
                      id="minRating"
                      name="minRating"
                      value={filters.minRating}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">All Ratings</option>
                      <option value="2">2+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select
                      id="sort"
                      value={sortOption}
                      onChange={handleSortChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                    </select>
                  </div>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="search"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="search"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Search by username, title or content..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-600">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-600">No reviews found matching your criteria.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Review Header */}
                    <div
                      className={`px-6 py-4 border-l-4 ${
                        review.isApproved ? 'border-green-500' : 'border-yellow-500'
                      } ${review.isPinned ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex flex-wrap justify-between items-center">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <div className="bg-gray-100 rounded-full p-2 mr-3">
                            {review.userId?.image ? (
                              <img
                                src={review.userId.image}
                                alt={review.userId.name}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => (e.target.src = '/default-avatar.png')}
                              />
                            ) : (
                              <FaUser className="text-gray-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {review.userId?.name || 'Unknown User'}
                            </h3>
                            <div className="text-sm text-gray-500">{formatDate(review.createdAt)}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            ID: {review._id.substring(review._id.length - 6)}
                          </span>
                          {review.isPinned && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center">
                              <FaThumbtack className="mr-1" /> Pinned
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 text-xs rounded-full flex items-center ${
                              review.isApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {review.isApproved ? (
                              <>
                                <FaCheck className="mr-1" /> Approved
                              </>
                            ) : (
                              <>
                                <FaClock className="mr-1" /> Pending
                              </>
                            )}
                          </span>
                          <div className="flex items-center text-yellow-400">
                            <span className="mr-1 font-medium text-gray-700">{review.rating}</span>
                            <FaStar />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="px-6 py-4">
                      <div className="cursor-pointer" onClick={() => toggleExpandReview(review._id)}>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{review.title}</h3>
                        <p
                          className={`text-gray-700 ${expandedReview !== review._id && 'line-clamp-3'}`}
                        >
                          {review.comment}
                        </p>
                        {review.comment.length > 150 && expandedReview !== review._id && (
                          <button className="text-blue-500 text-sm mt-1">Show more</button>
                        )}
                      </div>

                      {/* Admin Reply */}
                      {review.adminReply && review.adminReply.content && (
                        <div className="mt-4 pl-4 border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                          <div className="flex justify-between">
                            <div className="flex items-center mb-2">
                              <FaReply className="text-blue-500 mr-2" />
                              <span className="font-semibold text-blue-800">Admin Reply:</span>
                            </div>
                            <button
                              onClick={() => handleDeleteReply(review._id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete Reply"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                          <p className="text-gray-700">{review.adminReply.content}</p>
                          <div class testing className="text-sm text-gray-500 mt-2">
                            <span>Replied by {review.adminReply.repliedBy}</span>
                            <span> on {formatDate(review.adminReply.repliedAt)}</span>
                          </div>
                        </div>
                      )}

                      {/* Reply Form */}
                      {replyForm.reviewId === review._id && (
                        <div className="mt-4">
                          <form onSubmit={handleSubmitReply}>
                            <textarea
                              value={replyForm.replyText}
                              onChange={handleReplyChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Write your reply..."
                              rows="3"
                              required
                            ></textarea>
                            <div className="flex justify-end mt-2 space-x-2">
                              <button
                                type="button"
                                onClick={() => setReplyForm({ reviewId: null, replyText: '' })}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={!replyForm.replyText.trim()}
                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                              >
                                Submit Reply
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>

                    {/* Review Actions */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleApprove(review._id, review.isApproved)}
                        className={`px-3 py-1 text-sm rounded-md flex items-center ${
                          review.isApproved
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {review.isApproved ? (
                          <>
                            <FaTimes className="mr-1" /> Unapprove
                          </>
                        ) : (
                          <>
                            <FaCheck className="mr-1" /> Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleTogglePin(review._id, review.isPinned)}
                        className={`px-3 py-1 text-sm rounded-md flex items-center ${
                          review.isPinned
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <FaThumbtack className="mr-1" />
                        {review.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => handleOpenReplyForm(review)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                      >
                        <FaReply className="mr-1" />
                        {review.adminReply ? 'Edit Reply' : 'Reply'}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center"
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Pagination */}
              {pagination.hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Load More Reviews
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <FooterContainer />
      </div>
    </ErrorBoundary>
  );
};

export default AdminReviewPage;