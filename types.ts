export enum CustomerSource {
  XiaoHongShu = 'XiaoHongShu',
  TikTok = 'TikTok',
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  Amazon = 'Amazon',
  Other = 'Other'
}

export enum OrderStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

export interface OrderItem {
  style: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  contactInfo: string;
  orderNo: string;
  orderDate: string; // ISO string
  status: OrderStatus;
  shippedDate?: string; // ISO string
  amount: number;
  items: OrderItem[];
  source: CustomerSource;
  notes?: string;
  lastUpdated: number;
}

export interface StyleProduct {
  id: string;
  name: string; // The primary key for matching in orders usually
  category: string; // e.g., Top, Dress, Accessory (Part)
  material: string; // e.g., Silk, Cotton, Cyber-Mesh
  designType: string; // e.g., Casual, Techwear, Vintage
  costPrice?: number; // New: Purchase price
  retailPrice?: number; // New: Selling price
  discount?: string; // New: e.g. "10% OFF", "Double 11"
  notes?: string;
  lastUpdated: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingShipments: number;
  topSource: string;
}

export type ViewState = 'DASHBOARD' | 'ORDERS' | 'NEW_ORDER' | 'STYLES';