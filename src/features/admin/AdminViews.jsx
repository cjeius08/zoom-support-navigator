import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  loadFeedback,
  loadTeam,
  loadUsage,
  loadReadinessReport,
  loadStorageGuardrail,
  runAdminAction,
  updateFeedbackStatus,
} from "../../lib/adminApi";
import { avatarUrl } from "../profile/avatarCatalog";
import {
  buildUsageReport,
  dateRangeForPeriod,
  formatActiveDuration,
} from "../analytics/usageSummary";
import { useDialogFocus } from "../../lib/useDialogFocus";
import { CallNotesReport } from "./CallNotesReport";

function useData(loader, refreshKey = 0) {
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  useEffect(() => {
    let live = true;
    setState((current) => ({ ...current, loading: true, error: "" }));
    loader()
      .then((data) => live && setState({ loading: false, data, error: "" }))
      .catch(
        (error) =>
          live &&
          setState({ loading: false, data: null, error: error.message }),
      );
    return () => {
      live = false;
    };
  }, [loader, refreshKey]);
  return state;
}
function State({ state, children }) {
  if (state.loading) return <p>Loading secure data…</p>;
  if (state.error) return <p role="alert">{state.error}</p>;
  return children(state.data);
}


function formatStorageMb(bytes = 0) {
  return (Number(bytes || 0) / (1024 * 1024)).toFixed(1);
}

function StorageGuardrailCard({ state }) {
  if (state.loading) {
    return <section className="storage-guardrail-card safe" aria-label="Database storage guardrail">
      <strong>Database storage</strong>
      <span>Checking current usage…</span>
    </section>;
  }

  if (state.error || !state.data) {
    return <section className="storage-guardrail-card warning" role="status">
      <strong>Database storage check unavailable</strong>
      <span>{state.error || "Could not read the latest storage status."}</span>
    </section>;
  }

  const used = Number(state.data.database_bytes || 0);
  const limit = Number(state.data.limit_bytes || 524288000);
  const percent = limit ? Math.min(100, (used / limit) * 100) : 0;
  const status = state.data.status || "safe";
  const copy = {
    safe: "Safe. No action needed.",
    warning: "Warning: storage has reached 350 MB. Review growth before it becomes critical.",
    critical: "Critical: storage has reached 425 MB. Plan cleanup now.",
    urgent: "Urgent: storage has reached 475 MB. Reduce database size before the Free-plan limit.",
    limit_reached: "Limit reached: the Free project may enter read-only mode until database size is reduced.",
  }[status];

  return <section className={`storage-guardrail-card ${status}`} aria-label="Database storage guardrail" role={status === "safe" ? undefined : "alert"}>
    <div className="storage-guardrail-heading">
      <div>
        <p className="eyebrow">Free-plan guardrail</p>
        <strong>{formatStorageMb(used)} MB / {formatStorageMb(limit)} MB</strong>
      </div>
      <span className="storage-guardrail-status">{status.replace("_", " ")}</span>
    </div>
    <div className="storage-guardrail-meter" aria-label={`Database storage ${percent.toFixed(1)}% used`}>
      <span style={{ width: `${percent}%` }} />
    </div>
    <p>{copy}</p>
    <small>Last checked: {new Date(state.data.checked_at).toLocaleString()} · refreshed hourly</small>
  </section>;
}

function workspaceRoleLabel(person) {
  if (person?.role === "creator_admin") return "Admin";
  return person?.workspace_role === "lead" ? "Lead" : "Member";
}

function readinessAttemptSummary(attempts = [], maxAttempts = 3) {
  const ordered = [...attempts].sort(
    (a, b) => Number(a.attemptNumber || 0) - Number(b.attemptNumber || 0),
  );
  const submitted = ordered.filter((attempt) => attempt.status === "submitted");
  const first = submitted[0] || null;
  const latest = submitted[submitted.length - 1] || null;
  const inProgress = ordered.some((attempt) => attempt.status === "active");

  return {
    firstScore: first ? `${first.score}/${first.totalQuestions}` : "—",
    latestScore: latest ? `${latest.score}/${latest.totalQuestions}` : "—",
    attemptsUsed: `${ordered.length}/${maxAttempts}`,
    status: inProgress ? "In progress" : submitted.length ? "Completed" : "Not started",
  };
}

