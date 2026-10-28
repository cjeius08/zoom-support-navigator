# Batch 1 final QA

The matrix now has 32 explicit role/query assertions rather than console output. It pins Command Center first IDs, Quick Answer intent IDs and Quick Answer destination IDs. Rendered tests cover both-role microphone ordering. App integration uses synthetic authentication and mocked persistence/analytics; it opens scheduling from Dashboard, opens My Quick Access, returns to scheduling and selects scheduling again while on Hub.

Intentional differences: a generic positive statement such as “can hear me” has no Quick Answer; general search still provides audio references. Participant “host controls missing” provides participant meeting-controls navigation, not Host guidance. Host joining has an existing guided route while Participant joining offers its own diagnostic Quick Answer. Host audio uses its approved combined audio guide.

Resolved Participant relevance defects: rescheduling and recording now require a declared-topic match in guide titles before fuzzy/body-text ranking. The same filter is used for Smart Search process/issue results and Command Center. Host-classified FAQs are excluded from Participant command results using existing role metadata. Both original queries have no verified Participant-specific reference, so rendered no-verified-answer/no-approved-match states are tested, with zero suggestion options. The matrix now asserts null first-result IDs for these two queries. Host rescheduling/recording behavior is retained.

Account-switching navigation remains an explicit coverage gap for Host. No account-switching procedure was supplied or invented. The approved Host break-recording rule remains unchanged and is separated from break-specific confirmation.

Changes: Host-gate special Quick Answers and direct Hub results; Host-gate Smart Search Hub suggestions; deduplicate Command Center destinations; replace console-only matrix; add role tests and actual App navigation integration.

No merge, deployment, Supabase operation or Batch 2 work.
