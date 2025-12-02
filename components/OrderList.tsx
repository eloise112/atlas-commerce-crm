import React, { useState, useRef, useEffect } from 'react';
import { Order, CustomerSource, OrderStatus } from '../types';
import { HudButton, HudCard, HudSelect, HudInput } from './ui/HudComponents';
import { Edit, Trash2, Search, Filter, Box, User, X, RotateCcw, ChevronDown } from 'lucide-react';
import { STATUS_COLORS } from '../constants';
import { useLanguage } from '../utils/i18n';

interface Props {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: OrderStatus) => void;
  initialFilterStatus?: string; // New prop for external control
}

// Internal component for the status dropdown
const StatusBadge: React.FC<{ 
  currentStatus: OrderStatus; 
  onChange: (s: OrderStatus) => void; 
}> = ({ currentStatus, onChange }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`px-2 py-1 text-xs uppercase font-bold border rounded-sm whitespace-nowrap flex items-center gap-1 transition-all hover:brightness-125 focus:outline-none focus:ring-1 focus:ring-cyan-500 ${STATUS_COLORS[currentStatus]}`}
      >
        {t(currentStatus)}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-32 bg-slate-950 border border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.8)] z-50 flex flex-col rounded-sm overflow-hidden animate-fade-in origin-top-left">
           {Object.values(OrderStatus).map((status) => (
             <button
               key={status}
               onClick={(e) => { e.stopPropagation(); onChange(status); setIsOpen(false); }}
               className={`px-3 py-2 text-xs text-left font-mono hover:bg-slate-800 transition-colors border-l-2 ${status === currentStatus ? 'border-cyan-500 text-cyan-400 bg-slate-900' : 'border-transparent text-slate-400'}`}
             >
               {t(status)}
             </button>
           ))}
        </div>
      )}
    </div>
  );
};

