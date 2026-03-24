import { profile } from '@/lib/profile';
import Button from '@/components/ui/Button';

export default function AboutPage() {
  const skills = {
    'AI/LLM': ['RAG', 'Prompt Engineering', 'Context Engineering', 'AI Agents', 'Agent Evaluation'],
    'Cloud & Infrastructure': ['AWS', 'Docker'],
    'ML/DL': ['PyTorch', 'Scikit-learn'],
    'Agent Frameworks': ['LangGraph', 'LangChain', 'LangSmith'],
    'Languages': ['Python', 'SQL'],
  };

  const experiences = [
    {
      company: 'Tenfold AI',
      link: 'https://tenfoldai.io/',
      role: 'AI / LLM Engineer',
      period: 'Apr 2025 – Present',
      location: 'Taipei, Taiwan',
      highlights: [
        'Led development of 3+ production AI agents (Agentic RAG, multi-turn conversational AI, document review workflow), driving the acquisition of the company\'s first paying customers',
        'Established end-to-end LLM evaluation pipeline: offline testing with LLM-generated QA datasets and LLM-as-a-Judge, improving RAG answer accuracy from 0.65 to 0.80; online production monitoring via LangSmith reducing error rate from 5% to <1%',
        'Applied Deep Agent architecture and Context Engineering across production agents with dynamic tool-call limits; combined with prompt caching to reduce API costs by 60–75%',
        'Built purpose-built AWS infrastructure for AI agents with CDK: automated multi-jurisdiction data pipelines and agent file system, enabling agents to autonomously operate on uploaded documents',
      ],
    },
    {
      company: 'E.SUN Bank',
      link: 'https://www.esunbank.com/zh-tw/about',
      role: 'Machine Learning Research Intern',
      period: 'Oct 2022 – Aug 2023',
      location: 'Taipei, Taiwan',
      highlights: [
        'Researched Self-Supervised Learning for feature extraction on structured financial time series data (10M+ transaction records)',
        'Designed SSL approaches combining denoising autoencoder with contrastive learning, achieving 91% improvement in feature utilization and 10% boost in downstream model performance',
        'Delivered two research presentations on findings',
      ],
    },
  ];

  const education = [
    {
      school: 'National Yang Ming Chiao Tung University',
      link: 'https://www.nycu.edu.tw/nycu/en/index',
      degree: 'M.S. in Information Management and Finance - Data Science Track',
      period: 'Sep 2022 – Jul 2024',
      gpa: '4.27 / 4.3',
      highlights: ['Academic Excellence Award Recipient', 'Coursework: Machine Learning, Deep Learning, Data Mining, NLP'],
    },
    {
      school: 'National Cheng Kung University',
      link: 'https://web.ncku.edu.tw/index.php?Lang=en',
      degree: 'B.S. in Transportation and Communication Management Science',
      period: 'Sep 2018 – Jun 2022',
      gpa: '3.3 / 4.3',
      highlights: [],
    },
  ];

  const publications = [
    {
      title: 'FairCDSR: Fairness-Aware Cross-Domain Sequential Recommendation via Multi-Interest Transfer and Contrastive Learning',
      venue: 'IEEE Transactions on Knowledge and Data Engineering (TKDE) | JCR Q1 | Impact Factor: 10.4',
      link: 'https://ieeexplore.ieee.org/document/11048721',
      highlights: [
        'Achieved 10% improvement in recommendation accuracy using Transformer-based cross-domain modeling',
        'Reduced demographic bias by 70% through novel transfer and contrastive learning techniques',
      ],
    },
  ];

  const achievements = [
    'Phi Tau Phi Scholastic Honor Society Member (Top 3% academic performance)',
    'AI CUP 2023 Honorable Mention: Top 10% (16th/150 teams) in Multimodal Pathological Voice Classification',
    'AWS Certified Developer – Associate (Jan 2026)',
  ];

  return (
    <div className="container py-16 animate-fade-in">
      <div className="max-w-3xl">
        {/* Page Header */}
        <p className="section-label mb-4">About</p>
        <h1 className="text-4xl sm:text-5xl font-display font-medium mb-16 text-ink dark:text-ink-dark">
          About Me
        </h1>

        {/* Interests Section */}
        <section className="mb-16">
          <p className="section-label mb-6">Interests</p>
          <h3 className="font-display text-2xl font-medium text-ink dark:text-ink-dark mb-2">
            Photography
          </h3>
          <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary leading-relaxed">
            I enjoy capturing natural scenery, street life, and people — finding beauty in everyday moments.
          </p>
        </section>

        <div className="h-px bg-border dark:bg-border-dark mb-16" />

        {/* Experience Section */}
        <section className="mb-16">
          <p className="section-label mb-8">Experience</p>
          <div className="space-y-0 divide-y divide-border dark:divide-border-dark">
            {experiences.map((exp, index) => (
              <div key={index} className="py-8 first:pt-0 last:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                  <h3 className="font-display text-2xl font-medium text-ink dark:text-ink-dark">
                    <a href={exp.link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-border dark:decoration-border-dark hover:decoration-ink dark:hover:decoration-ink-dark transition-colors">
                      {exp.company}
                    </a>
                  </h3>
                  <span className="text-xs font-medium uppercase tracking-label text-ink-muted whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>
                <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary mb-1">
                  {exp.role}
                </p>
                <p className="text-xs text-ink-muted mb-4">{exp.location}</p>
                <ul className="space-y-2">
                  {exp.highlights.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-ink-secondary dark:text-ink-dark-secondary pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-px before:bg-ink-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-border dark:bg-border-dark mb-16" />

        {/* Education Section */}
        <section className="mb-16">
          <p className="section-label mb-8">Education</p>
          <div className="space-y-0 divide-y divide-border dark:divide-border-dark">
            {education.map((edu, index) => (
              <div key={index} className="py-8 first:pt-0 last:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                  <h3 className="font-display text-2xl font-medium text-ink dark:text-ink-dark">
                    <a href={edu.link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-border dark:decoration-border-dark hover:decoration-ink dark:hover:decoration-ink-dark transition-colors">
                      {edu.school}
                    </a>
                  </h3>
                  <span className="text-xs font-medium uppercase tracking-label text-ink-muted whitespace-nowrap">
                    {edu.period}
                  </span>
                </div>
                <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary">
                  {edu.degree}
                </p>
                {edu.gpa && (
                  <p className="text-sm text-ink-muted mt-1">
                    GPA: {edu.gpa}
                  </p>
                )}
                {edu.highlights.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {edu.highlights.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-ink-secondary dark:text-ink-dark-secondary pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-px before:bg-ink-muted"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-border dark:bg-border-dark mb-16" />

        {/* Publications Section */}
        <section className="mb-16">
          <p className="section-label mb-8">Publications</p>
          <div className="space-y-0 divide-y divide-border dark:divide-border-dark">
            {publications.map((pub, index) => (
              <div key={index} className="py-8 first:pt-0 last:pb-0">
                <a
                  href={pub.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-2xl font-medium text-ink dark:text-ink-dark hover:opacity-60 transition-opacity"
                >
                  {pub.title}
                </a>
                <p className="text-xs text-ink-muted mt-2">{pub.venue}</p>
                <ul className="mt-4 space-y-1.5">
                  {pub.highlights.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-ink-secondary dark:text-ink-dark-secondary pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-px before:bg-ink-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-border dark:bg-border-dark mb-16" />

        {/* Achievements Section */}
        <section className="mb-16">
          <p className="section-label mb-8">Achievements & Certifications</p>
          <ul className="space-y-2.5">
            {achievements.map((item, index) => (
              <li
                key={index}
                className="text-ink-secondary dark:text-ink-dark-secondary pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-px before:bg-ink-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="h-px bg-border dark:bg-border-dark mb-16" />

        {/* Skills Section */}
        <section className="mb-16">
          <p className="section-label mb-6">Technical Skills</p>
          <div className="space-y-5">
            {Object.entries(skills).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold font-sans text-ink dark:text-ink-dark mb-2.5">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span key={skill} className="tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resume Download */}
        <Button href="/resume.pdf" className="gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download Resume
        </Button>
      </div>
    </div>
  );
}
