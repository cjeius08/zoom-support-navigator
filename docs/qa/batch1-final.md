# Batch 1 final QA

The matrix now has 32 explicit role/query assertions rather than console output. It pins Command Center first IDs, Quick Answer intent IDs and Quick Answer destination IDs. Rendered tests cover both-role microphone ordering. App integration uses synthetic authentication and mocked persistence/analytics; it opens scheduling from Dashboard, opens My Quick Access, returns to scheduling and selects scheduling again while on Hub.

Intentional differences: a generic positive statement such as “can hear me” has no Quick Answer; general search still provides audio references. Participant “host controls missing” provides participant meeting-controls navigation, not Host guidance. Host joining has an existing guided route while Participant joining offers its own diagnostic Quick Answer. Host audio uses its approved combined audio guide.

Known FAILs retained explicitly in the characterization matrix: Participant “reschedule hearing date” returns waiting-for-host; Participant “automatic recording” returns transfer-device. Neither is considered a semantically correct match. The assertions expose existing output for review, not acceptance of those results. No Host-only special answer or direct Hub section is exposed to Participant for the three special queries.

Account-switching navigation remains an explicit coverage gap for Host. No account-switching procedure was supplied or invented. The approved Host break-recording rule remains unchanged and is separated from break-specific confirmation.

Changes: Host-gate special Quick Answers and direct Hub results; Host-gate Smart Search Hub suggestions; deduplicate Command Center destinations; replace console-only matrix; add role tests and actual App navigation integration.

No merge, deployment, Supabase operation or Batch 2 work.
