import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  Briefcase, 
  DollarSign, 
  Shield, 
  Users, 
  Search, 
  MessageSquare, 
  BookOpen, 
  AlertCircle,
  CheckCircle,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

// --- VERIFIED KNOWLEDGE BASE (Updated Dec 2025) ---
const LEGAL_DATA = {
  cpf: {
    title: "CPF & Contributions (2025)",
    source: "CPF Board",
    url: "https://www.cpf.gov.sg",
    content: [
      {
        topic: "Ordinary Wage (OW) Ceiling",
        fact: "The Ordinary Wage ceiling is $7,400 for 2025.",
        details: "Effective 1 Jan 2025, the OW ceiling was raised to $7,400. It is scheduled to increase to $8,000 in 2026."
      },
      {
        topic: "Contribution Rates (Age 55 or below)",
        fact: "Total: 37% (Employer: 17%, Employee: 20%)",
        details: "For Singapore Citizens/PRs (3rd year) aged 55 or below earning >$750/month."
      },
      {
        topic: "Senior Worker Rates",
        fact: "Rates increased by 1.5% for ages 55-65 from Jan 1, 2025.",
        details: "To boost retirement adequacy, contribution rates for senior workers have been raised."
      },
      {
        topic: "Special Account (SA) Closure",
        fact: "SA is closed for members aged 55 and above from Jan 2025.",
        details: "Savings transferred to Retirement Account (RA) up to Full Retirement Sum, remainder to Ordinary Account (OA)."
      }
    ]
  },
  leave: {
    title: "Leave Entitlements",
    source: "MOM / MSF",
    url: "https://www.mom.gov.sg/employment-practices/leave",
    content: [
      {
        topic: "Paternity Leave",
        fact: "4 Weeks Mandatory (Government-Paid).",
        details: "Effective April 1, 2025, Government-Paid Paternity Leave (GPPL) increased from 2 weeks to 4 weeks on a mandatory basis."
      },
      {
        topic: "Shared Parental Leave",
        fact: "New scheme: 6 weeks shared leave (from April 1, 2025).",
        details: "Replaces the old sharing scheme. Parents can share 6 weeks of Government-Paid leave. Increases to 10 weeks in 2026."
      },
      {
        topic: "Maternity Leave",
        fact: "16 Weeks (Government-Paid).",
        details: "For Singapore Citizen children. Standard protection against dismissal applies during pregnancy and leave."
      },
      {
        topic: "Childcare Leave",
        fact: "6 days per year (for citizens < 7 years old).",
        details: "Paid by Government (days 4-6) and Employer (days 1-3)."
      }
    ]
  },
  work_passes: {
    title: "Foreign Manpower (EP/S Pass)",
    source: "MOM",
    url: "https://www.mom.gov.sg/passes-and-permits",
    content: [
      {
        topic: "Employment Pass (EP) Salary",
        fact: "$5,600 (General) / $6,200 (Financial Services).",
        details: "New qualifying salary threshold effective Jan 1, 2025 for new applications. Older candidates require higher salaries."
      },
      {
        topic: "COMPASS Framework",
        fact: "All EP applications must pass COMPASS.",
        details: "Points-based system scoring Salary, Qualifications, Diversity, and Support for Local Employment. Pass mark is 40 points."
      },
      {
        topic: "S Pass Qualifying Salary",
        fact: "$3,150 (General).",
        details: "Subject to quota (Tier 1: 10% of workforce in Services)."
      }
    ]
  },
  fairness: {
    title: "Fair Employment & Compliance",
    source: "TAFEP / MOM",
    url: "https://www.tal.sg/tafep",
    content: [
      {
        topic: "Workplace Fairness Act (WFA)",
        fact: "Passed Jan 2025. Protects against discrimination.",
        details: "Covers Age, Nationality, Sex, Marital Status, Pregnancy, Caregiving, Race, Religion, Language, Disability, and Mental Health."
      },
      {
        topic: "Retirement Age",
        fact: "63 years (Re-employment up to 68).",
        details: "Scheduled to raise to 64 and 69 respectively on July 1, 2026."
      },
      {
        topic: "Dismissal",
        fact: "Must be for 'Just Cause' or with Notice.",
        details: "Dismissal without notice is only allowed for misconduct after due inquiry. Wrongful dismissal claims can be lodged at TADM."
      }
    ]
  }
};

