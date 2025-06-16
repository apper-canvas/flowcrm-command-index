const { ApperClient } = window.ApperSDK;

class DealService {
  constructor() {
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'deal';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "value" } },
          { field: { Name: "stage" } },
          { field: { Name: "probability" } },
          { field: { Name: "expected_close" } },
          { field: { Name: "contact_id" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } }
        ],
        orderBy: [{ fieldName: "created_at", sorttype: "DESC" }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      return response.data?.map(deal => ({
        id: deal.Id,
        title: deal.title || deal.Name || '',
        value: deal.value || 0,
        stage: deal.stage || 'lead',
        probability: deal.probability || 50,
        expectedClose: deal.expected_close,
        contactId: deal.contact_id?.toString(),
        createdAt: deal.created_at,
        updatedAt: deal.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "value" } },
          { field: { Name: "stage" } },
          { field: { Name: "probability" } },
          { field: { Name: "expected_close" } },
          { field: { Name: "contact_id" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        return null;
      }

      const deal = response.data;
      return {
        id: deal.Id,
        title: deal.title || deal.Name || '',
        value: deal.value || 0,
        stage: deal.stage || 'lead',
        probability: deal.probability || 50,
        expectedClose: deal.expected_close,
        contactId: deal.contact_id?.toString(),
        createdAt: deal.created_at,
        updatedAt: deal.updated_at
      };
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error);
      return null;
    }
  }

  async create(dealData) {
    try {
      const params = {
        records: [{
          Name: dealData.title,
          title: dealData.title,
          value: parseFloat(dealData.value),
          stage: dealData.stage || 'lead',
          probability: parseInt(dealData.probability) || 50,
          expected_close: dealData.expectedClose || null,
          contact_id: dealData.contactId ? parseInt(dealData.contactId) : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create deal:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create deal');
        }

        const createdDeal = response.results[0].data;
        return {
          id: createdDeal.Id,
          title: createdDeal.title || createdDeal.Name || '',
          value: createdDeal.value || 0,
          stage: createdDeal.stage || 'lead',
          probability: createdDeal.probability || 50,
          expectedClose: createdDeal.expected_close,
          contactId: createdDeal.contact_id?.toString(),
          createdAt: createdDeal.created_at,
          updatedAt: createdDeal.updated_at
        };
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  async update(id, dealData) {
    try {
      const updateRecord = {
        Id: parseInt(id),
        updated_at: new Date().toISOString()
      };

      // Only include fields that are being updated
      if (dealData.title !== undefined) {
        updateRecord.Name = dealData.title;
        updateRecord.title = dealData.title;
      }
      if (dealData.value !== undefined) {
        updateRecord.value = parseFloat(dealData.value);
      }
      if (dealData.stage !== undefined) {
        updateRecord.stage = dealData.stage;
      }
      if (dealData.probability !== undefined) {
        updateRecord.probability = parseInt(dealData.probability);
      }
      if (dealData.expectedClose !== undefined) {
        updateRecord.expected_close = dealData.expectedClose;
      }
      if (dealData.contactId !== undefined) {
        updateRecord.contact_id = dealData.contactId ? parseInt(dealData.contactId) : null;
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
          console.error(`Failed to update deal:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update deal');
        }

        const updatedDeal = response.results[0].data;
        return {
          id: updatedDeal.Id,
          title: updatedDeal.title || updatedDeal.Name || '',
          value: updatedDeal.value || 0,
          stage: updatedDeal.stage || 'lead',
          probability: updatedDeal.probability || 50,
          expectedClose: updatedDeal.expected_close,
          contactId: updatedDeal.contact_id?.toString(),
          createdAt: updatedDeal.created_at,
          updatedAt: updatedDeal.updated_at
        };
      }
    } catch (error) {
      console.error('Error updating deal:', error);
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
      console.error('Error deleting deal:', error);
      throw error;
    }
  }

  async updateStage(id, newStage) {
    return this.update(id, { stage: newStage });
  }
}

export default new DealService();