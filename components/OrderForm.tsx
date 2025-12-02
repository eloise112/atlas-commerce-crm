import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderItem, CustomerSource, OrderStatus, StyleProduct } from '../types';
import { dbService } from '../services/dbService';
import { HudButton, HudCard, HudInput, HudSelect } from './ui/HudComponents';
import { Trash2, PlusCircle, Save, X, Search } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface Props {
  existingOrder?: Order | null;
  onSave: (order: Order) => void;
  onCancel: () => void;
}

// --- Custom Style Selector Component ---
const StyleSelector = ({ 
  value, 
  onChange, 
  styles,
  placeholder 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  styles: StyleProduct[];
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter logic: Match Name, Category, Material, or Design Type
  const filtered = styles.filter(s => {
    const term = value.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) || 
      s.category.toLowerCase().includes(term) ||
      s.material.toLowerCase().includes(term) ||
      s.designType.toLowerCase().includes(term)
    );
  });

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <input 
          className="w-full bg-slate-950 border border-slate-700 text-cyan-100 pl-3 pr-8 py-1 text-sm focus:border-cyan-500 outline-none font-mono transition-shadow focus:shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          value={value}
          onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
        />
        <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
      </div>
      
      {isOpen && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-cyan-500/50 max-h-60 overflow-y-auto z-50 shadow-[0_0_30px_rgba(0,0,0,0.9)] rounded-sm scrollbar-thin">
           <div className="sticky top-0 bg-slate-950/90 backdrop-blur p-1 text-[10px] text-cyan-500 font-sci-fi border-b border-cyan-900/50 uppercase tracking-widest px-2">
             Library Matches ({filtered.length})
           </div>
           {filtered.map(style => (
             <div 
               key={style.id}
               onClick={() => { onChange(style.name); setIsOpen(false); }}
               className="p-2 hover:bg-cyan-500/10 cursor-pointer border-b border-slate-800 last:border-0 group transition-colors"
             >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-cyan-300 text-sm group-hover:text-white font-sci-fi tracking-wide">{style.name}</span>
                  <span className="text-[9px] text-slate-500 uppercase">{style.designType}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex gap-2 mt-1">
                   <span className="bg-slate-800/80 px-1.5 py-0.5 rounded text-cyan-100/70 border border-slate-700">{style.category}</span>
                   <span className="bg-slate-800/80 px-1.5 py-0.5 rounded text-cyan-100/70 border border-slate-700">{style.material}</span>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export const OrderForm: React.FC<Props> = ({ existingOrder, onSave, onCancel }) => {
  const { t } = useLanguage();
  const [availableStyles, setAvailableStyles] = useState<StyleProduct[]>([]);

  const [formData, setFormData] = useState<Partial<Order>>({
    customerName: '',
    contactInfo: '',
    orderNo: `ORD-${Date.now().toString().slice(-6)}`,
    orderDate: new Date().toISOString().split('T')[0],
    amount: 0,
    status: OrderStatus.Pending,
    source: CustomerSource.Other,
    items: [],
    notes: ''
  });

  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    // Load Styles for the dropdown
    setAvailableStyles(dbService.getAllStyles());

    if (existingOrder) {
      setFormData(existingOrder);
      setItems(existingOrder.items);
    }
  }, [existingOrder]);

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { style: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalOrder: Order = {
      id: existingOrder?.id || crypto.randomUUID(),
      customerName: formData.customerName!,
      contactInfo: formData.contactInfo!,
      orderNo: formData.orderNo!,
      orderDate: formData.orderDate!, 
      status: formData.status!,
      shippedDate: formData.status === OrderStatus.Shipped ? new Date().toISOString() : undefined,
      amount: Number(formData.amount),
      source: formData.source!,
      items: items,
      notes: formData.notes,
      lastUpdated: Date.now()
    };
    onSave(finalOrder);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <HudCard title={existingOrder ? `${t('form.editTitle')}: ${existingOrder.orderNo}` : t('form.newTitle')}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-cyan-500 font-sci-fi text-xs tracking-widest mb-4 border-b border-cyan-900 pb-1">{t('form.section.customer')}</h4>
          </div>
          
          <HudInput 
            label={t('form.customerName')}
            value={formData.customerName}
            onChange={e => setFormData({...formData, customerName: e.target.value})}
            required
            placeholder="e.g. Tony Stark"
          />
          
          <HudInput 
            label={t('form.contactInfo')}
            value={formData.contactInfo}
            onChange={e => setFormData({...formData, contactInfo: e.target.value})}
            required
            placeholder="Email, Phone or Social Handle"
          />

          <HudSelect 
            label={t('form.source')}
            value={formData.source}
            onChange={e => setFormData({...formData, source: e.target.value as CustomerSource})}
          >
            {Object.values(CustomerSource).map(s => <option key={s} value={s}>{t(s)}</option>)}
          </HudSelect>

          <div className="col-span-1 md:col-span-2 mt-4">
             <h4 className="text-cyan-500 font-sci-fi text-xs tracking-widest mb-4 border-b border-cyan-900 pb-1">{t('form.section.order')}</h4>
          </div>

          <HudInput 
            label={t('form.orderNo')}
            value={formData.orderNo}
            onChange={e => setFormData({...formData, orderNo: e.target.value})}
            required
          />

          <HudInput 
            label={t('form.orderDate')}
            type="date"
            value={formData.orderDate?.split('T')[0]}
            onChange={e => setFormData({...formData, orderDate: e.target.value})}
            required
          />

          <HudSelect 
            label={t('form.status')}
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value as OrderStatus})}
          >
            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{t(s)}</option>)}
          </HudSelect>

          <HudInput 
            label={t('form.amount')}
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
            required
          />

          {/* Item List */}
          <div className="col-span-1 md:col-span-2 bg-slate-900/50 p-4 border border-slate-800 rounded mb-4">
             <div className="flex justify-between items-center mb-4">
               <span className="font-sci-fi text-xs text-slate-400">{t('form.section.items')}</span>
               <button type="button" onClick={addItem} className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 font-sci-fi hover:underline">
                 <PlusCircle className="w-4 h-4" /> {t('form.addSku')}
               </button>
             </div>
             
             <div className="space-y-3">
                {items.length === 0 && <div className="text-center text-slate-600 italic text-sm py-4 border border-dashed border-slate-800 rounded">{t('form.emptyItems')}</div>}
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-start animate-fade-in relative z-10">
                    <div className="flex-grow group">
                      <label className="text-[10px] text-slate-500 uppercase block mb-1 font-sci-fi">{t('form.sku')}</label>
                      <StyleSelector 
                        value={item.style}
                        onChange={(val) => handleItemChange(idx, 'style', val)}
                        styles={availableStyles}
                        placeholder={t('form.skuPlaceholder')}
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] text-slate-500 uppercase block mb-1 font-sci-fi">{t('form.qty')}</label>
                      <input 
                        type="number"
                        placeholder="1"
                        className="w-full bg-slate-950 border border-slate-700 text-cyan-100 px-3 py-1 text-sm focus:border-cyan-500 outline-none font-mono transition-all"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                        required
                        min="1"
                      />
                    </div>
                    <div className="mt-6">
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-6">
            <HudButton variant="danger" onClick={onCancel}>
              <X className="w-4 h-4" /> {t('form.cancel')}
            </HudButton>
            <HudButton onClick={() => {}} className="bg-cyan-500/10 hover:bg-cyan-500/30">
              <Save className="w-4 h-4" /> {t('form.save')}
            </HudButton>
          </div>
        </form>
      </HudCard>
    </div>
  );
};
