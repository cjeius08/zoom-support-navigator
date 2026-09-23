import { useEffect, useMemo, useRef, useState } from "react";
import { assetUrl } from "../../lib/assetUrl";
import { buildCallGuide, PLATFORM_LABELS, processSections } from "./processText";
import { COMMON_ISSUE_ROUTES } from "./commonIssueRoutes";
import { relatedTrainingForCategory } from "../../data/trainingVideos";
import { useDialogFocus } from "../../lib/useDialogFocus";
import { FavoriteToggle } from "../favorites/FavoriteToggle";

const TABS = [
  ["quick", "Call Guide"],
  ["visual", "Visual Guide"],
  ["source", "Source Pages"],
  ["full", "Full Process"],
];


const DEVICE_TO_PLATFORM = {
  Windows: 'windows',
  Mac: 'macos',
  iPhone: 'ios',
  Android: 'android',
  Browser: 'web',
}

const trainingCategoryByProcessCategory = {
  join: "Joining Meetings",
  audio: "Audio & Microphone",
  video: "Camera & Video",
  controls: "Meeting Controls",
  sharing: "Screen Sharing",
  devices: "Devices & App",
};

export function ProcessDrawer({ process, onClose, onOpenTraining, initialDevice = null, onOpenRoute, onTrackEvent, isFavorite = false, favoriteBusy = false, onToggleFavorite = () => {} }) {
  const [tab, setTab] = useState("quick");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [outcome, setOutcome] = useState("active");
  const dialogRef = useRef(null);
  const copyResetRef = useRef(null);
  const [copyState, setCopyState] = useState({ id: "", status: "" });
  const guide = useMemo(() => buildCallGuide(process), [process]);
  const requestedPlatform = DEVICE_TO_PLATFORM[initialDevice] || "";
  const defaultPlatform = requestedPlatform && guide.availablePlatforms.includes(requestedPlatform)
    ? requestedPlatform
    : (guide.availablePlatforms.length === 1 ? guide.availablePlatforms[0] : "");
  const relatedRoutes = useMemo(
    () => COMMON_ISSUE_ROUTES.filter((route) => route.processIds?.includes(process.id)),
    [process.id],
  );
  const officialSources = useMemo(() => {
    const sources = new Map();
    for (const route of relatedRoutes) {
      for (const source of [route.primarySource, ...(route.supportingSources || [])]) {
        if (source?.url && !sources.has(source.url)) sources.set(source.url, source);
      }
    }
    return [...sources.values()];
  }, [relatedRoutes]);
  const eligibleSteps = useMemo(
    () => guide.steps.filter((step) =>
      !selectedPlatform || step.platforms.length === 0 || step.platforms.includes(selectedPlatform)
    ),
    [guide.steps, selectedPlatform],
  );
  const routeOptions = useMemo(() => {
    const options = [];
    const seen = new Set();
    for (const step of eligibleSteps) {
      const id = step.routeId || "main";
      if (seen.has(id)) continue;
      seen.add(id);
      options.push({ id, label: step.routeLabel || "Main approved steps" });
    }
    return options;
  }, [eligibleSteps]);
  const activeRouteId = routeOptions.some((route) => route.id === selectedRoute)
    ? selectedRoute
    : (routeOptions[0]?.id || "main");
  const activeSteps = useMemo(
    () => eligibleSteps.filter((step) => (step.routeId || "main") === activeRouteId),
    [eligibleSteps, activeRouteId],
  );
  const currentStep = activeSteps[currentStepIndex] || null;
  const noApprovedDevicePath = Boolean(selectedPlatform && activeSteps.length === 0);
  const quickFlow = guide.quickGuide.find((line) => line.includes("→")) || guide.quickGuide[0] || "";
  const requirementLines = guide.callouts
    .filter((callout) => callout.kind === "requirement")
    .flatMap((callout) => callout.lines);

  useDialogFocus(dialogRef, true, onClose);
  useEffect(() => () => window.clearTimeout(copyResetRef.current), []);
  useEffect(() => {
    setSelectedPlatform(defaultPlatform);
    setSelectedRoute("");
    setCurrentStepIndex(0);
    setOutcome("active");
  }, [process.id, defaultPlatform]);

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
    const stepsToCopy = selectedPlatform ? activeSteps : (activeSteps.length ? activeSteps : guide.steps);
    if (!stepsToCopy.length) return;
    await copyText(
      stepsToCopy
        .map((step, index) =>
          `${index + 1}. ${step.title}\n${[...step.instructions, ...step.confirmations].join("\n")}`
        )
        .join("\n\n"),
      "quick-steps",
    );
  }

  function resetProgress() {
    setCurrentStepIndex(0);
    setOutcome("active");
  }

  function selectPlatform(platform) {
    setSelectedPlatform(platform);
    setSelectedRoute("");
    resetProgress();
    onTrackEvent?.({
      eventType: "guide_device_selected",
      routeId: "navigator",
      processId: process.id,
      categoryId: process.category,
      toolId: `device_${platform}`,
    });
  }

  function selectGuideRoute(routeId) {
    setSelectedRoute(routeId);
    resetProgress();
    onTrackEvent?.({
      eventType: "guide_path_selected",
      routeId: "navigator",
      processId: process.id,
      categoryId: process.category,
      toolId: `path_${routeId}`,
    });
  }

  function markResolved() {
    setOutcome("resolved");
    onTrackEvent?.({
      eventType: "guide_outcome",
      routeId: "navigator",
      processId: process.id,
      categoryId: process.category,
      toolId: "resolved",
    });
  }

  function markNotResolved() {
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStepIndex((index) => index + 1);
      return;
    }
    setOutcome("exhausted");
    onTrackEvent?.({
      eventType: "guide_outcome",
      routeId: "navigator",
      processId: process.id,
      categoryId: process.category,
      toolId: "not_resolved_after_path",
    });
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
            <button
              className="drawer-close"
              aria-label="Close process"
              onClick={onClose}
            >
              ×
            </button>
            <FavoriteToggle
              active={isFavorite}
              busy={favoriteBusy}
              label={process.title}
              onToggle={onToggleFavorite}
            />
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
            <section className="call-guide guided-process" aria-label="Call Guide">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Live-call assist</p>
                  <h3>Guided Call Guide</h3>
                  <p className="guided-process-intro">One approved action at a time. Stop as soon as the issue is resolved.</p>
                </div>
                <button onClick={copySteps} disabled={noApprovedDevicePath}>
                  {copyLabel("quick-steps", "Copy Current Path")}
                </button>
              </div>

              {guide.availablePlatforms.length > 1 && (
                <section className="guide-device-picker" aria-label="Choose customer device">
                  <p className="eyebrow">1 · Device</p>
                  <h3>What device is the customer using?</h3>
                  <div className="guide-device-options">
                    {guide.availablePlatforms.map((platform) => (
                      <button
                        type="button"
                        key={platform}
                        aria-pressed={selectedPlatform === platform}
                        onClick={() => selectPlatform(platform)}
                      >
                        {PLATFORM_LABELS[platform] || platform}
                      </button>
                    ))}
                  </div>
                  {!selectedPlatform && <p className="guide-device-hint">Choose a device so Ozzie only shows instructions supported for that platform.</p>}
                </section>
              )}

              {(!guide.availablePlatforms.length || selectedPlatform || guide.availablePlatforms.length === 1) && (
                <>
                  {routeOptions.length > 1 && (
                    <section className="guide-path-picker">
                      <label htmlFor="guide-path-select">
                        <span className="eyebrow">Approved path</span>
                        <strong>What are you trying to do?</strong>
                      </label>
                      <select
                        id="guide-path-select"
                        value={activeRouteId}
                        onChange={(event) => selectGuideRoute(event.target.value)}
                      >
                        {routeOptions.map((route) => (
                          <option key={route.id} value={route.id}>{route.label}</option>
                        ))}
                      </select>
                    </section>
                  )}

                  {quickFlow && (
                    <div className="guide-flow-line">
                      <span>Quick flow</span>
                      <strong>{quickFlow}</strong>
                    </div>
                  )}

                  {currentStepIndex === 0 && outcome === "active" && guide.whatToAsk.length > 0 && (
                    <details className="approved-details what-to-ask-details">
                      <summary>Questions that may change the path</summary>
                      <ul>
                        {guide.whatToAsk.slice(0, 3).map((question, index) => (
                          <li key={index}>{question.text}</li>
                        ))}
                      </ul>
                    </details>
                  )}

                  {currentStepIndex === 0 && outcome === "active" && requirementLines.length > 0 && (
                    <details className="approved-details">
                      <summary>Before you start · approved requirements</summary>
                      {requirementLines.map((line, index) => <p key={index}>{line}</p>)}
                    </details>
                  )}

                  {outcome === "active" && noApprovedDevicePath && (
                    <section className="guide-coverage-gap" role="status">
                      <p className="eyebrow">Approved guide coverage gap</p>
                      <h3>No device-specific steps are approved here for {PLATFORM_LABELS[selectedPlatform] || selectedPlatform}.</h3>
                      <p>The Process Document may mention this platform in scope, but Ozzie did not find a supported step-by-step path for it. Another platform’s instructions will not be substituted.</p>
                      <div>
                        <button type="button" onClick={() => setTab("full")}>Open Full Process</button>
                        <button type="button" onClick={() => setTab("source")}>Open Source Pages</button>
                      </div>
                    </section>
                  )}

                  {outcome === "active" && currentStep && (
                    <article className="call-step-card guided-current-step">
                      <div className="guide-progress" aria-label={`Step ${currentStepIndex + 1} of ${activeSteps.length}`}>
                        <span>Step {currentStepIndex + 1} of {activeSteps.length}</span>
                        <progress value={currentStepIndex + 1} max={activeSteps.length} />
                      </div>
                      <div className="call-step-heading">
                        <span>Do this now</span>
                        <h3>{currentStep.title}</h3>
                        <button
                          onClick={() =>
                            copyText(
                              [
                                currentStep.title,
                                ...currentStep.instructions,
                                ...currentStep.confirmations,
                                ...currentStep.scripts,
                              ].join("\n"),
                              `step-${currentStepIndex}`,
                            )
                          }
                        >
                          {copyLabel(`step-${currentStepIndex}`, "Copy Step")}
                        </button>
                      </div>

                      {currentStep.instructions.length > 0 && (
                        <div className="guide-primary-actions">
                          <ul>
                            {currentStep.instructions.slice(0, 3).map((line, lineIndex) => (
                              <li key={lineIndex}>{line}</li>
                            ))}
                          </ul>
                          {currentStep.instructions.length > 3 && (
                            <details className="approved-details">
                              <summary>More approved detail ({currentStep.instructions.length - 3})</summary>
                              <ul>
                                {currentStep.instructions.slice(3).map((line, lineIndex) => (
                                  <li key={lineIndex}>{line}</li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </div>
                      )}

                      {currentStep.confirmations.length > 0 && (
                        <div className="step-confirm">
                          <p className="eyebrow">Confirm</p>
                          {currentStep.confirmations.map((line, lineIndex) => (
                            <p key={lineIndex}>{line}</p>
                          ))}
                        </div>
                      )}

                      {currentStep.scripts.length > 0 && (
                        <div className="step-script-compact">
                          <button
                            type="button"
                            onClick={() => copyText(currentStep.scripts.join("\n\n"), `step-${currentStepIndex}-script`)}
                          >
                            {copyLabel(`step-${currentStepIndex}-script`, "Copy Script")}
                          </button>
                          <details className="approved-details step-scripts">
                            <summary>Suggested wording</summary>
                            {currentStep.scripts.map((script, scriptIndex) => (
                              <blockquote key={scriptIndex}>{script}</blockquote>
                            ))}
                          </details>
                        </div>
                      )}

                      {currentStep.visualReferences.map((visual, visualIndex) => (
                        <button
                          className="view-visual"
                          key={visualIndex}
                          onClick={() => openVisual(visual)}
                        >
                          View Visual
                        </button>
                      ))}

                      <div className="guide-resolution-actions" aria-label="Step result">
                        <button type="button" className="guide-resolved" onClick={markResolved}>✓ Resolved / Done</button>
                        <button type="button" className="guide-not-resolved" onClick={markNotResolved}>
                          {currentStepIndex < activeSteps.length - 1 ? "Not resolved → Next step" : "Not resolved → Next options"}
                        </button>
                      </div>

                      {currentStepIndex > 0 && (
                        <button
                          type="button"
                          className="guide-back-step"
                          onClick={() => setCurrentStepIndex((index) => Math.max(0, index - 1))}
                        >
                          ← Previous step
                        </button>
                      )}
                    </article>
                  )}

                  {outcome === "resolved" && (
                    <section className="guide-resolution-state resolved" role="status">
                      <span>✓</span>
                      <div>
                        <p className="eyebrow">Resolved</p>
                        <h3>Stop here — no extra troubleshooting needed.</h3>
                        <p>The current approved path resolved the issue.</p>
                        <button type="button" onClick={resetProgress}>Start this path again</button>
                      </div>
                    </section>
                  )}

                  {outcome === "exhausted" && (
                    <section className="guide-resolution-state unresolved" role="status">
                      <span>→</span>
                      <div>
                        <p className="eyebrow">Still not resolved</p>
                        <h3>Choose the closest next approved path.</h3>
                        <p>Ozzie will not guess a fix. Continue only with another documented route or the approved referral boundary.</p>

                        {routeOptions.filter((route) => route.id !== activeRouteId).length > 0 && (
                          <div className="guide-next-options">
                            {routeOptions.filter((route) => route.id !== activeRouteId).map((route) => (
                              <button type="button" key={route.id} onClick={() => selectGuideRoute(route.id)}>
                                <strong>{route.label}</strong>
                                <span>Continue in this approved process</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {relatedRoutes.length > 0 && (
                          <div className="guide-next-options">
                            {relatedRoutes.map((route) => (
                              <button type="button" key={route.id} onClick={() => onOpenRoute?.(route.id)}>
                                <strong>{route.title}</strong>
                                <span>{route.subtitle}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <details className="approved-details referral-details">
                          <summary>When to stop / refer</summary>
                          {guide.referralDetails.map((line, index) => <p key={index}>{line}</p>)}
                          {guide.callouts
                            .filter((callout) => callout.kind === "referral" || callout.kind === "limitation")
                            .flatMap((callout) => callout.lines)
                            .map((line, index) => <p key={index}>{line}</p>)}
                        </details>
                      </div>
                    </section>
                  )}

                  {guide.globalScripts.length > 0 && (
                    <details className="approved-details">
                      <summary>Additional approved source wording</summary>
                      {guide.globalScripts.map((script, index) => (
                        <div className="suggested-script" key={index}>
                          <blockquote>{script}</blockquote>
                          <button onClick={() => copyText(script, `global-script-${index}`)}>
                            {copyLabel(`global-script-${index}`, "Copy Script")}
                          </button>
                        </div>
                      ))}
                    </details>
                  )}

                  <section className="guide-source-trace">
                    <p className="eyebrow">Source traceability</p>
                    <h3>Approved process first. Official Zoom Support where available.</h3>
                    <p>The concise Call Guide reorganizes the approved Process Document; the Full Process and Source Pages remain unchanged.</p>
                    {officialSources.length > 0 && (
                      <div>
                        {officialSources.map((source) => (
                          <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                            Zoom Support — {source.title} ↗
                          </a>
                        ))}
                      </div>
                    )}
                  </section>

                  {trainingCategoryByProcessCategory[process.category] &&
                    relatedTrainingForCategory(trainingCategoryByProcessCategory[process.category]).length > 0 && (
                      <div className="related-training">
                        <p className="eyebrow">Related training</p>
                        <div>
                          {relatedTrainingForCategory(trainingCategoryByProcessCategory[process.category])
                            .slice(0, 3)
                            .map((video) => (
                              <button key={video.id} onClick={() => onOpenTraining?.(video.id)}>
                                {video.title}
                              </button>
                            ))}
                        </div>
                        <button onClick={() => onOpenTraining?.()}>Open Training &amp; Resources</button>
                      </div>
                    )}
                </>
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
