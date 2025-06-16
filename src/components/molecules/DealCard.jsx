import { motion } from "framer-motion";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import React from "react";

const DealCard = ({ 
  deal, 
  contact,
  onEdit, 
  onDelete,
  className = '',
  isDragging = false,
  ...props 
}) => {
  const getStageColor = (stage) => {
    switch (stage) {
      case 'lead': return 'info';
      case 'qualified': return 'warning';
      case 'proposal': return 'secondary';
      case 'negotiation': return 'accent';
      case 'closed': return 'success';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <motion.div
    initial={{
        opacity: 0,
        y: 20
    }}
    animate={{
        opacity: 1,
        y: 0
    }}
    exit={{
        opacity: 0,
        y: -20
    }}
    transition={{
        duration: 0.2
    }}
    className={className}
    {...props}>
    <Card
        hover
        className={`p-4 cursor-grab active:cursor-grabbing ${isDragging ? "rotate-3 shadow-lg" : ""}`}>
        <div className="flex items-start justify-between mb-3">
            <h3
                className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                {deal.title}
            </h3>
            <div className="flex space-x-1 ml-2">
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onEdit?.(deal);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <ApperIcon name="Edit3" className="w-4 h-4" />
                </button>
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onDelete?.(deal);
                    }}
                    className="p-1 text-gray-400 hover:text-error transition-colors">
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                </button>
            </div>
        </div>
        <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(deal.value)}
                </span>
                <Badge variant={getStageColor(deal.stage)} size="sm">
                    {deal.probability}%
                                </Badge>
            </div>
            {contact && <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ApperIcon name="User" className="w-4 h-4" />
                <span className="truncate">{contact.name}</span>
            </div>})

                      {deal.phone && <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ApperIcon name="Phone" className="w-4 h-4" />
                <span className="truncate">{deal.phone}</span>
            </div>}
            {deal.expectedClose && <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ApperIcon name="Calendar" className="w-4 h-4" />
                <span>{format(new Date(deal.expectedClose), "MMM dd, yyyy")}</span>
            </div>}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                    initial={{
                        width: 0
                    }}
                    animate={{
                        width: `${deal.probability}%`
                    }}
                    transition={{
                        duration: 0.5,
                        delay: 0.2
                    }}
                    className="bg-primary h-2 rounded-full" />
            </div>
        </div></Card>
</motion.div>
  );
};

export default DealCard;