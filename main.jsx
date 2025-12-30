import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Briefcase,
  Shield,
  Users,
  Search,
  MessageSquare,
  BookOpen,
  Menu,
  ExternalLink,
  Globe,
  PlusCircle,
  Phone,
  Mail,
  Sparkles,
  Send,
  MapPin,
  Clock,
  Zap
} from 'lucide-react';
import { HRAgent } from './agent';

// --- DATA & CONFIG ---

const API_BASE = import.meta.env.VITE_API_BASE || "";

const JOB_SOURCES = [
  { name: "MyCareersFuture", searchUrl: "https://www.mycareersfuture.gov.sg/search?search=", color: "bg-blue-600", desc: "Official SG Govt Portal" },
  { name: "JobStreet", searchUrl: "https://www.jobstreet.com.sg/en/job-search/", suffix: "-jobs/", color: "bg-yellow-500", text: "text-black", desc: "Popular Commercial Board" },
  { name: "Seek", searchUrl: "https://www.seek.com.sg/jobs?keywords=", color: "bg-pink-600", desc: "International Network" },
  { name: "LinkedIn", searchUrl: "https://www.linkedin.com/jobs/search/?keywords=", color: "bg-blue-800", desc: "Professional Network" },
  { name: "Glints", searchUrl: "https://glints.com/sg/opportunities/jobs/explore?keyword=", color: "bg-red-500", desc: "Tech & Startups" },
  { name: "Foundit", searchUrl: "https://www.foundit.sg/srp/results?query=", color: "bg-purple-600", desc: "Formerly Monster" }
];

