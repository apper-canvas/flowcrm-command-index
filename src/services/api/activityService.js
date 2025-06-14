import activitiesData from '../mockData/activities.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ActivityService {
  constructor() {
    this.activities = [...activitiesData];
  }

  async getAll() {
    await delay(300);
    return [...this.activities];
  }

  async getById(id) {
    await delay(200);
    const activity = this.activities.find(a => a.id === id);
    return activity ? { ...activity } : null;
  }

  async getByContactId(contactId) {
    await delay(200);
    return this.activities.filter(a => a.contactId === contactId);
  }

  async getByDealId(dealId) {
    await delay(200);
    return this.activities.filter(a => a.dealId === dealId);
  }

  async create(activityData) {
    await delay(300);
    const newActivity = {
      ...activityData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    this.activities.push(newActivity);
    return { ...newActivity };
  }

  async update(id, activityData) {
    await delay(300);
    const index = this.activities.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Activity not found');
    
    this.activities[index] = {
      ...this.activities[index],
      ...activityData
    };
    return { ...this.activities[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.activities.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Activity not found');
    
    this.activities.splice(index, 1);
    return { success: true };
  }

  async markComplete(id) {
    await delay(200);
    const index = this.activities.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Activity not found');
    
    this.activities[index] = {
      ...this.activities[index],
      completed: true
    };
    return { ...this.activities[index] };
  }
}

export default new ActivityService();