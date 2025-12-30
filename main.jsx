import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  Briefcase, DollarSign, Shield, Users, Search, MessageSquare, 
  BookOpen, AlertCircle, CheckCircle, Menu, X, ChevronDown, 
  ChevronRight, ExternalLink, Globe, PlusCircle, Phone, Mail, 
  Sparkles, Send, MapPin, Clock 
} from 'lucide-react';

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
      { topic: "Senior Worker Rates", fact: "Rates increased by 1.5% for ages 55-65 from Jan 1, 2025.", details: "To boost retirement adequacy, contribution rates for senior workers have been raised." },
      { topic: "Special Account (SA) Closure", fact: "SA is closed for members aged 55 and above from Jan 2025.", details: "Savings transferred to Retirement Account (RA) up to Full Retirement Sum, remainder to Ordinary Account (OA)." }
    ]
  },
  leave: {
    title: "Leave Entitlements",
    source: "MOM / MSF",
    url: "https://www.mom.gov.sg/employment-practices/leave",
    content: [
      { topic: "Paternity Leave", fact: "4 Weeks Mandatory (Government-Paid).", details: "Effective April 1, 2025, Government-Paid Paternity Leave (GPPL) increased from 2 weeks to 4 weeks on a mandatory basis." },
      { topic: "Shared Parental Leave", fact: "New scheme: 6 weeks shared leave (from April 1, 2025).", details: "Replaces the old sharing scheme. Parents can share 6 weeks of Government-Paid leave. Increases to 10 weeks in 2026." },
      { topic: "Maternity Leave", fact: "16 Weeks (Government-Paid).", details: "For Singapore Citizen children. Standard protection against dismissal applies during pregnancy and leave." },
      { topic: "Childcare Leave", fact: "6 days per year (for citizens < 7 years old).", details: "Paid by Government (days 4-6) and Employer (days 1-3)." }
    ]
  },
  work_passes: {
    title: "Foreign Manpower (EP/S Pass)",
    source: "MOM",
    url: "https://www.mom.gov.sg/passes-and-permits",
    content: [
      { topic: "Employment Pass (EP) Salary", fact: "$5,600 (General) / $6,200 (Financial Services).", details: "New qualifying salary threshold effective Jan 1, 2025 for new applications. Older candidates require higher salaries." },
      { topic: "COMPASS Framework", fact: "All EP applications must pass COMPASS.", details: "Points-based system scoring Salary, Qualifications, Diversity, and Support for Local Employment. Pass mark is 40 points." },
      { topic: "S Pass Qualifying Salary", fact: "$3,150 (General).", details: "Subject to quota (Tier 1: 10% of workforce in Services)." }
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

// --- HELPER FUNCTIONS ---

const findAnswer = (query) => {
  const q = query.toLowerCase();
  
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
        answer: `I found this for you! 🤓\n\n**${data.fact}**\n\n${data.details}`,
        source: LEGAL_DATA[k.section].source,
        url: LEGAL_DATA[k.section].url,
        confidence: "High"
      };
    }
  }

  return {
    answer: "That's a good question! 🤔\n\nHowever, I can't find a specific verified government source for that in my 2025 database. It might be best to check the Ministry of Manpower (MOM) website directly for the most complex cases.",
    source: "System",
    url: "https://www.mom.gov.sg",
    confidence: "Low"
  };
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
      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
        <a href={data.url} target="_blank" rel="noreferrer" className="text-xs flex items-center text-blue-500 hover:text-blue-700 font-medium">
          Source: {data.source} <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
    </div>
  </div>
);

// --- 1. JOB SEARCH COMPONENT ---
const JobSearch = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (platform) => {
    if (!query.trim()) {
      alert("Please enter a job title first!");
      return;
    }
    const searchUrl = platform.suffix 
      ? `${platform.url}${encodeURIComponent(query)}${platform.suffix}` 
      : `${platform.url}${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-2xl shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Globe className="w-6 h-6 mr-2" /> 
          SG Job Aggregator
        </h2>
        <p className="text-blue-100 mb-6 max-w-2xl">
          Search once, find everywhere. Enter your desired role below to instantly generate search results across Singapore's top job portals.
        </p>
        <div className="relative max-w-xl">
          <input
            type="text"
            className="w-full p-4 pl-12 rounded-xl text-slate-800 focus:ring-4 focus:ring-blue-400 outline-none shadow-lg"
            placeholder="e.g. HR Manager, Python Developer, Admin Assistant..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(JOB_PLATFORMS[0])}
          />
          <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {JOB_PLATFORMS.map((platform, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
            <div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3 ${platform.color} ${platform.text || ''}`}>
                {platform.name}
              </div>
              <p className="text-sm text-slate-500 mb-4">{platform.desc}</p>
            </div>
            <button 
              onClick={() => handleSearch(platform)}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 flex items-center justify-center transition-colors"
            >
              Search on {platform.name} <ExternalLink className="w-3 h-3 ml-2" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 2. PART-TIME JOB BOARD COMPONENT ---
