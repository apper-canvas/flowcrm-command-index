import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Input = ({ 
  label,
  type = 'text',
  placeholder,
  value = '',
  onChange,
  onBlur,
  error,
  success,
  disabled = false,
  required = false,
  icon,
  className = '',
  ...props 
}) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(value !== '');

  const handleFocus = () => setFocused(true);
  
  const handleBlur = (e) => {
    setFocused(false);
    setHasValue(e.target.value !== '');
    onBlur?.(e);
  };

  const handleChange = (e) => {
    setHasValue(e.target.value !== '');
    onChange?.(e);
  };

  const inputClasses = `
    w-full px-4 py-3 border rounded-lg bg-white transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
    disabled:bg-gray-50 disabled:cursor-not-allowed
    ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
    ${success ? 'border-success focus:border-success focus:ring-success/20' : ''}
    ${!error && !success ? 'border-gray-300' : ''}
    ${icon ? 'pl-12' : ''}
  `;

  return (
    <div className={`relative ${className}`}>
      {/* Floating Label */}
      {label && (
        <motion.label
          animate={{
            y: focused || hasValue ? -24 : 12,
            scale: focused || hasValue ? 0.85 : 1,
            color: focused ? '#5B4CDB' : error ? '#EF4444' : '#6B7280'
          }}
          transition={{ duration: 0.2 }}
          className="absolute left-4 pointer-events-none font-medium origin-left z-10 bg-white px-1"
        >
          {label} {required && <span className="text-error">*</span>}
        </motion.label>
      )}

      {/* Icon */}
      {icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
          <ApperIcon name={icon} className="w-5 h-5 text-gray-400" />
        </div>
      )}

      {/* Input */}
      <input
        type={type}
        placeholder={focused ? placeholder : ''}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />

      {/* Success/Error Icons */}
      {(success || error) && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <ApperIcon 
            name={success ? "CheckCircle2" : "AlertCircle"} 
            className={`w-5 h-5 ${success ? 'text-success' : 'text-error'}`} 
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-error flex items-center space-x-1"
        >
          <ApperIcon name="AlertCircle" className="w-4 h-4" />
          <span>{error}</span>
        </motion.p>
      )}

      {/* Success Message */}
      {success && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-success flex items-center space-x-1"
        >
          <ApperIcon name="CheckCircle2" className="w-4 h-4" />
          <span>{success}</span>
        </motion.p>
      )}
    </div>
  );
};

export default Input;