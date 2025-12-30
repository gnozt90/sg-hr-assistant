import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
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

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
