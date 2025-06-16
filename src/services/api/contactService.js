class ContactService {
  constructor() {
    // Ensure SDK is available before accessing it
    if (!window.ApperSDK) {
      throw new Error('Apper SDK not loaded. Please ensure the SDK script is included in your HTML.');
    }
    
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'contact';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "company" } },
          { field: { Name: "position" } },
          { field: { Name: "Tags" } },
          { field: { Name: "status" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } }
        ],
        orderBy: [{ fieldName: "created_at", sorttype: "DESC" }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      return response.data?.map(contact => ({
        id: contact.Id,
        name: contact.Name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        position: contact.position || '',
        tags: contact.Tags ? contact.Tags.split(',').map(tag => tag.trim()) : [],
        status: contact.status || 'lead',
        createdAt: contact.created_at,
        updatedAt: contact.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "company" } },
          { field: { Name: "position" } },
          { field: { Name: "Tags" } },
          { field: { Name: "status" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        return null;
      }

      const contact = response.data;
      return {
        id: contact.Id,
        name: contact.Name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        position: contact.position || '',
        tags: contact.Tags ? contact.Tags.split(',').map(tag => tag.trim()) : [],
        status: contact.status || 'lead',
        createdAt: contact.created_at,
        updatedAt: contact.updated_at
      };
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error);
      return null;
    }
  }

  async create(contactData) {
    try {
      const params = {
        records: [{
          Name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          position: contactData.position || '',
          Tags: Array.isArray(contactData.tags) ? contactData.tags.join(',') : contactData.tags || '',
          status: contactData.status || 'lead',
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
          console.error(`Failed to create contact:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create contact');
        }

        const createdContact = response.results[0].data;
        return {
          id: createdContact.Id,
          name: createdContact.Name || '',
          email: createdContact.email || '',
          phone: createdContact.phone || '',
          company: createdContact.company || '',
          position: createdContact.position || '',
          tags: createdContact.Tags ? createdContact.Tags.split(',').map(tag => tag.trim()) : [],
          status: createdContact.status || 'lead',
          createdAt: createdContact.created_at,
          updatedAt: createdContact.updated_at
        };
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  async update(id, contactData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          position: contactData.position || '',
          Tags: Array.isArray(contactData.tags) ? contactData.tags.join(',') : contactData.tags || '',
          status: contactData.status || 'lead',
          updated_at: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update contact:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update contact');
        }

        const updatedContact = response.results[0].data;
        return {
          id: updatedContact.Id,
          name: updatedContact.Name || '',
          email: updatedContact.email || '',
          phone: updatedContact.phone || '',
          company: updatedContact.company || '',
          position: updatedContact.position || '',
          tags: updatedContact.Tags ? updatedContact.Tags.split(',').map(tag => tag.trim()) : [],
          status: updatedContact.status || 'lead',
          createdAt: updatedContact.created_at,
          updatedAt: updatedContact.updated_at
        };
      }
    } catch (error) {
      console.error('Error updating contact:', error);
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
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  async search(query) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "company" } },
          { field: { Name: "position" } },
          { field: { Name: "Tags" } },
          { field: { Name: "status" } }
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              conditions: [{
                fieldName: "Name",
                operator: "Contains",
                values: [query]
              }],
              operator: "OR"
            },
            {
              conditions: [{
                fieldName: "email",
                operator: "Contains",
                values: [query]
              }],
              operator: "OR"
            },
            {
              conditions: [{
                fieldName: "company",
                operator: "Contains",
                values: [query]
              }],
              operator: "OR"
            }
          ]
        }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        return [];
      }

      return response.data?.map(contact => ({
        id: contact.Id,
        name: contact.Name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        position: contact.position || '',
        tags: contact.Tags ? contact.Tags.split(',').map(tag => tag.trim()) : [],
        status: contact.status || 'lead'
      })) || [];
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  }
}

export default new ContactService();