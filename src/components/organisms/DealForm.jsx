import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const DealForm = ({ 
  deal = null, 
  contacts = [],
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
const [formData, setFormData] = useState({
    title: '',
    value: '',
    stage: 'lead',
    contactId: '',
    probability: '50',
    expectedClose: '',
    phone: '',
    city: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (deal) {
setFormData({
        title: deal.title || '',
        value: deal.value?.toString() || '',
        stage: deal.stage || 'lead',
        contactId: deal.contactId || '',
        probability: deal.probability?.toString() || '50',
        expectedClose: deal.expectedClose ? deal.expectedClose.split('T')[0] : '',
        phone: deal.phone || '',
        city: deal.city || ''
      });
    }
  }, [deal]);

const validateField = (name, value) => {
    switch (name) {
      case 'title':
        return !value.trim() ? 'Deal title is required' : '';
      case 'value':
        const numValue = parseFloat(value);
        return !value.trim() ? 'Deal value is required' : 
               isNaN(numValue) || numValue <= 0 ? 'Please enter a valid amount' : '';
      case 'contactId':
        return !value ? 'Please select a contact' : '';
      case 'probability':
        const probValue = parseInt(value);
        return !value ? 'Probability is required' :
               isNaN(probValue) || probValue < 0 || probValue > 100 ? 'Probability must be between 0 and 100' : '';
      case 'city':
        return !value.trim() ? 'City is required' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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
    ['title', 'value', 'contactId', 'probability', 'city'].forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    setTouched(['title', 'value', 'contactId', 'probability', 'city'].reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
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
      value: parseFloat(formData.value),
      probability: parseInt(formData.probability),
      expectedClose: formData.expectedClose ? new Date(formData.expectedClose).toISOString() : null
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      toast.error(error.message || 'Failed to save deal');
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
            {deal ? 'Edit Deal' : 'Add New Deal'}
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
          <div className="md:col-span-2">
            <Input
              label="Deal Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title ? errors.title : ''}
              required
              icon="Target"
            />
          </div>

          <Input
            label="Deal Value"
            name="value"
            type="number"
            value={formData.value}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.value ? errors.value : ''}
            required
            icon="DollarSign"
            placeholder="0.00"
/>

<Input
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            icon="Phone"
            placeholder="(555) 123-4567"
          />

          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.city ? errors.city : ''}
            required
            icon="MapPin"
            placeholder="Enter city"
          />

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

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stage
            </label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            >
              <option value="lead">Lead</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <Input
            label="Probability (%)"
            name="probability"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.probability ? errors.probability : ''}
            required
            icon="Percent"
          />

          <Input
            label="Expected Close Date"
            name="expectedClose"
            type="date"
            value={formData.expectedClose}
            onChange={handleChange}
            onBlur={handleBlur}
            icon="Calendar"
          />
        </div>

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
            {deal ? 'Update Deal' : 'Add Deal'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default DealForm;