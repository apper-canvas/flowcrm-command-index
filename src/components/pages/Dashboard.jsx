import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { contactService, dealService, activityService } from '@/services';
import StatCard from '@/components/molecules/StatCard';
import ActivityItem from '@/components/molecules/ActivityItem';
import DealCard from '@/components/molecules/DealCard';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalDeals: 0,
    pipelineValue: 0,
    activitiesCompleted: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [contactsData, dealsData, activitiesData] = await Promise.all([
        contactService.getAll(),
        dealService.getAll(),
        activityService.getAll()
      ]);

      setContacts(contactsData);
      setDeals(dealsData);

      // Calculate stats
      const pipelineValue = dealsData
        .filter(deal => deal.stage !== 'closed')
        .reduce((sum, deal) => sum + (deal.value || 0), 0);
      
      const completedActivities = activitiesData.filter(activity => activity.completed).length;

      setStats({
        totalContacts: contactsData.length,
        totalDeals: dealsData.length,
        pipelineValue,
        activitiesCompleted: completedActivities
      });

      // Recent activities (last 5)
      const sortedActivities = activitiesData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentActivities(sortedActivities);

      // Upcoming tasks (next 5 incomplete tasks with due dates)
      const upcoming = activitiesData
        .filter(activity => !activity.completed && activity.dueDate && new Date(activity.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);
      setUpcomingTasks(upcoming);

      // Top deals (highest value, not closed)
      const topValueDeals = dealsData
        .filter(deal => deal.stage !== 'closed')
        .sort((a, b) => (b.value || 0) - (a.value || 0))
        .slice(0, 3);
      setTopDeals(topValueDeals);

    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (activity) => {
    try {
      await activityService.markComplete(activity.id);
      toast.success('Task completed!');
      loadDashboardData(); // Refresh data
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadDashboardData} icon="RefreshCw">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Dashboard
        </motion.h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your sales pipeline.
        </p>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <StatCard
          title="Total Contacts"
          value={stats.totalContacts}
          icon="Users"
          iconColor="primary"
          animate
        />
        <StatCard
          title="Active Deals"
          value={stats.totalDeals}
          icon="Target"
          iconColor="accent"
          animate
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(stats.pipelineValue)}
          icon="DollarSign"
          iconColor="success"
          animate
        />
        <StatCard
          title="Tasks Completed"
          value={stats.activitiesCompleted}
          icon="CheckCircle2"
          iconColor="info"
          animate
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-lg shadow-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
            <Button variant="ghost" size="sm" icon="ExternalLink">
              View All
            </Button>
          </div>

          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const contact = contacts.find(c => c.id === activity.contactId);
                const deal = deals.find(d => d.id === activity.dealId);
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <ActivityItem
                      activity={activity}
                      contact={contact}
                      deal={deal}
                      onToggleComplete={handleCompleteTask}
                      showActions={false}
                    />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ApperIcon name="Activity" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activities</p>
            </div>
          )}
        </motion.div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Upcoming Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
              <ApperIcon name="Clock" className="w-5 h-5 text-gray-400" />
            </div>

            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map((task, index) => {
                  const contact = contacts.find(c => c.id === task.contactId);
                  
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <button
                        onClick={() => handleCompleteTask(task)}
                        className="mt-1 w-4 h-4 border-2 border-gray-300 rounded hover:border-primary transition-colors"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </p>
                        {contact && (
                          <p className="text-xs text-gray-600 truncate">
                            {contact.name}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="CheckCircle2" className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">All caught up!</p>
              </div>
            )}
          </motion.div>

          {/* Top Deals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Deals</h3>
              <ApperIcon name="TrendingUp" className="w-5 h-5 text-gray-400" />
            </div>

            {topDeals.length > 0 ? (
              <div className="space-y-4">
                {topDeals.map((deal, index) => {
                  const contact = contacts.find(c => c.id === deal.contactId);
                  
                  return (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {deal.title}
                        </h4>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(deal.value)}
                        </span>
                      </div>
                      {contact && (
                        <p className="text-sm text-gray-600">{contact.name}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize">{deal.stage}</span>
                        <span>{deal.probability}% chance</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="Target" className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active deals</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;