import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon, 
  iconColor = 'primary',
  className = '',
  animate = true 
}) => {
  const getIconBgColor = (color) => {
    switch (color) {
      case 'primary': return 'bg-primary/10 text-primary';
      case 'secondary': return 'bg-secondary/10 text-secondary';
      case 'accent': return 'bg-accent/10 text-accent';
      case 'success': return 'bg-success/10 text-success';
      case 'warning': return 'bg-warning/10 text-warning';
      case 'error': return 'bg-error/10 text-error';
      case 'info': return 'bg-info/10 text-info';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-error';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'positive': return 'TrendingUp';
      case 'negative': return 'TrendingDown';
      case 'neutral': return 'Minus';
      default: return 'Minus';
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <motion.div
            initial={animate ? { scale: 0.5, opacity: 0 } : {}}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-baseline space-x-2"
          >
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            {change && (
              <div className={`flex items-center space-x-1 ${getChangeColor(changeType)}`}>
                <ApperIcon name={getChangeIcon(changeType)} className="w-4 h-4" />
                <span className="text-sm font-medium">{change}</span>
              </div>
            )}
          </motion.div>
        </div>
        
        {icon && (
          <motion.div
            initial={animate ? { scale: 0, rotate: -180 } : {}}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconBgColor(iconColor)}`}
          >
            <ApperIcon name={icon} className="w-6 h-6" />
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;