import React, { useState, useMemo, useEffect, useRef } from 'react';
import { StyleProduct, Order } from '../types';
import { dbService } from '../services/dbService';
import { HudCard, HudButton, HudInput } from './ui/HudComponents';
import { useLanguage } from '../utils/i18n';
import { Plus, Edit, Trash2, Search, BarChart3, Database, Save, X, Tag, Zap, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { PROMO_PRESETS } from '../constants';

interface Props {
  orders: Order[];
}

// --- Quick Promo Selector Component ---
const PromoQuickAction: React.FC<{ 
  currentDiscount?: string; 
  onSelect: (discount: string) => void;
}> = ({ currentDiscount, onSelect }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [customVal, setCustomVal] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(customVal.trim()) {
      onSelect(customVal);
      setIsOpen(false);
      setCustomVal('');
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1 rounded transition-all flex items-center gap-1 ${currentDiscount ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-500 hover:text-cyan-400 hover:bg-cyan-900/30'}`}
        title={t('style.promo.quick')}
      >
        <Tag className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-slate-950 border border-cyan-500/50 shadow-[0_0_30px_rgba(0,0,0,0.9)] z-50 rounded-sm animate-fade-in origin-top-right overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-900/80 p-2 border-b border-cyan-500/20 text-[10px] font-sci-fi text-cyan-400 uppercase tracking-widest flex items-center gap-1">
             <Zap className="w-3 h-3" /> {t('style.promo.quick')}
          </div>

          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            {/* Custom Input */}
            <form onSubmit={handleCustomSubmit} className="p-2 border-b border-slate-800">
               <input 
                 autoFocus
                 className="w-full bg-slate-900 border border-slate-700 text-cyan-100 text-xs px-2 py-1 focus:border-cyan-500 outline-none font-mono"
                 placeholder={t('style.promo.custom')}
                 value={customVal}
                 onChange={(e) => setCustomVal(e.target.value)}
               />
            </form>

            {/* Clear Option */}
            {currentDiscount && (
               <button 
                 onClick={() => { onSelect(''); setIsOpen(false); }}
                 className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors border-b border-slate-800 font-mono flex items-center gap-2"
               >
                 <X className="w-3 h-3" /> {t('style.promo.clear')}
               </button>
            )}

            {/* Presets Title */}
            <div className="px-3 py-1.5 text-[9px] text-slate-500 font-sci-fi uppercase bg-slate-900/50">
               {t('style.promo.presets')}
            </div>

            {/* Presets List */}
            {PROMO_PRESETS.map((promo, idx) => (
              <button
                key={idx}
                onClick={() => { onSelect(promo.value); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors border-b border-slate-800 last:border-0 font-mono flex justify-between items-center group"
              >
                <span>{promo.label}</span>
                <span className="text-[9px] opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity">{promo.value}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


export const StyleLibrary: React.FC<Props> = ({ orders }) => {
  const { t } = useLanguage();
  const [styles, setStyles] = useState<StyleProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'ANALYTICS'>('INVENTORY');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<Partial<StyleProduct>>({});

  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = () => {
    setStyles(dbService.getAllStyles());
  };

  const handleSave = () => {
    if (!currentStyle.name) return;
    
    const newStyle: StyleProduct = {
      id: currentStyle.id || crypto.randomUUID(),
      name: currentStyle.name,
      category: currentStyle.category || 'Uncategorized',
      material: currentStyle.material || 'Unknown',
      designType: currentStyle.designType || 'Standard',
      costPrice: currentStyle.costPrice || 0,
      retailPrice: currentStyle.retailPrice || 0,
      discount: currentStyle.discount || '',
      lastUpdated: Date.now()
    };

    dbService.saveStyle(newStyle);
    loadStyles();
    setIsEditing(false);
    setCurrentStyle({});
  };

  const handleQuickPromoUpdate = (style: StyleProduct, newDiscount: string) => {
    const updatedStyle = { ...style, discount: newDiscount, lastUpdated: Date.now() };
    dbService.saveStyle(updatedStyle);
    loadStyles(); // Refresh UI
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this style definition?")) {
      dbService.deleteStyle(id);
      loadStyles();
    }
  };

  const filteredStyles = styles.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Analytics Logic ---
  const analyticsData = useMemo(() => {
    // 1. Flatten all order items
    const allItems = orders.flatMap(o => o.items.map(i => ({
      ...i,
      date: new Date(o.orderDate),
      orderId: o.id
    })));

    // 2. Aggregate Material Sales
    const materialStats: Record<string, number> = {};
    const styleStats: Record<string, number> = {};
    const monthlyStats: Record<string, number> = {};

    allItems.forEach(item => {
      // Find matching style definition
      const def = styles.find(s => s.name === item.style);
      const mat = def ? def.material : 'Unknown';
      
      materialStats[mat] = (materialStats[mat] || 0) + item.quantity;
      styleStats[item.style] = (styleStats[item.style] || 0) + item.quantity;
      
      const monthKey = `${item.date.getFullYear()}-${item.date.getMonth() + 1}`;
      monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + item.quantity;
    });

    // Format for Recharts
    const materialData = Object.entries(materialStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

    const styleData = Object.entries(styleStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10

    const trendData = Object.entries(monthlyStats)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { materialData, styleData, trendData };
  }, [orders, styles]);

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Header Tabs */}
      <div className="flex gap-4 border-b border-cyan-900/50 pb-2">
        <button 
          onClick={() => setActiveTab('INVENTORY')}
          className={`flex items-center gap-2 px-4 py-2 font-sci-fi text-sm uppercase tracking-wider transition-all ${activeTab === 'INVENTORY' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/10' : 'text-slate-500 hover:text-cyan-200'}`}
        >
          <Database className="w-4 h-4" /> {t('style.tab.inventory')}
        </button>
        <button 
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex items-center gap-2 px-4 py-2 font-sci-fi text-sm uppercase tracking-wider transition-all ${activeTab === 'ANALYTICS' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/10' : 'text-slate-500 hover:text-cyan-200'}`}
        >
          <BarChart3 className="w-4 h-4" /> {t('style.tab.analytics')}
        </button>
      </div>

      {/* --- Inventory View --- */}
      {activeTab === 'INVENTORY' && (
        <div className="animate-fade-in">
          {isEditing ? (
             <HudCard title={currentStyle.id ? t('style.edit') : t('style.addNew')}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2 lg:col-span-3">
                     <h4 className="text-cyan-500 font-sci-fi text-xs tracking-widest mb-2 border-b border-cyan-900 pb-1">Basic Info</h4>
                  </div>
                  <HudInput 
                    label={t('style.name')} 
                    value={currentStyle.name || ''} 
                    onChange={e => setCurrentStyle({...currentStyle, name: e.target.value})}
                    placeholder="e.g. MK85 Nano Helmet"
                  />
                  <HudInput 
                    label={t('style.category')} 
                    value={currentStyle.category || ''} 
                    onChange={e => setCurrentStyle({...currentStyle, category: e.target.value})}
                    placeholder="e.g. Headwear, Accessory"
                  />
                  <HudInput 
                    label={t('style.material')} 
                    value={currentStyle.material || ''} 
                    onChange={e => setCurrentStyle({...currentStyle, material: e.target.value})}
                    placeholder="e.g. Titanium, Cotton"
                  />
                  <HudInput 
                    label={t('style.design')} 
                    value={currentStyle.designType || ''} 
                    onChange={e => setCurrentStyle({...currentStyle, designType: e.target.value})}
                    placeholder="e.g. Tactical, Casual"
                  />
                  
                  <div className="md:col-span-2 lg:col-span-3 mt-2">
                     <h4 className="text-cyan-500 font-sci-fi text-xs tracking-widest mb-2 border-b border-cyan-900 pb-1">Pricing & Promo</h4>
                  </div>
                  <HudInput 
                    label={t('style.cost')} 
                    type="number"
                    value={currentStyle.costPrice || ''} 
                    onChange={e => setCurrentStyle({...currentStyle, costPrice: parseFloat(e.target.value)})}
                    placeholder="0.00"
                  />
                  <HudInput 
                    label={t('style.price')} 
                    type="number"
                    value={currentStyle.retailPrice || ''} 
                    onChange={e => setCurrentStyle({...currentStyle, retailPrice: parseFloat(e.target.value)})}
                    placeholder="0.00"
                  />
                   <HudInput 
                    label={t('style.discount')} 
                    value={currentStyle.discount || ''} 
                    onChange={e => setCurrentStyle({...currentStyle, discount: e.target.value})}
                    placeholder="e.g. Double 11 - 10% OFF"
                  />

                  <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-4">
                     <HudButton variant="danger" onClick={() => { setIsEditing(false); setCurrentStyle({}); }}><X className="w-4 h-4" /> {t('form.cancel')}</HudButton>
                     <HudButton onClick={handleSave}><Save className="w-4 h-4" /> {t('form.save')}</HudButton>
                  </div>
                </div>
             </HudCard>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                 <div className="relative w-full max-w-md">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                   <input 
                     type="text"
                     placeholder={t('list.search')}
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-slate-950 border border-slate-700 pl-10 pr-4 py-2 text-cyan-100 focus:border-cyan-400 outline-none font-mono text-sm"
                   />
                 </div>
                 <HudButton onClick={() => setIsEditing(true)}>
                   <Plus className="w-4 h-4" /> {t('style.addNew')}
                 </HudButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStyles.length === 0 && <div className="col-span-full text-center text-slate-500 py-10 font-mono">{t('style.empty')}</div>}
                {filteredStyles.map(style => (
                  <HudCard key={style.id} className="p-4 group hover:bg-cyan-900/10 transition-colors relative" noFloat>
                    {/* Discount Ribbon Container - Separate from card flow to allow overflow of menus but clip ribbon */}
                    <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                       {style.discount && (
                          <div className="absolute top-[12px] right-[-32px] w-[120px] bg-gradient-to-r from-red-600 to-rose-600 text-white text-[9px] font-bold text-center py-1 rotate-45 border-y border-white/20 shadow-[0_0_10px_rgba(220,38,38,0.8)] tracking-wider font-sci-fi animate-pulse-slow z-10">
                             {style.discount}
                          </div>
                       )}
                    </div>

                    <div className="flex justify-between items-start mb-2 pr-6">
                       <h3 className="font-bold text-cyan-300 text-lg font-sci-fi">{style.name}</h3>
                    </div>
                    
                    <div className="space-y-2 text-xs font-mono text-slate-400 mb-4">
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span>{t('style.category')}:</span>
                        <span className="text-white">{style.category}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span>{t('style.material')}:</span>
                        <span className="text-white">{style.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('style.design')}:</span>
                        <span className="text-white">{style.designType}</span>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-950/50 border border-slate-800 mb-2 rounded-sm relative">
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase">{t('style.cost')}</div>
                          <div className="text-sm text-slate-400 font-mono">${style.costPrice?.toFixed(2) || '0.00'}</div>
                       </div>
                       <div className="text-right">
                          <div className="text-[9px] text-cyan-500 uppercase">{t('style.price')}</div>
                          <div className="text-lg text-emerald-400 font-bold font-mono text-shadow-glow">${style.retailPrice?.toFixed(2) || '0.00'}</div>
                       </div>
                       
                       {/* Decorative tech lines */}
                       <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900 to-transparent"></div>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                       {/* Quick Actions Bar */}
                       <PromoQuickAction 
                          currentDiscount={style.discount} 
                          onSelect={(val) => handleQuickPromoUpdate(style, val)} 
                       />
                       <div className="w-[1px] bg-slate-800 h-6 mx-1"></div>
                       <button onClick={() => { setCurrentStyle(style); setIsEditing(true); }} className="text-cyan-400 hover:text-white p-1 hover:bg-cyan-900/30 rounded"><Edit className="w-4 h-4"/></button>
                       <button onClick={() => handleDelete(style.id)} className="text-red-400 hover:text-white p-1 hover:bg-red-900/30 rounded"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </HudCard>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* --- Analytics View --- */}
      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Top Selling Styles */}
          <HudCard title={t('style.analytics.bestStyle')} className="min-h-[300px]">
             <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analyticsData.styleData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" stroke="#475569" fontSize={10} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', color: '#fff' }} cursor={{fill: 'rgba(6,182,212,0.1)'}} />
                  <Bar dataKey="value" fill="#22d3ee" radius={[0, 4, 4, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </HudCard>

          {/* Material Distribution */}
          <HudCard title={t('style.analytics.bestMaterial')} className="min-h-[300px]">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.materialData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.materialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
             <div className="flex flex-wrap justify-center gap-2 mt-2">
                {analyticsData.materialData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1 text-xs font-mono text-slate-400">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {entry.name} ({entry.value})
                  </div>
                ))}
             </div>
          </HudCard>

          {/* Yearly Trend */}
          <HudCard title={t('style.analytics.yearTrend')} className="col-span-1 lg:col-span-2 min-h-[300px]">
             <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analyticsData.trendData}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', color: '#fff' }} />
                  <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} dot={{r:4, fill: '#ec4899'}} activeDot={{ r: 6 }} />
                </LineChart>
             </ResponsiveContainer>
          </HudCard>
        </div>
      )}
    </div>
  );
};