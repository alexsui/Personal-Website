'use client';

import { useId, useState } from 'react';
import ProductVisit, { type VisitStep } from './ProductVisit';
import styles from './ImpressionTimeline.module.css';

const impressionEvents = [
  { label: '模型打分', cutoff: 'score' },
  { label: '點進商品 A', cutoff: null },
  { label: '再次曝光', cutoff: 'exposure' },
] as const;

export default function ImpressionTimeline({ anchor }: { anchor: boolean }) {
  const group = useId();
  const [cutoff, setCutoff] = useState<'score' | 'exposure'>('score');
  const [visitStep, setVisitStep] = useState<VisitStep>(0);

  return (
    <figure id={anchor ? 'impression-timeline' : undefined} className={styles.figure} data-cutoff={cutoff}>
      <ProductVisit step={visitStep} onStep={setVisitStep} />
      <fieldset aria-label="特徵截止點">
        <div className={styles.plot}>
          <div className={styles.track} aria-hidden="true">
            <span className={styles.marker}>截止點</span>
          </div>
          <ol aria-label="事件順序">
            {impressionEvents.map((event, index) => {
              const value = event.cutoff;
              return (
                <li key={event.label} aria-current={visitStep === index ? 'step' : undefined}>
                  {value ? (
                    <label className={styles.choice}>
                      <input
                        type="radio"
                        name={group}
                        checked={value === cutoff}
                        onChange={() => setCutoff(value)}
                      />
                      <span className={styles.point} aria-hidden="true" />
                      <span>{event.label}</span>
                    </label>
                  ) : (
                    <span className={styles.middle}>
                      <span className={styles.tick} aria-hidden="true" />
                      {event.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </fieldset>
      <figcaption aria-live="polite" aria-atomic="true">
        {cutoff === 'score'
          ? <>第一次打分時，使用者還沒點進 A。訓練這筆樣本時，應<strong>排除這次瀏覽</strong>。</>
          : <>以再次曝光為截止點，樣本就會<strong>納入打分之後的瀏覽</strong>，造成資料洩漏。</>}
      </figcaption>
    </figure>
  );
}
