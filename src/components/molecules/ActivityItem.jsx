import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';

const ActivityItem = ({ 
  activity, 
  contact,
  deal,
  onEdit, 
  onDelete,
  onToggleComplete,
  showActions = true,
  className = '' 
}) => {
  // Early return if activity is not provided
  if (!activity) {
    console.warn('ActivityItem: activity prop is required');
    return null;
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'call': return 'Phone';
      case 'email': return 'Mail';
      case 'meeting': return 'Calendar';
      case 'task': return 'CheckSquare';
      case 'note': return 'FileText';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'call': return 'info';
      case 'email': return 'accent';
      case 'meeting': return 'warning';
      case 'task': return 'primary';
      case 'note': return 'secondary';
      default: return 'default';
    }
  };

  // Safe date parsing with error handling
  const parseDueDate = () => {
    try {
      return activity.dueDate ? new Date(activity.dueDate) : null;
    } catch (error) {
      console.error('Error parsing due date:', error);
      return null;
    }
  };

  const parseCreatedAt = () => {
    try {
      return activity.createdAt ? new Date(activity.createdAt) : new Date();
    } catch (error) {
      console.error('Error parsing created date:', error);
      return new Date();
    }
  };

  const dueDate = parseDueDate();
  const createdAt = parseCreatedAt();
  const now = new Date();

  const isOverdue = dueDate && dueDate < now && !activity.completed;
  const isDueSoon = dueDate && 
    dueDate > now && 
    dueDate < new Date(Date.now() + 24 * 60 * 60 * 1000) && 
    !activity.completed;

  // Safe date formatting
  const formatCreatedAt = () => {
    try {
      return formatDistanceToNow(createdAt, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting created date:', error);
      return 'Unknown time';
    }
  };

  const formatDueDate = () => {
    try {
      return dueDate ? format(dueDate, 'MMM dd') : '';
    } catch (error) {
      console.error('Error formatting due date:', error);
      return 'Invalid date';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex space-x-4 p-4 bg-white rounded-lg border border-gray-100 ${className}`}
    >
      {/* Activity Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        activity.completed ? 'bg-success/10' : `bg-${getActivityColor(activity.type || 'default')}/10`
      }`}>
        <ApperIcon 
          name={activity.completed ? "CheckCircle2" : getActivityIcon(activity.type)} 
          className={`w-5 h-5 ${
            activity.completed ? 'text-success' : `text-${getActivityColor(activity.type || 'default')}`
          }`}
        />
      </div>

      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h4 className={`font-medium ${activity.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {activity.title || 'Untitled Activity'}
            </h4>
            <Badge variant={getActivityColor(activity.type || 'default')} size="sm">
              {activity.type || 'activity'}
            </Badge>
            {activity.completed && (
              <Badge variant="success" size="sm">
                completed
              </Badge>
            )}
            {isOverdue && (
              <Badge variant="error" size="sm">
                overdue
              </Badge>
            )}
            {isDueSoon && (
              <Badge variant="warning" size="sm">
                due soon
              </Badge>
            )}
          </div>
        </div>

        {activity.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {activity.description}
          </p>
        )}

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          {contact?.name && (
            <div className="flex items-center space-x-1">
              <ApperIcon name="User" className="w-4 h-4" />
              <span>{contact.name}</span>
            </div>
          )}
          
          {deal?.title && (
            <div className="flex items-center space-x-1">
              <ApperIcon name="Target" className="w-4 h-4" />
              <span className="truncate">{deal.title}</span>
            </div>
          )}

          <div className="flex items-center space-x-1">
            <ApperIcon name="Clock" className="w-4 h-4" />
            <span>{formatCreatedAt()}</span>
          </div>

          {dueDate && (
            <div className="flex items-center space-x-1">
              <ApperIcon name="Calendar" className="w-4 h-4" />
              <span>Due {formatDueDate()}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            {activity.type === 'task' && !activity.completed && (
              <Button
                variant="ghost"
                size="sm"
                icon="Check"
                onClick={() => onToggleComplete?.(activity)}
              >
                Complete
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon="Edit3"
              onClick={() => onEdit?.(activity)}
            />
            <Button
              variant="ghost"
              size="sm"
              icon="Trash2"
              onClick={() => onDelete?.(activity)}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityItem;