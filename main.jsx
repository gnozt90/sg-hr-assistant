import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Briefcase, DollarSign, Shield, Users, Search, MessageSquare, 
  BookOpen, Menu, X, ExternalLink, Globe, PlusCircle, Phone, Mail, 
  Sparkles, Send, MapPin, Clock, Zap
} from 'lucide-react';
import { HRAgent } from './agent';

// --- DATA & CONFIG ---

const JOB_PLATFORMS = [
  { name: "MyCareersFuture", url: "https://www.mycareersfuture.gov.sg/search?search=", color: "bg-blue-600", desc: "Official SG Govt Portal" },
  { name: "JobStreet", url: "https://www.jobstreet.com.sg/en/job-search/", suffix: "-jobs/", color: "bg-yellow-500", text: "text-black", desc: "Popular Commercial Board" },
  { name: "Seek", url: "https://www.seek.com.sg/jobs?keywords=", color: "bg-pink-600", desc: "International Network" },
  { name: "LinkedIn", url: "https://www.linkedin.com/jobs/search/?keywords=", color: "bg-blue-800", desc: "Professional Network" },
  { name: "Glints", url: "https://glints.com/sg/opportunities/jobs/explore?keyword=", color: "bg-red-500", desc: "Tech & Startups" },
  { name: "Foundit", url: "https://www.foundit.sg/srp/results?query=", color: "bg-purple-600", desc: "Formerly Monster" }
];

const LEGAL_DATA = {
  cpf: {
    title: "CPF & Contributions (2025)",
    source: "CPF Board",
    url: "https://www.cpf.gov.sg",
    content: [
      { topic: "Ordinary Wage (OW) Ceiling", fact: "The Ordinary Wage ceiling is $7,400 for 2025.", details: "Effective 1 Jan 2025, the OW ceiling was raised to $7,400. It is scheduled to increase to $8,000 in 2026." },
      { topic: "Contribution Rates (Age 55 or below)", fact: "Total: 37% (Employer: 17%, Employee: 20%)", details: "For Singapore Citizens/PRs (3rd year) aged 55 or below earning >$750/month." },
      { topic: "Senior Worker Rates", fact: "Rates increased by 1.5% for ages 55-65 from Jan 1, 2025.", details: "To boost retirement adequacy, contribution rates for senior workers have been raised." }
    ]
  },
  leave: {
    title: "Leave Entitlements",
    source: "MOM / MSF",
    url: "https://www.mom.gov.sg/employment-practices/leave",
    content: [
      { topic: "Paternity Leave", fact: "4 Weeks Mandatory (Government-Paid).", details: "Effective April 1, 2025, Government-Paid Paternity Leave (GPPL) increased from 2 weeks to 4 weeks on a mandatory basis." },
      { topic: "Shared Parental Leave", fact: "New scheme: 6 weeks shared leave (from April 1, 2025).", details: "Replaces the old sharing scheme. Parents can share 6 weeks of Government-Paid leave. Increases to 10 weeks in 2026." },
      { topic: "Maternity Leave", fact: "16 Weeks (Government-Paid).", details: "For Singapore Citizen children. Standard protection against dismissal applies during pregnancy and leave." }
    ]
  },
  work_passes: {
    title: "Foreign Manpower (EP/S Pass)",
    source: "MOM",
    url: "https://www.mom.gov.sg/passes-and-permits",
    content: [
      { topic: "Employment Pass (EP) Salary", fact: "$5,600 (General) / $6,200 (Financial Services).", details: "New qualifying salary threshold effective Jan 1, 2025 for new applications. Older candidates require higher salaries." },
      { topic: "COMPASS Framework", fact: "All EP applications must pass COMPASS.", details: "Points-based system scoring Salary, Qualifications, Diversity, and Support for Local Employment. Pass mark is 40 points." }
    ]
  },
  fairness: {
    title: "Fair Employment & Compliance",
    source: "TAFEP / MOM",
    url: "https://www.tal.sg/tafep",
    content: [
      { topic: "Workplace Fairness Act (WFA)", fact: "Passed Jan 2025. Protects against discrimination.", details: "Covers Age, Nationality, Sex, Marital Status, Pregnancy, Caregiving, Race, Religion, Language, Disability, and Mental Health." },
      { topic: "Retirement Age", fact: "63 years (Re-employment up to 68).", details: "Scheduled to raise to 64 and 69 respectively on July 1, 2026." },
      { topic: "Dismissal", fact: "Must be for 'Just Cause' or with Notice.", details: "Dismissal without notice is only allowed for misconduct after due inquiry. Wrongful dismissal claims can be lodged at TADM." }
    ]
  }
};

