export default function ProjectCard({
  project,
}: {
  project: { title: string; description: string; link: string };
}) {
  return (
    <a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      {/* Label */}
      <p className="text-xs font-medium uppercase tracking-label text-ink-muted mb-2">
        Project
      </p>

      {/* Title */}
      <h3 className="text-2xl font-display font-medium text-ink dark:text-ink-dark group-hover:opacity-60 transition-opacity mb-2">
        {project.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary leading-relaxed">
        {project.description}
      </p>
    </a>
  );
}
