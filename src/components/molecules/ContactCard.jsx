import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';

const ContactCard = ({ 
  contact, 
  onEdit, 
  onDelete, 
  onViewDetails,
  className = '' 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'lead': return 'warning';
      case 'prospect': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card hover clickable className={`p-6 ${className}`} onClick={() => onViewDetails?.(contact)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <ApperIcon name="User" className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{contact.name}</h3>
            <p className="text-sm text-gray-600 truncate">{contact.position}</p>
          </div>
        </div>
        <Badge variant={getStatusColor(contact.status)} size="sm" animate>
          {contact.status}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ApperIcon name="Building2" className="w-4 h-4" />
          <span className="truncate">{contact.company}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ApperIcon name="Mail" className="w-4 h-4" />
          <span className="truncate">{contact.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ApperIcon name="Phone" className="w-4 h-4" />
          <span>{contact.phone}</span>
        </div>
      </div>

      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {contact.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="primary" size="sm">
              {tag}
            </Badge>
          ))}
          {contact.tags.length > 3 && (
            <Badge variant="default" size="sm">
              +{contact.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon="Edit3"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(contact);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Trash2"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(contact);
            }}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          icon="ExternalLink"
          iconPosition="right"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(contact);
          }}
        >
          View
        </Button>
      </div>
    </Card>
  );
};

export default ContactCard;