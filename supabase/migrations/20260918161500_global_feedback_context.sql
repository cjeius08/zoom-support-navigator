alter table public.zoom_feedback_reports
  add column if not exists selected_tab text,
  add column if not exists current_section text,
  add column if not exists active_device text,
  add column if not exists active_caller_role text,
  add column if not exists active_common_issue text,
  add column if not exists page_path text,
  add column if not exists page_hash text,
  add column if not exists viewport_width integer,
  add column if not exists viewport_height integer,
  add column if not exists browser_user_agent text,
  add column if not exists client_reported_at timestamptz;

alter table public.zoom_feedback_reports
  drop constraint if exists zoom_feedback_reports_selected_tab_length,
  add constraint zoom_feedback_reports_selected_tab_length
    check (selected_tab is null or char_length(selected_tab) <= 160),
  drop constraint if exists zoom_feedback_reports_current_section_length,
  add constraint zoom_feedback_reports_current_section_length
    check (current_section is null or char_length(current_section) <= 240),
  drop constraint if exists zoom_feedback_reports_active_device_length,
  add constraint zoom_feedback_reports_active_device_length
    check (active_device is null or char_length(active_device) <= 80),
  drop constraint if exists zoom_feedback_reports_active_caller_role_length,
  add constraint zoom_feedback_reports_active_caller_role_length
    check (active_caller_role is null or char_length(active_caller_role) <= 80),
  drop constraint if exists zoom_feedback_reports_active_common_issue_length,
  add constraint zoom_feedback_reports_active_common_issue_length
    check (active_common_issue is null or char_length(active_common_issue) <= 160),
  drop constraint if exists zoom_feedback_reports_page_path_length,
  add constraint zoom_feedback_reports_page_path_length
    check (page_path is null or char_length(page_path) <= 500),
  drop constraint if exists zoom_feedback_reports_page_hash_length,
  add constraint zoom_feedback_reports_page_hash_length
    check (page_hash is null or char_length(page_hash) <= 500),
  drop constraint if exists zoom_feedback_reports_browser_user_agent_length,
  add constraint zoom_feedback_reports_browser_user_agent_length
    check (browser_user_agent is null or char_length(browser_user_agent) <= 1000),
  drop constraint if exists zoom_feedback_reports_viewport_width_positive,
  add constraint zoom_feedback_reports_viewport_width_positive
    check (viewport_width is null or viewport_width > 0),
  drop constraint if exists zoom_feedback_reports_viewport_height_positive,
  add constraint zoom_feedback_reports_viewport_height_positive
    check (viewport_height is null or viewport_height > 0);

comment on column public.zoom_feedback_reports.selected_tab is 'Most specific selected UI tab when feedback was opened.';
comment on column public.zoom_feedback_reports.current_section is 'Current subsection, drawer, video, or other visible workspace section.';
comment on column public.zoom_feedback_reports.active_device is 'Live Call Flow device filter at report time.';
comment on column public.zoom_feedback_reports.active_caller_role is 'Live Call Flow caller role at report time.';
comment on column public.zoom_feedback_reports.active_common_issue is 'Active Common Issue route id at report time.';
comment on column public.zoom_feedback_reports.page_path is 'Browser pathname captured when report modal opened.';
comment on column public.zoom_feedback_reports.page_hash is 'Browser hash captured when report modal opened.';
comment on column public.zoom_feedback_reports.viewport_width is 'Browser viewport width in CSS pixels at report time.';
comment on column public.zoom_feedback_reports.viewport_height is 'Browser viewport height in CSS pixels at report time.';
comment on column public.zoom_feedback_reports.browser_user_agent is 'Browser user agent captured for UI/debug context.';
comment on column public.zoom_feedback_reports.client_reported_at is 'Client timestamp captured when report modal opened.';
