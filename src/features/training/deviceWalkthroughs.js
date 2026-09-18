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
  },,
  {
    id: 'iphone',
    label: 'iPhone',
    title: 'iPhone mobile walkthrough',
    subtitle: 'Zoom Workplace mobile app on iOS',
    summary: 'Use the iPhone map to orient the caller around the mobile meeting controls, join-audio choices, camera behavior, iOS permissions, and the iOS screen-broadcast flow.',
    quickFacts: [
      'Mobile app path',
      'Mute default label: Mute My Microphone',
      'Screen share uses the iOS Screen Broadcast flow',
    ],
    sections: [
      {
        id: 'iphone-open-settings',
        eyebrow: '1 · Open / Settings',
        title: 'Start from the Zoom mobile app',
        image: 'assets/visual-references/iphone-mobile-settings.svg',
        imageAlt: 'iPhone guide showing Zoom Settings, Meetings, Mute My Microphone, Turn Off My Video, and iOS permissions',
        steps: [
          'Open the Zoom mobile app on the iPhone.',
          'Use the app Home area to join or start the meeting. If the caller needs a default join preference, open Settings → Meetings.',
          'For a mute-on-join default, use Mute My Microphone. For a video-off default, use Turn Off My Video.',
        ],
        whatTheyShouldSee: 'Zoom mobile settings show the iOS-specific Mute My Microphone label and the meeting join preferences.',
      },
      {
        id: 'iphone-controls',
        eyebrow: '2 · In-meeting map',
        title: 'Tap the meeting to reveal the mobile controls',
        image: 'assets/visual-references/iphone-mobile-controls.svg',
        imageAlt: 'iPhone Zoom meeting controls guide showing Audio, Mute, Video, Chat, and More',
        steps: [
          'Tap the meeting screen when the controls are hidden.',
          'Use Join Audio / Audio or Mute / Unmute in the meeting controls for the caller’s own meeting audio.',
          'Use Video for the caller’s camera. Open More when the needed option is not visible on the main toolbar.',
        ],
        whatTheyShouldSee: 'The mobile meeting controls appear. Exact control placement can vary by meeting state, role, and Zoom version.',
      },
      {
        id: 'iphone-audio-video',
        eyebrow: '3 · Audio / Video',
        title: 'Connect audio first, then test mute or camera state',
        image: 'assets/visual-references/iphone-mobile-controls.svg',
        imageAlt: 'iPhone Zoom mobile meeting controls showing Audio, Mute, and Video controls',
        steps: [
          'If the caller has not joined meeting audio, tap Join Audio and use the internet-audio option displayed by Zoom. Current Zoom articles may show Call using Internet Audio or Wifi or Cellular Data depending on the flow.',
          'Once connected, use Mute / Unmute for the caller’s microphone.',
          'Use Start Video / Stop Video for the camera. First-time camera or microphone use may trigger an iOS permission prompt.',
        ],
        whatTheyShouldSee: 'The caller is connected to meeting audio, the microphone state changes when tapped, and video works when Zoom has iOS camera permission.',
      },
      {
        id: 'iphone-share-permissions',
        eyebrow: '4 · Share / iOS permissions',
        title: 'iPhone screen sharing uses Screen Broadcast',
        image: 'assets/visual-references/iphone-mobile-settings.svg',
        imageAlt: 'iPhone Zoom settings and iOS permission guide',
        steps: [
          'For screen sharing, tap Share → Screen, review the iOS system notice, then use Start Broadcast.',
          'To stop sharing, return to Zoom and tap Stop Share or use the iOS broadcast indicator.',
          'If microphone or camera access is blocked, open iPhone Settings → Zoom and enable the permission that matches the caller’s symptom.',
        ],
        whatTheyShouldSee: 'iOS shows the screen-broadcast state while sharing, and Zoom has the required Camera or Microphone permission when those features are used.',
      },
    ],
    platformNotes: [
      {
        title: 'iOS mute label',
        text: 'Zoom currently labels the iPhone mute-on-join default Mute My Microphone; Android uses Always Mute My Microphone.',
      },
      {
        title: 'iOS screen share',
        text: 'Sharing the entire iPhone screen uses Apple’s Screen Broadcast flow and a Start Broadcast action.',
      },
      {
        title: 'Mobile controls can move',
        text: 'Participant controls can appear differently based on meeting state and app version. Use More when the requested control is not visible.',
      },
    ],
    sources: [
      {
        title: 'Getting started with the Zoom Workplace mobile app',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063582',
      },
      {
        title: 'Participant controls in a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062674',
      },
      {
        title: 'Muting your microphone when joining a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062614',
      },
      {
        title: 'Audio settings for iOS',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064460',
      },
      {
        title: 'Sharing your iOS screen from the Zoom mobile app',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0066104',
      },
    ],
  },
  {
    id: 'android',
    label: 'Android',
    title: 'Android mobile walkthrough',
    subtitle: 'Zoom Workplace mobile app on Android',
    summary: 'Use the Android map to orient the caller around mobile controls, Zoom meeting defaults, Android permissions, audio connection, and system-level screen-sharing indicators.',
    quickFacts: [
      'Mobile app path',
      'Mute default label: Always Mute My Microphone',
      'Android permission menus vary by device manufacturer',
    ],
    sections: [
      {
        id: 'android-open-settings',
        eyebrow: '1 · Open / Settings',
        title: 'Start from the Zoom mobile app',
        image: 'assets/visual-references/android-mobile-settings.svg',
        imageAlt: 'Android guide showing Zoom Settings, Meetings, Always Mute My Microphone, Turn Off My Video, and Android permissions',
        steps: [
          'Open the Zoom mobile app on the Android device.',
          'Use the app Home area to join or start the meeting. For join defaults, open Settings → Meetings.',
          'For mute-on-join, use Always Mute My Microphone. For video-off by default, use Turn Off My Video.',
        ],
        whatTheyShouldSee: 'Zoom mobile settings show the Android-specific Always Mute My Microphone label and the meeting join preferences.',
      },
      {
        id: 'android-controls',
        eyebrow: '2 · In-meeting map',
        title: 'Use the mobile toolbar and More',
        image: 'assets/visual-references/android-mobile-controls.svg',
        imageAlt: 'Android Zoom meeting controls guide showing Mute, Video, Chat, Share, and More',
        steps: [
          'Tap the meeting screen if the controls are hidden.',
          'Use Mute / Unmute and Video for the caller’s own microphone and camera after they are connected to meeting audio.',
          'Open More for additional controls such as Participants, Host tools, reactions, or meeting settings when those options are available.',
        ],
        whatTheyShouldSee: 'The Android meeting controls appear with More available for additional actions not shown on the main toolbar.',
      },
      {
        id: 'android-audio-video',
        eyebrow: '3 · Audio / Video',
        title: 'Join device audio before troubleshooting the microphone',
        image: 'assets/visual-references/android-mobile-controls.svg',
        imageAlt: 'Android Zoom mobile meeting controls showing microphone, video, and More',
        steps: [
          'If the caller has not joined meeting audio, tap Join Audio and use the internet-audio option displayed by Zoom, such as Wifi or Cellular Data.',
          'After audio connects, use Mute / Unmute to confirm the microphone state.',
          'Use Start Video / Stop Video for the camera. First-time use may require Android microphone or camera permission.',
        ],
        whatTheyShouldSee: 'The device is connected to Zoom meeting audio and the caller can control their microphone and camera from the meeting toolbar.',
      },
      {
        id: 'android-share-permissions',
        eyebrow: '4 · Share / Android permissions',
        title: 'Android shows a system sharing indicator',
        image: 'assets/visual-references/android-mobile-settings.svg',
        imageAlt: 'Android Zoom settings and permissions guide',
        steps: [
          'Use Share / Start share from the meeting controls and choose the content the caller wants to share.',
          'When full-screen sharing begins, Android displays a system notification or screen-broadcast indicator showing that capture is active.',
          'If microphone or camera access is blocked, open Android Settings → Apps → Zoom → Permissions. Menu wording can vary by manufacturer, so look for Apps, Permission Manager, or Privacy controls.',
        ],
        whatTheyShouldSee: 'Android indicates when screen sharing is active, and Zoom has the required Camera or Microphone permission for the affected feature.',
      },
    ],
    platformNotes: [
      {
        title: 'Android mute label',
        text: 'Zoom currently labels the Android mute-on-join default Always Mute My Microphone; iPhone uses Mute My Microphone.',
      },
      {
        title: 'Android permission menus vary',
        text: 'The Android path may be Apps, Apps & notifications, Permission Manager, or Privacy controls depending on the device maker and OS version.',
      },
      {
        title: 'More is important',
        text: 'Zoom’s current mobile guidance frequently routes Participants, Host tools, reactions, and extra meeting controls through More.',
      },
    ],
    sources: [
      {
        title: 'Getting started with the Zoom Workplace mobile app',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063582',
      },
      {
        title: 'Participant controls in a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062674',
      },
      {
        title: 'Muting your microphone when joining a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062614',
      },
      {
        title: 'Testing your audio settings for Zoom meetings',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062765',
      },
      {
        title: 'Troubleshooting speaker or microphone issues on your mobile device',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0066222',
      },
    ],
  }
]

export function deviceWalkthroughById(id) {
  return DEVICE_WALKTHROUGHS.find(device => device.id === id) ?? null
}
