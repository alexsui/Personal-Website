import { Fragment } from 'react';
import ImpressionTimeline from './ImpressionTimeline';

export default function PostBody({ html, language, preview = false }: { html: string; language: string; preview?: boolean }) {
  // Only a standalone paragraph in sanitized Markdown can mount this figure.
  const sections = html.split('<p>{{impression-timeline}}</p>');
  return (
    <div lang={language}>
      {sections.map((section, index) => (
        <Fragment key={index}>
          {index > 0 && <ImpressionTimeline anchor={!preview && index === 1} />}
          {section && <div className="prose" dangerouslySetInnerHTML={{ __html: section }} />}
        </Fragment>
      ))}
    </div>
  );
}
