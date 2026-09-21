import { useEffect, useRef, useState } from 'react'
import { useDialogFocus } from '../../lib/useDialogFocus'
import './OzzieWelcome.css'

const OZZIE_AUDIO_DELAY_SECONDS = 0.18

export function OzzieWelcome({
  open = false,
  videoSrc,
  busy = false,
  error = '',
  replay = false,
  onContinue = () => {},
  onClose = () => {},
}) {
  const dialogRef = useRef(null)
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const syncFrameRef = useRef(null)
  const audioAlignedRef = useRef(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  useDialogFocus(dialogRef, open, replay ? onClose : undefined)

  const cancelSyncFrame = () => {
    if (syncFrameRef.current) {
      cancelAnimationFrame(syncFrameRef.current)
      syncFrameRef.current = null
    }
  }

  const pauseIntro = () => {
    cancelSyncFrame()
    videoRef.current?.pause()
    audioRef.current?.pause()
    setVideoPlaying(false)
  }

  useEffect(() => {
    if (!open) {
      pauseIntro()
      audioAlignedRef.current = false
      return undefined
    }

    return () => {
      cancelSyncFrame()
      videoRef.current?.pause()
      audioRef.current?.pause()
    }
  }, [open, videoSrc])

  if (!open) return null

  const finish = replay ? onClose : onContinue

  const startIntro = async () => {
    const video = videoRef.current
    const audio = audioRef.current
    if (!video || !audio) return

    cancelSyncFrame()

    if (video.ended || (Number.isFinite(video.duration) && video.currentTime >= video.duration - 0.05)) {
      video.currentTime = 0
      audio.currentTime = 0
      audioAlignedRef.current = false
    }

    if (audioAlignedRef.current && video.currentTime >= OZZIE_AUDIO_DELAY_SECONDS) {
      audio.currentTime = Math.max(0, video.currentTime - OZZIE_AUDIO_DELAY_SECONDS)
      audio.muted = false
      await Promise.allSettled([video.play(), audio.play()])
      setVideoPlaying(!video.paused)
      return
    }

    audio.muted = true
    audio.currentTime = 0
    await Promise.allSettled([video.play(), audio.play()])
    setVideoPlaying(!video.paused)

    const releaseAudioWhenVideoIsReady = () => {
      if (!videoRef.current || !audioRef.current || videoRef.current.paused) {
        syncFrameRef.current = null
        return
      }

      if (videoRef.current.currentTime >= OZZIE_AUDIO_DELAY_SECONDS) {
        audioRef.current.currentTime = 0
        audioRef.current.muted = false
        audioAlignedRef.current = true
        syncFrameRef.current = null
        return
      }

      syncFrameRef.current = requestAnimationFrame(releaseAudioWhenVideoIsReady)
    }

    syncFrameRef.current = requestAnimationFrame(releaseAudioWhenVideoIsReady)
  }

  const toggleIntroPlayback = () => {
    if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
      pauseIntro()
      return
    }
    void startIntro()
  }

  const resetIntroPlayback = () => {
    cancelSyncFrame()
    const video = videoRef.current
    const audio = audioRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audio.muted = true
    }
    audioAlignedRef.current = false
    setVideoPlaying(false)
  }

  return (
    <div className="ozzie-welcome-backdrop" role="presentation">
      <section
        ref={dialogRef}
        tabIndex={-1}
        className="ozzie-welcome-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ozzie-welcome-title"
        aria-describedby="ozzie-welcome-description"
      >
        <div className="ozzie-welcome-media">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            src={videoSrc}
            aria-label="Meet Ozzie introduction video"
            onEnded={resetIntroPlayback}
          >
            Your browser does not support this introduction video.
          </video>
          <audio
            ref={audioRef}
            preload="auto"
            src={videoSrc}
            aria-hidden="true"
          />
          <div className="ozzie-video-controls">
            <button
              type="button"
              className="ozzie-video-play"
              onClick={toggleIntroPlayback}
              aria-label={videoPlaying ? 'Pause Ozzie introduction' : 'Play Ozzie introduction'}
            >
              {videoPlaying ? 'Pause' : 'Play Ozzie'}
            </button>
            <small>Audio is synchronized to Ozzie’s animation.</small>
          </div>
        </div>

        <div className="ozzie-welcome-copy">
          <p className="eyebrow">{replay ? 'Ozzie introduction' : 'Welcome to your workspace'}</p>
          <h2 id="ozzie-welcome-title">Meet Ozzie</h2>
          <p id="ozzie-welcome-description">
            Your guide to the Ogletree Support Workspace. Find Zoom guidance,
            training, troubleshooting routes, and live-call support faster.
          </p>

          {error && <p className="ozzie-welcome-error" role="alert">{error}</p>}

          <div className="ozzie-welcome-actions">
            <button
              type="button"
              className="primary-action"
              disabled={busy}
              onClick={finish}
            >
              {busy ? 'Opening workspace…' : replay ? 'Back to Workspace' : 'Start Exploring'}
            </button>
            {!replay && (
              <button
                type="button"
                className="ozzie-welcome-skip"
                disabled={busy}
                onClick={onContinue}
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
