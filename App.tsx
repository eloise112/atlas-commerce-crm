import React, { useState, useEffect } from 'react';
import { ViewState, Order, OrderStatus } from './types';
import { dbService } from './services/dbService';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { OrderForm } from './components/OrderForm';
import { StyleLibrary } from './components/StyleLibrary';
import { BackgroundGlobe } from './components/ui/BackgroundGlobe';
import { LayoutDashboard, Users, Plus, Upload, Download, Hexagon, Menu, X, Globe, Shirt, Home } from 'lucide-react';
import { LanguageProvider, useLanguage } from './utils/i18n';

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-4 font-sci-fi text-sm tracking-wider uppercase transition-all duration-300 border-l-2 text-left
    ${active 
      ? 'bg-gradient-to-r from-cyan-900/40 to-transparent border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
      : 'border-transparent text-slate-400 hover:text-cyan-200 hover:bg-slate-800/50'
    }`}
  >
    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'animate-pulse' : ''}`} />
    {label}
  </button>
);

const AppContent = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeOrderFilter, setActiveOrderFilter] = useState('ALL');
  
  const { t, language, setLanguage } = useLanguage();

  // Load Data
  useEffect(() => {
    const data = dbService.getAllOrders();
    setOrders(data);
  }, [refreshTrigger]);

  const handleDashboardNav = (targetView: ViewState, filterStr: string = 'ALL') => {
    setActiveOrderFilter(filterStr);
    setView(targetView);
  };

  const handleSaveOrder = (order: Order) => {
    dbService.saveOrder(order);
    setRefreshTrigger(prev => prev + 1);
    setView('ORDERS');
    setEditingOrder(null);
  };

  const handleStatusUpdate = (id: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      const updatedOrder = { ...order, status: newStatus, lastUpdated: Date.now() };
      // Auto-set shipped date if status changes to Shipped
      if (newStatus === OrderStatus.Shipped && !order.shippedDate) {
         updatedOrder.shippedDate = new Date().toISOString();
      }
      dbService.saveOrder(updatedOrder);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm("CONFIRM DELETION: This action cannot be undone.")) {
      dbService.deleteOrder(id);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await dbService.importDatabase(file);
          setRefreshTrigger(prev => prev + 1);
          alert('SYSTEM RESTORED: Database import successful.');
        } catch (error) {
          alert('SYSTEM ERROR: Import failed. Invalid file structure.');
        }
      }
    };
    input.click();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const NavContent = () => (
    <>
        <div className="p-8 pb-4 border-b border-slate-800">
           {/* Clickable Title to Home */}
           <div 
             className="flex items-center gap-3 mb-2 cursor-pointer group"
             onClick={() => { setView('DASHBOARD'); setIsMobileMenuOpen(false); }}
           >
             <Hexagon className="w-8 h-8 text-cyan-400 flex-shrink-0 group-hover:rotate-90 transition-transform duration-700" strokeWidth={1.5} />
             <h1 className="font-sci-fi text-xl font-bold tracking-widest text-white italic whitespace-nowrap group-hover:text-cyan-300 transition-colors">
               {t('app.title')}<span className="text-cyan-400 text-xs not-italic ml-1">v3.1</span>
             </h1>
           </div>
           <p className="text-xs text-slate-500 font-mono pl-11">{t('app.subtitle')}</p>
        </div>

        <nav className="flex-grow py-8 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label={t('nav.dashboard')}
            active={view === 'DASHBOARD'} 
            onClick={() => { setView('DASHBOARD'); setIsMobileMenuOpen(false); }} 
          />
          <SidebarItem 
            icon={Users} 
            label={t('nav.orders')} 
            active={view === 'ORDERS'} 
            onClick={() => { setView('ORDERS'); setActiveOrderFilter('ALL'); setEditingOrder(null); setIsMobileMenuOpen(false); }} 
          />
          <SidebarItem 
            icon={Shirt} 
            label={t('nav.styles')}
            active={view === 'STYLES'} 
            onClick={() => { setView('STYLES'); setIsMobileMenuOpen(false); }} 
          />
          <SidebarItem 
            icon={Plus} 
            label={t('nav.newOrder')}
            active={view === 'NEW_ORDER'} 
            onClick={() => { setView('NEW_ORDER'); setEditingOrder(null); setIsMobileMenuOpen(false); }} 
          />
        </nav>

        <div className="p-6 border-t border-slate-800 space-y-3">
          <p className="text-xs text-slate-500 font-sci-fi mb-2 uppercase tracking-widest">{t('nav.system')}</p>
          
          <button 
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-200 transition-colors p-2 border border-cyan-900/50 bg-cyan-950/20 hover:bg-cyan-900/40 group"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 group-hover:animate-spin-slow" />
              <span>LANGUAGE / 语言</span>
            </div>
            <span className="bg-cyan-500/20 px-1.5 py-0.5 rounded text-[10px]">{language.toUpperCase()}</span>
          </button>

          <button 
            onClick={dbService.exportDatabase}
            className="w-full flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors p-2 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/10"
          >
            <Download className="w-4 h-4" /> {t('nav.export')}
          </button>
          <button 
            onClick={handleImport}
            className="w-full flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors p-2 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/10"
          >
            <Upload className="w-4 h-4" /> {t('nav.import')}
          </button>
        </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-black text-cyan-50 overflow-hidden">
      
      {/* 3D Background */}
      <BackgroundGlobe />

      {/* Grid Overlay for Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-72 bg-slate-950/80 backdrop-blur-md border-r border-slate-800 z-20 hidden lg:flex flex-col relative shrink-0">
        <NavContent />
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-64 bg-slate-950 border-r border-cyan-900/50 h-full flex flex-col animate-fade-in-left shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <NavContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow overflow-x-hidden overflow-y-auto relative z-10 flex flex-col h-screen w-full">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur flex justify-between items-center sticky top-0 z-30">
           <div 
             className="flex items-center gap-2 cursor-pointer"
             onClick={() => setView('DASHBOARD')}
            >
             <Hexagon className="w-6 h-6 text-cyan-400" strokeWidth={1.5} />
             <span className="font-sci-fi font-bold text-lg tracking-wider">{t('app.title')}</span>
           </div>
           
           <div className="flex items-center gap-3">
              {/* Quick Home Button (Mobile Header) */}
              <button 
                  onClick={() => setView('DASHBOARD')}
                  className="flex items-center gap-2 px-3 py-1.5 border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 font-sci-fi text-[10px] uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all rounded-sm"
               >
                  <Home className="w-3 h-3" />
                  <span className="hidden sm:inline">{t('nav.returnHome')}</span>
               </button>

              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 border border-cyan-500/30 text-cyan-400 bg-cyan-900/10 rounded-sm">
                <Menu className="w-6 h-6" />
              </button>
           </div>
        </header>

        {/* Dynamic View Area */}
        <div className="p-4 md:p-8 lg:p-12 w-full max-w-[1600px] mx-auto">
          {/* Desktop Top Right Actions (Absolute Positioned) */}
          <div className="hidden lg:flex absolute top-8 right-12 gap-4 items-center z-20">
             <button 
                  onClick={() => setView('DASHBOARD')}
                  className="flex items-center gap-2 px-4 py-2 border border-cyan-500/30 bg-slate-950/80 backdrop-blur text-cyan-400 font-sci-fi text-xs uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:text-white transition-all group rounded-sm"
               >
                  <Home className="w-4 h-4 group-hover:animate-pulse" />
                  {t('nav.returnHome')}
             </button>
             <div className="text-right">
                <div className="font-mono text-[10px] text-slate-500">SYSTEM STATUS</div>
                <div className="font-mono text-xs text-green-400 glow-text">ONLINE</div>
             </div>
          </div>


          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 border-b border-cyan-900/30 pb-4 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-sci-fi text-white tracking-widest uppercase glow-text animate-fade-in-down">
                {view === 'DASHBOARD' && t('nav.dashboard')}
                {view === 'ORDERS' && t('nav.orders')}
                {view === 'NEW_ORDER' && t('nav.newOrder')}
                {view === 'STYLES' && t('nav.styles')}
              </h2>
              <div className="h-1 w-20 bg-cyan-500 mt-2 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse-slow"></div>
            </div>

            {/* Mobile/Tablet System Status (Inline) */}
            <div className="flex lg:hidden flex-col items-end gap-3">
               <div className="font-mono text-xs text-slate-500 text-right">
                 SYSTEM STATUS: <span className="text-green-400">ONLINE</span> <br/>
                 LOCAL STORAGE: <span className="text-cyan-400">CONNECTED</span>
               </div>
            </div>
          </div>

          <div className="relative min-h-[500px]">
             {/* Scanline Effect Overlay - Updated Class Usage */}
             <div className="absolute inset-0 pointer-events-none z-0">
               <div className="scanline"></div>
             </div>

             <div className="relative z-10">
               {view === 'DASHBOARD' && <Dashboard orders={orders} onNavigate={handleDashboardNav} />}
               
               {view === 'ORDERS' && (
                 <OrderList 
                   orders={orders} 
                   onEdit={(order) => { setEditingOrder(order); setView('NEW_ORDER'); }} 
                   onDelete={handleDeleteOrder} 
                   onStatusChange={handleStatusUpdate}
                   initialFilterStatus={activeOrderFilter}
                 />
               )}

               {view === 'STYLES' && (
                  <StyleLibrary orders={orders} />
               )}
               
               {view === 'NEW_ORDER' && (
                 <OrderForm 
                   existingOrder={editingOrder}
                   onSave={handleSaveOrder} 
                   onCancel={() => { setView('ORDERS'); setEditingOrder(null); }} 
                 />
               )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}