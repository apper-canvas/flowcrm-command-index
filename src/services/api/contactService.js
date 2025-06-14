import contactsData from '../mockData/contacts.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ContactService {
  constructor() {
    this.contacts = [...contactsData];
  }

  async getAll() {
    await delay(300);
    return [...this.contacts];
  }

  async getById(id) {
    await delay(200);
    const contact = this.contacts.find(c => c.id === id);
    return contact ? { ...contact } : null;
  }

  async create(contactData) {
    await delay(300);
    const newContact = {
      ...contactData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.contacts.push(newContact);
    return { ...newContact };
  }

  async update(id, contactData) {
    await delay(300);
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');
    
    this.contacts[index] = {
      ...this.contacts[index],
      ...contactData,
      updatedAt: new Date().toISOString()
    };
    return { ...this.contacts[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');
    
    this.contacts.splice(index, 1);
    return { success: true };
  }

  async search(query) {
    await delay(200);
    const lowercaseQuery = query.toLowerCase();
    return this.contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.email.toLowerCase().includes(lowercaseQuery) ||
      contact.company.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export default new ContactService();