const PART_TIME_PLATFORMS = [
  { name: "FastGig", url: "https://www.fastgig.sg", color: "bg-orange-500", desc: "Flexible Shifts" },
  { name: "GrabJobs", url: "https://grabjobs.co/singapore/part-time-jobs", color: "bg-green-500", desc: "Quick Hire" },
  { name: "Staffie", url: "https://staffie.com", color: "bg-purple-500", desc: "F&B & Events" },
  { name: "Gumtree", url: "https://www.gumtree.sg/s-part-time-jobs/v1c28p1", color: "bg-green-800", desc: "Classifieds" },
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
  const [sources, setSources] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [apiErrors, setApiErrors] = useState([]);

  const getSourceBadge = (sourceName) => {
    const source = JOB_SOURCES.find(
      (item) => item.name.toLowerCase() === String(sourceName || "").toLowerCase()
    );
    return source ? `${source.color} ${source.text || ""}` : "bg-slate-600";
  };

  const getFallbackSources = () =>
    JOB_SOURCES.map((source) => ({
      name: source.name,
      searchUrl: `${source.searchUrl}${encodeURIComponent(query)}${source.suffix || ""}`,
    }));

  const fetchJobs = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setHasSearched(true);
    setError("");
    setApiErrors([]);

    try {
      const response = await fetch(
        `${API_BASE}/api/jobs?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`Job search failed (${response.status})`);
      }
      const data = await response.json();
      setResults(data.jobs || []);
      setSources(data.sources || []);
      setApiErrors(data.errors || []);
    } catch (err) {
      setError(err.message || "Unable to fetch jobs.");
      setResults([]);
      setSources([]);
    } finally {
      setSearching(false);
    }
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
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
          />
          <button onClick={fetchJobs} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 rounded-xl shadow-lg">Search</button>
        </div>
      </div>

      {searching ? (
        <div className="text-center py-20 text-slate-500">Searching across job boards...</div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {apiErrors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-3 rounded-lg">
              {apiErrors.map((item, idx) => (
                <div key={idx}>{item.source}: {item.message}</div>
              ))}
            </div>
          )}
          {results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((job) => (
                <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{job.title}</h3>
                    <div className="text-sm text-slate-600">
                      {job.company} • {job.location}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      {job.salary && <span>{job.salary}</span>}
                      {job.postedAt && <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase mt-2 inline-block ${getSourceBadge(job.source)}`}>
                      {job.source || "Job Board"}
                    </span>
                  </div>
                  <a href={job.applyUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-sm border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50">Apply</a>
                </div>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-600 text-sm">
              <p className="font-semibold text-slate-800 mb-3">No jobs returned yet.</p>
              <p className="mb-4">You can also open the live results directly on each job site:</p>
              <div className="flex flex-wrap gap-2">
                {(sources.length > 0 ? sources : getFallbackSources()).map((source) => (
                  <a key={source.name} href={source.searchUrl} target="_blank" rel="noreferrer" className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center">
                    {source.name} <ExternalLink className="w-3 h-3 ml-2 opacity-60" />
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-600 text-sm">
              <p className="font-semibold text-slate-800 mb-2">Start searching to see live results.</p>
              <p>Tip: Try role titles like "HR executive", "barista", or "software engineer".</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- PART TIME JOBS COMPONENT ---
const PartTimeJobSearch = () => {
  const JOBS = [
    { id: 1, title: "Banquet Server", pay: "$12 - $15/hr", location: "Orchard", type: "Ad-hoc" },
    { id: 2, title: "Retail Assistant", pay: "$10/hr", location: "Jurong East", type: "Shift" },
    { id: 3, title: "Event Crew", pay: "$14/hr", location: "Marina Bay", type: "Weekend" },
    { id: 4, title: "Warehouse Packer", pay: "$11/hr", location: "Changi", type: "Night Shift" },
    { id: 5, title: "Data Entry", pay: "$12/hr", location: "Remote", type: "Contract" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
       <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 rounded-2xl shadow-xl text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center"><Clock className="w-6 h-6 mr-2" /> Part-Time & Gig Hub</h2>
          <p className="text-emerald-100 mb-6">Find flexible shifts, weekend gigs, and ad-hoc work in Singapore.</p>
          
          <div className="flex flex-wrap gap-2">
            {PART_TIME_PLATFORMS.map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center">
                    {p.name} <ExternalLink className="w-3 h-3 ml-2 opacity-50"/>
                </a>
            ))}
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {JOBS.map(job => (
              <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800">{job.title}</h3>
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">{job.type}</span>
                  </div>
                  <div className="flex items-center text-slate-500 text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1"/> {job.location}
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                      <span className="font-bold text-lg text-slate-700">{job.pay}</span>
                      <button className="text-emerald-600 font-bold text-sm hover:underline">View Details</button>
                  </div>
              </div>
          ))}
       </div>
    </div>
  );
};

// --- PART TIME POSTING BOARD ---
const PartTimeBoard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    title: "",
    pay: "",
    location: "",
    schedule: "",
    description: "",
    contactName: "",
    contactMethod: "email",
    contactValue: "",
  });

  const loadPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/part-time`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      setError("Unable to load part-time posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const getContactHref = (method, value) => {
    const trimmed = value.trim();
    if (method === "phone") return `tel:${trimmed}`;
    if (method === "whatsapp") return `https://wa.me/${trimmed.replace(/\D/g, "")}`;
    return `mailto:${trimmed}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.title.trim() || !form.pay.trim() || !form.location.trim() || !form.contactValue.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/part-time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        throw new Error("Unable to post job.");
      }
      const data = await response.json();
      setPosts((prev) => [data.post, ...prev]);
      setForm({
        title: "",
        pay: "",
        location: "",
        schedule: "",
        description: "",
        contactName: "",
        contactMethod: "email",
        contactValue: "",
      });
      setNotice("Your post is live. Thanks for contributing!");
    } catch (err) {
      setError(err.message || "Unable to post job.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 rounded-2xl shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <PlusCircle className="w-6 h-6 mr-2" /> Post a Part-Time Role
        </h2>
        <p className="text-amber-100">
          Share flexible shifts with the community and connect directly with candidates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800">New Job Posting</h3>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          {notice && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{notice}</div>}
          <div>
            <label className="text-xs font-semibold text-slate-600">Job Title *</label>
            <input
              className="mt-1 w-full p-3 border border-slate-200 rounded-lg"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Cafe Assistant"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Pay / Rate *</label>
              <input
                className="mt-1 w-full p-3 border border-slate-200 rounded-lg"
                value={form.pay}
                onChange={(e) => setForm((prev) => ({ ...prev, pay: e.target.value }))}
                placeholder="$12 - $16/hr"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Location *</label>
              <input
                className="mt-1 w-full p-3 border border-slate-200 rounded-lg"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Bugis"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Schedule</label>
            <input
              className="mt-1 w-full p-3 border border-slate-200 rounded-lg"
              value={form.schedule}
              onChange={(e) => setForm((prev) => ({ ...prev, schedule: e.target.value }))}
              placeholder="Weekends, 6pm - 11pm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Description</label>
            <textarea
              className="mt-1 w-full p-3 border border-slate-200 rounded-lg min-h-[120px]"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Responsibilities, dress code, and requirements."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Contact Name</label>
              <input
                className="mt-1 w-full p-3 border border-slate-200 rounded-lg"
                value={form.contactName}
                onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))}
                placeholder="Hiring Manager"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Contact Method *</label>
              <select
                className="mt-1 w-full p-3 border border-slate-200 rounded-lg bg-white"
                value={form.contactMethod}
                onChange={(e) => setForm((prev) => ({ ...prev, contactMethod: e.target.value }))}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Contact Details *</label>
            <input
              className="mt-1 w-full p-3 border border-slate-200 rounded-lg"
              value={form.contactValue}
              onChange={(e) => setForm((prev) => ({ ...prev, contactValue: e.target.value }))}
              placeholder="name@email.com or +6591234567"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg"
            disabled={saving}
          >
            {saving ? "Posting..." : "Publish Job"}
          </button>
        </form>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Latest Community Posts</h3>
              <p className="text-sm text-slate-500">Connect directly with employers.</p>
            </div>
            <div className="flex items-center text-xs text-slate-500">
              <Clock className="w-4 h-4 mr-1" />
              Updated live
            </div>
          </div>

          {loading ? (
            <div className="text-center text-slate-500 py-10">Loading posts...</div>
          ) : (
            <div className="space-y-4">
              {posts.length === 0 && (
                <div className="text-center text-slate-500 py-10 bg-white rounded-xl border border-slate-200">
                  No posts yet. Be the first to share a role!
                </div>
              )}
              {posts.map((post) => (
                <div key={post.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">{post.title}</h4>
                      <div className="text-sm text-slate-500">{post.location} • {post.pay}</div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {post.schedule && <div className="text-xs text-slate-500 mt-2">Schedule: {post.schedule}</div>}
                  {post.description && <p className="text-sm text-slate-600 mt-3">{post.description}</p>}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="text-xs text-slate-500">
                      {post.contactName ? `Contact: ${post.contactName}` : "Contact available"}
                    </div>
                    <a
                      href={getContactHref(post.contactMethod, post.contactValue)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center text-sm font-bold text-amber-700 hover:underline"
                    >
                      {post.contactMethod === "email" && <Mail className="w-4 h-4 mr-1" />}
                      {post.contactMethod === "phone" && <Phone className="w-4 h-4 mr-1" />}
                      {post.contactMethod === "whatsapp" && <MessageSquare className="w-4 h-4 mr-1" />}
                      Contact
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- LIVELY AI CHAT COMPONENT (OPENAI BACKEND) ---
const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'agent', content: "Hello! 👋 I'm your HR Assistant.\n\nAsk me about SG HR rules, CPF, leave, or hiring. I can switch between **OpenAI** (online) and offline mode." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [useRealAI, setUseRealAI] = useState(false);
  const quickPrompts = [
    "What are the 2025 CPF contribution rates?",
    "Summarize parental leave updates.",
    "How do I handle wrongful dismissal?",
    "What is COMPASS for EP applications?",
  ];
  
  const scrollRef = useRef(null);
  const agentRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // Initialize Real Agent when toggled on
  useEffect(() => {
    if (useRealAI) {
      agentRef.current = new HRAgent(API_BASE);
    }
  }, [useRealAI]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    if (useRealAI && agentRef.current) {
        const response = await agentRef.current.chat(userMsg.content, [...messages, userMsg]);
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
                    {useRealAI ? "⚡ Power: OpenAI (Server)" : "🔋 Power: Offline Rules"}
                </p>
            </div>
            </div>
            <button onClick={() => setMessages([messages[0]])} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded">Clear</button>
        </div>
        
        {/* MODEL TOGGLE */}
        <div className="flex items-center text-xs bg-black/20 p-2 rounded-lg">
            <label className="flex items-center cursor-pointer select-none">
                <div className="relative">
                    <input type="checkbox" className="sr-only" checked={useRealAI} onChange={() => setUseRealAI(!useRealAI)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${useRealAI ? 'bg-green-400' : 'bg-slate-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useRealAI ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <div className="ml-3 font-medium">
                    {useRealAI ? "Online Agent (OpenAI)" : "Offline Mode"}
                </div>
            </label>
        </div>
      </div>

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

      <div className="p-4 bg-white border-t border-slate-100 space-y-3">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full"
            >
              {prompt}
            </button>
          ))}
        </div>
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
              
              <button onClick={() => setActiveTab('part_time')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left group">
                <div className="text-emerald-600 bg-emerald-50 w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Clock className="w-5 h-5" /></div>
                <h3 className="font-bold text-slate-800 mb-2">Part-Time & Gigs</h3>
                <p className="text-sm text-slate-500">Find flexible shifts, ad-hoc jobs, and weekend work.</p>
              </button>

              <button onClick={() => setActiveTab('part_time_board')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left group">
                <div className="text-amber-600 bg-amber-50 w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><PlusCircle className="w-5 h-5" /></div>
                <h3 className="font-bold text-slate-800 mb-2">Post Part-Time Jobs</h3>
                <p className="text-sm text-slate-500">Let the community apply directly with one click.</p>
              </button>

              <button onClick={() => setActiveTab('leave')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left group">
                <div className="text-purple-600 bg-purple-50 w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Shield className="w-5 h-5" /></div>
                <h3 className="font-bold text-slate-800 mb-2">2025 Compliance</h3>
                <p className="text-sm text-slate-500">Check new Paternity Leave and Workplace Fairness rules.</p>
              </button>

              <button onClick={() => setActiveTab('ai_agent')} className="bg-gradient-to-br from-indigo-50 to-violet-50 p-6 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-all text-left group relative overflow-hidden md:col-span-3">
                <div className="absolute top-0 right-0 p-2"><Sparkles className="w-12 h-12 text-indigo-100" /></div>
                <div className="text-indigo-600 bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><MessageSquare className="w-5 h-5" /></div>
                <h3 className="font-bold text-indigo-900 mb-2">Ask AI Agent</h3>
                <p className="text-sm text-indigo-700">Powered by Google Gen AI SDK. Ask about anything.</p>
              </button>
            </div>
          </div>
        );
      case 'jobs': return <JobSearch />;
      case 'part_time': return <PartTimeJobSearch />;
      case 'part_time_board': return <PartTimeBoard />;
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
          <SidebarItem icon={Clock} label={isSidebarOpen ? "Part-Time / Gigs" : ""} active={activeTab === 'part_time'} onClick={() => setActiveTab('part_time')} />
          <SidebarItem icon={PlusCircle} label={isSidebarOpen ? "Post Part-Time" : ""} active={activeTab === 'part_time_board'} onClick={() => setActiveTab('part_time_board')} />
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
