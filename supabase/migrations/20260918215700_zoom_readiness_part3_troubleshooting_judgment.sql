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
  'zoom_troubleshooting_judgment_v1',
  'join-becomes-waiting-room',
  1,
  'A caller says they cannot join. After you enter the Meeting ID exactly as provided, Zoom now shows that the caller is in the Waiting Room. What is the best next judgment?',
  '[
    {"id":"a","text":"Keep troubleshooting it as a failed join and reinstall Zoom."},
    {"id":"b","text":"Stop the failed-join path and treat this as a Waiting Room state before choosing the next action."},
    {"id":"c","text":"Keep re-entering the Meeting ID until the Waiting Room disappears."},
    {"id":"d","text":"Switch to microphone troubleshooting because the meeting has loaded."}
  ]'::jsonb,
  'b',
  'Reaching the Waiting Room means the meeting details were accepted and the caller is no longer in the same failed-join state. The correct judgment is to switch to the waiting-state path instead of continuing unrelated join recovery steps.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Common Issue Route · Can’t join the meeting / Waiting to get in'
),
(
  'zoom_troubleshooting_judgment_v1',
  'audio-join-before-output',
  2,
  'A caller is already inside the Zoom meeting and says, “I can’t hear anyone.” Zoom is still showing Join Audio. What should happen before deeper speaker troubleshooting?',
  '[
    {"id":"a","text":"Open microphone permissions because audio problems usually start with the microphone."},
    {"id":"b","text":"Connect to meeting audio using the internet-audio option shown on the caller’s device, then reassess the symptom."},
    {"id":"c","text":"Reinstall Zoom before testing any audio controls."},
    {"id":"d","text":"Ask the host to change the meeting’s participant permissions."}
  ]'::jsonb,
  'b',
  'When Zoom still shows Join Audio, the caller has not yet completed the meeting-audio connection. Connect to meeting audio first; only then does speaker or output troubleshooting become meaningful.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Common Issue Route · I can’t hear anyone'
),
(
  'zoom_troubleshooting_judgment_v1',
  'microphone-not-recognized-by-os',
  3,
  'A caller cannot be heard. Zoom is unmuted and the intended microphone has been checked, but the operating system itself still does not recognize that microphone after basic connection checks. What is the right troubleshooting judgment?',
  '[
    {"id":"a","text":"Keep changing Zoom microphone selections even though the operating system cannot see the device."},
    {"id":"b","text":"Stop Zoom-only troubleshooting because the remaining problem is at the device or operating-system level."},
    {"id":"c","text":"Switch to speaker-output troubleshooting."},
    {"id":"d","text":"Bypass any managed device restriction so Zoom can force access to the microphone."}
  ]'::jsonb,
  'b',
  'If the operating system itself does not recognize the microphone after basic checks, Zoom cannot select or use a device the system does not expose. The agent should stop treating it as a Zoom-only microphone problem.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Common Issue Route · They can’t hear me'
),
(
  'zoom_troubleshooting_judgment_v1',
  'camera-preview-restored',
  4,
  'A caller’s camera was black. You select the intended camera in Zoom and the video preview immediately appears. What should the agent do next?',
  '[
    {"id":"a","text":"Continue into permissions and reinstall steps anyway, just to be safe."},
    {"id":"b","text":"Confirm the caller can see the expected preview or meeting video and treat the camera issue as resolved."},
    {"id":"c","text":"Move to audio troubleshooting because the camera now works."},
    {"id":"d","text":"Restart the computer before confirming whether the fix worked."}
  ]'::jsonb,
  'b',
  'The expected result of selecting the correct camera is a usable Zoom preview or meeting image. Once that expected result appears, confirm resolution instead of continuing unnecessary deeper recovery steps.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Common Issue Route · My camera isn’t working'
),
(
  'zoom_troubleshooting_judgment_v1',
  'screen-share-system-permission',
  5,
  'A caller can see and open Share, but the operating system or browser blocks screen capture when they try to start sharing. What is the best next troubleshooting direction?',
  '[
    {"id":"a","text":"Treat it as a missing Share control and keep searching the Zoom toolbar."},
    {"id":"b","text":"Follow the approved operating-system or browser screen-capture permission path for that device, then test again."},
    {"id":"c","text":"Assume the host disabled participant sharing even though the Share picker already opened."},
    {"id":"d","text":"Reinstall Zoom before checking the device or browser permission."}
  ]'::jsonb,
  'b',
  'Once the Share control is present and the share flow reaches an operating-system or browser capture block, the evidence points to the device/browser permission layer rather than a hidden Zoom control. Follow the approved permission path and do not bypass managed restrictions.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Common Issue Route · Can’t share my screen'
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
