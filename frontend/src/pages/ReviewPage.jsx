import React, { useState, useEffect, useContext } from 'react';
import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import FooterContainer from '../components/Footer';
import { FaStar, FaRegStar, FaUser, FaClock, FaReply, FaThumbtack } from 'react-icons/fa';

const ReviewPage = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, isLoggedin } = useContext(AppContent);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userReviews, setUserReviews] = useState([]);
  const [publicReviews, setPublicReviews] = useState([]);
  const [users, setUsers] = useState({}); // Store user data by userId
  const [stats, setStats] = useState({
    averageRating: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  });

  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Batch fetch user data
  const fetchUserDataBatch = async (userIds) => {
    const uniqueIds = [...new Set(userIds)].filter((id) => !users[id] && typeof id === 'string');
    console.log('Fetching user IDs:', uniqueIds); // Debug log
    if (uniqueIds.length === 0) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/users/batch`,
        { userIds: uniqueIds },
        { withCredentials: true }
      );
      if (data.success) {
        const newUsers = data.users.reduce((acc, user) => ({
          ...acc,
          [user._id]: { name: user.name, image: user.image },
        }), {});
        setUsers((prev) => ({ ...prev, ...newUsers }));
      }
    } catch (error) {
      console.error('Error fetching users batch:', error);
      uniqueIds.forEach((id) => {
        setUsers((prev) => ({
          ...prev,
          [id]: { name: 'Unknown User', image: null },
        }));
      });
    }
  };

  // Fetch public reviews
  const fetchPublicReviews = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/public?page=${page}`);
      if (data.success) {
        setPublicReviews(data.reviews);
        setStats(data.stats);
        setPagination(data.pagination);
        // Extract userIds, handling objects
        const userIds = data.reviews
          .map((review) => (typeof review.userId === 'object' ? review.userId._id : review.userId))
          .filter((id) => id && typeof id === 'string');
        if (userIds.length > 0) {
          await fetchUserDataBatch(userIds);
        }
      }
    } catch (error) {
      console.error('Error fetching public reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's own reviews
  const fetchUserReviews = async () => {
    if (!isLoggedin) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/user`, {
        withCredentials: true,
      });
      if (data.success) {
        setUserReviews(data.reviews);
        // Extract userIds, handling objects
        const userIds = data.reviews
          .map((review) => (typeof review.userId === 'object' ? review.userId._id : review.userId))
          .filter((id) => id && typeof id === 'string');
        if (userIds.length > 0) {
          await fetchUserDataBatch(userIds);
        }
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }
  };

  useEffect(() => {
    fetchPublicReviews();
    fetchUserReviews();
  }, [isLoggedin, backendUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingChange = (newRating) => {
    setFormData((prev) => ({
      ...prev,
      rating: newRating,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedin) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      let response;
      if (editMode) {
        response = await axios.put(
          `${backendUrl}/api/auth/update/${editId}`,
          formData,
          { withCredentials: true }
        );
      } else {
        response = await axios.post(
          `${backendUrl}/api/auth/create`,
          formData,
          { withCredentials: true }
        );
      }
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          rating: 5,
          title: '',
          comment: '',
        });
        setEditMode(false);
        setEditId(null);
        fetchUserReviews();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setFormData({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
    });
    setEditMode(true);
    setEditId(review._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    try {
      const { data } = await axios.delete(`${backendUrl}/api/auth/delete/${id}`, {
        withCredentials: true,
      });
      if (data.success) {
        toast.success(data.message);
        setUserReviews((prev) => prev.filter((review) => review._id !== id));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleCancel = () => {
    setFormData({
      rating: 5,
      title: '',
      comment: '',
    });
    setEditMode(false);
    setEditId(null);
  };

  const handleLoadMore = () => {
    if (pagination.hasMore) {
      fetchPublicReviews(pagination.currentPage + 1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculatePercentage = (count) => {
    const total = Object.values(stats.distribution).reduce((a, b) => a + b, 0);
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-10 mt-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Reviews</h1>
          <p className="text-gray-600 mb-10">Share your experience with FinVista or read what others have to say.</p>

          {/* Review Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {editMode ? 'Edit Your Review' : 'Write a Review'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Your Rating</label>
                <div className="flex text-2xl text-yellow-400 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="focus:outline-none mr-1"
                    >
                      {star <= formData.rating ? <FaStar /> : <FaRegStar />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Summarize your experience"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">Your Review</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience with our app"
                  required
                />
              </div>
              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:bg-blue-300"
                >
                  {submitting ? 'Submitting...' : editMode ? 'Update Review' : 'Submit Review'}
                </button>
                {editMode && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* User's Reviews Section */}
          {isLoggedin && userReviews.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Reviews</h2>
              <div className="space-y-4">
                {userReviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-lg shadow-md p-6 relative">
                    {review.isPinned && (
                      <div className="absolute top-4 right-4 text-blue-500">
                        <FaThumbtack />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex text-yellow-400 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>
                              {i < review.rating ? <FaStar /> : <FaRegStar />}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">{review.title}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(review)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="bg-blue-100 rounded-full p-1 mr-4">
                        {users[typeof review.userId === 'object' ? review.userId._id : review.userId]?.image ? (
                          <img
                            src={users[typeof review.userId === 'object' ? review.userId._id : review.userId].image}
                            alt={users[typeof review.userId === 'object' ? review.userId._id : review.userId].name}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => (e.target.src = '/default-avatar.png')}
                          />
                        ) : (
                          <FaUser className="text-blue-500" />
                        )}
                      </div>
                      <span className="font-medium mr-2">
                        {users[typeof review.userId === 'object' ? review.userId._id : review.userId]?.name || 'Loading...'}
                      </span>
                      <FaClock className="mr-1" />
                      <span className="mr-3">{formatDate(review.createdAt)}</span>
                      <span className={review.isApproved ? 'text-green-500' : 'text-yellow-500'}>
                        {review.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                    {review.adminReply && review.adminReply.content && (
                      <div className="mt-4 pl-4 border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                        <div className="flex items-center mb-2">
                          <FaReply className="text-blue-500 mr-2" />
                          <span className="font-semibold text-blue-800">Admin Reply:</span>
                        </div>
                        <p className="text-gray-700">{review.adminReply.content}</p>
                        <div className="text-sm text-gray-500 mt-2">
                          <span>Replied by {review.adminReply.repliedBy}</span>
                          <span> on {formatDate(review.adminReply.repliedAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Reviews Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Customer Feedback</h2>
              <div className="flex items-center">
                <div className="text-yellow-400 flex items-center mr-2">
                  <FaStar />
                </div>
                <span className="font-bold text-2xl text-gray-800">{stats.averageRating.toFixed(1)}</span>
                <span className="text-gray-500 ml-1">/ 5</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <div className="w-16 flex items-center">
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
                      {calculatePercentage(stats.distribution[rating])}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              {loading && <p className="text-center text-gray-600">Loading reviews...</p>}
              {!loading && publicReviews.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600">No reviews available yet. Be the first to share your experience!</p>
                </div>
              )}
              {publicReviews.map((review) => (
                <div key={review._id} className="bg-white rounded-lg shadow-md p-6 relative">
                  {review.isPinned && (
                    <div className="absolute top-4 right-4 text-blue-500" title="Pinned Review">
                      <FaThumbtack />
                    </div>
                  )}
                  <div className="flex items-start mb-2">
                    <div className="bg-blue-100 rounded-full p-1.5 mr-4">
                      {users[typeof review.userId === 'object' ? review.userId._id : review.userId]?.image ? (
                        <img
                          src={users[typeof review.userId === 'object' ? review.userId._id : review.userId].image}
                          alt={users[typeof review.userId === 'object' ? review.userId._id : review.userId].name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => (e.target.src = '/default-avatar.png')}
                        />
                      ) : (
                        <FaUser className="text-blue-500" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex text-yellow-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < review.rating ? <FaStar /> : <FaRegStar />}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1 capitalize">{review.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span className="font-medium mr-2">
                          {users[typeof review.userId === 'object' ? review.userId._id : review.userId]?.name || 'Loading...'}
                        </span>
                        <FaClock className="mr-1" />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 capitalize">{review.comment}</p>
                      {review.adminReply && review.adminReply.content && (
                        <div className="mt-4 pl-4 border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                          <div className="flex items-center mb-2">
                            <FaReply className="text-blue-500 mr-2" />
                            <span className="font-semibold text-blue-800">Admin Reply:</span>
                          </div>
                          <p className="text-gray-700">{review.adminReply.content}</p>
                          <div className="text-sm text-gray-500 mt-2 capitalize">
                            <span>Replied by {review.adminReply.repliedBy}</span>
                            <span> on {formatDate(review.adminReply.repliedAt)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
      </div>
      <FooterContainer />
    </div>
  );
};

export default ReviewPage;