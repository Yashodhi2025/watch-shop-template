"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Text, useContent } from "@/components/storefront/editable";
import { safeIntroColor } from "@/components/storefront/IntroAnimation";

export default function IntroPage() {
  const { text } = useContent();
  const [preview, setPreview] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const duration = Math.max(1, Math.min(10, Number(text("home.introDuration", "3")) || 3));
  const styles = {
    "--intro-background": safeIntroColor(text("home.introBackgroundColor", "#080d18"), "#080d18"),
    "--intro-dial": safeIntroColor(text("home.introDialColor", "#c4a46a"), "#c4a46a"),
    "--intro-duration": `${duration}s`,
  } as CSSProperties;
  useEffect(() => {
    if (!previewing) return;
    const timeout = window.setTimeout(() => setPreviewing(false), duration * 1000);
    return () => window.clearTimeout(timeout);
  }, [previewing, preview, duration]);
  return (
    <main className="aurel-intro-editor-page" data-preview-page-key="intro">
      <div key={preview} className={`aurel-cinematic-intro aurel-cinematic-intro-persistent${previewing ? " aurel-cinematic-intro-previewing" : ""}`} style={styles}>
        <div className="aurel-intro-glow" aria-hidden="true" />
        <svg className="aurel-intro-dial" viewBox="0 0 220 220" data-preview-field-path="home.introDialColor">
          <circle className="aurel-dial-ring" cx="110" cy="110" r="94" />
          <circle className="aurel-dial-ring aurel-dial-ring-inner" cx="110" cy="110" r="76" />
          {Array.from({ length: 12 }, (_, index) => <line key={index} className="aurel-dial-tick" x1="110" y1="22" x2="110" y2={index % 3 === 0 ? "36" : "30"} transform={`rotate(${index * 30} 110 110)`} />)}
          <line className="aurel-hour-hand" x1="110" y1="112" x2="110" y2="68" />
          <line className="aurel-minute-hand" x1="110" y1="112" x2="110" y2="48" />
          <g className="aurel-second-hand"><line x1="110" y1="132" x2="110" y2="43" /><circle cx="110" cy="110" r="4" /></g>
        </svg>
        <div className="aurel-intro-logo">
          <Text data-preview-field-path="home.introLogo" fallback="AUREL" className="aurel-intro-name" />
          <Text data-preview-field-path="home.introTagline" fallback="TIMEPIECES" className="aurel-intro-subtitle" />
        </div>
        <button type="button" className="aurel-intro-preview" data-preview-field-path="home.introDuration" onClick={() => { setPreview(value => value + 1); setPreviewing(true); }}>Preview Animation</button>
      </div>
    </main>
  );
}
