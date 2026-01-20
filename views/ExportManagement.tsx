
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Product, Bill, Customer } from '../types';

interface ActivityLog {
  id: string;
  type: 'Export' | 'Backup' | 'AI Insight';
  data: string;
  date: string;
  status: 'Success' | 'Failed' | 'Processing';
  format?: 'PDF' | 'CSV' | 'Text';
}

const INITIAL_HISTORY: ActivityLog[] = [
  { id: 'ACT-001', type: 'Export', data: 'Reports (Jan-Dec 2023)', date: '2024-01-22, 10:45 AM', status: 'Success', format: 'PDF' },
  { id: 'ACT-002', type: 'Backup', data: 'Full Database Backup', date: '2024-01-22, 10:30 AM', status: 'Success' },
];

const ExportManagement: React.FC = () => {
  const [exportTypes, setExportTypes] = useState({ reports: true, product: false, customer: false, employee: false });
  const [format, setFormat] = useState<'PDF' | 'CSV'>('PDF');
  const [isExporting, setIsExporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<{title: string, uri: string}[]>([]);
  const [history, setHistory] = useState<ActivityLog[]>(INITIAL_HISTORY);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getAiInsights = async () => {
    // Check if API_KEY is present
    if (!process.env.API_KEY) {
      showToast('API Key missing. Check README.md', 'error');
      setAiInsight("Developer Note: Please add your Gemini API Key to the .env file to enable AI-powered business insights.");
      return;
    }

    setIsAnalyzing(true);
    setAiInsight(null);
    setGroundingLinks([]);

    try {
      const products: Product[] = JSON.parse(localStorage.getItem('sm_products') || '[]');
      const bills: Bill[] = JSON.parse(localStorage.getItem('sm_bills') || '[]');
      const customers: Customer[] = JSON.parse(localStorage.getItem('sm_customers') || '[]');
      
      const statsSummary = `
        Shop Stats:
        - Total Products: ${products.length}
        - Total Sales Records: ${bills.length}
        - Total Customers: ${customers.length}
        - Inventory Categories: ${[...new Set(products.map(p => p.category))].join(', ')}
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `As a business consultant for an Indian retail shop, analyze these stats and provide 3 short, strategic growth tips: ${statsSummary}. Also suggest tools for inventory optimization.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      setAiInsight(response.text);
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const links = chunks
          .filter((c: any) => c.web)
          .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
        setGroundingLinks(links);
      }

      const newLog: ActivityLog = {
        id: `AI-${Math.floor(Math.random() * 900) + 100}`,
        type: 'AI Insight',
        data: 'Growth Strategy Analysis',
        date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        status: 'Success',
        format: 'Text'
      };
      setHistory(prev => [newLog, ...prev]);
      showToast('Business Insights Generated');
    } catch (err) {
      console.error(err);
      showToast('AI Analysis failed. Check connectivity.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showToast(`${format} Export Generated`);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-20">
      {toast && (
        <div className={`fixed top-24 right-8 z-[110] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 ${
          toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="text-sm font-black">{toast.message}</p>
        </div>
      )}

      {!process.env.API_KEY && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4 text-amber-800 animate-in slide-in-from-top-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">⚠️</div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest">Developer Configuration Required</p>
            <p className="text-sm font-medium">Add <code className="bg-amber-100 px-1 rounded">API_KEY</code> to your environment to enable AI insights.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Export Settings */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Export Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Datasets</label>
                <Checkbox label="Sales Reports" checked={exportTypes.reports} onChange={() => setExportTypes({...exportTypes, reports: !exportTypes.reports})} />
                <Checkbox label="Inventory List" checked={exportTypes.product} onChange={() => setExportTypes({...exportTypes, product: !exportTypes.product})} />
                <Checkbox label="Customer CRM" checked={exportTypes.customer} onChange={() => setExportTypes({...exportTypes, customer: !exportTypes.customer})} />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Output Format</label>
                <div className="flex gap-6">
                  <Radio label="PDF Document" checked={format === 'PDF'} onChange={() => setFormat('PDF')} />
                  <Radio label="CSV Spreadsheet" checked={format === 'CSV'} onChange={() => setFormat('CSV')} />
                </div>
              </div>
            </div>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-sky-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {isExporting ? 'Generating...' : 'Download Export'}
            </button>
          </div>

          {/* AI Insights Section */}
          <div className="bg-gradient-to-br from-sky-600 to-indigo-700 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-sky-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-black tracking-tight">AI Strategy Consultant</h2>
                <p className="text-sky-100/70 text-xs font-bold uppercase tracking-widest mt-1">Powered by Gemini Flash</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">✨</div>
            </div>

            {isAnalyzing ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 relative z-10">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p className="text-sm font-black uppercase tracking-widest animate-pulse">Analyzing Shop Performance...</p>
              </div>
            ) : aiInsight ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 relative z-10">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-sm leading-relaxed font-medium">
                  {aiInsight}
                </div>
                {groundingLinks.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-sky-200">Recommended Resources</p>
                    <div className="flex flex-wrap gap-2">
                      {groundingLinks.map((link, i) => (
                        <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/20 hover:bg-white text-[10px] font-black uppercase text-white hover:text-sky-600 rounded-xl transition-all border border-white/10">
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={getAiInsights} className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-sky-200">Re-analyze Data</button>
              </div>
            ) : (
              <div className="text-center py-8 relative z-10">
                <p className="text-sky-100 mb-8 font-medium">Get a personalized growth strategy based on your current inventory and sales data.</p>
                <button 
                  onClick={getAiInsights}
                  className="px-10 py-4 bg-white text-sky-600 font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  Generate Insights
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Audit Log Sidebar */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-gray-900 mb-6 tracking-tight">Activity Log</h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            {history.map(log => (
              <div key={log.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:border-sky-200">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                    log.type === 'AI Insight' ? 'bg-indigo-100 text-indigo-600' : 'bg-sky-100 text-sky-600'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-[8px] font-bold text-gray-400">{log.date}</span>
                </div>
                <p className="text-xs font-black text-gray-900">{log.data}</p>
                <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">ID: {log.id}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkbox: React.FC<{label: string, checked: boolean, onChange: () => void}> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div onClick={onChange} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
      checked ? 'bg-sky-600 border-sky-600' : 'border-gray-200 group-hover:border-sky-400'
    }`}>
      {checked && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
    </div>
    <span className="text-sm font-bold text-gray-600">{label}</span>
  </label>
);

const Radio: React.FC<{label: string, checked: boolean, onChange: () => void}> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group" onClick={onChange}>
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
      checked ? 'border-sky-600' : 'border-gray-200 group-hover:border-sky-400'
    }`}>
      {checked && <div className="w-2.5 h-2.5 bg-sky-600 rounded-full"></div>}
    </div>
    <span className="text-sm font-bold text-gray-600">{label}</span>
  </label>
);

export default ExportManagement;
