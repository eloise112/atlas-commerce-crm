import { Order, StyleProduct } from "../types";

const ORDER_STORAGE_KEY = 'jarvis_crm_data_v1';
const STYLE_STORAGE_KEY = 'jarvis_crm_styles_v1';

// Initial Seed Data if empty
const SEED_ORDERS: Order[] = [
  {
    id: '1',
    customerName: 'Tony Stark',
    contactInfo: 'stark@avengers.com',
    orderNo: 'ORD-001',
    orderDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'Shipped' as any,
    shippedDate: new Date().toISOString(),
    amount: 1500.00,
    items: [{ style: 'Mk85 Helmet', quantity: 1 }],
    source: 'Facebook' as any,
    lastUpdated: Date.now()
  },
  {
    id: '2',
    customerName: 'Peter Parker',
    contactInfo: '@spidey_nyc',
    orderNo: 'ORD-002',
    orderDate: new Date().toISOString(),
    status: 'Pending' as any,
    amount: 250.50,
    items: [{ style: 'Web Shooter Refill', quantity: 10 }, { style: 'Camera Lens', quantity: 1 }],
    source: 'TikTok' as any,
    lastUpdated: Date.now()
  }
];

const SEED_STYLES: StyleProduct[] = [
  { 
    id: 's1', 
    name: 'Mk85 Helmet', 
    category: 'Accessory', 
    material: 'Nano-Tech Gold', 
    designType: 'Techwear', 
    costPrice: 800,
    retailPrice: 1500,
    discount: '',
    lastUpdated: Date.now() 
  },
  { 
    id: 's2', 
    name: 'Web Shooter Refill', 
    category: 'Consumable', 
    material: 'Synthetic Web', 
    designType: 'Utility', 
    costPrice: 5,
    retailPrice: 25,
    discount: 'Buy 10 Get 1 Free',
    lastUpdated: Date.now() 
  },
  { 
    id: 's3', 
    name: 'Cyberpunk Jacket', 
    category: 'Top', 
    material: 'Leather/LED', 
    designType: 'Streetwear', 
    costPrice: 120,
    retailPrice: 350,
    discount: 'Double 11: 10% OFF',
    lastUpdated: Date.now() 
  }
];

export const dbService = {
  // --- Orders ---
  getAllOrders: (): Order[] => {
    try {
      const data = localStorage.getItem(ORDER_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(SEED_ORDERS));
        return SEED_ORDERS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error("DB Load Error", e);
      return [];
    }
  },

  saveOrder: (order: Order): void => {
    const orders = dbService.getAllOrders();
    const existingIndex = orders.findIndex(o => o.id === order.id);
    if (existingIndex >= 0) {
      orders[existingIndex] = { ...order, lastUpdated: Date.now() };
    } else {
      orders.push({ ...order, lastUpdated: Date.now() });
    }
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  },

  deleteOrder: (id: string): void => {
    const orders = dbService.getAllOrders();
    const newOrders = orders.filter(o => o.id !== id);
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(newOrders));
  },

  // --- Styles ---
  getAllStyles: (): StyleProduct[] => {
    try {
      const data = localStorage.getItem(STYLE_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(SEED_STYLES));
        return SEED_STYLES;
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  saveStyle: (style: StyleProduct): void => {
    const styles = dbService.getAllStyles();
    const existingIndex = styles.findIndex(s => s.id === style.id);
    if (existingIndex >= 0) {
      styles[existingIndex] = { ...style, lastUpdated: Date.now() };
    } else {
      styles.push({ ...style, lastUpdated: Date.now() });
    }
    localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(styles));
  },

  deleteStyle: (id: string): void => {
    const styles = dbService.getAllStyles();
    const newStyles = styles.filter(s => s.id !== id);
    localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(newStyles));
  },

  // --- System ---
  exportDatabase: (): void => {
    const orders = localStorage.getItem(ORDER_STORAGE_KEY) || '[]';
    const styles = localStorage.getItem(STYLE_STORAGE_KEY) || '[]';
    
    const backup = {
      version: 2,
      date: new Date().toISOString(),
      orders: JSON.parse(orders),
      styles: JSON.parse(styles)
    };

    const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATLAS_FULL_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importDatabase: (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          
          // Handle V2 (Combined) or V1 (Array of orders only)
          if (parsed.version === 2 || (parsed.orders && parsed.styles)) {
            localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(parsed.orders));
            localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(parsed.styles));
            resolve(true);
          } else if (Array.isArray(parsed)) {
             // Legacy Fallback
             localStorage.setItem(ORDER_STORAGE_KEY, content);
             resolve(true);
          } else {
            reject("Invalid file format");
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
};