// --- LEGACY HELPER (FALLBACK) ---

const findLegacyAnswer = (query) => {
  const q = query.toLowerCase();
  // Simplified logic for fallback
  if (q.includes("cpf") || q.includes("7400")) return { answer: "The CPF Ordinary Wage ceiling for 2025 is **$7,400**.", source: "Local DB" };
  if (q.includes("paternity")) return { answer: "Paternity Leave is now **4 Weeks mandatory** (Govt-Paid) as of April 1, 2025.", source: "Local DB" };
  if (q.includes("shared")) return { answer: "New Shared Parental Leave allows parents to share **6 weeks** of leave.", source: "Local DB" };
  return { answer: "I couldn't find that in my local database. Try enabling the AI Agent!", source: "System" };
};

// --- COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center w-full p-3 mb-2 rounded-lg transition-all duration-200 ${
      active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon className="w-5 h-5 mr-3" />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const InfoCard = ({ title, data }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
      <h3 className="font-semibold text-slate-800 flex items-center">
        <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
        {title}
      </h3>
      <span className="text-xs font-mono text-slate-400 bg-slate-200 px-2 py-1 rounded">
        VERIFIED 2025
      </span>
    </div>
    <div className="p-6">
      <div className="space-y-6">
        {data.content.map((item, idx) => (
          <div key={idx} className="pb-4 last:pb-0 last:border-0 border-b border-slate-100">
            <h4 className="font-bold text-slate-700 text-sm mb-1">{item.topic}</h4>
            <p className="text-blue-700 font-semibold mb-1">{item.fact}</p>
            <p className="text-slate-500 text-sm">{item.details}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- JOB SEARCH COMPONENT ---
const JobSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const simulateSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    
    setTimeout(() => {
      const newResults = [];
      JOB_PLATFORMS.forEach(platform => {
        newResults.push({
          id: Math.random(),
          title: `${query} Role`,
          company: "Demo Company Pte Ltd",
          location: "Singapore",
          salary: "Competitive",
          platform: platform,
          posted: "2 days ago"
        });
      });
      setResults(newResults);
      setSearching(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-2xl shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-4 flex items-center"><Globe className="w-6 h-6 mr-2" /> SG Job Aggregator</h2>
        <div className="relative max-w-xl flex gap-2">
          <input
            type="text"
            className="flex-1 p-4 rounded-xl text-slate-800 outline-none shadow-lg"
            placeholder="Search jobs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && simulateSearch()}
          />
          <button onClick={simulateSearch} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 rounded-xl shadow-lg">Search</button>
        </div>
      </div>

      {searching ? (
        <div className="text-center py-20 text-slate-500">Aggregating jobs...</div>
      ) : (
        <div className="grid gap-4">
          {results.map(job => (
            <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center">
               <div>
                  <h3 className="font-bold text-lg text-slate-800">{job.title}</h3>
                  <div className="text-sm text-slate-600">{job.company} • {job.location}</div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase mt-2 inline-block ${job.platform.color} ${job.platform.text || ''}`}>{job.platform.name}</span>
               </div>
               <a href={job.platform.url + encodeURIComponent(query)} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-sm border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50">Apply</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- LIVELY AI CHAT COMPONENT (UPDATED WITH ADK) ---
const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'agent', content: "Hello! 👋 I'm your HR Assistant.\n\nI can use **Google Gemini** to answer complex questions about SG Law, or use my offline database." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [useRealAI, setUseRealAI] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || "");
  const [showKeyInput, setShowKeyInput] = useState(false);
  
  const scrollRef = useRef(null);
  const agentRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // Initialize Real Agent if key exists
  useEffect(() => {
    if (apiKey && useRealAI) {
      agentRef.current = new HRAgent(apiKey);
    }
  }, [apiKey, useRealAI]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    if (useRealAI && agentRef.current) {
        // REAL AI PATH
        const response = await agentRef.current.chat(userMsg.content, messages);
        setIsTyping(false);
        setMessages(prev => [...prev, { 
            role: 'agent', 
            content: response.text, 
            source: response.source 
        }]);
    } else {
        // OFFLINE PATH
        setTimeout(() => {
            const response = findLegacyAnswer(userMsg.content);
            setMessages(prev => [...prev, { role: 'agent', content: response.answer, source: response.source }]);
            setIsTyping(false);
        }, 800);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 h-[600px] flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 flex flex-col text-white">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-full mr-3">
                <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
                <h3 className="font-bold">HR Assistant AI</h3>
                <p className="text-[10px] text-blue-100 uppercase tracking-wider">
                    {useRealAI ? "⚡ Power: Google Gemini (ADK)" : "🔋 Power: Offline Rules"}
                </p>
            </div>
            </div>
            <button onClick={() => setMessages([messages[0]])} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded">Clear</button>
        </div>
        
        {/* MODEL TOGGLE */}
        <div className="flex items-center text-xs bg-black/20 p-2 rounded-lg">
            <label className="flex items-center cursor-pointer select-none">
                <div className="relative">
                    <input type="checkbox" className="sr-only" checked={useRealAI} onChange={() => {
                        if (!apiKey && !useRealAI) setShowKeyInput(true);
                        setUseRealAI(!useRealAI);
                    }} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${useRealAI ? 'bg-green-400' : 'bg-slate-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useRealAI ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <div className="ml-3 font-medium">
                    {useRealAI ? "Online Agent (Gemini)" : "Offline Mode"}
                </div>
            </label>
            {!apiKey && useRealAI && <button onClick={() => setShowKeyInput(true)} className="ml-auto underline text-yellow-300">Set Key</button>}
        </div>
      </div>

      {/* API KEY INPUT MODAL */}
      {showKeyInput && (
        <div className="bg-yellow-50 p-4 border-b border-yellow-200 text-xs text-yellow-800">
            <p className="mb-2 font-bold">Enter Google Gemini API Key to enable the Agent:</p>
            <div className="flex gap-2">
                <input 
                    type="password" 
                    placeholder="AIzaSy..." 
                    className="flex-1 p-2 border rounded"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
                <button onClick={() => setShowKeyInput(false)} className="bg-yellow-600 text-white px-3 rounded">Save</button>
            </div>
            <p className="mt-1 opacity-70">Get one free at aistudio.google.com</p>
        </div>
      )}

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative ${
              m.role === 'user' 
                ? 'bg-violet-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {m.content.split('**').map((part, index) => index % 2 === 1 ? <strong key={index}>{part}</strong> : part)}
              </div>
              {m.role === 'agent' && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Source: {m.source || "AI"}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center space-x-1">
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm transition-all"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
            disabled={!input.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">Singapore HR Portal</h1>
                <p className="text-slate-300 max-w-2xl">
                    Your one-stop platform for compliance, payroll, and job hunting in Singapore. 
                    Now powered by <span className="text-yellow-300 font-bold">Google Gemini ADK</span>.
                </p>
                <div className="flex gap-3 mt-6">
                    <button onClick={() => setActiveTab('ai_agent')} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-medium flex items-center transition-colors shadow-lg shadow-blue-900/50">
                    <Zap className="w-4 h-4 mr-2 text-yellow-300" /> Try AI Agent
                    </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button onClick={() => setActiveTab('jobs')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left group">
                <div className="text-blue-600 bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Globe className="w-5 h-5" /></div>
                <h3 className="font-bold text-slate-800 mb-2">Job Search Hub</h3>
                <p className="text-sm text-slate-500">Search across JobStreet, CareersFuture, and LinkedIn.</p>
              </button>

              <button onClick={() => setActiveTab('leave')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left group">
                <div className="text-purple-600 bg-purple-50 w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Shield className="w-5 h-5" /></div>
                <h3 className="font-bold text-slate-800 mb-2">2025 Compliance</h3>
                <p className="text-sm text-slate-500">Check new Paternity Leave and Workplace Fairness rules.</p>
              </button>

              <button onClick={() => setActiveTab('ai_agent')} className="bg-gradient-to-br from-indigo-50 to-violet-50 p-6 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-all text-left group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2"><Sparkles className="w-12 h-12 text-indigo-100" /></div>
                <div className="text-indigo-600 bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><MessageSquare className="w-5 h-5" /></div>
                <h3 className="font-bold text-indigo-900 mb-2">Ask AI Agent</h3>
                <p className="text-sm text-indigo-700">Powered by Google Gen AI SDK. Ask about anything.</p>
              </button>
            </div>
          </div>
        );
      case 'jobs': return <JobSearch />;
      case 'cpf': return <div className="space-y-6 animate-fadeIn"><h2 className="text-2xl font-bold text-slate-800">CPF & Payroll</h2><InfoCard title="Latest CPF Regulations" data={LEGAL_DATA.cpf} /></div>;
      case 'leave': return <div className="space-y-6 animate-fadeIn"><h2 className="text-2xl font-bold text-slate-800">Leave & Time Off</h2><InfoCard title="Statutory Leave Entitlements" data={LEGAL_DATA.leave} /></div>;
      case 'foreign': return <div className="space-y-6 animate-fadeIn"><h2 className="text-2xl font-bold text-slate-800">Foreign Manpower</h2><InfoCard title="Work Passes & Quotas" data={LEGAL_DATA.work_passes} /></div>;
      case 'ai_agent': return <div className="space-y-6 animate-fadeIn"><h2 className="text-2xl font-bold text-slate-800 mb-4">Compliance Assistant</h2><AIChat /></div>;
      default: return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center text-blue-700 font-bold text-xl tracking-tight">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-2">SG</div>
              HR<span className="text-slate-800">Hub</span>
            </div>
          ) : <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">H</div>}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <SidebarItem icon={Briefcase} label={isSidebarOpen ? "Dashboard" : ""} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <div className="my-4 border-t border-slate-100"></div>
          <SidebarItem icon={Search} label={isSidebarOpen ? "Job Search" : ""} active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} />
          <SidebarItem icon={Shield} label={isSidebarOpen ? "CPF & Payroll" : ""} active={activeTab === 'cpf'} onClick={() => setActiveTab('cpf')} />
          <SidebarItem icon={Users} label={isSidebarOpen ? "Leave & Benefits" : ""} active={activeTab === 'leave'} onClick={() => setActiveTab('leave')} />
          <SidebarItem icon={BookOpen} label={isSidebarOpen ? "Work Passes" : ""} active={activeTab === 'foreign'} onClick={() => setActiveTab('foreign')} />
          
          <div className="mt-auto pt-4">
           <button onClick={() => setActiveTab('ai_agent')} className={`flex items-center w-full p-3 mb-2 rounded-lg transition-all ${activeTab === 'ai_agent' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'bg-violet-50 text-violet-700 hover:bg-violet-100'}`}>
            <Sparkles className="w-5 h-5 mr-3" />
            <span className={`font-bold text-sm ${!isSidebarOpen && 'hidden'}`}>Ask AI Agent</span>
          </button>
          </div>
        </div>

        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-4 border-t border-slate-100 flex items-center text-slate-500 hover:text-slate-800 transition-colors">
          {isSidebarOpen ? <Menu className="w-5 h-5 mr-2" /> : <Menu className="w-5 h-5 mx-auto" />}
          {isSidebarOpen && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-700 capitalize">{activeTab === 'home' ? 'Overview' : activeTab.replace('_', ' ')}</h2>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300">HR</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8"><div className="max-w-6xl mx-auto">{renderContent()}</div></main>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
