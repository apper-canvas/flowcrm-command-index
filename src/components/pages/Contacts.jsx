import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { contactService } from '@/services';
import ContactCard from '@/components/molecules/ContactCard';
import ContactForm from '@/components/organisms/ContactForm';
import SearchBar from '@/components/molecules/SearchBar';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchQuery, statusFilter]);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError(err.message || 'Failed to load contacts');
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = [...contacts];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.company.toLowerCase().includes(query) ||
        contact.position.toLowerCase().includes(query) ||
        (contact.tags && contact.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    // For real implementation, you might want to debounce this
    try {
      const results = await contactService.search(query);
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setShowForm(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDeleteContact = async (contact) => {
    if (!window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      return;
    }

    try {
      await contactService.delete(contact.id);
      setContacts(prev => prev.filter(c => c.id !== contact.id));
      toast.success('Contact deleted successfully');
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    
    try {
      if (editingContact) {
        const updatedContact = await contactService.update(editingContact.id, formData);
        setContacts(prev => prev.map(c => c.id === editingContact.id ? updatedContact : c));
        toast.success('Contact updated successfully');
      } else {
        const newContact = await contactService.create(formData);
        setContacts(prev => [newContact, ...prev]);
        toast.success('Contact added successfully');
      }
      setShowForm(false);
      setEditingContact(null);
    } catch (error) {
      // Error is handled in the form component
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  const getStatusCounts = () => {
    return contacts.reduce((counts, contact) => {
      counts[contact.status] = (counts[contact.status] || 0) + 1;
      return counts;
    }, { all: contacts.length });
  };

  const statusCounts = getStatusCounts();

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
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          ))}
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-card animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Contacts</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadContacts} icon="RefreshCw">
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
          Contacts ({contacts.length})
        </motion.h1>
        <Button
          icon="Plus"
          onClick={handleAddContact}
        >
          Add Contact
        </Button>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6"
      >
        <div className="flex-1 max-w-md">
          <SearchBar
            placeholder="Search contacts..."
            onSearch={handleSearch}
            onResultClick={(contact) => handleEditContact(contact)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'lead', label: 'Leads' },
            { key: 'prospect', label: 'Prospects' }
          ].map(status => (
            <button
              key={status.key}
              onClick={() => setStatusFilter(status.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.label} ({statusCounts[status.key] || 0})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Contacts Grid */}
      {filteredContacts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <ContactCard
                contact={contact}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
                onViewDetails={handleEditContact}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <ApperIcon name="Users" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No contacts found' : 'No contacts yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first contact'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button
              icon="Plus"
              onClick={handleAddContact}
            >
              Add Contact
            </Button>
          )}
        </motion.div>
      )}

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <ContactForm
              contact={editingContact}
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

export default Contacts;