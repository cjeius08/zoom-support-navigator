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
  buildUsageSummary,
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
  ["custom", "Custom"],
];

export function UsageAnalytics({ onOpenSavedNotes = () => {} }) {
  const [period, setPeriod] = useState("daily");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const range = useMemo(
    () => dateRangeForPeriod(period, { customStart, customEnd }),
    [customEnd, customStart, period],
  );
  const loader = useCallback(
    () => loadUsage(range),
    [range],
  );
  const state = useData(loader);
  const readinessLoader = useCallback(() => loadReadinessReport(), []);
  const readinessState = useData(readinessLoader);

  return (
    <section className="console-view usage-analytics">
      <div className="view-heading">
        <div>
          <p className="eyebrow">Privacy-safe metadata</p>
          <h1>Usage Analytics</h1>
          <p>
            Active time counts only recent-interaction windows. Idle browser
            tabs do not continue accumulating active hours.
          </p>
        </div>
      </div>

      <div className="usage-period-controls" role="group" aria-label="Usage period">
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
            <input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
          </label>
          <label>
            End date
            <input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
          </label>
        </div>
      )}

      <State state={state}>
        {(data) => {
          const summary = buildUsageSummary({ ...data, start: range.start, end: range.end });
          return (
            <>
              <div className="real-summary usage-summary" aria-label="Usage summary">
                <div aria-label={`Total Users: ${summary.totalUsers}`}>
                  <strong>{summary.totalUsers}</strong>
                  <span>Total Users</span>
                </div>
                <div aria-label={`Active Now: ${summary.active}`}>
                  <strong>{summary.active}</strong>
                  <span>Active Now</span>
                </div>
                <div aria-label={`Idle: ${summary.idle}`}>
                  <strong>{summary.idle}</strong>
                  <span>Idle</span>
                </div>
                <div aria-label={`Offline: ${summary.offline}`}>
                  <strong>{summary.offline}</strong>
                  <span>Offline</span>
                </div>
                <div aria-label={`Active Time: ${formatActiveDuration(summary.activeSeconds)}`}>
                  <strong>{formatActiveDuration(summary.activeSeconds)}</strong>
                  <span>Active Time</span>
                </div>
              </div>

              <div className="usage-user-list" aria-label="Usage by user">
                {summary.users.map((user) => (
                  <article className="usage-user-row" key={user.id}>
                    <div className="usage-user-identity">
                      <strong>{user.username || user.initials}</strong>
                      <small>
                        {user.initials} · {workspaceRoleLabel(user)}
                      </small>
                    </div>
                    <span className={`presence-badge ${user.presence}`}>{user.presence}</span>
                    <dl>
                      <div><dt>Active time</dt><dd>{formatActiveDuration(user.activeSeconds)}</dd></div>
                      <div><dt>Sessions</dt><dd>{user.sessions}</dd></div>
                      <div><dt>Events</dt><dd>{user.events}</dd></div>
                      <div><dt>Top process</dt><dd>{user.topProcess || "—"}</dd></div>
                      <div><dt>Top category</dt><dd>{user.topCategory || "—"}</dd></div>
                      <div><dt>Top tool</dt><dd>{user.topTool || "—"}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>

              <p className="usage-privacy-note">
                Usage Analytics stores identifiers and timestamps only. Saved Call
                Documentation is stored separately under protected note access rules.
              </p>
            </>
          );
        }}
      </State>

      <CallNotesReport range={range} onOpenNotes={onOpenSavedNotes} />

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
          onClick={() => setQueueMinimized(value => !value)}
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
                  const reporterName = reporter?.username || reporter?.initials || "Unknown submitter";
                  const reporterRole = reporter
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
