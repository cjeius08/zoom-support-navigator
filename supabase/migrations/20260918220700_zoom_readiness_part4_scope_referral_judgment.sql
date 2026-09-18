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
  'zoom_scope_referral_judgment_v1',
  'basic-support-steps-remain',
  1,
  'A caller has a basic Zoom setup issue. Approved troubleshooting steps still remain, and the next step does not require guessing, bypassing a control, or making an unauthorized change. What is the correct scope decision?',
  '[
    {"id":"a","text":"Stop immediately and refer the caller because any unresolved Zoom issue belongs to another team."},
    {"id":"b","text":"Continue the approved troubleshooting one step at a time and confirm the result after each meaningful action."},
    {"id":"c","text":"Skip the remaining approved steps and promise a direct Zoom Support escalation."},
    {"id":"d","text":"Make any system or account change needed as long as it might solve the issue."}
  ]'::jsonb,
  'b',
  'Basic Zoom setup, navigation, controls, and approved troubleshooting remain within scope when approved steps remain and the next action stays inside the team''s authority. The agent should continue the approved process rather than refer too early.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Scope Check · Continue approved troubleshooting'
),
(
  'zoom_scope_referral_judgment_v1',
  'waiting-room-owner',
  2,
  'A participant is in the Zoom Waiting Room and asks you to let them into the meeting. Who owns the next action?',
  '[
    {"id":"a","text":"The support agent should admit the participant if the meeting details look correct."},
    {"id":"b","text":"The meeting host or organizer owns admission; explain the Waiting Room and do not bypass that control."},
    {"id":"c","text":"The participant’s device manufacturer must admit them."},
    {"id":"d","text":"Zoom Support should be contacted directly to override the Waiting Room."}
  ]'::jsonb,
  'b',
  'Waiting Room admission is controlled by the meeting host. Basic support can confirm the meeting information and explain the state, but cannot admit the participant or bypass the host-controlled permission.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Scope Check · Waiting Room admission'
),
(
  'zoom_scope_referral_judgment_v1',
  'account-license-admin-owner',
  3,
  'A caller needs a Zoom account role, license, or organization-level permission changed before they can continue. What is the correct handoff?',
  '[
    {"id":"a","text":"Change the account or license from basic support if the caller asks clearly."},
    {"id":"b","text":"Refer the caller to their organization’s IT/help desk or Zoom administrator for the account-level change."},
    {"id":"c","text":"Tell the caller to create a second Zoom account as a workaround."},
    {"id":"d","text":"Promise that Zoom Support will make the change for them."}
  ]'::jsonb,
  'b',
  'Account roles, licenses, administrative permissions, and organization-level access are outside basic support authority. The correct owner is the caller''s organization IT/help desk or Zoom administrator.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Scope Check · Account / admin permission'
),
(
  'zoom_scope_referral_judgment_v1',
  'hardware-not-detected-owner',
  4,
  'After basic connection and Zoom device-selection checks, the operating system still does not recognize the caller’s microphone. What is the correct scope decision and owner?',
  '[
    {"id":"a","text":"Keep changing Zoom microphone settings until the device appears."},
    {"id":"b","text":"Stop Zoom-only troubleshooting and refer to organization IT, device support, or the hardware provider."},
    {"id":"c","text":"Bypass any system restriction so Zoom can force access to the microphone."},
    {"id":"d","text":"Refer to the meeting host because all microphone issues are host-controlled."}
  ]'::jsonb,
  'b',
  'When the device or operating system itself does not detect the hardware after basic checks, the issue is no longer limited to a Zoom setting. The next owner is IT/device support or the hardware provider rather than continued Zoom-only troubleshooting.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Scope Check · Hardware not detected'
),
(
  'zoom_scope_referral_judgment_v1',
  'privacy-recording-policy-owner',
  5,
  'A caller asks whether they are allowed to record, use an AI feature, or take another action that may affect privacy or confidentiality in the proceeding. What should the agent do?',
  '[
    {"id":"a","text":"Decide whether the action is permitted based on the Zoom setting that is available."},
    {"id":"b","text":"Explain where the Zoom control is located if needed, but refer the permission or policy decision to the meeting organizer or designated arbitration/client contact."},
    {"id":"c","text":"Enable the feature first and tell the caller to ask permission afterward."},
    {"id":"d","text":"Tell the caller that any feature visible in Zoom is automatically permitted."}
  ]'::jsonb,
  'b',
  'Basic support can explain the technical control, but cannot interpret or authorize proceeding, recording, privacy, confidentiality, or AI policy. The meeting organizer or designated arbitration/client contact owns that decision.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Scope Check · Privacy / recording / proceeding policy'
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
