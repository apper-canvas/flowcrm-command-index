import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, startOfDay, endOfDay, isToday, isTomorrow, isYesterday } from 'date-fns';
import { activityService, contactService, dealService } from '@/services';
import ActivityItem from '@/components/molecules/ActivityItem';
import ActivityForm from '@/components/organisms/ActivityForm';
import SearchBar from '@/components/molecules/SearchBar';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, typeFilter, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      
      setActivities(activitiesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError(err.message || 'Failed to load activities');
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(query) ||
        activity.description.toLowerCase().includes(query) ||
        activity.type.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter === 'completed') {
      filtered = filtered.filter(activity => activity.completed);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(activity => !activity.completed);
    } else if (statusFilter === 'overdue') {
      filtered = filtered.filter(activity => 
        !activity.completed && 
        activity.dueDate && 
        new Date(activity.dueDate) < new Date()
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredActivities(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setShowForm(true);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleDeleteActivity = async (activity) => {
    if (!window.confirm(`Are you sure you want to delete "${activity.title}"?`)) {
      return;
    }

    try {
      await activityService.delete(activity.id);
      setActivities(prev => prev.filter(a => a.id !== activity.id));
      toast.success('Activity deleted successfully');
    } catch (error) {
      toast.error('Failed to delete activity');
    }
  };

  const handleToggleComplete = async (activity) => {
    try {
      const updatedActivity = await activityService.markComplete(activity.id);
      setActivities(prev => prev.map(a => a.id === activity.id ? updatedActivity : a));
      toast.success('Activity marked as completed');
    } catch (error) {
      toast.error('Failed to update activity');
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    
    try {
      if (editingActivity) {
        const updatedActivity = await activityService.update(editingActivity.id, formData);
        setActivities(prev => prev.map(a => a.id === editingActivity.id ? updatedActivity : a));
        toast.success('Activity updated successfully');
      } else {
        const newActivity = await activityService.create(formData);
        setActivities(prev => [newActivity, ...prev]);
        toast.success('Activity added successfully');
      }
      setShowForm(false);
      setEditingActivity(null);
    } catch (error) {
      // Error is handled in the form component
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingActivity(null);
  };

  const groupActivitiesByDate = (activities) => {
    const groups = activities.reduce((acc, activity) => {
      const date = activity.dueDate ? new Date(activity.dueDate) : new Date(activity.createdAt);
      const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
      
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(activity);
      
      return acc;
    }, {});

    // Sort groups by date (newest first)
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .map(([dateStr, activities]) => ({
        date: new Date(dateStr),
        dateStr,
        activities
      }));
  };

  const getDateLabel = (date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM dd, yyyy');
  };

  const getFilterCounts = () => {
    return {
      all: activities.length,
      call: activities.filter(a => a.type === 'call').length,
      email: activities.filter(a => a.type === 'email').length,
      meeting: activities.filter(a => a.type === 'meeting').length,
      task: activities.filter(a => a.type === 'task').length,
      note: activities.filter(a => a.type === 'note').length,
      completed: activities.filter(a => a.completed).length,
      pending: activities.filter(a => !a.completed).length,
      overdue: activities.filter(a => !a.completed && a.dueDate && new Date(a.dueDate) < new Date()).length
    };
  };

  const counts = getFilterCounts();
  const groupedActivities = groupActivitiesByDate(filteredActivities);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="flex space-x-4">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          ))}
        </div>

        {/* Activities Skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="bg-white rounded-lg p-4 shadow-card animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Activities</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadData} icon="RefreshCw">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900"
        >
          Activities ({activities.length})
        </motion.h1>
        <Button
          icon="Plus"
          onClick={handleAddActivity}
        >
          Add Activity
        </Button>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 mb-6"
      >
        {/* Search */}
        <div className="max-w-md">
          <SearchBar
            placeholder="Search activities..."
            onSearch={handleSearch}
          />
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Type:</span>
          {[
            { key: 'all', label: 'All' },
            { key: 'call', label: 'Calls' },
            { key: 'email', label: 'Emails' },
            { key: 'meeting', label: 'Meetings' },
            { key: 'task', label: 'Tasks' },
            { key: 'note', label: 'Notes' }
          ].map(type => (
            <button
              key={type.key}
              onClick={() => setTypeFilter(type.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                typeFilter === type.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label} ({counts[type.key] || 0})
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          {[
            { key: 'all', label: 'All' },
            { key: 'completed', label: 'Completed' },
            { key: 'pending', label: 'Pending' },
            { key: 'overdue', label: 'Overdue' }
          ].map(status => (
            <button
              key={status.key}
              onClick={() => setStatusFilter(status.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status.key
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.label} ({counts[status.key] || 0})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Activities Timeline */}
      {filteredActivities.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {groupedActivities.map(({ date, dateStr, activities }, groupIndex) => (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * groupIndex }}
              className="space-y-4"
            >
              {/* Date Header */}
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getDateLabel(date)}
                </h3>
                <div className="flex-1 h-px bg-gray-200"></div>
                <Badge variant="default" size="sm">
                  {activities.length} activities
                </Badge>
              </div>

              {/* Activities List */}
              <div className="space-y-3">
                {activities.map((activity, index) => {
                  const contact = contacts.find(c => c.id === activity.contactId);
                  const deal = deals.find(d => d.id === activity.dealId);
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <ActivityItem
                        activity={activity}
                        contact={contact}
                        deal={deal}
                        onEdit={handleEditActivity}
                        onDelete={handleDeleteActivity}
                        onToggleComplete={handleToggleComplete}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <ApperIcon name="Clock" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' 
              ? 'No activities found' 
              : 'No activities yet'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start tracking your interactions by adding your first activity'
            }
          </p>
          {!searchQuery && typeFilter === 'all' && statusFilter === 'all' && (
            <Button
              icon="Plus"
              onClick={handleAddActivity}
            >
              Add Activity
            </Button>
          )}
        </motion.div>
      )}

      {/* Activity Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <ActivityForm
              activity={editingActivity}
              contacts={contacts}
              deals={deals}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              loading={formLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Activities;