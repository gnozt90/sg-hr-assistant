const FALLBACK_SOURCES = [
  {
    name: "JobStreet",
    searchUrl: (query) =>
      `https://www.jobstreet.com.sg/en/job-search/${encodeURIComponent(query)}-jobs/`,
  },
  {
    name: "MyCareersFuture",
    searchUrl: (query) =>
      `https://www.mycareersfuture.gov.sg/search?search=${encodeURIComponent(query)}`,
  },
  {
    name: "Seek",
    searchUrl: (query) =>
      `https://www.seek.com.sg/jobs?keywords=${encodeURIComponent(query)}`,
  },
  {
    name: "LinkedIn",
    searchUrl: (query) =>
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`,
  },
];

function formatSalary(min, max, currency) {
  const minValue = typeof min === "number" ? min : Number(min);
  const maxValue = typeof max === "number" ? max : Number(max);
  const hasMin = Number.isFinite(minValue);
  const hasMax = Number.isFinite(maxValue);
  if (!hasMin && !hasMax) return "";
  const parts = [];
  if (hasMin) parts.push(minValue.toLocaleString());
  if (hasMax) parts.push(maxValue.toLocaleString());
  const range = parts.join(" - ");
  return currency ? `${currency} ${range}` : range;
}

async function fetchAdzuna(query) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    return { jobs: [], error: "Adzuna credentials not configured." };
  }

  const url = new URL("https://api.adzuna.com/v1/api/jobs/sg/search/1");
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("what", query);
  url.searchParams.set("results_per_page", "25");
  url.searchParams.set("content-type", "application/json");

  const response = await fetch(url);
  if (!response.ok) {
    return { jobs: [], error: `Adzuna error: ${response.status}` };
  }
  const data = await response.json();
  const jobs = (data.results || []).map((job) => ({
    id: `adzuna-${job.id}`,
    title: job.title,
    company: job.company?.display_name || "Unknown",
    location: job.location?.display_name || "Singapore",
    postedAt: job.created,
    salary: formatSalary(job.salary_min, job.salary_max, job.salary_currency),
    source: job.category?.label || "Adzuna",
    applyUrl: job.redirect_url,
  }));
  return { jobs, error: null };
}

async function fetchJSearch(query) {
  const apiKey = process.env.RAPIDAPI_JSEARCH_KEY;
  const apiHost = process.env.RAPIDAPI_JSEARCH_HOST || "jsearch.p.rapidapi.com";
  if (!apiKey) {
    return { jobs: [], error: "JSearch credentials not configured." };
  }

  const url = new URL(`https://${apiHost}/search`);
  url.searchParams.set("query", `${query} in Singapore`);
  url.searchParams.set("page", "1");
  url.searchParams.set("num_pages", "1");

  const response = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": apiHost,
    },
  });
  if (!response.ok) {
    return { jobs: [], error: `JSearch error: ${response.status}` };
  }
  const data = await response.json();
  const jobs = (data.data || []).map((job) => ({
    id: `jsearch-${job.job_id}`,
    title: job.job_title,
    company: job.employer_name || "Unknown",
    location: [job.job_city, job.job_state, job.job_country]
      .filter(Boolean)
      .join(", "),
    postedAt: job.job_posted_at_datetime_utc,
    salary: formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency),
    source: job.job_publisher || "JSearch",
    applyUrl: job.job_apply_link,
  }));
  return { jobs, error: null };
}

export async function fetchJobs(query) {
  const sources = FALLBACK_SOURCES.map((source) => ({
    name: source.name,
    searchUrl: source.searchUrl(query),
  }));

  const providers = [
    { name: "Adzuna", fetcher: fetchAdzuna },
    { name: "JSearch", fetcher: fetchJSearch },
  ];

  const jobs = [];
  const errors = [];

  for (const provider of providers) {
    try {
      const result = await provider.fetcher(query);
      jobs.push(...result.jobs);
      if (result.error) {
        errors.push({ source: provider.name, message: result.error });
      }
    } catch (error) {
      errors.push({ source: provider.name, message: error.message });
    }
  }

  return {
    jobs,
    sources,
    errors,
  };
}
