insert into private.zoom_readiness_questions (
  question_set_version,
  question_id,
  question_order,
  prompt,
  options,
  correct_option_id,
  explanation,
  location_label,
  resource_target,
  source_label
) values
(
  'zoom_device_navigation_v1',
  'windows-toolbar-location',
  1,
  'A Windows caller is already inside a Zoom meeting but says the meeting controls disappeared. What should the agent guide them to do first?',
  '[
    {"id":"a","text":"Open Windows Settings and change the taskbar behavior."},
    {"id":"b","text":"Move the pointer inside the Zoom meeting window and look along the bottom for the meeting controls toolbar."},
    {"id":"c","text":"Open the browser version of Zoom instead."},
    {"id":"d","text":"Press Alt + F4 to refresh the controls."}
  ]'::jsonb,
  'b',
  'On the Zoom Workplace desktop app for Windows, the in-meeting controls can hide until the pointer moves inside the meeting window. The toolbar appears along the bottom; More can contain controls that are not pinned.',
  'Training & Resources → Device Walkthroughs → Windows → In-meeting map',
  '{"view":"training","section":"devices","device":"windows"}'::jsonb,
  'Device Walkthroughs · Windows desktop walkthrough'
),
(
  'zoom_device_navigation_v1',
  'mac-privacy-location',
  2,
  'A Mac caller has the correct camera selected in Zoom, but macOS is blocking access. Where should the agent guide them next?',
  '[
    {"id":"a","text":"Apple menu → System Settings → Privacy & Security, then open the permission that matches the symptom."},
    {"id":"b","text":"Zoom profile → Meetings → Advanced → Camera permissions."},
    {"id":"c","text":"Finder → Applications → Zoom → Get Info → Sharing & Permissions."},
    {"id":"d","text":"Safari Settings → Websites, even though the caller is using the desktop app."}
  ]'::jsonb,
  'a',
  'For the Zoom Workplace desktop app on macOS, Camera, Microphone, and Screen & System Audio Recording permissions are controlled in macOS System Settings → Privacy & Security. The permission should match the caller''s symptom.',
  'Training & Resources → Device Walkthroughs → Mac → macOS permissions',
  '{"view":"training","section":"devices","device":"mac"}'::jsonb,
  'Device Walkthroughs · Mac desktop walkthrough'
),
(
  'zoom_device_navigation_v1',
  'iphone-screen-broadcast',
  3,
  'An iPhone caller needs to share the entire phone screen in Zoom. Which path matches the iPhone walkthrough?',
  '[
    {"id":"a","text":"More → Settings → Display Capture → Start."},
    {"id":"b","text":"Share → Screen, review the iOS notice, then choose Start Broadcast."},
    {"id":"c","text":"Open Control Center first and enable AirPlay Mirroring to Zoom."},
    {"id":"d","text":"Open iPhone Settings → Zoom → Screen Recording and start the share there."}
  ]'::jsonb,
  'b',
  'On iPhone, full-screen sharing uses Apple''s Screen Broadcast flow. The approved walkthrough is Share → Screen, then Start Broadcast after the iOS system notice.',
  'Training & Resources → Device Walkthroughs → iPhone → Share / iOS permissions',
  '{"view":"training","section":"devices","device":"iphone"}'::jsonb,
  'Device Walkthroughs · iPhone mobile walkthrough'
),
(
  'zoom_device_navigation_v1',
  'android-audio-before-mic',
  4,
  'An Android caller joined the meeting but has not connected to meeting audio yet. They say the microphone is not working. What should the agent do first?',
  '[
    {"id":"a","text":"Open Android permission settings immediately and reinstall Zoom if the microphone is listed."},
    {"id":"b","text":"Tap Join Audio and connect using the internet-audio option Zoom shows, then test Mute / Unmute."},
    {"id":"c","text":"Open More and change the meeting host."},
    {"id":"d","text":"Switch the caller to the desktop app before testing audio."}
  ]'::jsonb,
  'b',
  'The Android walkthrough says to join device audio before troubleshooting the microphone. After audio connects, use Mute / Unmute to confirm the microphone state, then move to permissions only if needed.',
  'Training & Resources → Device Walkthroughs → Android → Audio / Video',
  '{"view":"training","section":"devices","device":"android"}'::jsonb,
  'Device Walkthroughs · Android mobile walkthrough'
),
(
  'zoom_device_navigation_v1',
  'browser-webapp-boundary',
  5,
  'A caller is using Zoom in a desktop browser, not the installed app. Which guidance best matches the Browser walkthrough?',
  '[
    {"id":"a","text":"Give them the desktop-app profile menu and installed-app Settings path."},
    {"id":"b","text":"Use the Zoom Web App controls and browser/site permissions; do not assume installed-app paths apply."},
    {"id":"c","text":"Tell them browser Zoom cannot use microphone or camera."},
    {"id":"d","text":"Require the desktop app before checking whether Join from your browser is available."}
  ]'::jsonb,
  'b',
  'The Zoom Web App is not the installed desktop app. Its in-meeting controls, Web App settings, and browser/site permissions should be used instead of desktop-app-only paths.',
  'Training & Resources → Device Walkthroughs → Browser → Web App controls / permissions',
  '{"view":"training","section":"devices","device":"browser"}'::jsonb,
  'Device Walkthroughs · Browser / Zoom Web App walkthrough'
)
on conflict (question_set_version, question_id) do update
set
  question_order = excluded.question_order,
  prompt = excluded.prompt,
  options = excluded.options,
  correct_option_id = excluded.correct_option_id,
  explanation = excluded.explanation,
  location_label = excluded.location_label,
  resource_target = excluded.resource_target,
  source_label = excluded.source_label;