export const OrderList: React.FC<Props> = ({ orders, onEdit, onDelete, onStatusChange, initialFilterStatus = 'ALL' }) => {
  const { t } = useLanguage();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>(initialFilterStatus);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Effect to update filter if prop changes (e.g. navigation from dashboard)
  useEffect(() => {
    if (initialFilterStatus !== 'ALL') {
      setFilterStatus(initialFilterStatus);
      setShowFilters(true); // Auto-open filter panel to show why results are filtered
    } else {
      setFilterStatus('ALL');
    }
  }, [initialFilterStatus]);

  // Reset Filters
  const resetFilters = () => {
    setFilterSource('ALL');
    setFilterStatus('ALL');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  // Filter Logic
  const filteredOrders = orders.filter(o => {
    // 1. Text Search
    const matchesSearch = 
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.contactInfo.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Source Filter
    const matchesSource = filterSource === 'ALL' || o.source === filterSource;

    // 3. Status Filter
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;

    // 4. Date Filter
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(o.orderDate) >= new Date(startDate);
    }
    if (endDate) {
      matchesDate = matchesDate && new Date(o.orderDate) <= new Date(endDate);
    }

    return matchesSearch && matchesSource && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Top Controls */}
      <div className="bg-slate-900/50 p-4 border-b border-cyan-500/30">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Search Bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
            <input 
              type="text"
              placeholder={t('list.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-none pl-10 pr-4 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] font-mono text-sm"
            />
          </div>

          {/* Filter Toggle Button */}
          <div className="flex gap-2 w-full md:w-auto">
              <HudButton 
                onClick={() => setShowFilters(!showFilters)} 
                className={`text-xs px-4 flex-1 md:flex-none ${showFilters ? 'bg-cyan-900/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : ''}`}
              >
                {showFilters ? <X className="w-3 h-3"/> : <Filter className="w-3 h-3"/>} 
                {t('list.filter')}
              </HudButton>
          </div>
        </div>

        {/* Expanding Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dashed border-slate-700 animate-fade-in-down">
            <div className="flex items-center gap-2 mb-4 text-xs font-sci-fi text-cyan-400 uppercase tracking-widest">
              <div className="w-1 h-4 bg-cyan-500"></div>
              {t('list.filterPanel')}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Source Select */}
              <div className="col-span-1">
                 <HudSelect label={t('filter.source')} value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
                   <option value="ALL">{t('filter.all')}</option>
                   {Object.values(CustomerSource).map(s => <option key={s} value={s}>{t(s)}</option>)}
                 </HudSelect>
              </div>

              {/* Status Select */}
              <div className="col-span-1">
                 <HudSelect label={t('filter.status')} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                   <option value="ALL">{t('filter.all')}</option>
                   {Object.values(OrderStatus).map(s => <option key={s} value={s}>{t(s)}</option>)}
                 </HudSelect>
              </div>

              {/* Date Start */}
              <div className="col-span-1">
                 <HudInput label={t('filter.startDate')} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              {/* Date End */}
              <div className="col-span-1">
                 <HudInput label={t('filter.endDate')} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>

              {/* Reset Button */}
              <div className="col-span-1 flex items-end mb-4">
                <button 
                  onClick={resetFilters}
                  className="w-full h-[42px] border border-red-900/50 text-red-400 hover:bg-red-900/20 hover:border-red-500 transition-all font-sci-fi text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3 h-3" /> {t('filter.reset')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block overflow-x-auto border border-slate-800 bg-slate-900/30 min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-700 text-xs font-sci-fi text-slate-400 uppercase tracking-wider">
              <th className="p-4 whitespace-nowrap">{t('th.orderNo')}</th>
              <th className="p-4 whitespace-nowrap">{t('th.customer')}</th>
              <th className="p-4 whitespace-nowrap">{t('th.source')}</th>
              <th className="p-4 whitespace-nowrap">{t('th.date')}</th>
              <th className="p-4 whitespace-nowrap">{t('th.status')}</th>
              <th className="p-4 whitespace-nowrap text-right">{t('th.amount')}</th>
              <th className="p-4 whitespace-nowrap text-center">{t('th.items')}</th>
              <th className="p-4 whitespace-nowrap text-right">{t('th.actions')}</th>
            </tr>
          </thead>
          <tbody className="text-sm font-mono divide-y divide-slate-800">
            {filteredOrders.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-slate-500">{t('list.noRecords')}</td></tr>
            ) : filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-cyan-900/10 transition-colors group">
                <td className="p-4 font-bold text-cyan-300">{order.orderNo}</td>
                <td className="p-4">
                  <div className="text-white font-medium">{order.customerName}</div>
                  <div className="text-xs text-slate-500 truncate max-w-[150px]">{order.contactInfo}</div>
                </td>
                <td className="p-4 text-slate-300">{t(order.source)}</td>
                <td className="p-4 text-slate-300">{new Date(order.orderDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <StatusBadge 
                    currentStatus={order.status} 
                    onChange={(newStatus) => onStatusChange(order.id, newStatus)} 
                  />
                </td>
                <td className="p-4 text-right text-green-400 font-bold">${order.amount.toFixed(2)}</td>
                <td className="p-4 text-center text-slate-400">{order.items.reduce((acc, i) => acc + i.quantity, 0)}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(order)} className="p-2 text-cyan-400 hover:bg-cyan-900/50 rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(order.id)} className="p-2 text-red-400 hover:bg-red-900/50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Hidden on Desktop) */}
      <div className="md:hidden space-y-4">
        {filteredOrders.length === 0 ? (
           <div className="p-8 text-center text-slate-500 border border-slate-800 bg-slate-900/30">{t('list.noRecords')}</div>
        ) : filteredOrders.map((order) => (
          <HudCard key={order.id} className="p-4">
            <div className="flex justify-between items-start mb-4 border-b border-cyan-900/30 pb-2">
              <div>
                <div className="text-lg font-bold text-cyan-300 font-mono">{order.orderNo}</div>
                <div className="text-xs text-slate-500 font-mono">{new Date(order.orderDate).toLocaleDateString()}</div>
              </div>
              <StatusBadge 
                currentStatus={order.status} 
                onChange={(newStatus) => onStatusChange(order.id, newStatus)} 
              />
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-white text-sm">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded">{t(order.source)}</span>
                 <span className="text-xs text-slate-500 truncate">{order.contactInfo}</span>
              </div>
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-slate-500" />
                <span className="text-slate-300 text-sm">{order.items.length} Unique SKUs ({order.items.reduce((acc,i) => acc + i.quantity, 0)} items)</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-cyan-900/30">
               <div className="text-xl text-green-400 font-bold font-mono">${order.amount.toFixed(2)}</div>
               <div className="flex gap-2">
                  <button onClick={() => onEdit(order)} className="p-2 text-cyan-400 hover:bg-cyan-900/50 border border-cyan-900/50 rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(order.id)} className="p-2 text-red-400 hover:bg-red-900/50 border border-red-900/50 rounded"><Trash2 className="w-4 h-4" /></button>
               </div>
            </div>
          </HudCard>
        ))}
      </div>

      <div className="text-right text-xs text-slate-500 font-mono">
        {t('list.displaying')} {filteredOrders.length} {t('list.records')}
      </div>
    </div>
  );
};