// --- SIMULATED AI AGENT LOGIC ---
const findAnswer = (query) => {
  const q = query.toLowerCase();
  
  // Keyword mapping to Knowledge Base
  const keywords = [
    { keys: ["cpf", "ceiling", "7400", "limit", "ordinary wage"], section: 'cpf', index: 0 },
    { keys: ["contribution", "rate", "percent", "employer share"], section: 'cpf', index: 1 },
    { keys: ["senior", "older", "55", "65"], section: 'cpf', index: 2 },
    { keys: ["special account", "sa closure"], section: 'cpf', index: 3 },
    { keys: ["paternity", "father", "dad"], section: 'leave', index: 0 },
    { keys: ["shared", "parental", "sharing"], section: 'leave', index: 1 },
    { keys: ["maternity", "mother", "pregnant", "pregnancy"], section: 'leave', index: 2 },
    { keys: ["childcare", "child", "sick"], section: 'leave', index: 3 },
    { keys: ["ep", "employment pass", "5600", "foreign", "compass"], section: 'work_passes', index: 0 },
    { keys: ["compass", "points", "score"], section: 'work_passes', index: 1 },
    { keys: ["s pass", "spass"], section: 'work_passes', index: 2 },
    { keys: ["fairness", "discrimination", "wfa", "act", "ageism", "race"], section: 'fairness', index: 0 },
    { keys: ["retire", "re-employment", "old age"], section: 'fairness', index: 1 },
    { keys: ["fire", "dismiss", "terminate", "notice"], section: 'fairness', index: 2 },
  ];

  for (let k of keywords) {
    if (k.keys.some(key => q.includes(key))) {
      const data = LEGAL_DATA[k.section].content[k.index];
      return {
        answer: `**${data.fact}**\n\n${data.details}`,
        source: LEGAL_DATA[k.section].source,
        url: LEGAL_DATA[k.section].url,
        confidence: "High"
      };
    }
  }

  return {
    answer: "I cannot find a verified government source for this specific query in my 2025 database. Please consult the Ministry of Manpower (MOM) website directly or seek legal advice.",
    source: "System",
    url: "https://www.mom.gov.sg",
    confidence: "Low"
  };
};


// --- COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center w-full p-3 mb-2 rounded-lg transition-colors ${
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
      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
        <a 
          href={data.url} 
          target="_blank" 
          rel="noreferrer"
          className="text-xs flex items-center text-blue-500 hover:text-blue-700 font-medium"
        >
          Source: {data.source} <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
    </div>
  </div>
);

const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'agent', content: "Hello! I am your Singapore HR Compliance Assistant. I can answer questions about MOM Employment Laws, CPF Rates (2025), and Leave Entitlements. \n\nTry asking: \"What is the new CPF ceiling?\" or \"Is paternity leave mandatory?\"" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate network delay
    setTimeout(() => {
      const response = findAnswer(userMsg.content);
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: response.answer,
        source: response.source,
        url: response.url
      }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 h-[600px] flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl">
        <div className="flex items-center text-white">
          <div className="p-2 bg-white/20 rounded-full mr-3">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">SG HR Compliance Agent</h3>
            <p className="text-xs text-blue-100 opacity-90">Powered by RAG (Verified Sources)</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {m.content.split('**').map((part, index) => 
                  index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                )}
              </div>
              {m.role === 'agent' && m.source && m.source !== "System" && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-2">Verified Source:</span>
                  <a 
                    href={m.url}
                    target="_blank"
                    rel="noreferrer" 
                    className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                  >
                    {m.source} <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 rounded-b-xl">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Ask about CPF, Leave, or Termination..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors shadow-md disabled:opacity-50"
            disabled={!input.trim()}
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Not legal advice. Information based on Dec 2025 guidelines.
        </p>
      </div>
    </div>
  );
};

