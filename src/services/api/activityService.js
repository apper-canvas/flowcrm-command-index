const { ApperClient } = window.ApperSDK;

class ActivityService {
  constructor() {
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'Activity1';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "type" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "contact_id" } },
          { field: { Name: "deal_id" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "created_at" } }
        ],
        orderBy: [{ fieldName: "created_at", sorttype: "DESC" }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      return response.data?.map(activity => ({
        id: activity.Id,
        type: activity.type || 'call',
        title: activity.title || activity.Name || '',
        description: activity.description || '',
        contactId: activity.contact_id?.toString(),
        dealId: activity.deal_id?.toString(),
        dueDate: activity.due_date,
        completed: activity.completed || false,
        createdAt: activity.created_at
      })) || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "type" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "contact_id" } },
          { field: { Name: "deal_id" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "created_at" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        return null;
      }

      const activity = response.data;
      return {
        id: activity.Id,
        type: activity.type || 'call',
        title: activity.title || activity.Name || '',
        description: activity.description || '',
        contactId: activity.contact_id?.toString(),
        dealId: activity.deal_id?.toString(),
        dueDate: activity.due_date,
        completed: activity.completed || false,
        createdAt: activity.created_at
      };
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error);
      return null;
    }
  }

  async getByContactId(contactId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "type" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "contact_id" } },
          { field: { Name: "deal_id" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "created_at" } }
        ],
        where: [{
          FieldName: "contact_id",
          Operator: "EqualTo",
          Values: [parseInt(contactId)]
        }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        return [];
      }

      return response.data?.map(activity => ({
        id: activity.Id,
        type: activity.type || 'call',
        title: activity.title || activity.Name || '',
        description: activity.description || '',
        contactId: activity.contact_id?.toString(),
        dealId: activity.deal_id?.toString(),
        dueDate: activity.due_date,
        completed: activity.completed || false,
        createdAt: activity.created_at
      })) || [];
    } catch (error) {
      console.error('Error fetching activities by contact:', error);
      return [];
    }
  }

  async getByDealId(dealId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "type" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "contact_id" } },
          { field: { Name: "deal_id" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "created_at" } }
        ],
        where: [{
          FieldName: "deal_id",
          Operator: "EqualTo",
          Values: [parseInt(dealId)]
        }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        return [];
      }

      return response.data?.map(activity => ({
        id: activity.Id,
        type: activity.type || 'call',
        title: activity.title || activity.Name || '',
        description: activity.description || '',
        contactId: activity.contact_id?.toString(),
        dealId: activity.deal_id?.toString(),
        dueDate: activity.due_date,
        completed: activity.completed || false,
        createdAt: activity.created_at
      })) || [];
    } catch (error) {
      console.error('Error fetching activities by deal:', error);
      return [];
    }
  }

  async create(activityData) {
    try {
      const params = {
        records: [{
          Name: activityData.title,
          type: activityData.type || 'call',
          title: activityData.title,
          description: activityData.description || '',
          contact_id: activityData.contactId ? parseInt(activityData.contactId) : null,
          deal_id: activityData.dealId ? parseInt(activityData.dealId) : null,
          due_date: activityData.dueDate || null,
          completed: activityData.completed || false,
          created_at: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create activity:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create activity');
        }

        const createdActivity = response.results[0].data;
        return {
          id: createdActivity.Id,
          type: createdActivity.type || 'call',
          title: createdActivity.title || createdActivity.Name || '',
          description: createdActivity.description || '',
          contactId: createdActivity.contact_id?.toString(),
          dealId: createdActivity.deal_id?.toString(),
          dueDate: createdActivity.due_date,
          completed: createdActivity.completed || false,
          createdAt: createdActivity.created_at
        };
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  async update(id, activityData) {
    try {
      const updateRecord = {
        Id: parseInt(id)
      };

      // Only include fields that are being updated
      if (activityData.title !== undefined) {
        updateRecord.Name = activityData.title;
        updateRecord.title = activityData.title;
      }
      if (activityData.type !== undefined) {
        updateRecord.type = activityData.type;
      }
      if (activityData.description !== undefined) {
        updateRecord.description = activityData.description;
      }
      if (activityData.contactId !== undefined) {
        updateRecord.contact_id = activityData.contactId ? parseInt(activityData.contactId) : null;
      }
      if (activityData.dealId !== undefined) {
        updateRecord.deal_id = activityData.dealId ? parseInt(activityData.dealId) : null;
      }
      if (activityData.dueDate !== undefined) {
        updateRecord.due_date = activityData.dueDate;
      }
      if (activityData.completed !== undefined) {
        updateRecord.completed = activityData.completed;
      }

      const params = {
        records: [updateRecord]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update activity:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update activity');
        }

        const updatedActivity = response.results[0].data;
        return {
          id: updatedActivity.Id,
          type: updatedActivity.type || 'call',
          title: updatedActivity.title || updatedActivity.Name || '',
          description: updatedActivity.description || '',
          contactId: updatedActivity.contact_id?.toString(),
          dealId: updatedActivity.deal_id?.toString(),
          dueDate: updatedActivity.due_date,
          completed: updatedActivity.completed || false,
          createdAt: updatedActivity.created_at
        };
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  async markComplete(id) {
    return this.update(id, { completed: true });
  }
}

export default new ActivityService();