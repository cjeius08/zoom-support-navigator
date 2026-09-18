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
  'zoom_live_call_readiness_v1',
  'listen-before-action',
  1,
  'A caller opens with, “My camera is broken. Tell me what to click.” What is the strongest live-call response before beginning technical steps?',
  '[
    {"id":"a","text":"Open Video Settings immediately so the caller sees fast action."},
    {"id":"b","text":"Let the caller explain what is happening, acknowledge the concern, then gather the minimum context needed such as device/app or browser and the exact visible symptom before choosing a route."},
    {"id":"c","text":"Ask the caller to restart the computer first, then collect details if the problem remains."},
    {"id":"d","text":"Refer the caller because camera issues may involve the device."}
  ]'::jsonb,
  'b',
  'The live call flow requires listening and acknowledgment before troubleshooting, followed by enough caller/device/context information and probing to identify the actual problem. Jumping straight to a technical step risks solving the wrong issue.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Live Call Flow · Listen → Identify → Probe'
),
(
  'zoom_live_call_readiness_v1',
  'screen-differs-stop-reassess',
  2,
  'During troubleshooting, you give one approved instruction, but the caller says the screen does not match what you described and the expected control is not there. What should you do next?',
  '[
    {"id":"a","text":"Keep giving the remaining steps from memory so the call keeps moving."},
    {"id":"b","text":"Stop, ask what the caller actually sees, re-check the device/context or route, and only continue once the next instruction matches the visible state."},
    {"id":"c","text":"Tell the caller the control must be there and ask them to keep looking."},
    {"id":"d","text":"Reset the whole call and start every troubleshooting step again."}
  ]'::jsonb,
  'b',
  'Locate → Describe → Guide → Confirm requires one action at a time and a pause for the observed result. If the caller’s screen differs, the agent should reassess rather than guess or continue down a mismatched path.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Live Call Flow · Locate → Describe → Guide → Confirm'
),
(
  'zoom_live_call_readiness_v1',
  'resolved-confirm-recap-close',
  3,
  'A caller could not hear the meeting. After selecting the intended speaker, Zoom’s test sound works and the caller says they can now hear the other participants. What is the best way to finish the call?',
  '[
    {"id":"a","text":"End the call immediately because the troubleshooting step worked."},
    {"id":"b","text":"Confirm the exact failed function is now working, recap the issue and completed step, ask the final Zoom-related check, then close and document the call as resolved."},
    {"id":"c","text":"Continue into microphone, camera, and network troubleshooting to make sure nothing else might fail later."},
    {"id":"d","text":"Mark the call unresolved until the caller has used Zoom for several more minutes."}
  ]'::jsonb,
  'b',
  'The live call flow says never assume resolution. Once the caller confirms the failed function works, follow the resolved branch: confirm, recap, final check, close, and document the completed steps and result.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Live Call Flow + Call Documentation · Resolved branch'
),
(
  'zoom_live_call_readiness_v1',
  'unresolved-managed-permission-handoff',
  4,
  'Approved basic checks are complete, but the remaining blocker is an organization-managed device permission that the agent cannot change. What is the best live-call handling?',
  '[
    {"id":"a","text":"Keep trying unrelated Zoom settings so the caller does not feel referred too early."},
    {"id":"b","text":"Explain that the remaining step is outside approved authority, identify the organization IT/help desk as the next owner, avoid promising a direct Zoom escalation, and document the steps, result, recommended contact, and referred outcome."},
    {"id":"c","text":"Tell the caller to disable the organization security control themselves."},
    {"id":"d","text":"Promise that Zoom Support will take over the issue after the call."}
  ]'::jsonb,
  'b',
  'When the remaining action requires an organization-controlled permission, basic support should stop rather than bypass it. The Scope Check identifies organization IT/help desk as the owner, and documentation should record what was tested, the observed result, the recommended contact, and the referral outcome without promising a handoff that is not performed.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Scope Check + Call Documentation · Managed permission referral'
),
(
  'zoom_live_call_readiness_v1',
  'documentation-evidence-only',
  5,
  'Which documentation approach best represents a completed live support call?',
  '[
    {"id":"a","text":"Write the likely root cause, add a contact person you think can help, and summarize the steps you intended to try."},
    {"id":"b","text":"Record the caller/device and access context, the exact observed issue, only the steps actually completed with their results, the confirmed resolution or next step, the recommended contact if referred, and the final call outcome."},
    {"id":"c","text":"Document only the final outcome because the troubleshooting details are already visible in Zoom."},
    {"id":"d","text":"Copy the entire troubleshooting guide into the case notes even if most steps were not used."}
  ]'::jsonb,
  'b',
  'Call Documentation is evidence-based: document the exact issue, completed steps and observed results, the confirmed resolution or next step, the recommended contact when referred, and the final outcome. Do not invent a cause, person, channel, or troubleshooting step that did not occur.',
  'Training & Resources',
  '{"view":"training"}'::jsonb,
  'Call Documentation · Exact issue / Steps attempted + result / Resolution / Outcome'
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
