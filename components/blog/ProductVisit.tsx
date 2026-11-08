'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './ProductVisit.module.css';

const products = [
  { name: '商品 - 明信片A', alt: '午睡的貓', image: '/images/gallery/alishan/DSCF0774.JPG' },
  { name: '商品 - 明信片B', alt: '山間列車', image: '/images/gallery/alishan/DSCF0672.JPG' },
];

export type VisitStep = 0 | 1 | 2;
const stepDuration = [2200, 2900, 0] as const;

function PlaybackCursor({ duration }: { duration: number }) {
  return (
    <svg className={styles.cursor} viewBox="0 0 28 32" aria-hidden="true" focusable="false"
      style={{ animationDuration: `${duration}ms` }}>
      <path d="M3 2.5 4.3 25l5.7-5.8 4.2 9.1 4.2-2-4.2-8.9 8.3-.4Z"
        fill="#23231f" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ProductPhoto({ index }: { index: number }) {
  const product = products[index];
  return <Image src={product.image} alt={product.alt} fill sizes="(max-width: 700px) 70vw, 380px" />;
}

export default function ProductVisit({ step, onStep }: { step: VisitStep; onStep: (step: VisitStep) => void }) {
  const [playing, setPlaying] = useState(false);
  const action = useRef<HTMLButtonElement>(null);
  const playback = useRef<HTMLButtonElement>(null);
  const manualFocus = useRef(false);
  const isDetail = step === 1;

  useEffect(() => {
    if (!manualFocus.current) return;
    manualFocus.current = false;
    (step === 2 ? playback : action).current?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => {
    if (!playing || step === 2) return;
    const timer = window.setTimeout(() => {
      if (step === 1) setPlaying(false);
      onStep(step === 0 ? 1 : 2);
    }, stepDuration[step]);
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', pauseWhenHidden);
    };
  }, [step, playing, onStep]);

  function advance() {
    manualFocus.current = true;
    setPlaying(false);
    onStep(isDetail ? 2 : 1);
  }

  function togglePlayback() {
    if (step === 2) onStep(0);
    setPlaying(!playing);
  }

  return (
    <div className={styles.visit}>
      <div className={styles.viewport}>
        <div key={step} className={styles.scene} data-step={step}>
          <div className={styles.navigation}>
            {isDetail ? (
              <button ref={action} type="button" className={styles.back} onClick={advance}>
                <span aria-hidden="true" />返回列表
                {playing && <PlaybackCursor duration={stepDuration[step]} />}
              </button>
            ) : <span>推薦列表</span>}
          </div>
          {isDetail ? (
            <div className={styles.detail}>
              <div className={styles.hero}><ProductPhoto index={0} /></div>
              <strong>{products[0].name}</strong>
            </div>
          ) : (
            <div className={styles.list}>
              {products.map((product, index) => {
                const content = (
                  <>
                    <span className={styles.thumb}><ProductPhoto index={index} /></span>
                    <strong className={styles.itemText}>{product.name}</strong>
                  </>
                );
                return index === 0 && step === 0 ? (
                  <button key={product.name} type="button" ref={action} className={styles.productLink}
                    aria-label={'點開' + product.name} onClick={advance}>
                    {content}
                    {playing && <PlaybackCursor duration={stepDuration[step]} />}
                  </button>
                ) : <div key={product.name}>{content}</div>;
              })}
            </div>
          )}
        </div>
      </div>
      <div className={styles.log}>
        <div role="status" aria-atomic="true">
          <span className="sr-only">{['推薦列表。', '商品 A 詳情。', '返回原列表。'][step]}</span>
          列表打分 1 次 <span aria-hidden="true">·</span> 商品 A 曝光 {step === 2 ? <strong>2</strong> : '1'} 次
        </div>
        <button ref={playback} type="button" onClick={togglePlayback}>
          {playing ? '暫停' : isDetail ? '繼續播放' : '播放示意'}
        </button>
      </div>
    </div>
  );
}