export function AdminHome({ onNavigate, avatars = [] }) {
  const storageLoader = useCallback(() => loadStorageGuardrail(), []);
  const teamLoader = useCallback(() => loadTeam(), []);
  const storageState = useData(storageLoader);
  const teamState = useData(teamLoader);

  return (
    <section className="console-view">
      <p className="eyebrow">Admin workspace</p>
      <h1>Admin Home</h1>
      <p>
        Manage the real team, review privacy-safe usage, and respond to
        submitted feedback.
      </p>
      <StorageGuardrailCard state={storageState} />

      <section className="admin-account-overview" aria-labelledby="admin-existing-accounts-title">
        <div className="view-heading">
          <div>
            <p className="eyebrow">Account overview</p>
            <h2 id="admin-existing-accounts-title">Existing Accounts</h2>
            <p>Current workspace accounts are shown here. Use Team Management for account changes and invites.</p>
          </div>
          <button className="primary-action" onClick={() => onNavigate("team")}>
            Manage Team
          </button>
        </div>
        <State state={teamState}>{team => {
          const existingAccounts = (team || []).filter(person => !person.pending);
          if (!existingAccounts.length) {
            return <p role="status">No existing accounts are visible. Open Team Management or refresh the page to retry.</p>;
          }
          return <div className="team-list admin-home-team-list">
            {existingAccounts.map(person => (
              <article key={person.id}>
                {avatarUrl(person.avatar_id, avatars) ? (
                  <img src={avatarUrl(person.avatar_id, avatars)} alt="" />
                ) : (
                  <span className="avatar-fallback">{person.initials}</span>
                )}
                <div>
                  <strong>{person.username}</strong>
                  <small>{person.initials} · {workspaceRoleLabel(person)}</small>
                </div>
                <span className={`presence-badge ${person.presence || "offline"}`}>
                  {person.presence || "offline"}
                </span>
                <span className={`status-badge ${person.status}`}>
                  {person.status}
                </span>
              </article>
            ))}
          </div>;
        }}</State>
      </section>

      <div className="admin-shortcuts">
        <button onClick={() => onNavigate("team")}>
          <strong>Team Management</strong>
          <span>Accounts, invites and access →</span>
        </button>
        <button onClick={() => onNavigate("usage")}>
          <strong>Usage Analytics</strong>
          <span>Real Console activity →</span>
        </button>
        <button onClick={() => onNavigate("feedback_queue")}>
          <strong>Feedback Queue</strong>
          <span>User reports and context →</span>
        </button>
        <button onClick={() => onNavigate("saved_notes")}>
          <strong>Saved Notes & Follow-Ups</strong>
          <span>Protected call notes and follow-up queue →</span>
        </button>
        <button onClick={() => onNavigate("avatar_library")}>
          <strong>Avatar Library</strong>
          <span>Add or remove profile avatars →</span>
        </button>
      </div>
    </section>
  );
}

