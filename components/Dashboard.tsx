import React, { useMemo } from 'react';
import { Order, OrderStatus, ViewState } from '../types';
import { HudCard } from './ui/HudComponents';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { DollarSign, Package, Truck, Activity, MousePointerClick } from 'lucide-react';
import { SOURCE_COLORS } from '../constants';
import { useLanguage } from '../utils/i18n';

interface Props {
  orders: Order[];
  onNavigate: (view: ViewState, filter?: string) => void;
}

export const Dashboard: React.FC<Props> = ({ orders, onNavigate }) => {
  const { t } = useLanguage();

  const stats = useMemo(() => {
    return {
      totalRevenue: orders.reduce((acc, curr) => acc + (curr.status !== OrderStatus.Cancelled ? curr.amount : 0), 0),
      totalOrders: orders.length,
      pendingShipments: orders.filter(o => o.status === OrderStatus.Pending || o.status === OrderStatus.Paid).length,
      avgOrderValue: orders.length > 0 ? orders.reduce((acc, c) => acc + c.amount, 0) / orders.length : 0
    };
  }, [orders]);

  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      counts[o.source] = (counts[o.source] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const recentSalesData = useMemo(() => {
    // Group by date (last 7 entries roughly)
    const sorted = [...orders].sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
    return sorted.slice(-10).map(o => ({
      date: new Date(o.orderDate).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric'}),
      amount: o.amount
    }));
  }, [orders]);

  const cardActionClass = "col-span-1 cursor-pointer hover:bg-slate-900/80 hover:border-cyan-400/80 transition-all group/card relative overflow-hidden";
  const hoverIconClass = "absolute top-2 right-2 opacity-0 group-hover/card:opacity-50 transition-opacity text-cyan-400";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
      {/* KPI Cards - Responsive Grid */}
      <HudCard 
        className={cardActionClass} 
        title={t('dash.revenue')}
        onClick={() => onNavigate('ORDERS')}
      >
        <MousePointerClick className={hoverIconClass} size={16} />
        <div className="flex items-center justify-between">
          <div className="text-2xl md:text-3xl font-mono text-cyan-300 truncate">${stats.totalRevenue.toLocaleString()}</div>
          <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-cyan-500 opacity-50 shrink-0" />
        </div>
        <div className="text-[10px] md:text-xs text-slate-400 mt-2 font-mono uppercase tracking-wider">{t('dash.revenue.sub')}</div>
      </HudCard>

      <HudCard 
        className={cardActionClass} 
        title={t('dash.orders')}
        onClick={() => onNavigate('ORDERS')}
      >
        <MousePointerClick className={hoverIconClass} size={16} />
        <div className="flex items-center justify-between">
          <div className="text-2xl md:text-3xl font-mono text-white">{stats.totalOrders}</div>
          <Package className="w-6 h-6 md:w-8 md:h-8 text-white opacity-50 shrink-0" />
        </div>
        <div className="text-[10px] md:text-xs text-slate-400 mt-2 font-mono uppercase tracking-wider">{t('dash.orders.sub')}</div>
      </HudCard>

      <HudCard 
        className={cardActionClass} 
        title={t('dash.pending')}
        onClick={() => onNavigate('ORDERS', OrderStatus.Pending)}
      >
        <MousePointerClick className={hoverIconClass} size={16} />
        <div className="flex items-center justify-between">
          <div className="text-2xl md:text-3xl font-mono text-amber-400 animate-pulse-slow">{stats.pendingShipments}</div>
          <Truck className="w-6 h-6 md:w-8 md:h-8 text-amber-500 opacity-50 shrink-0" />
        </div>
        <div className="text-[10px] md:text-xs text-slate-400 mt-2 font-mono uppercase tracking-wider">{t('dash.pending.sub')}</div>
      </HudCard>

      <HudCard 
        className={cardActionClass} 
        title={t('dash.avgValue')}
        onClick={() => onNavigate('ORDERS')}
      >
        <MousePointerClick className={hoverIconClass} size={16} />
        <div className="flex items-center justify-between">
          <div className="text-2xl md:text-3xl font-mono text-green-400">${stats.avgOrderValue.toFixed(0)}</div>
          <Activity className="w-6 h-6 md:w-8 md:h-8 text-green-500 opacity-50 shrink-0" />
        </div>
        <div className="text-[10px] md:text-xs text-slate-400 mt-2 font-mono uppercase tracking-wider">{t('dash.avgValue.sub')}</div>
      </HudCard>

      {/* Charts - Stack on mobile, side-by-side on large screens */}
      <HudCard className="col-span-1 md:col-span-2 lg:col-span-2 h-64 md:h-80" title={t('dash.chart.revenue')}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={recentSalesData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <XAxis dataKey="date" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 10}} interval="preserveStartEnd" />
            <YAxis stroke="#475569" tick={{fill: '#94a3b8', fontSize: 10}} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', color: '#fff', fontSize: '12px' }} 
              itemStyle={{ color: '#22d3ee' }}
            />
            <Line type="monotone" dataKey="amount" stroke="#22d3ee" strokeWidth={2} dot={{fill: '#06b6d4', r: 3}} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </HudCard>

      <HudCard className="col-span-1 md:col-span-2 lg:col-span-2 h-auto md:h-80 min-h-[300px]" title={t('dash.chart.traffic')}>
        <div className="flex flex-col sm:flex-row h-full items-center">
          <div className="w-full sm:w-[60%] h-[200px] sm:h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SOURCE_COLORS[entry.name as keyof typeof SOURCE_COLORS] || '#94a3b8'} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full sm:w-[40%] flex flex-wrap sm:flex-col justify-center gap-2 text-xs font-mono p-4 sm:p-0">
             {sourceData.map((entry) => (
               <div key={entry.name} className="flex items-center gap-2 w-[48%] sm:w-auto">
                 <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: SOURCE_COLORS[entry.name as keyof typeof SOURCE_COLORS] || '#94a3b8' }}></span>
                 <span className="text-slate-300 truncate">{t(entry.name)}</span>
                 <span className="text-cyan-400">({entry.value})</span>
               </div>
             ))}
          </div>
        </div>
      </HudCard>
    </div>
  );
};