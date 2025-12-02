import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "app.title": "ATLAS",
    "app.subtitle": "CROSS-BORDER COMMERCE SYSTEM",
    "nav.dashboard": "Mission Control",
    "nav.orders": "Client Database",
    "nav.newOrder": "New Entry",
    "nav.styles": "Style Lab",
    "nav.system": "System Operations",
    "nav.export": "EXPORT SYSTEM DATA",
    "nav.import": "IMPORT SYSTEM DATA",
    "nav.returnHome": "RETURN TO BASE",
    
    // Dashboard
    "dash.revenue": "REVENUE",
    "dash.revenue.sub": "LIFETIME ACCUMULATION",
    "dash.orders": "ORDERS",
    "dash.orders.sub": "GLOBAL TRANSACTIONS",
    "dash.pending": "PENDING",
    "dash.pending.sub": "ACTION REQUIRED",
    "dash.avgValue": "AVG VALUE",
    "dash.avgValue.sub": "PER CLIENT METRIC",
    "dash.chart.revenue": "REVENUE TRAJECTORY",
    "dash.chart.traffic": "TRAFFIC SOURCES",
    
    // Order List
    "list.search": "SEARCH DATABASE...",
    "list.filter": "FILTER",
    "list.filterPanel": "ADVANCED FILTERS",
    "list.noRecords": "NO RECORDS FOUND",
    "list.displaying": "DISPLAYING",
    "list.records": "RECORDS",
    "filter.source": "Source Channel",
    "filter.status": "Order Status",
    "filter.startDate": "Start Date",
    "filter.endDate": "End Date",
    "filter.reset": "RESET FILTERS",
    "filter.all": "ALL",
    "th.orderNo": "Order No",
    "th.customer": "Customer",
    "th.source": "Source",
    "th.date": "Date",
    "th.status": "Status",
    "th.amount": "Amount",
    "th.items": "Items",
    "th.actions": "Actions",

    // Style Lab
    "style.tab.inventory": "INVENTORY",
    "style.tab.analytics": "ANALYTICS",
    "style.addNew": "ADD NEW STYLE",
    "style.edit": "EDIT STYLE",
    "style.name": "Style Name / SKU",
    "style.category": "Category / Part",
    "style.material": "Material",
    "style.design": "Design Type",
    "style.cost": "Cost (Purchase)",
    "style.price": "Price (Retail)",
    "style.discount": "Discount / Promo",
    "style.analytics.bestMaterial": "BEST SELLING MATERIALS",
    "style.analytics.bestStyle": "QUARTERLY TOP STYLES",
    "style.analytics.yearTrend": "ANNUAL SALES TREND",
    "style.empty": "No styles in library.",
    "style.promo.quick": "Quick Promo",
    "style.promo.clear": "CLEAR TAG",
    "style.promo.custom": "Custom Tag...",
    "style.promo.presets": "EVENT PRESETS",

    // Order Form
    "form.editTitle": "EDIT ORDER",
    "form.newTitle": "NEW TRANSACTION ENTRY",
    "form.section.customer": "CUSTOMER DATA",
    "form.section.order": "ORDER DETAILS",
    "form.section.items": "PRODUCT LINE ITEMS",
    "form.customerName": "Customer Name",
    "form.contactInfo": "Contact Info",
    "form.source": "Acquisition Source",
    "form.orderNo": "Order Number",
    "form.orderDate": "Order Date",
    "form.status": "Status",
    "form.amount": "Total Amount ($)",
    "form.sku": "SKU / Style",
    "form.skuPlaceholder": "Select from library or type...",
    "form.qty": "Qty",
    "form.addSku": "ADD SKU",
    "form.cancel": "CANCEL",
    "form.save": "SAVE RECORD",
    "form.emptyItems": "No items added yet.",

    // Status & Source (Display)
    "Pending": "Pending",
    "Paid": "Paid",
    "Shipped": "Shipped",
    "Delivered": "Delivered",
    "Cancelled": "Cancelled",
    "XiaoHongShu": "XiaoHongShu",
    "TikTok": "TikTok",
    "Facebook": "Facebook",
    "Instagram": "Instagram",
    "Amazon": "Amazon",
    "Other": "Other"
  },
  zh: {
    // Nav
    "app.title": "阿特拉斯",
    "app.subtitle": "跨境电商指挥系统",
    "nav.dashboard": "指挥控制台",
    "nav.orders": "客户资料库",
    "nav.newOrder": "新增录入",
    "nav.styles": "款式研发库",
    "nav.system": "系统指令集",
    "nav.export": "系统数据导出",
    "nav.import": "系统数据导入",
    "nav.returnHome": "快速返回首页",
    
    // Dashboard
    "dash.revenue": "营收总额",
    "dash.revenue.sub": "历史累计收益",
    "dash.orders": "订单总量",
    "dash.orders.sub": "全球交易记录",
    "dash.pending": "待处理",
    "dash.pending.sub": "需立即执行",
    "dash.avgValue": "客单均价",
    "dash.avgValue.sub": "单客价值分析",
    "dash.chart.revenue": "营收趋势分析",
    "dash.chart.traffic": "流量来源分布",
    
    // Order List
    "list.search": "检索数据库...",
    "list.filter": "筛选面板",
    "list.filterPanel": "高级筛选条件",
    "list.noRecords": "未检索到相关记录",
    "list.displaying": "当前显示",
    "list.records": "条记录",
    "filter.source": "来源渠道",
    "filter.status": "订单状态",
    "filter.startDate": "起始日期",
    "filter.endDate": "结束日期",
    "filter.reset": "重置筛选",
    "filter.all": "全部",
    "th.orderNo": "订单编号",
    "th.customer": "客户信息",
    "th.source": "来源渠道",
    "th.date": "下单日期",
    "th.status": "当前状态",
    "th.amount": "金额",
    "th.items": "商品数",
    "th.actions": "操作",

    // Style Lab
    "style.tab.inventory": "款式列表",
    "style.tab.analytics": "数据分析",
    "style.addNew": "录入新款",
    "style.edit": "编辑款式",
    "style.name": "款式名称 / SKU",
    "style.category": "部位 / 分类",
    "style.material": "材质成分",
    "style.design": "设计风格",
    "style.cost": "当前进货价",
    "style.price": "当前售价",
    "style.discount": "优惠/折扣信息",
    "style.analytics.bestMaterial": "热销材质分布",
    "style.analytics.bestStyle": "季度爆款排行",
    "style.analytics.yearTrend": "年度销量走势",
    "style.empty": "款式库暂无数据",
    "style.promo.quick": "快速打标",
    "style.promo.clear": "清除标签",
    "style.promo.custom": "自定义折扣...",
    "style.promo.presets": "营销活动预设",

    // Order Form
    "form.editTitle": "编辑订单",
    "form.newTitle": "录入新交易",
    "form.section.customer": "客户档案数据",
    "form.section.order": "订单详细参数",
    "form.section.items": "产品SKU清单",
    "form.customerName": "客户姓名",
    "form.contactInfo": "联系方式 (邮箱/社媒)",
    "form.source": "获客渠道",
    "form.orderNo": "系统订单号",
    "form.orderDate": "交易日期",
    "form.status": "订单状态",
    "form.amount": "交易总额 ($)",
    "form.sku": "款式 / 产品名",
    "form.skuPlaceholder": "从库中选择或手动输入...",
    "form.qty": "数量",
    "form.addSku": "添加 SKU",
    "form.cancel": "取消操作",
    "form.save": "保存记录",
    "form.emptyItems": "暂无商品条目",

    // Status & Source (Display)
    "Pending": "待处理",
    "Paid": "已付款",
    "Shipped": "已发货",
    "Delivered": "已送达",
    "Cancelled": "已取消",
    "XiaoHongShu": "小红书",
    "TikTok": "TikTok",
    "Facebook": "Facebook",
    "Instagram": "Instagram",
    "Amazon": "亚马逊",
    "Other": "其他渠道"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};