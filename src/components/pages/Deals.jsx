import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { dealService, contactService } from '@/services';
import DealPipeline from '@/components/organisms/DealPipeline';
import DealForm from '@/components/organisms/DealForm';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadDealsAndContacts();
  }, []);

  const loadDealsAndContacts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load deals and contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeal = () => {
    setEditingDeal(null);
    setShowForm(true);
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setShowForm(true);
  };

  const handleDeleteDeal = async (deal) => {
    if (!window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      return;
    }

    try {
      await dealService.delete(deal.id);
      setDeals(prev => prev.filter(d => d.id !== deal.id));
      toast.success('Deal deleted successfully');
    } catch (error) {
      toast.error('Failed to delete deal');
    }
  };

  const handleDealUpdate = async (dealId, updateData) => {
    try {
      const updatedDeal = await dealService.update(dealId, updateData);
      setDeals(prev => prev.map(d => d.id === dealId ? updatedDeal : d));
      return updatedDeal;
    } catch (error) {
      throw error;
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    
    try {
      if (editingDeal) {
        const updatedDeal = await dealService.update(editingDeal.id, formData);
        setDeals(prev => prev.map(d => d.id === editingDeal.id ? updatedDeal : d));
        toast.success('Deal updated successfully');
      } else {
        const newDeal = await dealService.create(formData);
        setDeals(prev => [newDeal, ...prev]);
        toast.success('Deal added successfully');
      }
      setShowForm(false);
      setEditingDeal(null);
    } catch (error) {
      // Error is handled in the form component
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingDeal(null);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* Pipeline Skeleton */}
        <div className="flex space-x-6 overflow-x-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-80">
              <div className="h-16 bg-gray-200 rounded-t-lg animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Deals</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadDealsAndContacts} icon="RefreshCw">
          Try Again
        </Button>
      </div>
    );
  }

  if (deals.length === 0 && !loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <Button icon="Plus" onClick={handleAddDeal}>
            Add Deal
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <ApperIcon name="Target" className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No deals yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start tracking your sales opportunities by creating your first deal. 
            You can manage the entire sales process from lead to close.
          </p>
          <Button
            icon="Plus"
            size="lg"
            onClick={handleAddDeal}
          >
            Create Your First Deal
          </Button>
        </motion.div>

        {/* Deal Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <DealForm
                deal={editingDeal}
                contacts={contacts}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                loading={formLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="p-6 h-full max-w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full flex flex-col"
      >
        <DealPipeline
          deals={deals}
          contacts={contacts}
          onDealUpdate={handleDealUpdate}
          onAddDeal={handleAddDeal}
          onEditDeal={handleEditDeal}
          onDeleteDeal={handleDeleteDeal}
          loading={loading}
        />
      </motion.div>

      {/* Deal Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <DealForm
              deal={editingDeal}
              contacts={contacts}
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

export default Deals;