import { useEffect, useMemo, useRef, useState } from 'react'
import { TRAINING_CATEGORIES, TRAINING_VIDEOS, trainingEmbedUrl } from '../../data/trainingVideos'
import { useDialogFocus } from '../../lib/useDialogFocus'
import { DeviceWalkthroughs } from './DeviceWalkthroughs'
import { ScriptsCommunication } from './ScriptsCommunication'
import { TrainingRoadmap } from './TrainingRoadmap'
import { GuidedLessons } from './GuidedLessons'

function VideoViewer({ videos, index, onClose }) {
  const dialogRef = useRef(null)
  const video = videos[index]
  useDialogFocus(dialogRef, true, onClose)

  return <div className="modal-backdrop training-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section ref={dialogRef} tabIndex={-1} className="training-viewer" role="dialog" aria-modal="true" aria-label={video.title}>
      <header><div><p className="eyebrow">Zoom training video</p><h2>{video.title}</h2></div><button className="drawer-close" type="button" aria-label="Close video" onClick={onClose}>×</button></header>
      <div className="video-frame"><iframe title={'Video player: ' + video.title} src={trainingEmbedUrl(video.videoId)} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
      <p><strong>Useful for:</strong> {video.usefulFor}</p>
      {video.relatedCategories.length > 0 && <div className="training-tags">{video.relatedCategories.map((category) => <span key={category}>{category}</span>)}</div>}
      <footer><div className="viewer-navigation"><button type="button" disabled={index === 0} onClick={() => videos.onChange(index - 1)}>Previous Video</button><button type="button" disabled={index === videos.length - 1} onClick={() => videos.onChange(index + 1)}>Next Video</button></div><a href={video.youtubeUrl} target="_blank" rel="noreferrer">Open on YouTube</a></footer>
    </section>
  </div>
}

