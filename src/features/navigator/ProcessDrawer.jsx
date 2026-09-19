import { useEffect, useMemo, useRef, useState } from "react";
import { assetUrl } from "../../lib/assetUrl";
import { buildCallGuide, processSections } from "./processText";
import { relatedTrainingForCategory } from "../../data/trainingVideos";
import { useDialogFocus } from "../../lib/useDialogFocus";
import { FavoriteToggle } from "../favorites/FavoriteToggle";

const TABS = [
  ["quick", "Call Guide"],
  ["visual", "Visual Guide"],
  ["source", "Source Pages"],
  ["full", "Full Process"],
];

const STEP_PREVIEW_LIMIT = 6;
const SCRIPT_PREVIEW_LIMIT = 3;
const CALLOUT_PREVIEW_LIMIT = 6;

const trainingCategoryByProcessCategory = {
  join: "Joining Meetings",
  audio: "Audio & Microphone",
  video: "Camera & Video",
  controls: "Meeting Controls",
  sharing: "Screen Sharing",
  devices: "Devices & App",
};

export function ProcessDrawer({ process, onClose, onOpenTraining, onTrackEvent, isFavorite = false, favoriteBusy = false, onToggleFavorite = () => {} }) {
  const [tab, setTab] = useState("quick");
  const [stepsExpanded, setStepsExpanded] = useState(false);
  const [scriptsExpanded, setScriptsExpanded] = useState(false);
  const [expandedCallouts, setExpandedCallouts] = useState({});
  const dialogRef = useRef(null);
  const copyResetRef = useRef(null);
  const [copyState, setCopyState] = useState({ id: "", status: "" });
  const guide = useMemo(() => buildCallGuide(process), [process]);
  const visibleSteps = stepsExpanded ? guide.steps : guide.steps.slice(0, STEP_PREVIEW_LIMIT);
  const hiddenStepCount = Math.max(0, guide.steps.length - visibleSteps.length);
  const visibleGlobalScripts = scriptsExpanded
    ? guide.globalScripts
    : guide.globalScripts.slice(0, SCRIPT_PREVIEW_LIMIT);
  const hiddenScriptCount = Math.max(0, guide.globalScripts.length - visibleGlobalScripts.length);
  useDialogFocus(dialogRef, true, onClose);
  useEffect(() => () => window.clearTimeout(copyResetRef.current), []);

  function copyLabel(id, defaultLabel) {
    if (copyState.id !== id) return defaultLabel;
    return copyState.status === "copied" ? "Copied ✓" : "Copy failed";
  }

  async function copyText(text, id) {
    window.clearTimeout(copyResetRef.current);
    onTrackEvent?.({
      eventType: "copy_action",
      routeId: "navigator",
      processId: process.id,
      categoryId: process.category,
      toolId: id,
    });
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      setCopyState({ id, status: "copied" });
    } catch {
      setCopyState({ id, status: "failed" });
    }
    copyResetRef.current = window.setTimeout(
      () => setCopyState({ id: "", status: "" }),
      1600,
    );
  }
  async function copySteps() {
    await copyText(
      guide.steps
        .map(
          (step) =>
            `${step.number}. ${step.title}\n${step.instructions.join("\n")}`,
        )
        .join("\n\n"),
      "quick-steps",
    );
  }
  function selectTab(id, { focus = false } = {}) {
    setTab(id);
    onTrackEvent?.({
      eventType: "tool_open",
      routeId: "navigator",
      processId: process.id,
      categoryId: process.category,
      toolId: `tab_${id}`,
    });
    if (focus) {
      document.getElementById(`process-tab-${id}`)?.focus();
    }
  }

  function handleTabKey(event, index) {
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + TABS.length) % TABS.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = TABS.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    selectTab(TABS[nextIndex][0], { focus: true });
  }

  function openVisual(visual) {
    const index = process.visualReferences?.indexOf(visual) ?? -1;
    selectTab("visual");
    window.setTimeout(
      () =>
        document
          .getElementById(`visual-${index}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  }
  return (
    <div
      className="drawer-backdrop"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside
        ref={dialogRef}
        tabIndex={-1}
        className="process-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <header className="drawer-header">
          <div>
            <span className="process-category">{process.category}</span>
            <h2 id="drawer-title">{process.title}</h2>
            <p>{process.purpose}</p>
          </div>
          <div className="drawer-header-actions">
            <FavoriteToggle
              active={isFavorite}
              busy={favoriteBusy}
              label={process.title}
              onToggle={onToggleFavorite}
            />
            <button
              className="drawer-close"
              aria-label="Close process"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </header>
        <div className="process-tabs" role="tablist" aria-label="Process views">
          {TABS.map(([id, label], index) => (
            <button
              key={id}
              id={`process-tab-${id}`}
              role="tab"
              aria-selected={tab === id}
              aria-controls="process-tabpanel"
              tabIndex={tab === id ? 0 : -1}
              onKeyDown={(event) => handleTabKey(event, index)}
              onClick={() => selectTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div
          className="drawer-content"
          id="process-tabpanel"
          role="tabpanel"
          aria-labelledby={`process-tab-${tab}`}
          tabIndex={0}
        >
          {tab === "quick" && (
            <section className="call-guide" aria-label="Call Guide">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Live-call assist</p>
                  <h3>Call Guide</h3>
                </div>
                <button onClick={copySteps}>
                  {copyLabel("quick-steps", "Copy Quick Steps")}
                </button>
              </div>
              {guide.quickGuide.length > 0 && (
                <section className="call-quick-guide">
                  <p className="eyebrow">Quick Guide / Remember the Process</p>
                  {guide.quickGuide.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </section>
              )}
              {guide.whatToAsk.length > 0 && (
                <section className="what-to-ask">
                  <p className="eyebrow">What to Ask</p>
                  <ul>
                    {guide.whatToAsk.map((question, index) => (
                      <li key={index}>
                        {question.text}
                        {question.origin === "derived" && (
                          <small>Derived from approved process</small>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {guide.suggestedScript.origin === "derived" && (
                <section className="suggested-script">
                  <p className="eyebrow">{guide.suggestedScript.label}</p>
                  <blockquote>{guide.suggestedScript.text}</blockquote>
                  <button onClick={() => copyText(guide.suggestedScript.text, "suggested-script")}>
                    {copyLabel("suggested-script", "Copy Script")}
                  </button>
                  <small>
                    Console wording derived only from this approved process.
                  </small>
                </section>
              )}
              {visibleGlobalScripts.map((script, index) => (
                <section className="suggested-script" key={`global-${index}`}>
                  <p className="eyebrow">Additional Source Script</p>
                  <blockquote>{script}</blockquote>
                  <button onClick={() => copyText(script, `global-script-${index}`)}>
                    {copyLabel(`global-script-${index}`, "Copy Script")}
                  </button>
                </section>
              ))}
              {hiddenScriptCount > 0 && (
                <button
                  type="button"
                  className="show-more-scripts"
                  onClick={() => setScriptsExpanded(true)}
                >
                  Show remaining scripts ({hiddenScriptCount})
                </button>
              )}
              <div className="call-step-list">
                {visibleSteps.map((step, index) => (
                  <article
                    className="call-step-card"
                    id={`call-step-${index}`}
                    key={`${step.number}-${step.title}`}
                  >
                    <div className="call-step-heading">
                      <span>Step {step.number}</span>
                      <h3>{step.title}</h3>
                      <button
                        onClick={() =>
                          copyText(
                            [
                              `Step ${step.number}: ${step.title}`,
                              ...step.instructions,
                              ...step.scripts,
                            ].join("\n"),
                            `step-${index}`,
                          )
                        }
                      >
                        {copyLabel(`step-${index}`, "Copy Step")}
                      </button>
                    </div>
                    {step.instructions.length > 0 && (
                      <div>
                        <p className="eyebrow">What to Do</p>
                        <ul>
                          {step.instructions.map((line, lineIndex) => (
                            <li key={lineIndex}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {step.scripts.length > 0 && (
                      <div className="step-scripts">
                        <p className="eyebrow">Suggested Script</p>
                        {step.scripts.map((script, scriptIndex) => (
                          <div key={scriptIndex}>
                            <blockquote>{script}</blockquote>
                            <button onClick={() => copyText(script, `step-${index}-script-${scriptIndex}`)}>
                              {copyLabel(`step-${index}-script-${scriptIndex}`, "Copy Script")}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {step.confirmations.length > 0 && (
                      <div className="step-confirm">
                        <p className="eyebrow">Confirm with Customer</p>
                        {step.confirmations.map((line, lineIndex) => (
                          <p key={lineIndex}>{line}</p>
                        ))}
                      </div>
                    )}
                    {step.visualReferences.map((visual, visualIndex) => (
                      <button
                        className="view-visual"
                        key={visualIndex}
                        onClick={() => openVisual(visual)}
                      >
                        View Visual
                      </button>
                    ))}
                    <nav
                      className="step-navigation"
                      aria-label={`Step ${step.number} navigation`}
                    >
                      {index > 0 && (
                        <a href={`#call-step-${index - 1}`}>Previous Step</a>
                      )}
                      {index < visibleSteps.length - 1 && (
                        <a href={`#call-step-${index + 1}`}>Next Step</a>
                      )}
                    </nav>
                  </article>
                ))}
              </div>
              {hiddenStepCount > 0 && (
                <button
                  type="button"
                  className="show-more-steps"
                  onClick={() => setStepsExpanded(true)}
                >
                  Show remaining steps ({hiddenStepCount})
                </button>
              )}
              {guide.callouts.length > 0 && (
                <section className="guide-callouts">
                  {guide.callouts.map((callout, index) => {
                    const expanded = Boolean(expandedCallouts[index]);
                    const visibleLines = expanded
                      ? callout.lines
                      : callout.lines.slice(0, CALLOUT_PREVIEW_LIMIT);
                    const hiddenCount = Math.max(0, callout.lines.length - visibleLines.length);
                    const detailLabel = callout.kind === "referral"
                      ? "referral details"
                      : `${callout.label.toLowerCase()} details`;

                    return (
                      <article
                        className={`guide-callout ${callout.kind}`}
                        key={index}
                      >
                        <p className="eyebrow">{callout.label}</p>
                        {visibleLines.map((line, lineIndex) => (
                          <p className="callout-line" key={lineIndex}>{line}</p>
                        ))}
                        {hiddenCount > 0 && (
                          <button
                            type="button"
                            className="show-more-callout"
                            onClick={() => setExpandedCallouts(current => ({ ...current, [index]: true }))}
                          >
                            Show remaining {detailLabel} ({hiddenCount})
                          </button>
                        )}
                      </article>
                    );
                  })}
                </section>
              )}
              <div className="refer-card">
                <h3>When to Refer</h3>
                {guide.referralDetails.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              {trainingCategoryByProcessCategory[process.category] &&
                relatedTrainingForCategory(
                  trainingCategoryByProcessCategory[process.category],
                ).length > 0 && (
                  <div className="related-training">
                    <p className="eyebrow">Related training</p>
                    <div>
                      {relatedTrainingForCategory(
                        trainingCategoryByProcessCategory[process.category],
                      )
                        .slice(0, 3)
                        .map((video) => (
                          <button
                            key={video.id}
                            onClick={() => onOpenTraining?.(video.id)}
                          >
                            {video.title}
                          </button>
                        ))}
                    </div>
                    <button onClick={() => onOpenTraining?.()}>
                      Open Training &amp; Resources
                    </button>
                  </div>
                )}
            </section>
          )}
          {tab === "visual" && (
            <section aria-label="Visual Guide">
              {process.visualReferences?.length ? (
                <div className="visual-list">
                  {process.visualReferences.map((item, index) => (
                    <article
                      id={`visual-${index}`}
                      className="visual-card"
                      key={`${index}-${item.title}`}
                    >
                      <div className="visual-card-head">
                        <span>Visual {index + 1}</span>
                        <strong>{item.status || "Matched to process"}</strong>
                      </div>
                      <h3>{item.title}</h3>
                      <img
                        loading="lazy"
                        src={assetUrl(item.image)}
                        alt={item.title}
                      />
                      <div className="visual-guidance">
                        <div>
                          <b>Locate &amp; Guide</b>
                          <p>{item.documentStep}</p>
                          <p>{item.instruction}</p>
                        </div>
                        <div>
                          <b>Confirm</b>
                          <p>{item.expectedResult}</p>
                        </div>
                      </div>
                      <footer>
                        {item.platform && <span>{item.platform}</span>}
                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {item.sourceName || "Source"}
                          </a>
                        )}
                      </footer>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No visual reference available for this process yet</h3>
                  <p>
                    Use Call Guide or the source pages for source-backed
                    guidance.
                  </p>
                </div>
              )}
            </section>
          )}
          {tab === "source" && (
            <section aria-label="Source Pages">
              {process.images?.length ? (
                <div className="source-pages">
                  {process.images.map((image, index) => (
                    <figure key={image}>
                      <div>
                        <span>
                          Page {index + 1} of {process.images.length}
                        </span>
                        <a
                          href={assetUrl(image)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open full size
                        </a>
                      </div>
                      <img
                        loading="lazy"
                        src={assetUrl(image)}
                        alt={`${process.title} source page ${index + 1}`}
                      />
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No source pages available</h3>
                </div>
              )}
            </section>
          )}
          {tab === "full" && (
            <section className="full-process" aria-label="Full Process">
              {processSections(process.text).map((section, index) => (
                <section
                  className={
                    section.heading.toLowerCase().includes("sample script")
                      ? "script-section"
                      : ""
                  }
                  key={`${index}-${section.heading}`}
                >
                  <h3>{section.heading}</h3>
                  {section.lines.map((line, lineIndex) => (
                    <p key={lineIndex}>{line}</p>
                  ))}
                </section>
              ))}
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
