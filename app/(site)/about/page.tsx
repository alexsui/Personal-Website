import { getAboutSections } from '@/lib/db/about';
import { getProfile } from '@/lib/db/profile';
import { DbAboutSection } from '@/lib/db/types';
import Button from '@/components/ui/Button';
import AuthGate from '@/components/admin/AuthGate';
import EditAboutButton from '@/components/admin/EditAboutButton';

export const revalidate = 60;

function groupByType(sections: DbAboutSection[]): Record<string, DbAboutSection[]> {
  return sections.reduce((acc, s) => {
    if (!acc[s.type]) acc[s.type] = [];
    acc[s.type].push(s);
    return acc;
  }, {} as Record<string, DbAboutSection[]>);
}

export default async function AboutPage() {
  const [sections, profile] = await Promise.all([getAboutSections(), getProfile()]);
  const grouped = groupByType(sections);

  const interests = grouped['interest'] ?? [];
  const experiences = grouped['experience'] ?? [];
  const educations = grouped['education'] ?? [];
  const publications = grouped['publication'] ?? [];
  const achievements = grouped['achievement'] ?? [];
  const skillGroups = grouped['skill_group'] ?? [];

  return (
    <div className="container py-16 animate-fade-in">
      <div className="max-w-3xl">
        {/* Page Header */}
        <p className="section-label mb-4">About</p>
        <h1 className="text-4xl sm:text-5xl font-display font-medium mb-4 text-ink dark:text-ink-dark">
          About Me
        </h1>
        <div className="mb-16">
          {profile?.chinese_name && (
            <p className="text-lg text-ink-secondary dark:text-ink-dark-secondary">
              <span lang="zh-Hant">{profile.chinese_name}</span>
              {' · '}
              <span lang="en">{profile.name}</span>
            </p>
          )}
        </div>

        {/* Interests Section */}
        {interests.length > 0 && (
          <section className="mb-16">
            <p className="section-label mb-6">Interests</p>
            {interests.map((interest) => (
              <div key={interest.id}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display text-2xl font-medium text-ink dark:text-ink-dark">
                    {interest.title}
                  </h3>
                  <AuthGate>
                    <EditAboutButton section={interest} />
                  </AuthGate>
                </div>
                {(interest.content as { description?: string }).description && (
                  <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary leading-relaxed">
                    {(interest.content as { description?: string }).description}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        <div className="h-px bg-border dark:bg-border-dark mb-16" />

        {/* Experience Section */}
        {experiences.length > 0 && (
          <section className="mb-16">
            <p className="section-label mb-8">Experience</p>
            <div className="space-y-0 divide-y divide-border dark:divide-border-dark">
              {experiences.map((exp) => {
                const content = exp.content as { bullets?: string[]; location?: string };
                const period = [exp.date_start, exp.date_end ?? 'Present'].filter(Boolean).join(' – ');
                return (
                  <div key={exp.id} className="py-8 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-2xl font-medium text-ink dark:text-ink-dark">
                          {exp.url ? (
                            <a href={exp.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-border dark:decoration-border-dark hover:decoration-ink dark:hover:decoration-ink-dark transition-colors">
                              {exp.title}
                            </a>
                          ) : (
                            exp.title
                          )}
                        </h3>
                        <AuthGate>
                          <EditAboutButton section={exp} />
                        </AuthGate>
                      </div>
                      <span className="text-xs font-medium uppercase tracking-label text-ink-muted whitespace-nowrap">
                        {period}
                      </span>
                    </div>
                    {exp.subtitle && (
                      <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary mb-1">
                        {exp.subtitle}
                      </p>
                    )}
                    {content.location && (
                      <p className="text-xs text-ink-muted mb-4">{content.location}</p>
                    )}
                    {content.bullets && content.bullets.length > 0 && (
                      <ul className="space-y-2">
                        {content.bullets.map((item, i) => (
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
                );
              })}
            </div>
          </section>
        )}

        <div className="h-px bg-border dark:bg-border-dark mb-16" />

        {/* Education Section */}
        {educations.length > 0 && (
          <section className="mb-16">
            <p className="section-label mb-8">Education</p>
            <div className="space-y-0 divide-y divide-border dark:divide-border-dark">
              {educations.map((edu) => {
                const content = edu.content as { gpa?: string; bullets?: string[] };
                const period = [edu.date_start, edu.date_end].filter(Boolean).join(' – ');
                return (
                  <div key={edu.id} className="py-8 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-2xl font-medium text-ink dark:text-ink-dark">
                          {edu.url ? (
                            <a href={edu.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-border dark:decoration-border-dark hover:decoration-ink dark:hover:decoration-ink-dark transition-colors">
                              {edu.title}
                            </a>
                          ) : (
                            edu.title
                          )}
                        </h3>
                        <AuthGate>
                          <EditAboutButton section={edu} />
                        </AuthGate>
                      </div>
                      <span className="text-xs font-medium uppercase tracking-label text-ink-muted whitespace-nowrap">
                        {period}
                      </span>
                    </div>
                    {edu.subtitle && (
                      <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary">
                        {edu.subtitle}
                      </p>
                    )}
                    {content.gpa && (
                      <p className="text-sm text-ink-muted mt-1">
                        GPA: {content.gpa}
                      </p>
                    )}
                    {content.bullets && content.bullets.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {content.bullets.map((item, i) => (
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
                );
              })}
            </div>
          </section>
        )}

        <div className="h-px bg-border dark:bg-border-dark mb-16" />

        {/* Publications Section */}
        {publications.length > 0 && (
          <section className="mb-16">
            <p className="section-label mb-8">Publications</p>
            <div className="space-y-0 divide-y divide-border dark:divide-border-dark">
              {publications.map((pub) => {
                const content = pub.content as { bullets?: string[] };
                return (
                  <div key={pub.id} className="py-8 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      {pub.url ? (
                        <a
                          href={pub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-display text-2xl font-medium text-ink dark:text-ink-dark hover:opacity-60 transition-opacity"
                        >
                          {pub.title}
                        </a>
                      ) : (
                        <span className="font-display text-2xl font-medium text-ink dark:text-ink-dark">
                          {pub.title}
                        </span>
                      )}
                      <AuthGate>
                        <EditAboutButton section={pub} />
                      </AuthGate>
                    </div>
                    {pub.subtitle && (
                      <p className="text-xs text-ink-muted mt-2">{pub.subtitle}</p>
                    )}
                    {content.bullets && content.bullets.length > 0 && (
                      <ul className="mt-4 space-y-1.5">
                        {content.bullets.map((item, i) => (
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
                );
              })}
            </div>
          </section>
        )}

        <div className="h-px bg-border dark:bg-border-dark mb-16" />

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <section className="mb-16">
            <p className="section-label mb-8">Achievements & Certifications</p>
            <ul className="space-y-2.5">
              {achievements.map((item) => (
                <li
                  key={item.id}
                  className="text-ink-secondary dark:text-ink-dark-secondary pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-px before:bg-ink-muted"
                >
                  <span className="inline-flex items-center gap-2">
                    {item.title}
                    <AuthGate>
                      <EditAboutButton section={item} />
                    </AuthGate>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="h-px bg-border dark:bg-border-dark mb-16" />

        {/* Skills Section */}
        {skillGroups.length > 0 && (
          <section className="mb-16">
            <p className="section-label mb-6">Technical Skills</p>
            <div className="space-y-5">
              {skillGroups.map((group) => {
                const content = group.content as { items?: string[] };
                return (
                  <div key={group.id}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <h3 className="text-sm font-semibold font-sans text-ink dark:text-ink-dark">
                        {group.title}
                      </h3>
                      <AuthGate>
                        <EditAboutButton section={group} />
                      </AuthGate>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(content.items ?? []).map((skill) => (
                        <span key={skill} className="tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

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
