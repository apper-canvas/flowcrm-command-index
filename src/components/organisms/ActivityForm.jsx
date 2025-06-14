import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const ActivityForm = ({ 
  activity = null, 
  contacts = [],
  deals = [],
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    type: 'call',
    title: '',
    description: '',
    contactId: '',
    dealId: '',
    dueDate: '',
    completed: false
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type || 'call',
        title: activity.title || '',
        description: activity.description || '',
        contactId: activity.contactId || '',
        dealId: activity.dealId || '',
        dueDate: activity.dueDate ? activity.dueDate.split('T')[0] : '',
        completed: activity.completed || false
      });
    }
  }, [activity]);

  // Filter deals based on selected contact
  const filteredDeals = formData.contactId 
    ? deals.filter(deal => deal.contactId === formData.contactId)
    : deals;

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        return !value.trim() ? 'Activity title is required' : '';
      case 'contactId':
        return !value ? 'Please select a contact' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
      // Clear dealId if contact changes
      ...(name === 'contactId' && { dealId: '' })
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    ['title', 'contactId'].forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    setTouched(['title', 'contactId'].reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    const submitData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      dealId: formData.dealId || null
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      toast.error(error.message || 'Failed to save activity');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4"
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {activity ? 'Edit Activity' : 'Add New Activity'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" className="w-6 h-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            >
              <option value="call">Phone Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="task">Task</option>
              <option value="note">Note</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact <span className="text-error">*</span>
            </label>
            <select
              name="contactId"
              value={formData.contactId}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ${
                touched.contactId && errors.contactId ? 'border-error' : 'border-gray-300'
              }`}
            >
              <option value="">Select a contact</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} - {contact.company}
                </option>
              ))}
            </select>
            {touched.contactId && errors.contactId && (
              <p className="mt-2 text-sm text-error">{errors.contactId}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Input
              label="Activity Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title ? errors.title : ''}
              required
              icon="Edit3"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Deal (Optional)
            </label>
            <select
              name="dealId"
              value={formData.dealId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              disabled={!formData.contactId}
            >
              <option value="">Select a deal</option>
              {filteredDeals.map(deal => (
                <option key={deal.id} value={deal.id}>
                  {deal.title} - ${deal.value?.toLocaleString()}
                </option>
              ))}
            </select>
            {!formData.contactId && (
              <p className="mt-1 text-xs text-gray-500">Select a contact first to see related deals</p>
            )}
          </div>

          <Input
            label="Due Date (Optional)"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            onBlur={handleBlur}
            icon="Calendar"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
            placeholder="Add any additional details about this activity..."
          />
        </div>

        {activity && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="completed"
              name="completed"
              checked={formData.completed}
              onChange={handleChange}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
            />
            <label htmlFor="completed" className="text-sm font-medium text-gray-700">
              Mark as completed
            </label>
          </div>
        )}

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon="Save"
          >
            {activity ? 'Update Activity' : 'Add Activity'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ActivityForm;