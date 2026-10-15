import { useRef, useState } from "react";

function Brand({ footer = false }) {
  return (
    <a className={`brand${footer ? " footer-brand" : ""}`} href="#top" aria-label="0 to shipped home">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>
        0 to <span className="brand-accent">shipped</span>
      </span>
    </a>
  );
}

function ResumeIllustration() {
  return (
    <div className="hero-art" aria-label="Illustration of a resume getting a score">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="art-spark spark-one" aria-hidden="true">✳</div>
      <div className="art-spark spark-two" aria-hidden="true">✳</div>
      <div className="resume-card">
        <div className="resume-topline"><span className="resume-dot" /> RESUME_OVERVIEW.PDF</div>
        <div className="resume-profile">
          <div className="profile-avatar">JD</div>
          <div className="profile-lines"><i /><i /><i /></div>
        </div>
        <div className="resume-section-label">EXPERIENCE</div>
        <div className="resume-lines"><i /><i /><i /></div>
        <div className="resume-section-label">SKILLS</div>
        <div className="resume-tags"><i /><i /><i /></div>
        <div className="resume-lines short-lines"><i /><i /></div>
      </div>
      <div className="score-float">
        <div className="score-ring"><span>✓</span></div>
        <div><strong>Comparison ready</strong><span>Resume + job description</span></div>
      </div>
      <div className="skills-float">
        <span className="skill-check" aria-hidden="true">✓</span>
        <div><strong>AI comparison</strong><span>Score &amp; skills coming soon</span></div>
      </div>
      <div className="art-caption"><span /> A little more confident, already.</div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14.5v3A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ResultsPlaceholder() {
  return (
    <div className="results-placeholder">
      <div className="placeholder-illustration" aria-hidden="true">
        <span className="placeholder-page"><i /><i /><i /><i /></span>
        <span className="placeholder-magnifier" />
        <span className="placeholder-star">✳</span>
      </div>
      <strong>Your results will land here.</strong>
      <span>Submit a PDF and job description to save a comparison request.</span>
    </div>
  );
}

function Results({ comparison }) {
  return (
    <div className="results-content">
      <div className="results-topline">
        <div><span className="step-number">02</span><span className="results-label">COMPARISON REQUEST</span></div>
        <span className="demo-badge pending-badge">AI COMING LATER</span>
      </div>
      <div className="result-score-row">
        <div className="request-status-icon" aria-hidden="true">✓</div>
        <div className="result-score-copy"><h3>Files received.</h3><p>Your resume and job description are saved.</p></div>
      </div>
      <div className="request-details">
        <span>RESUME</span>
        <strong>{comparison.resumeFilename}</strong>
        <span>REQUEST ID</span>
        <strong className="request-id">{comparison.id}</strong>
      </div>
      <p className="demo-disclaimer">
        AI comparison is not connected yet. Your files are stored and ready for the comparison step to be added later.
      </p>
    </div>
  );
}

function Analyzer() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comparison, setComparison] = useState(null);

  function selectFile(nextFile) {
    setError("");
    if (!nextFile) return;
    if (nextFile.type !== "application/pdf" && !nextFile.name.toLowerCase().endsWith(".pdf")) {
      setFile(null);
      setComparison(null);
      setError("That file isn’t a PDF. Choose a PDF to continue.");
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setComparison(null);
      setError("That PDF is over 10 MB. Choose a smaller file to continue.");
      return;
    }
    setFile(nextFile);
    setComparison(null);
    setError("");
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || !jobDescription.trim()) return;

    setIsSubmitting(true);
    setError("");
    setComparison(null);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription.trim());

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? "";
      const response = await fetch(`${apiUrl}/api/comparisons`, {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "The comparison request could not be saved.");
      }
      setComparison(payload.comparison);
    } catch (requestError) {
      setError(requestError.message || "Could not reach the server. Check that the backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="analyzer-section" id="analyzer" aria-labelledby="analyzer-title">
      <div className="section-heading">
        <span className="section-kicker">THE QUICK CHECK</span>
        <h2 id="analyzer-title">Let’s see what you’ve got.</h2>
        <p>Submit a resume and job description to create a comparison request.</p>
      </div>
      <div className="analyzer-card">
        <form className="upload-panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <span className="step-number">01</span>
            <div><h3>Upload your resume</h3><p>We’ll take it from here.</p></div>
          </div>
          <label className="job-description-label" htmlFor="job-description">Job description</label>
          <textarea
            id="job-description"
            className="job-description-input"
            value={jobDescription}
            onChange={(event) => {
              setJobDescription(event.target.value);
              setComparison(null);
            }}
            maxLength={20000}
            placeholder="Paste the job description you want to compare against…"
            required
          />
          <span className="character-count">{jobDescription.length.toLocaleString()} / 20,000</span>
          <div
            className={`dropzone${dragging ? " is-dragging" : ""}`}
            onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
            }}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              id="resume-file"
              type="file"
              accept=".pdf,application/pdf"
              aria-label="Choose a resume PDF"
              onChange={(event) => selectFile(event.target.files?.[0])}
            />
            <button className="dropzone-action" type="button" onClick={() => inputRef.current?.click()}>
              <span className="upload-icon"><UploadIcon /></span>
              <strong>{file ? file.name : "Drop your PDF here"}</strong>
              <span className="upload-subtitle">
                {file ? "Ready when you are" : <>or <span>browse files</span> on your device</>}
              </span>
              <span className="file-note">PDF only · Max 10 MB</span>
            </button>
          </div>
          {error && <p className="upload-error" role="alert">{error}</p>}
          <button className="analyze-button" type="submit" disabled={!file || !jobDescription.trim() || isSubmitting}>
            <span>{isSubmitting ? "Saving your comparison…" : "Submit for comparison"}</span><span aria-hidden="true">→</span>
          </button>
          <p className="privacy-note"><span aria-hidden="true">⌑</span> Submissions are stored in MongoDB.</p>
        </form>
        <div className="results-panel" aria-live="polite">
          {comparison ? <Results comparison={comparison} /> : <ResultsPlaceholder />}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: "↑", label: "01 / UPLOAD", title: "Bring your resume", description: "One PDF is all you need to get started.", className: "upload-how" },
    { icon: "◎", label: "02 / SAVE", title: "Create your comparison", description: "Your resume and job description are saved together.", className: "scan-how" },
    { icon: "↗", label: "03 / COMPARE", title: "Get your match insights", description: "AI scoring and skill suggestions are planned for a future update.", className: "grow-how" },
  ];

  return (
    <section className="how-section" id="how-it-works">
      <div className="how-intro">
        <span className="section-kicker">NO SPREADSHEETS. NO GUESSING.</span>
        <h2>A small check.<br /><span>A big confidence boost.</span></h2>
      </div>
      <div className="how-steps">
        {steps.map((step) => (
          <article className="how-step" key={step.label}>
            <span className={`how-icon ${step.className}`} aria-hidden="true">{step.icon}</span>
            <div>
              <span className="how-step-number">{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function App() {
  return (
    <>
      <header className="site-header" id="top">
        <Brand />
        <nav className="header-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#analyzer">Resume checker</a>
        </nav>
        <a className="header-cta" href="#analyzer">Check my resume <span aria-hidden="true">↗</span></a>
      </header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT ROLE STARTS HERE</div>
            <h1 id="hero-title">Your resume.<br />One step <span>closer.</span></h1>
            <p className="hero-description">
              Bring your resume and a job description together. AI-powered scoring and skill insights are coming next.
            </p>
            <a className="primary-button" href="#analyzer">Get my resume score <span aria-hidden="true">↘</span></a>
            <div className="social-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span className="avatar avatar-one">J</span><span className="avatar avatar-two">M</span>
                <span className="avatar avatar-three">A</span><span className="avatar avatar-four">+</span>
              </div>
              <span><strong>A little clarity goes a long way.</strong><br />Free to try. No account needed.</span>
            </div>
          </div>
          <ResumeIllustration />
        </section>
        <Analyzer />
        <HowItWorks />
        <section className="bottom-cta">
          <span className="bottom-spark" aria-hidden="true">✳</span>
          <div><span className="section-kicker">READY WHEN YOU ARE</span><h2>Let’s get you one step closer.</h2></div>
          <a className="primary-button" href="#analyzer">Check my resume <span aria-hidden="true">↗</span></a>
        </section>
      </main>
      <footer className="site-footer">
        <Brand footer />
        <span>A little clarity goes a long way.</span>
        <span>Made for the next step. © 2025 0 to shipped</span>
      </footer>
    </>
  );
}

export default App;