export function TrainingResources({ initialVideoId = null, initialTarget = null, onReportContextChange = () => {} }) {
  const initialIndex = initialVideoId ? TRAINING_VIDEOS.findIndex(video => video.id === initialVideoId) : -1
  const [section, setSection] = useState(initialVideoId ? 'videos' : initialTarget?.section || 'roadmap')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : null)
  const [deviceTarget, setDeviceTarget] = useState(initialTarget?.device || null)
  const [scriptTarget, setScriptTarget] = useState({
    mode: initialTarget?.mode || null,
    subsection: initialTarget?.subsection || null,
    scenario: initialTarget?.scenario || null,
  })

  useEffect(() => {
    if (!initialVideoId) return
    const nextIndex = TRAINING_VIDEOS.findIndex(video => video.id === initialVideoId)
    if (nextIndex >= 0) {
      setSection('videos')
      setQuery('')
      setCategory('All')
      setActiveIndex(nextIndex)
    }
  }, [initialVideoId])

  useEffect(() => {
    if (!initialTarget?.section) return
    setSection(initialTarget.section)
    setActiveIndex(null)
    if (initialTarget.section === 'devices') {
      setDeviceTarget(initialTarget.device || null)
    }
    if (initialTarget.section === 'scripts') {
      setScriptTarget({
        mode: initialTarget.mode || 'language',
        subsection: initialTarget.subsection || null,
        scenario: initialTarget.scenario || null,
      })
    }
  }, [initialTarget])

  const filteredVideos = useMemo(() => TRAINING_VIDEOS.filter((video) => {
    const haystack = (video.title + ' ' + video.usefulFor + ' ' + video.relatedCategories.join(' ')).toLowerCase()
    return haystack.includes(query.trim().toLowerCase()) && (category === 'All' || video.relatedCategories.includes(category))
  }), [query, category])
  const viewerVideos = Object.assign(filteredVideos, { onChange: setActiveIndex })

  useEffect(() => {
    if (section === 'lessons') return

    const sectionLabels = {
      roadmap: 'Training Roadmap',
      lessons: 'Guided Visual Lessons',
      devices: 'Device Walkthroughs',
      scripts: 'Scripts & Communication',
      videos: 'Video Library',
    }
    onReportContextChange({
      selected_tab: sectionLabels[section] || section,
      current_section: section === 'videos'
        ? (activeIndex !== null ? filteredVideos[activeIndex]?.title || 'Video Library' : category !== 'All' ? category : null)
        : section === 'roadmap'
          ? 'Phase 6 learning path'
          : null,
      active_device: null,
      active_caller_role: null,
      active_common_issue: null,
      process_id: null,
      category_id: null,
    })
  }, [section, activeIndex, category, filteredVideos, onReportContextChange])

  function changeSection(nextSection) {
    setSection(nextSection)
    setActiveIndex(null)
  }

  function openRoadmapResource(target) {
    if (target.section === 'devices') {
      setDeviceTarget(target.device || null)
    }
    if (target.section === 'scripts') {
      setScriptTarget({
        mode: target.mode || 'language',
        subsection: target.subsection || null,
        scenario: target.scenario || null,
      })
    }
    setSection(target.section)
    setActiveIndex(null)
  }

  return <section className="console-view training-library">
    <div className="view-heading">
      <div>
        <p className="eyebrow">Zoom learning workspace</p>
        <h1>Training &amp; Resources</h1>
        <p>Start with the roadmap, then open the visual walkthroughs, communication lessons, scenarios, and videos when you need them.</p>
      </div>
      <span className="playlist-label">{section === 'roadmap' ? 'Phase 6 · Structured learning path' : section === 'lessons' ? 'Phase 6 · Guided visual lessons' : section === 'devices' ? 'Phase 3 · Windows + Mac + iPhone + Android + Browser' : section === 'scripts' ? 'Phase 4 · Call language + scenario scripts' : 'Getting Started with Zoom · ' + TRAINING_VIDEOS.length + ' videos'}</span>
    </div>

    <div className="training-section-tabs" role="tablist" aria-label="Training resource sections">
      <button
        type="button"
        role="tab"
        aria-selected={section === 'roadmap'}
        onClick={() => changeSection('roadmap')}
      >Training Roadmap</button>
      <button
        type="button"
        role="tab"
        aria-selected={section === 'lessons'}
        onClick={() => changeSection('lessons')}
      >Guided Visual Lessons</button>
      <button
        type="button"
        role="tab"
        aria-selected={section === 'devices'}
        onClick={() => changeSection('devices')}
      >Device Walkthroughs</button>
      <button
        type="button"
        role="tab"
        aria-selected={section === 'scripts'}
        onClick={() => changeSection('scripts')}
      >Scripts &amp; Communication</button>
      <button
        type="button"
        role="tab"
        aria-selected={section === 'videos'}
        onClick={() => changeSection('videos')}
      >Video Library</button>
    </div>

    {section === 'roadmap'
      ? <TrainingRoadmap onOpenResource={openRoadmapResource} />
      : section === 'lessons'
        ? <GuidedLessons onOpenResource={openRoadmapResource} onReportContextChange={onReportContextChange} />
        : section === 'devices'
          ? <DeviceWalkthroughs initialDeviceId={deviceTarget} onReportContextChange={onReportContextChange} />
        : section === 'scripts'
          ? <ScriptsCommunication
              onReportContextChange={onReportContextChange}
              initialMode={scriptTarget.mode}
              initialSectionId={scriptTarget.subsection}
              initialScenarioId={scriptTarget.scenario}
            />
          : <>
          <div className="training-controls"><label>Search training videos<input type="search" aria-label="Search training videos" value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(null) }} placeholder="Search topics and support categories" /></label><label>Filter by category<select aria-label="Filter training by category" value={category} onChange={(event) => { setCategory(event.target.value); setActiveIndex(null) }}>{TRAINING_CATEGORIES.map((name) => <option key={name}>{name}</option>)}</select></label></div>
          <p className="library-count">{filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} available</p>
          <div className="training-grid">{filteredVideos.map((video, index) => <article key={video.id} className="training-card"><img loading="lazy" src={video.thumbnailUrl} alt="" /><div className="training-card-body"><h2>{video.title}</h2><p><strong>Useful for:</strong> {video.usefulFor}</p>{video.relatedCategories.length > 0 && <div className="training-tags">{video.relatedCategories.map((tag) => <span key={tag}>{tag}</span>)}</div>}<button type="button" onClick={() => setActiveIndex(index)}>Watch Video</button></div></article>)}</div>
          {filteredVideos.length === 0 && <div className="empty-state"><h2>No training videos found</h2><p>Try another keyword or category.</p></div>}
          {activeIndex !== null && <VideoViewer videos={viewerVideos} index={activeIndex} onClose={() => setActiveIndex(null)} />}
        </>}
  </section>
}
