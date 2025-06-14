import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import DealCard from '@/components/molecules/DealCard';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const PIPELINE_STAGES = [
  { id: 'lead', title: 'Lead', color: 'bg-info/10 border-info/20' },
  { id: 'qualified', title: 'Qualified', color: 'bg-warning/10 border-warning/20' },
  { id: 'proposal', title: 'Proposal', color: 'bg-secondary/10 border-secondary/20' },
  { id: 'negotiation', title: 'Negotiation', color: 'bg-accent/10 border-accent/20' },
  { id: 'closed', title: 'Closed', color: 'bg-success/10 border-success/20' }
];

const DealPipeline = ({ 
  deals = [], 
  contacts = [], 
  onDealUpdate, 
  onAddDeal,
  onEditDeal,
  onDeleteDeal,
  loading = false 
}) => {
  const [stageDeals, setStageDeals] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Group deals by stage
    const grouped = PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage.id] = deals.filter(deal => deal.stage === stage.id);
      return acc;
    }, {});
    setStageDeals(grouped);
  }, [deals]);

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = async (result) => {
    setIsDragging(false);
    
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    try {
      // Optimistic update
      const dealId = draggableId;
      const newStage = destination.droppableId;
      
      // Update local state immediately
      setStageDeals(prev => {
        const newState = { ...prev };
        const deal = newState[source.droppableId].find(d => d.id === dealId);
        
        if (deal) {
          // Remove from source
          newState[source.droppableId] = newState[source.droppableId].filter(d => d.id !== dealId);
          // Add to destination
          newState[destination.droppableId] = [...newState[destination.droppableId], { ...deal, stage: newStage }];
        }
        
        return newState;
      });

      // Update via service
      await onDealUpdate(dealId, { stage: newStage });
      toast.success('Deal moved successfully');
    } catch (error) {
      // Revert on error
      const grouped = PIPELINE_STAGES.reduce((acc, stage) => {
        acc[stage.id] = deals.filter(deal => deal.stage === stage.id);
        return acc;
      }, {});
      setStageDeals(grouped);
      toast.error('Failed to move deal');
    }
  };

  const getStageValue = (stageId) => {
    return stageDeals[stageId]?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Pipeline Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Deal Pipeline</h2>
        <Button
          icon="Plus"
          onClick={onAddDeal}
        >
          Add Deal
        </Button>
      </div>

      {/* Pipeline Stages */}
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex space-x-6 min-w-max h-full pb-4">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.id} className="flex-shrink-0 w-80">
                {/* Stage Header */}
                <div className={`p-4 rounded-t-lg border-2 border-b-0 ${stage.color}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{stage.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {stageDeals[stage.id]?.length || 0} deals • {formatCurrency(getStageValue(stage.id))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-96 max-h-[calc(100vh-300px)] overflow-y-auto p-4 border-2 border-t-0 rounded-b-lg bg-white space-y-3 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-gray-50 border-primary/50' : stage.color
                      }`}
                    >
                      <AnimatePresence>
                        {stageDeals[stage.id]?.map((deal, index) => {
                          const contact = contacts.find(c => c.id === deal.contactId);
                          
                          return (
                            <Draggable
                              key={deal.id}
                              draggableId={deal.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <DealCard
                                    deal={deal}
                                    contact={contact}
                                    onEdit={onEditDeal}
                                    onDelete={onDeleteDeal}
                                    isDragging={snapshot.isDragging}
                                  />
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      </AnimatePresence>
                      {provided.placeholder}
                      
                      {/* Empty State */}
                      {(!stageDeals[stage.id] || stageDeals[stage.id].length === 0) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-12 text-gray-400"
                        >
                          <ApperIcon name="Package" className="w-12 h-12 mb-3" />
                          <p className="text-sm">No deals in {stage.title.toLowerCase()}</p>
                        </motion.div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default DealPipeline;