const PartTimeBoard = () => {
  const [jobs, setJobs] = useState([
    { id: 1, title: "Weekend Events Packer", company: "LogiHub SG", rate: "$12 - $14 / hr", location: "Jurong East", type: "Ad-hoc", contact: "91234567", contactType: "phone" },
    { id: 2, title: "Banquet Server", company: "Grand Marina Hotel", rate: "$15 / hr", location: "City Hall", type: "Weekends", contact: "hr@grandmarina.sg", contactType: "email" },
    { id: 3, title: "Data Entry Admin", company: "FinTech Corp", rate: "$10 / hr", location: "Remote / CBD", type: "Contract", contact: "98765432", contactType: "phone" }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", company: "", rate: "", location: "", contact: "", contactType: "phone" });

  const handlePost = (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.contact) return;
    setJobs([{ ...newJob, id: Date.now(), type: "New Post" }, ...jobs]);
    setShowForm(false);
    setNewJob({ title: "", company: "", rate: "", location: "", contact: "", contactType: "phone" });
  };

  const getContactLink = (job) => {
    if (job.contactType === 'email') return `mailto:${job.contact}`;
    return `tel:${job.contact}`; // Or whatsapp URL
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Part-Time Board</h2>
          <p className="text-slate-500 text-sm">Community board for ad-hoc, contract, and weekend jobs.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "Post a Job"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handlePost} className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 shadow-inner space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Job Title (e.g. Packer)" className="p-2 rounded border" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} required />
            <input placeholder="Company Name" className="p-2 rounded border" value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} />
            <input placeholder="Rate (e.g. $12/hr)" className="p-2 rounded border" value={newJob.rate} onChange={e => setNewJob({...newJob, rate: e.target.value})} />
            <input placeholder="Location" className="p-2 rounded border" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
            <div className="flex gap-2">
              <select className="p-2 rounded border" value={newJob.contactType} onChange={e => setNewJob({...newJob, contactType: e.target.value})}>
                <option value="phone">Phone/WhatsApp</option>
                <option value="email">Email</option>
              </select>
              <input placeholder="Contact Info" className="p-2 rounded border flex-1" value={newJob.contact} onChange={e => setNewJob({...newJob, contact: e.target.value})} required />
            </div>
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg w-full font-bold">Post Listing</button>
          <p className="text-xs text-center text-emerald-600 italic">Note: Listings are temporary for this demo session.</p>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center hover:border-emerald-300 transition-colors">
            <div className="mb-4 md:mb-0">
              <h3 className="font-bold text-lg text-slate-800">{job.title}</h3>
              <p className="text-slate-600 text-sm font-medium">{job.company} • <span className="text-emerald-600">{job.rate}</span></p>
              <div className="flex gap-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {job.location}</span>
                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {job.type}</span>
              </div>
            </div>
            <a 
              href={getContactLink(job)}
              className={`px-5 py-2 rounded-lg font-medium text-sm flex items-center shadow-sm ${
                job.contactType === 'email' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {job.contactType === 'email' ? <Mail className="w-4 h-4 mr-2" /> : <Phone className="w-4 h-4 mr-2" />}
              Connect
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 3. LIVELY AI CHAT COMPONENT ---
const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'agent', content: "Hello! 👋 I'm your HR Assistant.\n\nI'm updated with the latest **2025 Regulations**! Ask me about:\n✨ New Paternity Leave\n✨ CPF Rates\n✨ Workplace Fairness Act" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = findAnswer(userMsg.content);
      setMessages(prev => [...prev, { role: 'agent', content: response.answer, source: response.source, url: response.url }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 h-[600px] flex flex-col overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-between text-white">
        <div className="flex items-center">
          <div className="p-2 bg-white/20 rounded-full mr-3">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h3 className="font-bold">HR Assistant AI</h3>
            <p className="text-[10px] text-blue-100 uppercase tracking-wider">Online • Updated 2025</p>
          </div>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded">Clear</button>
      </div>

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
              {m.role === 'agent' && m.source && m.source !== "System" && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Source: {m.source}</span>
                  <a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-violet-600 hover:underline flex items-center">
                    Verify <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
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

const CPFCalculator = () => {
  const [wage, setWage] = useState(5000);
  const [ageGroup, setAgeGroup] = useState('lte55');
  const CEILING = 7400; 
  
  const calculate = () => {
    const applicableWage = Math.min(wage, CEILING);
    let rates = { emp: 0.20, comp: 0.17 };
    if (ageGroup === '55to60') rates = { emp: 0.16, comp: 0.155 };
    if (ageGroup === '60to65') rates = { emp: 0.115, comp: 0.12 };
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
            <input type="number" value={wage} onChange={(e) => setWage(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none font-mono" />
            <p className="text-xs text-slate-400 mt-1">2025 Ceiling Cap: ${CEILING.toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Age Group</label>
            <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="lte55">55 and below</option>
              <option value="55to60">Above 55 to 60</option>
              <option value="60to65">Above 60 to 65</option>
              <option value="gt65">Above 65</option>
            </select>
          </div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center text-sm"><span className="text-slate-600">Employee Share (Deducted):</span><span className="font-bold text-slate-800 font-mono">${result.employee.toFixed(2)}</span></div>
          <div className="flex justify-between items-center text-sm"><span className="text-slate-600">Employer Share (Added):</span><span className="font-bold text-slate-800 font-mono">${result.employer.toFixed(2)}</span></div>
          <div className="border-t border-emerald-200 pt-3 flex justify-between items-center"><span className="text-emerald-800 font-bold">Total Contribution:</span><span className="font-bold text-emerald-700 font-mono text-lg">${result.total.toFixed(2)}</span></div>
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
                Your one-stop platform for compliance, payroll, and job hunting in Singapore. 
                Updated for 2025 regulations including the new CPF Ceiling ($7,400).
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveTab('ai_agent')} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-medium flex items-center transition-colors">
                  <MessageSquare className="w-4 h-4 mr-2" /> Ask AI Agent
                </button>
                <button onClick={() => setActiveTab('jobs')} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center">
                  <Search className="w-4 h-4 mr-2" /> Find Jobs
                </button>
              </div>
            </div>
            
            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button onClick={() => setActiveTab('jobs')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left group">
                <div className="text-blue-600 bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Job Search Hub</h3>
                <p className="text-sm text-slate-500">Search across JobStreet, CareersFuture, and LinkedIn in one click.</p>
              </button>

              <button onClick={() => setActiveTab('parttime')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left group">
                <div className="text-emerald-600 bg-emerald-50 w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Part-Time Board</h3>
                <p className="text-sm text-slate-500">Post and find ad-hoc or weekend jobs. Connect instantly.</p>
              </button>

              <button onClick={() => setActiveTab('leave')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left group">
                <div className="text-purple-600 bg-purple-50 w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">2025 Compliance</h3>
                <p className="text-sm text-slate-500">Check new Paternity Leave and Workplace Fairness rules.</p>
              </button>
            </div>
          </div>
        );
      case 'jobs':
        return <JobSearch />;
      case 'parttime':
        return <PartTimeBoard />;
      case 'cpf':
        return <div className="space-y-6 animate-fadeIn"><h2 className="text-2xl font-bold text-slate-800">CPF & Payroll</h2><CPFCalculator /><InfoCard title="Latest CPF Regulations" data={LEGAL_DATA.cpf} /></div>;
      case 'leave':
        return <div className="space-y-6 animate-fadeIn"><h2 className="text-2xl font-bold text-slate-800">Leave & Time Off</h2><InfoCard title="Statutory Leave Entitlements" data={LEGAL_DATA.leave} /></div>;
      case 'foreign':
        return <div className="space-y-6 animate-fadeIn"><h2 className="text-2xl font-bold text-slate-800">Foreign Manpower</h2><InfoCard title="Work Passes & Quotas" data={LEGAL_DATA.work_passes} /></div>;
      case 'compliance':
        return <div className="space-y-6 animate-fadeIn"><h2 className="text-2xl font-bold text-slate-800">Compliance & Safety</h2><InfoCard title="Fair Employment & WSH" data={LEGAL_DATA.fairness} /></div>;
      case 'ai_agent':
        return <div className="space-y-6 animate-fadeIn"><h2 className="text-2xl font-bold text-slate-800 mb-4">Compliance Assistant</h2><AIChat /></div>;
      default:
        return <div>Select a tab</div>;
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
          {isSidebarOpen && <p className="px-4 text-xs font-semibold text-slate-400 uppercase mb-2">Connect</p>}
          
          <SidebarItem icon={Search} label={isSidebarOpen ? "Job Search" : ""} active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} />
          <SidebarItem icon={DollarSign} label={isSidebarOpen ? "Part-Time Board" : ""} active={activeTab === 'parttime'} onClick={() => setActiveTab('parttime')} />
          
          <div className="my-4 border-t border-slate-100"></div>
          {isSidebarOpen && <p className="px-4 text-xs font-semibold text-slate-400 uppercase mb-2">Compliance</p>}
          
          <SidebarItem icon={Shield} label={isSidebarOpen ? "CPF & Payroll" : ""} active={activeTab === 'cpf'} onClick={() => setActiveTab('cpf')} />
          <SidebarItem icon={Users} label={isSidebarOpen ? "Leave & Benefits" : ""} active={activeTab === 'leave'} onClick={() => setActiveTab('leave')} />
          <SidebarItem icon={BookOpen} label={isSidebarOpen ? "Work Passes" : ""} active={activeTab === 'foreign'} onClick={() => setActiveTab('foreign')} />
          
          <div className="mt-auto pt-4">
           <button onClick={() => setActiveTab('ai_agent')} className={`flex items-center w-full p-3 mb-2 rounded-lg transition-all ${activeTab === 'ai_agent' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'bg-violet-50 text-violet-700 hover:bg-violet-100'}`}>
            <MessageSquare className="w-5 h-5 mr-3" />
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
            <span className="text-xs font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" /> Verified: Dec 30, 2025
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300">HR</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8"><div className="max-w-6xl mx-auto">{renderContent()}</div></main>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
