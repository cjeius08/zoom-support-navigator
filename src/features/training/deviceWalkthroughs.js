export const DEVICE_WALKTHROUGH_VERIFIED_AT = 'September 18, 2026'

export const DEVICE_WALKTHROUGHS = [
  {
    id: 'windows',
    label: 'Windows',
    title: 'Windows desktop walkthrough',
    subtitle: 'Zoom Workplace desktop app',
    summary: 'Use this map to orient the caller before troubleshooting: open Zoom, find Settings, identify the in-meeting toolbar, then move into Audio or Video only when the symptom requires it.',
    quickFacts: [
      'Desktop app path',
      'Mute / unmute shortcut: Alt + A',
      'Meeting controls appear at the bottom of the meeting window',
    ],
    sections: [
      {
        id: 'windows-open-join',
        eyebrow: '1 · Open / Join',
        title: 'Start from Zoom Workplace',
        image: 'assets/visual-references/join-meeting.png',
        imageAlt: 'Zoom Workplace join screen showing the Join a meeting option',
        steps: [
          'Open the Zoom Workplace desktop app.',
          'Use Home → Join when the caller has a Meeting ID, or use the meeting invitation link.',
          'If the caller needs app settings, open the profile menu → Settings. On Zoom Workplace 6.7.0 and later, the navigation-bar gear can also open Settings.',
        ],
        whatTheyShouldSee: 'Zoom Workplace opens to the app workspace, with Join available for entering a meeting and Settings available from the profile or gear.',
      },
      {
        id: 'windows-toolbar',
        eyebrow: '2 · In-meeting map',
        title: 'Find the meeting controls toolbar',
        image: 'assets/visual-references/workplace-controls.png',
        imageAlt: 'Zoom Workplace in-meeting toolbar with Audio, Video, Participants, Chat, Share, and other controls',
        steps: [
          'Move the pointer inside the meeting window if the toolbar is hidden.',
          'Look along the bottom for Audio, Video, Participants, Chat, Share, and other available controls.',
          'Open More when the control the caller needs is not pinned to the visible toolbar.',
        ],
        whatTheyShouldSee: 'The bottom toolbar appears. Exact controls can vary by role, meeting settings, product access, and toolbar customization.',
      },
      {
        id: 'windows-audio',
        eyebrow: '3 · Audio',
        title: 'Speaker and microphone live under Audio',
        image: 'assets/visual-references/audio-settings.png',
        imageAlt: 'Zoom Audio settings showing speaker and microphone selectors and test controls',
        steps: [
          'Use the arrow beside Audio / Mute to change the current speaker or microphone during a meeting.',
          'Open Audio Settings for the full speaker and microphone controls.',
          'Use Test Speaker or the microphone test before changing OS settings or reinstalling Zoom.',
        ],
        whatTheyShouldSee: 'The intended speaker and microphone are selected and Zoom can test them.',
      },
      {
        id: 'windows-video',
        eyebrow: '4 · Video',
        title: 'Camera selection lives under Video',
        image: 'assets/visual-references/video-settings.png',
        imageAlt: 'Zoom Video settings showing the selected camera and preview',
        steps: [
          'Use Start Video / Stop Video for the caller’s own camera.',
          'Use the arrow beside Video to change the selected camera or open video settings.',
          'Confirm the video preview before moving into Windows privacy permissions or deeper troubleshooting.',
        ],
        whatTheyShouldSee: 'The intended camera is selected and a usable preview appears when camera access is available.',
      },
    ],
    platformNotes: [
      {
        title: 'Windows shortcut',
        text: 'Alt + A toggles mute / unmute when the Zoom meeting window has focus.',
      },
      {
        title: 'Windows privacy boundary',
        text: 'If Zoom cannot access the microphone or camera, verify Windows privacy permissions before treating the Zoom app itself as defective.',
      },
      {
        title: 'Do not confuse app vs web',
        text: 'These labels are for the Zoom Workplace desktop app. A caller using Zoom in a browser needs the Browser walkthrough instead.',
      },
    ],
    sources: [
      {
        title: 'Getting started with the Zoom Workplace desktop app',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064516',
      },
      {
        title: 'Participant controls in a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062674',
      },
      {
        title: 'Changing settings in the Zoom Workplace desktop and mobile app',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060612',
      },
      {
        title: 'Troubleshooting speaker or microphone issues in the desktop app',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060836',
      },
    ],
  },
  {
    id: 'mac',
    label: 'Mac',
    title: 'Mac desktop walkthrough',
    subtitle: 'Zoom Workplace desktop app on macOS',
    summary: 'The Zoom app layout is largely shared with Windows, but macOS has its own keyboard shortcut and system-level Camera, Microphone, and Screen Recording permissions.',
    quickFacts: [
      'Desktop app path',
      'Mute / unmute shortcut: Command + Shift + A',
      'macOS permissions: System Settings → Privacy & Security',
    ],
    sections: [
      {
        id: 'mac-open-join',
        eyebrow: '1 · Open / Join',
        title: 'Open Zoom Workplace, then orient the caller',
        image: 'assets/visual-references/join-meeting.png',
        imageAlt: 'Zoom Workplace join screen showing the Join a meeting option',
        steps: [
          'Open Zoom Workplace from Applications, Launchpad, Spotlight, or the Dock.',
          'Use Home → Join when the caller has a Meeting ID, or use the meeting invitation link.',
          'Open the profile menu → Settings. On Zoom Workplace 6.7.0 and later, the navigation-bar gear can also open Settings.',
        ],
        whatTheyShouldSee: 'The Zoom Workplace app opens with the normal app navigation and Join available for meeting entry.',
      },
      {
        id: 'mac-toolbar',
        eyebrow: '2 · In-meeting map',
        title: 'Use the same core meeting toolbar',
        image: 'assets/visual-references/workplace-controls.png',
        imageAlt: 'Zoom Workplace in-meeting toolbar with Audio, Video, Participants, Chat, Share, and other controls',
        steps: [
          'Move the pointer inside the meeting window if the controls are hidden.',
          'Look at the bottom for Audio, Video, Participants, Chat, Share, and the other controls available to this caller.',
          'Check More when a control is not visible; toolbar contents can vary by role and customization.',
        ],
        whatTheyShouldSee: 'The meeting controls toolbar appears at the bottom of the meeting window.',
      },
      {
        id: 'mac-audio-video',
        eyebrow: '3 · Audio / Video',
        title: 'Select the Zoom device before changing macOS',
        image: 'assets/visual-references/audio-settings.png',
        imageAlt: 'Zoom Audio settings showing speaker and microphone selectors and test controls',
        steps: [
          'For audio, use the arrow beside Audio / Mute to select the speaker and microphone, then test them.',
          'For camera issues, use the arrow beside Video to select the intended camera and confirm the preview.',
          'Only move to macOS permissions when the correct Zoom device is selected but Zoom still cannot access it.',
        ],
        whatTheyShouldSee: 'Zoom has the intended speaker, microphone, and camera selected before the agent changes macOS privacy settings.',
      },
      {
        id: 'mac-permissions',
        eyebrow: '4 · macOS permissions',
        title: 'Camera, microphone, and screen sharing can be blocked by macOS',
        image: 'assets/visual-references/video-settings.png',
        imageAlt: 'Zoom Video settings showing the selected camera and preview before checking macOS permissions',
        steps: [
          'Open Apple menu → System Settings → Privacy & Security.',
          'Choose the permission that matches the symptom: Camera, Microphone, or Screen & System Audio Recording.',
          'Enable Zoom when the caller is authorized to change the Mac setting.',
          'If macOS prompts to restart Zoom after changing the permission, restart the app before testing again.',
        ],
        whatTheyShouldSee: 'Zoom is allowed for the required macOS permission and the affected function works after the app is restarted when required.',
      },
    ],
    platformNotes: [
      {
        title: 'Mac shortcut',
        text: 'Command + Shift + A toggles mute / unmute when Zoom has focus.',
      },
      {
        title: 'Permissions are outside Zoom',
        text: 'Camera, Microphone, and Screen & System Audio Recording permissions live in macOS System Settings → Privacy & Security.',
      },
      {
        title: 'Administrator boundary',
        text: 'Changing protected macOS permissions may require administrator access. Do not bypass organization-managed settings.',
      },
    ],
    sources: [
      {
        title: 'Getting started with the Zoom Workplace desktop app',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064516',
      },
      {
        title: 'Participant controls in a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062674',
      },
      {
        title: 'Changing settings in the Zoom Workplace desktop and mobile app',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060612',
      },
      {
        title: 'Granting macOS permissions for Zoom',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064868',
      },
    ],
  },
]

export function deviceWalkthroughById(id) {
  return DEVICE_WALKTHROUGHS.find(device => device.id === id) ?? null
}