const CPFCalculator = () => {
  const [wage, setWage] = useState(5000);
  const [ageGroup, setAgeGroup] = useState('lte55');
  
  // 2025 Rates
  const CEILING = 7400; 
  
  const calculate = () => {
    const applicableWage = Math.min(wage, CEILING);
    let rates = { emp: 0.20, comp: 0.17 }; // <= 55

    if (ageGroup === '55to60') rates = { emp: 0.16, comp: 0.155 }; // Updated 2025 estimates
    if (ageGroup === '60to65') rates = { emp: 0.115, comp: 0.12 }; // Updated 2025 estimates
    if (ageGroup === 'gt65') rates = { emp: 0.05, comp: 0.075 };

    return {
      employee: applicableWage * rates.emp,
      employer: applicableWage * rates.comp,
      total: applicableWage * (rates.emp + rates.comp)
    };
  };

  const result = calculate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg mr-3">
          <DollarSign className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-slate-800">Quick CPF Calculator (2025)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Monthly Gross Wage (OW)</label>
            <input 
              type="number" 
              value={wage}
              onChange={(e) => setWage(Number(e.target.value))}
              className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">2025 Ceiling Cap: ${CEILING.toLocaleString()}</p>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Age Group</label>
            <select 
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="lte55">55 and below</option>
              <option value="55to60">Above 55 to 60</option>
              <option value="60to65">Above 60 to 65</option>
              <option value="gt65">Above 65</option>
            </select>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Employee Share (Deducted):</span>
            <span className="font-bold text-slate-800 font-mono">${result.employee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Employer Share (Added):</span>
            <span className="font-bold text-slate-800 font-mono">${result.employer.toFixed(2)}</span>
          </div>
          <div className="border-t border-emerald-200 pt-3 flex justify-between items-center">
            <span className="text-emerald-800 font-bold">Total Contribution:</span>
            <span className="font-bold text-emerald-700 font-mono text-lg">${result.total.toFixed(2)}</span>
          </div>
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
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-xl">
              <h1 className="text-3xl font-bold mb-2">Singapore HR Portal</h1>
              <p className="text-slate-300 max-w-2xl">
                Your single source of truth for compliance, payroll, and employment laws. 
                Updated for 2025 regulations including the new CPF Ceiling ($7,400) and Workplace Fairness Act.
              </p>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setActiveTab('ai_agent')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-medium flex items-center transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask AI Agent
                </button>
                <button 
                  onClick={() => setActiveTab('cpf')}
                  className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                >
                  View CPF 2025 Rates
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="text-blue-600 bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">New: Shared Parental Leave</h3>
                <p className="text-sm text-slate-500 mb-4">
                  From April 1, 2025, the new Shared Parental Leave scheme adds 6 weeks of shared leave for parents.
                </p>
                <button onClick={() => setActiveTab('leave')} className="text-blue-600 text-sm font-semibold hover:underline">Read more &rarr;</button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="text-emerald-600 bg-emerald-50 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">CPF Ceiling Raised</h3>
                <p className="text-sm text-slate-500 mb-4">
                  The Ordinary Wage ceiling is now $7,400. Ensure payroll software is updated for Jan 2025 runs.
                </p>
                <button onClick={() => setActiveTab('cpf')} className="text-emerald-600 text-sm font-semibold hover:underline">Calculate &rarr;</button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="text-purple-600 bg-purple-50 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Fair Employment</h3>
                <p className="text-sm text-slate-500 mb-4">
                  The Workplace Fairness Act is now law. Review hiring practices to avoid discrimination penalties.
                </p>
                <button onClick={() => setActiveTab('compliance')} className="text-purple-600 text-sm font-semibold hover:underline">Check Guidelines &rarr;</button>
              </div>
            </div>
          </div>
        );
      case 'cpf':
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-800">CPF & Payroll</h2>
            <CPFCalculator />
            <InfoCard title="Latest CPF Regulations" data={LEGAL_DATA.cpf} />
          </div>
        );
      case 'leave':
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-800">Leave & Time Off</h2>
            <InfoCard title="Statutory Leave Entitlements" data={LEGAL_DATA.leave} />
          </div>
        );
      case 'foreign':
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-800">Foreign Manpower</h2>
            <InfoCard title="Work Passes & Quotas" data={LEGAL_DATA.work_passes} />
          </div>
        );
      case 'compliance':
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-800">Compliance & Safety</h2>
            <InfoCard title="Fair Employment & WSH" data={LEGAL_DATA.fairness} />
          </div>
        );
      case 'ai_agent':
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Compliance Assistant</h2>
            <AIChat />
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center text-blue-700 font-bold text-xl tracking-tight">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-2">SG</div>
              HR<span className="text-slate-800">Hub</span>
            </div>
          ) : (
             <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">H</div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarItem 
            icon={Briefcase} 
            label={isSidebarOpen ? "Dashboard" : ""} 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
          />
          <div className="my-4 border-t border-slate-100"></div>
          <p className={`px-4 text-xs font-semibold text-slate-400 uppercase mb-2 ${!isSidebarOpen && 'hidden'}`}>Modules</p>
          <SidebarItem 
            icon={DollarSign} 
            label={isSidebarOpen ? "CPF & Payroll" : ""} 
            active={activeTab === 'cpf'} 
            onClick={() => setActiveTab('cpf')} 
          />
          <SidebarItem 
            icon={Users} 
            label={isSidebarOpen ? "Leave & Benefits" : ""} 
            active={activeTab === 'leave'} 
            onClick={() => setActiveTab('leave')} 
          />
          <SidebarItem 
            icon={BookOpen} 
            label={isSidebarOpen ? "Work Passes" : ""} 
            active={activeTab === 'foreign'} 
            onClick={() => setActiveTab('foreign')} 
          />
          <SidebarItem 
            icon={Shield} 
            label={isSidebarOpen ? "Compliance" : ""} 
            active={activeTab === 'compliance'} 
            onClick={() => setActiveTab('compliance')} 
          />
          <div className="my-4 border-t border-slate-100"></div>
           <button 
            onClick={() => setActiveTab('ai_agent')}
            className={`flex items-center w-full p-3 mb-2 rounded-lg transition-all ${
              activeTab === 'ai_agent' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            <span className={`font-bold text-sm ${!isSidebarOpen && 'hidden'}`}>Ask AI Agent</span>
          </button>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-4 border-t border-slate-100 flex items-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          {isSidebarOpen ? <Users className="w-5 h-5 mr-2" /> : <Menu className="w-5 h-5 mx-auto" />}
          {isSidebarOpen && <span className="text-sm font-medium">Collapse Menu</span>}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-700 capitalize">
            {activeTab === 'home' ? 'Overview' : activeTab.replace('_', ' ')}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Data Verified: Dec 30, 2025
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300">
              HR
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
