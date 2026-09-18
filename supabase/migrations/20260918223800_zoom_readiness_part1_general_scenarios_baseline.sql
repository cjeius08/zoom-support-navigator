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
  'zoom_general_scenarios_v1',
  'join-exact-state',
  1,
  'A Zoom user says, “I can’t get into the meeting.” What is the best first move?',
  '[
    {"id":"a","text":"Restart the computer immediately before asking anything else."},
    {"id":"b","text":"Ask what exact Zoom screen or message appears and confirm the meeting link or details before choosing the next route."},
    {"id":"c","text":"Start checking the microphone and speaker because joining issues are usually audio-related."},
    {"id":"d","text":"Tell the user to contact the host immediately without checking what Zoom is showing."}
  ]'::jsonb,
  'b',
  '“Can’t join” is too broad by itself. The approved joining route starts by identifying exactly where Zoom stops the user and using the visible message or meeting details to choose the next step.',
  'Training & Resources → Scripts & Communication → Scenario Scripts → Can’t Join',
  '{"mode":"scenarios","view":"training","section":"scripts","scenario":"cant-join"}'::jsonb,
  'Scripts & Communication · Can’t Join'
),
(
  'zoom_general_scenarios_v1',
  'cant-hear-output',
  2,
  'A user is already inside a Zoom meeting but cannot hear anyone. Which direction should the agent investigate first?',
  '[
    {"id":"a","text":"Treat it as a speaker/output problem: confirm meeting audio is connected, then check the speaker path."},
    {"id":"b","text":"Treat it as a microphone/input problem and start by unmuting the user."},
    {"id":"c","text":"Leave the meeting and create a new meeting link."},
    {"id":"d","text":"Change camera settings because video can affect Zoom audio."}
  ]'::jsonb,
  'a',
  'If the user cannot hear others, the symptom is on the output/speaker side. First confirm the user is connected to meeting audio, then follow the approved speaker/output checks.',
  'Training & Resources → Scripts & Communication → Scenario Scripts → Can’t Hear',
  '{"mode":"scenarios","view":"training","section":"scripts","scenario":"cant-hear"}'::jsonb,
  'Scripts & Communication · Can’t Hear'
),
(
  'zoom_general_scenarios_v1',
  'cant-be-heard-input',
  3,
  'Other participants say they cannot hear the Zoom user. What should the agent focus on first?',
  '[
    {"id":"a","text":"Speaker volume and output device."},
    {"id":"b","text":"The microphone/input path: Zoom mute state, any physical mute control, and the microphone Zoom is using."},
    {"id":"c","text":"The meeting link and passcode."},
    {"id":"d","text":"Screen-sharing permission."}
  ]'::jsonb,
  'b',
  'When others cannot hear the user, the symptom is on the microphone/input side. The approved route starts by checking mute state and the microphone path rather than speaker output.',
  'Training & Resources → Scripts & Communication → Scenario Scripts → They Can’t Hear Me',
  '{"mode":"scenarios","view":"training","section":"scripts","scenario":"cant-be-heard"}'::jsonb,
  'Scripts & Communication · They Can’t Hear Me'
),
(
  'zoom_general_scenarios_v1',
  'camera-state',
  4,
  'A Zoom user says, “My camera isn’t working.” What should the agent determine before trying unrelated fixes?',
  '[
    {"id":"a","text":"Whether video is simply turned off or Zoom is actually failing to show an image from the camera."},
    {"id":"b","text":"Whether the user can hear meeting audio."},
    {"id":"c","text":"Whether the host has started screen sharing."},
    {"id":"d","text":"Whether the meeting invitation contains a phone number."}
  ]'::jsonb,
  'a',
  'The camera route first distinguishes a simple video-off state from a camera that is on but black, missing, or not producing an image. That observation determines the next approved check.',
  'Training & Resources → Scripts & Communication → Scenario Scripts → Camera',
  '{"mode":"scenarios","view":"training","section":"scripts","scenario":"camera-not-working"}'::jsonb,
  'Scripts & Communication · Camera'
),
(
  'zoom_general_scenarios_v1',
  'screen-share-control',
  5,
  'A Zoom user says they cannot share their screen. What is the safest first judgment?',
  '[
    {"id":"a","text":"Assume Zoom is broken and tell the user to reinstall it."},
    {"id":"b","text":"Determine what happens when they try to share and whether the Share Screen action is available or controlled by the meeting host before changing anything."},
    {"id":"c","text":"Tell the user to create a new Zoom account."},
    {"id":"d","text":"Change microphone permissions first."}
  ]'::jsonb,
  'b',
  'Screen sharing can depend on the visible Zoom state and host-controlled permissions. The agent should identify what the user sees and whether the feature is available before assuming a product failure.',
  'Training & Resources → Scripts & Communication → Scenario Scripts → Screen Share',
  '{"mode":"scenarios","view":"training","section":"scripts","scenario":"cant-share"}'::jsonb,
  'Scripts & Communication · Screen Share'
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