function TeamDialog({ person, onClose, onAction, busy }) {
  const [mode, setMode] = useState("");
  const dialogRef = useRef(null);
  useDialogFocus(dialogRef, true, onClose);
  const submit = (event, payload) => {
    event.preventDefault();
    if (busy) return;
    onAction(payload);
  };
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="profile-panel admin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-title"
      >
        <h2 id="manage-title">Manage {person.username || person.initials}</h2>
        {!mode && (
          <div className="admin-actions">
            <button onClick={() => setMode("username")}>Edit Username</button>
            <button onClick={() => setMode("initials")}>Edit Initials</button>
            <button onClick={() => setMode("role")}>Edit Role</button>
            <button onClick={() => setMode("password")}>Reset Password</button>
            {person.status === "active" ? (
              <button onClick={() => setMode("deactivate")}>
                Deactivate Account
              </button>
            ) : (
              <button onClick={() => setMode("reactivate")}>
                Reactivate Account
              </button>
            )}
            <button className="danger-action" onClick={() => setMode("delete")}>
              Permanently Delete
            </button>
          </div>
        )}
        {mode === "username" && (
          <form
            onSubmit={(event) =>
              submit(event, {
                action: "rename_username",
                user_id: person.id,
                username: String(
                  new FormData(event.currentTarget).get("username"),
                ),
              })
            }
          >
            <label>
              Username
              <input
                name="username"
                defaultValue={person.username}
                pattern="[a-z0-9_]{3,}"
                required
              />
            </label>
            <div className="dialog-actions">
              <button type="button" onClick={() => setMode("")}>
                Cancel
              </button>
              <button disabled={busy}>{busy ? "Processing…" : "Save Username"}</button>
            </div>
          </form>
        )}
        {mode === "initials" && (
          <form
            onSubmit={(event) =>
              submit(event, {
                action: "rename_initials",
                user_id: person.id,
                initials: String(
                  new FormData(event.currentTarget).get("initials"),
                ).toUpperCase(),
              })
            }
          >
            <label>
              Initials
              <input
                name="initials"
                defaultValue={person.initials}
                pattern="[A-Z]{2,3}"
                minLength="2"
                maxLength="3"
                onChange={(event) => {
                  event.currentTarget.value =
                    event.currentTarget.value.toUpperCase();
                }}
                required
              />
            </label>
            <div className="dialog-actions">
              <button type="button" onClick={() => setMode("")}>
                Cancel
              </button>
              <button disabled={busy}>{busy ? "Processing…" : "Save Initials"}</button>
            </div>
          </form>
        )}
        {mode === "role" && (
          <form
            onSubmit={(event) =>
              submit(event, {
                action: "set_workspace_role",
                user_id: person.id,
                workspace_role: String(
                  new FormData(event.currentTarget).get("workspace_role"),
                ),
              })
            }
          >
            <label>
              Role
              <select
                name="workspace_role"
                defaultValue={person.workspace_role === "lead" ? "lead" : "member"}
                required
              >
                <option value="member">Member</option>
                <option value="lead">Lead</option>
              </select>
            </label>
            <p>
              Member and Lead currently have the same workspace permissions.
              Lead is a title only for now.
            </p>
            <div className="dialog-actions">
              <button type="button" onClick={() => setMode("")}>
                Cancel
              </button>
              <button disabled={busy}>{busy ? "Processing…" : "Save Role"}</button>
            </div>
          </form>
        )}
        {mode === "password" && (
          <form
            onSubmit={(event) =>
              submit(event, {
                action: "reset_password",
                user_id: person.id,
                temporary_password: String(
                  new FormData(event.currentTarget).get("password"),
                ),
              })
            }
          >
            <label>
              Temporary password
              <input
                name="password"
                type="password"
                minLength="8"
                autoComplete="new-password"
                required
              />
            </label>
            <p>The user must change this password at next sign-in.</p>
            <div className="dialog-actions">
              <button type="button" onClick={() => setMode("")}>
                Cancel
              </button>
              <button disabled={busy}>{busy ? "Processing…" : "Reset Password"}</button>
            </div>
          </form>
        )}
        {mode === "deactivate" && (
          <div>
            <p>
              Deactivate this account? Protected access is blocked and history
              remains.
            </p>
            <div className="dialog-actions">
              <button onClick={() => setMode("")}>Cancel</button>
              <button
                className="danger-action"
                disabled={busy}
                onClick={() => !busy && onAction({ action: "deactivate", user_id: person.id })}
              >
                {busy ? "Processing…" : "Confirm Deactivate"}
              </button>
            </div>
          </div>
        )}
        {mode === "reactivate" && (
          <div>
            <p>
              Reactivate this account? Its existing identity and password remain
              in place.
            </p>
            <div className="dialog-actions">
              <button onClick={() => setMode("")}>Cancel</button>
              <button
                disabled={busy}
                onClick={() => !busy && onAction({ action: "reactivate", user_id: person.id })}
              >
                {busy ? "Processing…" : "Confirm Reactivate"}
              </button>
            </div>
          </div>
        )}
        {mode === "delete" && (
          <form
            onSubmit={(event) =>
              submit(event, {
                action: "delete_permanently",
                user_id: person.id,
                confirmation: String(
                  new FormData(event.currentTarget).get("confirmation"),
                ),
              })
            }
          >
            <p>
              This permanently deletes the account and its linked history. It
              cannot be undone.
            </p>
            <label>
              Confirm username or initials
              <input name="confirmation" required />
            </label>
            <div className="dialog-actions">
              <button type="button" onClick={() => setMode("")}>
                Cancel
              </button>
              <button className="danger-action" disabled={busy}>{busy ? "Processing…" : "Permanently Delete"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function TeamManagement({ avatars = [] }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteInitials, setInviteInitials] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteSaving, setInviteSaving] = useState(false);
  const [actionSaving, setActionSaving] = useState(false);
  const inviteLockRef = useRef(false);
  const actionLockRef = useRef(false);
  const inviteDialogRef = useRef(null);
  useDialogFocus(inviteDialogRef, inviteOpen, () => setInviteOpen(false));
  const refresh = async () => {
    setLoading(true);
    try {
      setTeam(await loadTeam());
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  const action = async (payload) => {
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    setActionSaving(true);
    setError("");
    try {
      await runAdminAction(payload);
      await refresh();
      setSelected(null);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      actionLockRef.current = false;
      setActionSaving(false);
    }
  };
  const generateInvite = async (event) => {
    event.preventDefault();
    if (inviteLockRef.current) return;
    inviteLockRef.current = true;
    setInviteSaving(true);
    const form = new FormData(event.currentTarget);
    const initials = String(form.get("initials") || "")
      .trim()
      .toUpperCase();
    const workspaceRole = String(form.get("workspace_role") || "member");
    try {
      const data = await runAdminAction({
        action: "generate_invite",
        initials,
        workspace_role: workspaceRole,
      });
      setInviteCode(data.invite_code);
      await refresh();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      inviteLockRef.current = false;
      setInviteSaving(false);
    }
  };
  return (
    <section className="console-view team-management">
      <div className="view-heading">
        <div>
          <p className="eyebrow">Admin only</p>
          <h1>Team Management</h1>
          <p>
            Manage accounts, pending invite slots, and secure lifecycle actions.
          </p>
        </div>
        <button
          className="primary-action"
          onClick={() => {
            setInviteOpen(true);
            setInviteCode("");
            setInviteInitials("");
            setInviteRole("member");
          }}
        >
          Add Team Member
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p>Loading secure data…</p>
      ) : (
        <div className="team-list">
          {team.map((person) => (
            <article key={person.id}>
              {avatarUrl(person.avatar_id, avatars) ? (
                <img src={avatarUrl(person.avatar_id, avatars)} alt="" />
              ) : (
                <span className="avatar-fallback">{person.initials}</span>
              )}
              <div>
                <strong>{person.username || "Pending invite"}</strong>
                <small>
                  {person.initials} ·{" "}
                  {person.pending
                    ? `Pending ${workspaceRoleLabel(person)}`
                    : workspaceRoleLabel(person)}
                </small>
              </div>
              <span
                className={`presence-badge ${person.presence || "offline"}`}
              >
                {person.presence || "offline"}
              </span>
              <span className={`status-badge ${person.status}`}>
                {person.status}
              </span>
              {person.role !== "creator_admin" && (
                <button
                  className="row-menu"
                  aria-label={person.pending ? `Regenerate invite for ${person.initials}` : `Manage ${person.username || person.initials}`}
                  onClick={() => {
                    if (person.pending) {
                      setInviteOpen(true);
                      setInviteCode("");
                      setInviteInitials(person.initials);
                      setInviteRole(person.workspace_role === "lead" ? "lead" : "member");
                    } else setSelected(person);
                  }}
                >
                  {person.pending ? "Regenerate Invite" : "Actions"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
      {inviteOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setInviteOpen(false)
          }
        >
          <form
            ref={inviteDialogRef}
            tabIndex={-1}
            className="profile-panel admin-dialog"
            onSubmit={generateInvite}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
          >
            <h2 id="invite-title">Generate Invite</h2>
            <label>
              Initials
              <input
                name="initials"
                defaultValue={inviteInitials}
                autoComplete="off"
                pattern="[A-Z]{2,3}"
                minLength="2"
                maxLength="3"
                onChange={(event) => {
                  event.currentTarget.value =
                    event.currentTarget.value.toUpperCase();
                }}
                required
              />
            </label>
            <label>
              Role
              <select
                name="workspace_role"
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value)}
                required
              >
                <option value="member">Member</option>
                <option value="lead">Lead</option>
              </select>
            </label>
            <p>
              Generating a new code revokes a prior unused invite for these
              initials. Member and Lead have the same permissions for now.
            </p>
            {inviteCode && (
              <div className="one-time-code">
                <strong>Invite code — shown once</strong>
                <code>{inviteCode}</code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(inviteCode)}
                >
                  Copy Invite Code
                </button>
              </div>
            )}
            <div className="dialog-actions">
              <button type="button" onClick={() => setInviteOpen(false)}>
                Close
              </button>
              <button className="primary-action" disabled={inviteSaving}>{inviteSaving ? "Generating…" : "Generate Invite"}</button>
            </div>
          </form>
        </div>
      )}
      {selected && (
        <TeamDialog
          person={selected}
          onClose={() => setSelected(null)}
          onAction={action}
          busy={actionSaving}
        />
      )}
    </section>
  );
}

const USAGE_PERIODS = [
  ["daily", "Daily"],
  ["weekly", "Weekly"],
  ["monthly", "Monthly"],
  ["quarterly", "Quarterly"],
  ["yearly", "Yearly"],
  ["custom", "Custom"],
];

export function UsageAnalytics({ onOpenSavedNotes = () => {} }) {
  const [period, setPeriod] = useState("daily");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [memberId, setMemberId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [featureId, setFeatureId] = useState("");
  const range = useMemo(
    () => dateRangeForPeriod(period, { customStart, customEnd }),
    [customEnd, customStart, period],
  );
  const rangeReady = Boolean(range.start && range.end);
  const loader = useCallback(
    () => rangeReady
      ? loadUsage(range)
      : Promise.resolve({ profiles: [], events: [], sessions: [], presence: [], loadedAt: null }),
    [range, rangeReady],
  );
  const state = useData(loader);
  const readinessLoader = useCallback(() => loadReadinessReport(), []);
  const readinessState = useData(readinessLoader);
  const customRangeError = period === "custom" && customStart && customEnd && customStart > customEnd;

  function resetUsageFilters() {
    setPeriod("daily");
    setCustomStart("");
    setCustomEnd("");
    setMemberId("");
    setRouteId("");
    setFeatureId("");
  }

  function formatTimestamp(value) {
    if (!value) return "—";
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed.toLocaleString() : "—";
  }

  function humanize(value) {
    return String(value || "").replaceAll("_", " ");
  }

  return (
    <section className="console-view usage-analytics">
      <div className="view-heading">
        <div>
          <p className="eyebrow">Admin only · Privacy-safe metadata</p>
          <h1>Usage Analytics</h1>
          <p>
            Review recorded page views, feature actions, sessions, and member activity.
            Live presence is shown separately from historical usage.
          </p>
        </div>
      </div>

      <div className="usage-period-controls" role="group" aria-label="Usage date range">
        {USAGE_PERIODS.map(([id, label]) => (
          <button
            type="button"
            className={period === id ? "active" : ""}
            aria-pressed={period === id}
            key={id}
            onClick={() => setPeriod(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {period === "custom" && (
        <div className="usage-custom-range">
          <label>
            Start date
            <input
              type="date"
              value={customStart}
              max={customEnd || undefined}
              onChange={(event) => setCustomStart(event.target.value)}
            />
          </label>
          <label>
            End date
            <input
              type="date"
              value={customEnd}
              min={customStart || undefined}
              onChange={(event) => setCustomEnd(event.target.value)}
            />
          </label>
        </div>
      )}

      <div className="usage-filter-panel" aria-label="Usage report filters">
        <div className="usage-filter-grid">
          <label>
            Team member
            <select aria-label="Filter by team member" value={memberId} onChange={(event) => setMemberId(event.target.value)}>
              <option value="">All team members</option>
              {state.data?.profiles?.map((person) => (
                <option key={person.id} value={person.id}>{person.username || person.initials || "Unknown user"}</option>
              ))}
            </select>
          </label>
          <label>
            Page or section
            <select aria-label="Filter by page or section" value={routeId} onChange={(event) => setRouteId(event.target.value)}>
              <option value="">All pages and sections</option>
              {[...new Set((state.data?.events || []).map((event) => event.route_id).filter(Boolean))]
                .sort()
                .map((route) => <option key={route} value={route}>{humanize(route)}</option>)}
            </select>
          </label>
          <label>
            Feature or tool
            <select aria-label="Filter by feature or tool" value={featureId} onChange={(event) => setFeatureId(event.target.value)}>
              <option value="">All features and tools</option>
              {[...new Set((state.data?.events || [])
                .filter((event) => event.event_type !== "route_view" && event.event_type !== "navigation")
                .map((event) => event.tool_id ? `tool:${event.tool_id}` : `event:${event.event_type}`))]
                .sort()
                .map((feature) => (
                  <option key={feature} value={feature}>
                    {humanize(feature.startsWith("tool:") ? feature.slice(5) : feature.slice(6))}
                  </option>
                ))}
            </select>
          </label>
          <button type="button" className="usage-reset-button" onClick={resetUsageFilters}>Reset filters</button>
        </div>
        {rangeReady && (
          <p className="usage-range-note">
            Dates use your browser’s local timezone. End dates include the full selected day.
          </p>
        )}
      </div>

      {customRangeError && (
        <p className="usage-validation-message" role="alert">The end date must be on or after the start date.</p>
      )}
      {period === "custom" && !customRangeError && !rangeReady && (
        <p className="usage-validation-message" role="status">Choose both a start date and an end date to load a custom report.</p>
      )}

      {rangeReady && (
        <State state={state}>
          {(data) => {
            const report = buildUsageReport({
              ...data,
              start: range.start,
              end: range.end,
              period,
              memberId,
              routeId,
              featureId,
            });
            const maxBucketCount = Math.max(1, ...report.activityBuckets.map((bucket) => bucket.count));

            return (
              <>
                <div className="real-summary usage-summary" aria-label="Usage summary">
                  <div aria-label={`Total Users: ${report.totalUsers}`}>
                    <strong>{report.totalUsers}</strong>
                    <span>Team Members</span>
                  </div>
                  <div aria-label={`Sessions: ${report.sessionCount}`}>
                    <strong>{report.sessionCount}</strong>
                    <span>Sessions</span>
                  </div>
                  <div aria-label={`Page Views: ${report.pageViews}`}>
                    <strong>{report.pageViews}</strong>
                    <span>Page Views</span>
                  </div>
                  <div aria-label={`Feature Actions: ${report.featureUsage}`}>
                    <strong>{report.featureUsage}</strong>
                    <span>Feature Actions</span>
                  </div>
                  <div aria-label={`Active Time: ${formatActiveDuration(report.activeSeconds)}`}>
                    <strong>{formatActiveDuration(report.activeSeconds)}</strong>
                    <span>Recorded Active Time</span>
                  </div>
                  <div aria-label={`Most Recent Event: ${formatTimestamp(report.latestEventAt)}`}>
                    <strong className="usage-summary-time">{formatTimestamp(report.latestEventAt)}</strong>
                    <span>Most Recent Event</span>
                  </div>
                </div>

                <section className="usage-report-panel" aria-labelledby="usage-trend-title">
                  <div className="usage-report-heading">
                    <div>
                      <p className="eyebrow">Historical usage</p>
                      <h2 id="usage-trend-title">Usage over time</h2>
                      <p>Each bar counts stored usage events that match the selected filters.</p>
                    </div>
                  </div>
                  {report.eventCount > 0 && report.activityBuckets.length ? (
                    <div className="usage-chart-scroll">
                      <div className="usage-chart" role="list" aria-label="Usage events over time">
                        {report.activityBuckets.map((bucket) => (
                          <div className="usage-chart-column" role="listitem" key={bucket.id} aria-label={`${bucket.label}: ${bucket.count} events`}>
                            <strong>{bucket.count}</strong>
                            <div className="usage-chart-bar-track">
                              <span
                                className="usage-chart-bar"
                                style={{ height: bucket.count ? `${Math.max(4, (bucket.count / maxBucketCount) * 100)}%` : "0%" }}
                              />
                            </div>
                            <small>{bucket.label}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="usage-empty-state">No usage events match this date range and filter set.</p>
                  )}
                </section>

                <div className="usage-detail-grid">
                  <section className="usage-report-panel" aria-labelledby="usage-members-title">
                    <h2 id="usage-members-title">Usage by team member</h2>
                    {report.users.length ? (
                      <div className="usage-table-wrap">
                        <table className="usage-table">
                          <caption className="sr-only">Usage totals by team member</caption>
                          <thead><tr><th scope="col">Member</th><th scope="col">Role</th><th scope="col">Active time</th><th scope="col">Sessions</th><th scope="col">Page views</th><th scope="col">Feature actions</th></tr></thead>
                          <tbody>{report.users.map((user) => (
                            <tr key={user.id}>
                              <th scope="row">{user.username || user.initials || "Unknown user"}</th>
                              <td>{workspaceRoleLabel(user)}</td>
                              <td>{formatActiveDuration(user.activeSeconds)}</td>
                              <td>{user.sessions}</td>
                              <td>{user.pageViews}</td>
                              <td>{user.featureUsage}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="usage-empty-state">No team members match the selected filters.</p>
                    )}
                  </section>

                  <section className="usage-report-panel" aria-labelledby="usage-pages-title">
                    <h2 id="usage-pages-title">Usage by page or section</h2>
                    {report.byPage.length ? (
                      <div className="usage-table-wrap">
                        <table className="usage-table">
                          <caption className="sr-only">Recorded page views by page or section</caption>
                          <thead><tr><th scope="col">Page or section</th><th scope="col">Page views</th></tr></thead>
                          <tbody>{report.byPage.map((item) => (
                            <tr key={item.id}><th scope="row">{humanize(item.id)}</th><td>{item.count}</td></tr>
                          ))}</tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="usage-empty-state">No page views match the selected filters.</p>
                    )}
                  </section>

                  <section className="usage-report-panel" aria-labelledby="usage-features-title">
                    <h2 id="usage-features-title">Usage by feature or tool</h2>
                    {report.byFeature.length ? (
                      <div className="usage-table-wrap">
                        <table className="usage-table">
                          <caption className="sr-only">Feature actions by tool or event type</caption>
                          <thead><tr><th scope="col">Feature or action</th><th scope="col">Uses</th></tr></thead>
                          <tbody>{report.byFeature.map((item) => (
                            <tr key={item.id}><th scope="row">{humanize(item.id)}</th><td>{item.count}</td></tr>
                          ))}</tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="usage-empty-state">No feature actions match the selected filters.</p>
                    )}
                  </section>

                  <section className="usage-report-panel usage-recent-activity" aria-labelledby="usage-activity-title">
                    <h2 id="usage-activity-title">Recent activity</h2>
                    {report.recentActivity.length ? (
                      <div className="usage-table-wrap">
                        <table className="usage-table">
                          <caption className="sr-only">Recent recorded activity</caption>
                          <thead><tr><th scope="col">Time</th><th scope="col">Member</th><th scope="col">Action</th><th scope="col">Page or section</th><th scope="col">Feature or tool</th></tr></thead>
                          <tbody>{report.recentActivity.map((event, index) => (
                            <tr key={`${event.session_id || "no-session"}-${event.created_at}-${index}`}>
                              <td>{formatTimestamp(event.created_at)}</td>
                              <td>{event.userLabel} · {event.userRole}</td>
                              <td>{event.actionLabel}</td>
                              <td>{humanize(event.route_id) || "—"}</td>
                              <td>{humanize(event.featureLabel) || "—"}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="usage-empty-state">No activity matches the selected filters.</p>
                    )}
                  </section>
                </div>

                <section className="usage-report-panel usage-presence-panel" aria-labelledby="usage-presence-title">
                  <div className="usage-report-heading">
                    <div>
                      <p className="eyebrow">Live status · not historical usage</p>
                      <h2 id="usage-presence-title">User presence now</h2>
                      <p>Presence uses the latest heartbeat and interaction. Date filters do not change live state.</p>
                    </div>
                  </div>
                  <div className="usage-presence-summary">
                    <div aria-label={`Active Now: ${report.presenceCounts.active}`}><strong>{report.presenceCounts.active}</strong><span>Active now</span></div>
                    <div aria-label={`Idle: ${report.presenceCounts.idle}`}><strong>{report.presenceCounts.idle}</strong><span>Idle</span></div>
                    <div aria-label={`Offline: ${report.presenceCounts.offline}`}><strong>{report.presenceCounts.offline}</strong><span>Offline</span></div>
                  </div>
                  {report.users.length ? (
                    <div className="usage-table-wrap">
                      <table className="usage-table">
                        <caption className="sr-only">Current user presence</caption>
                        <thead><tr><th scope="col">Member</th><th scope="col">Role</th><th scope="col">Presence</th><th scope="col">Last interaction</th></tr></thead>
                        <tbody>{report.users.map((user) => (
                          <tr key={user.id}>
                            <th scope="row">{user.username || user.initials || "Unknown user"}</th>
                            <td>{workspaceRoleLabel(user)}</td>
                            <td><span className={`presence-badge ${user.presence}`}>{user.presence}</span></td>
                            <td>{formatTimestamp(user.presenceLastInteraction)}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="usage-empty-state">No team members match the selected filters.</p>
                  )}
                </section>

                <div className="usage-data-integrity" role="note">
                  <strong>Data and metric definitions</strong>
                  <ul>
                    <li>Page views count `route_view` events. Feature actions count stored feature events; navigation events are reported separately in Recent activity.</li>
                    <li>Sessions count records overlapping the selected dates. Recorded active time includes the full stored duration of those sessions because active seconds are not split by date.</li>
                    <li>Database read completed at {formatTimestamp(data.loadedAt)}. Event-write failures are not stored, so write-delivery completeness cannot be confirmed from these records.</li>
                    <li>In this report range, {report.unmatchedEventCount} event(s) have no matching session row and {report.unendedSessionCount} overlapping session(s) have no recorded end. An open session uses its last interaction only to estimate range overlap; no historical records are rewritten.</li>
                    <li>Analytics contains approved identifiers and timestamps only. Call Documentation and Readiness reports below use separate protected data.</li>
                  </ul>
                </div>
              </>
            );
          }}
        </State>
      )}

      {rangeReady && <CallNotesReport range={range} onOpenNotes={onOpenSavedNotes} />}

      <section className="readiness-admin-report" aria-labelledby="readiness-report-title">
        <div className="view-heading">
          <div>
            <p className="eyebrow">Readiness validation</p>
            <h2 id="readiness-report-title">Readiness Lab Report</h2>
            <p>
              Attempt history is kept separately from usage activity. Attempt 1,
              Attempt 2, and Attempt 3 remain visible with their scores and
              incorrect answers.
            </p>
          </div>
        </div>

        <State state={readinessState}>
          {(report) => (
            <div className="readiness-report-parts">
              {(report?.parts || []).map((part) => (
                <section className="readiness-report-part" key={part.id} aria-labelledby={`readiness-report-${part.id}`}>
                  <div className="readiness-report-part-heading">
                    <span>Part {part.number}</span>
                    <h3 id={`readiness-report-${part.id}`}>{part.title}</h3>
                  </div>
                  <div className="usage-user-list" aria-label={`${part.title} attempts by user`}>
                    {(part.users || []).map((user) => {
                      const summary = readinessAttemptSummary(user.attempts, part.maxAttempts || 3);
                      return (
                        <article className="usage-user-row readiness-report-user" key={`${part.id}-${user.id}`}>
                          <div className="usage-user-identity">
                            <strong>{user.username || user.initials}</strong>
                            <small>
                              {user.initials} · {workspaceRoleLabel(user)}
                            </small>
                          </div>

                          <div className="readiness-report-content">
                            <dl
                              className="readiness-summary-grid"
                              aria-label={`${user.username || user.initials} ${part.title} summary`}
                            >
                              <div><dt>First score</dt><dd>{summary.firstScore}</dd></div>
                              <div><dt>Latest score</dt><dd>{summary.latestScore}</dd></div>
                              <div><dt>Attempts used</dt><dd>{summary.attemptsUsed}</dd></div>
                              <div>
                                <dt>Status</dt>
                                <dd className={`readiness-summary-status ${summary.status.toLowerCase().replaceAll(" ", "-")}`}>
                                  {summary.status}
                                </dd>
                              </div>
                            </dl>

                            {user.attempts?.length ? (
                              <div className="readiness-report-attempts">
                                {user.attempts.map((attempt) => (
                                  <details key={attempt.id} open={attempt.status === "active"}>
                                    <summary>
                                      <strong>Attempt {attempt.attemptNumber}</strong>
                                      <span>
                                        {attempt.status === "submitted"
                                          ? `Score ${attempt.score}/${attempt.totalQuestions}`
                                          : `${attempt.checkedCount}/${attempt.totalQuestions} checked · In progress`}
                                      </span>
                                    </summary>
                                    <dl>
                                      <div>
                                        <dt>Status</dt>
                                        <dd>{attempt.status === "submitted" ? "Submitted" : "In progress"}</dd>
                                      </div>
                                      <div>
                                        <dt>Started</dt>
                                        <dd>{attempt.startedAt ? new Date(attempt.startedAt).toLocaleString() : "—"}</dd>
                                      </div>
                                      <div>
                                        <dt>Submitted</dt>
                                        <dd>{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "—"}</dd>
                                      </div>
                                    </dl>

                                    <div className="readiness-report-misses">
                                      <strong>Incorrect answers</strong>
                                      {attempt.incorrectAnswers?.length ? (
                                        <ol>
                                          {attempt.incorrectAnswers.map((miss) => (
                                            <li key={`${attempt.id}-${miss.questionId}`}>
                                              <p>{miss.prompt}</p>
                                              <small><b>Selected:</b> {miss.selectedAnswer || miss.selectedOptionId}</small>
                                              <small><b>Correct:</b> {miss.correctAnswer || miss.correctOptionId}</small>
                                            </li>
                                          ))}
                                        </ol>
                                      ) : (
                                        <small>
                                          {attempt.status === "submitted"
                                            ? "No incorrect answers recorded."
                                            : "Incorrect answers will appear here as this attempt is checked."}
                                        </small>
                                      )}
                                    </div>
                                  </details>
                                ))}
                              </div>
                            ) : (
                              <p className="readiness-no-attempts">No attempts yet for this part.</p>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </State>
      </section>
    </section>
  );
}

const FEEDBACK_STATUSES = ["new", "reviewing", "planned", "resolved", "closed", "dismissed"];


export function FeedbackQueue({ onOpenPage }) {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [updatingId, setUpdatingId] = useState("");
  const [actionError, setActionError] = useState("");
  const [queueMinimized, setQueueMinimized] = useState(false);
  const queueScrollPosition = useRef(0);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const loader = useCallback(() => loadFeedback(), []);
  const teamLoader = useCallback(() => loadTeam(), []);
  const state = useData(loader, refreshVersion);
  const teamState = useData(teamLoader);
  const profilesById = useMemo(
    () => new Map((teamState.data || []).filter(person => person.id).map(person => [person.id, person])),
    [teamState.data],
  );

  function toggleExpanded(itemId) {
    setExpandedIds(current => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function toggleQueueMinimized() {
    if (queueMinimized) {
      setQueueMinimized(false);
      window.requestAnimationFrame(() => window.scrollTo(0, queueScrollPosition.current));
      return;
    }
    queueScrollPosition.current = window.scrollY || 0;
    setQueueMinimized(true);
  }

  async function changeStatus(item, status) {
    if (status === item.status || updatingId) return;
    setUpdatingId(item.id);
    setActionError("");
    try {
      await updateFeedbackStatus(item.id, status);
      setRefreshVersion((value) => value + 1);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <section className="console-view feedback-queue">
      <p className="eyebrow">Admin only</p>
      <div className="feedback-queue-heading">
        <div>
          <h1>Feedback Queue</h1>
          <p>
            Review user reports, update their status, and jump back to the stored
            safe page or process context.
          </p>
        </div>
        <button
          type="button"
          className="feedback-queue-minimize"
          aria-controls="feedback-queue-panel"
          aria-expanded={!queueMinimized}
          onClick={toggleQueueMinimized}
        >
          {queueMinimized ? "Restore Feedback Queue" : "Minimize Feedback Queue"}
        </button>
      </div>
      {queueMinimized && (
        <p className="feedback-queue-minimized-note" role="status">
          The queue is minimized. Your expanded item and scroll position are saved.
        </p>
      )}
      {actionError && <p role="alert">{actionError}</p>}
      <div id="feedback-queue-panel" hidden={queueMinimized}>
        <State state={state}>
          {(items) =>
            items.length ? (
              <div className="feedback-list">
                {items.map((item) => {
                  const reporter = profilesById.get(item.reporter_user_id);
                  const reporterName = reporter?.username || reporter?.initials || (teamState.loading ? "Loading submitter…" : "Unknown submitter");
                  const reporterRole = teamState.loading
                    ? "Loading role…"
                    : reporter
                      ? reporter.role === "creator_admin"
                        ? "Admin"
                        : reporter.workspace_role === "lead"
                          ? "Lead"
                          : "Member"
                      : "Role unavailable";
                  const reporterAvatar = avatarUrl(reporter?.avatar_id);
                  const expanded = expandedIds.has(item.id);
                  const submittedAt = item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : "Time unavailable";
                  const reporterMeta = reporter
                    ? (reporter.initials ? reporter.initials + " · " : "") + reporterRole
                    : reporterRole;

                  return (
                    <article key={item.id} className={"feedback-item" + (expanded ? " is-expanded" : "")}>
                      <header className="feedback-item-row">
                        <button
                          type="button"
                          className="feedback-item-toggle"
                          aria-expanded={expanded}
                          aria-label={(expanded ? "Collapse" : "Expand") + " feedback " + item.id}
                          onClick={() => toggleExpanded(item.id)}
                        >
                          <span className="feedback-item-type">
                            {(item.type || "feedback").replaceAll("_", " ")}
                          </span>
                          <span className="feedback-reporter">
                            {reporterAvatar
                              ? <img src={reporterAvatar} alt="" />
                              : <span className="feedback-avatar-fallback">{reporter?.initials || "?"}</span>}
                            <span>
                              <strong>{reporterName}</strong>
                              <small>{reporterMeta}</small>
                            </span>
                          </span>
                          <time className="feedback-submitted-at" dateTime={item.created_at || undefined}>
                            {submittedAt}
                          </time>
                          <span className="feedback-item-chevron" aria-hidden="true">{expanded ? "−" : "+"}</span>
                        </button>
                        <label className="feedback-status-control">
                          <span className="sr-only">Status</span>
                          <select
                            aria-label={"Status for feedback " + item.id}
                            value={item.status}
                            disabled={updatingId === item.id}
                            onChange={(event) => changeStatus(item, event.target.value)}
                          >
                            {FEEDBACK_STATUSES.map((status) => (
                              <option value={status} key={status}>{status}</option>
                            ))}
                          </select>
                        </label>
                      </header>
                      {item.what_noticed && (
                        <p className="feedback-item-preview">{item.what_noticed}</p>
                      )}

                      {expanded && (
                        <div className="feedback-item-details">
                          <div className="feedback-item-submitter">
                            {reporterAvatar
                              ? <img src={reporterAvatar} alt="" />
                              : <span className="feedback-avatar-fallback">{reporter?.initials || "?"}</span>}
                            <div>
                              <strong>{reporterName}</strong>
                              <small>{reporterMeta}</small>
                            </div>
                          </div>
                          <p className="feedback-item-description">
                            <b>What they noticed</b>
                            <span>{item.what_noticed || "No description provided."}</span>
                          </p>
                          {item.suggested_change && (
                            <p className="feedback-item-suggestion">
                              <b>Suggested change</b>
                              <span>{item.suggested_change}</span>
                            </p>
                          )}
                          <p className="feedback-item-submitted">
                            <b>Submitted</b>
                            <time dateTime={item.created_at || undefined}>{submittedAt}</time>
                          </p>
                          <div className="feedback-context-row">
                            <small>
                              {item.page_label || "Page unavailable"}
                              {item.process_id ? " · " + item.process_id : ""}
                              {item.active_common_issue ? " · " + item.active_common_issue : ""}
                            </small>
                            <button type="button" onClick={() => onOpenPage?.(item)}>Open Page</button>
                          </div>
                          <details className="feedback-screen-context">
                            <summary>Captured screen context</summary>
                            <dl>
                              <div><dt>Route</dt><dd>{item.route_id || "—"}</dd></div>
                              <div><dt>Selected tab</dt><dd>{item.selected_tab || "—"}</dd></div>
                              <div><dt>Section</dt><dd>{item.current_section || "—"}</dd></div>
                              <div><dt>Device filter</dt><dd>{item.active_device || "—"}</dd></div>
                              <div><dt>Caller role</dt><dd>{item.active_caller_role || "—"}</dd></div>
                              <div><dt>Common issue</dt><dd>{item.active_common_issue || "—"}</dd></div>
                              <div><dt>Process</dt><dd>{item.process_id || "—"}</dd></div>
                              <div><dt>Category</dt><dd>{item.category_id || "—"}</dd></div>
                              <div><dt>Viewport</dt><dd>{item.viewport_width && item.viewport_height ? item.viewport_width + " × " + item.viewport_height : "—"}</dd></div>
                              <div><dt>Page path</dt><dd>{[item.page_path, item.page_hash].filter(Boolean).join("") || "—"}</dd></div>
                              <div className="feedback-context-wide"><dt>Browser</dt><dd>{item.browser_user_agent || "—"}</dd></div>
                              <div><dt>Client time</dt><dd>{item.client_reported_at ? new Date(item.client_reported_at).toLocaleString() : "—"}</dd></div>
                            </dl>
                          </details>
                          {updatingId === item.id && <small role="status">Saving…</small>}
                          {item.history?.length > 0 && (
                            <div className="feedback-history">
                              <small>Status history</small>
                              <ul>
                                {item.history.slice(-3).map((history, index) => (
                                  <li key={history.created_at + "-" + index}>
                                    {history.previous_status || "new"} → {history.new_status}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <h2>No feedback yet</h2>
                <p>Submitted user reports will appear here.</p>
              </div>
            )
          }
        </State>
      </div>
    </section>
  );
}
