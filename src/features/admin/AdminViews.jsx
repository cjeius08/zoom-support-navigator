import { useEffect, useState } from "react";
import {
  loadFeedback,
  loadTeam,
  loadUsage,
  runAdminAction,
} from "../../lib/adminApi";
import { avatarUrl } from "../profile/avatarCatalog";

function useData(loader) {
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  useEffect(() => {
    let live = true;
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
  }, [loader]);
  return state;
}
function State({ state, children }) {
  if (state.loading) return <p>Loading secure data…</p>;
  if (state.error) return <p role="alert">{state.error}</p>;
  return children(state.data);
}

export function AdminHome({ onNavigate }) {
  return (
    <section className="console-view">
      <p className="eyebrow">JA workspace</p>
      <h1>Admin Home</h1>
      <p>
        Manage the real team, review privacy-safe usage, and respond to
        submitted feedback.
      </p>
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
          <span>Agent reports and context →</span>
        </button>
      </div>
    </section>
  );
}

function TeamDialog({ person, onClose, onAction }) {
  const [mode, setMode] = useState("");
  const submit = (event, payload) => {
    event.preventDefault();
    onAction(payload);
  };
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
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
              <button>Save Username</button>
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
              <button>Save Initials</button>
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
            <p>The agent must change this password at next sign-in.</p>
            <div className="dialog-actions">
              <button type="button" onClick={() => setMode("")}>
                Cancel
              </button>
              <button>Reset Password</button>
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
                onClick={() =>
                  onAction({ action: "deactivate", user_id: person.id })
                }
              >
                Confirm Deactivate
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
                onClick={() =>
                  onAction({ action: "reactivate", user_id: person.id })
                }
              >
                Confirm Reactivate
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
              <button className="danger-action">Permanently Delete</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function TeamManagement() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteInitials, setInviteInitials] = useState("");
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
    try {
      await runAdminAction(payload);
      await refresh();
      setSelected(null);
    } catch (actionError) {
      setError(actionError.message);
    }
  };
  const generateInvite = async (event) => {
    event.preventDefault();
    const initials = String(
      new FormData(event.currentTarget).get("initials") || "",
    )
      .trim()
      .toUpperCase();
    try {
      const data = await runAdminAction({
        action: "generate_invite",
        initials,
      });
      setInviteCode(data.invite_code);
      await refresh();
    } catch (actionError) {
      setError(actionError.message);
    }
  };
  return (
    <section className="console-view team-management">
      <div className="view-heading">
        <div>
          <p className="eyebrow">JA only</p>
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
              {avatarUrl(person.avatar_id) ? (
                <img src={avatarUrl(person.avatar_id)} alt="" />
              ) : (
                <span className="avatar-fallback">{person.initials}</span>
              )}
              <div>
                <strong>{person.username || "Pending invite"}</strong>
                <small>
                  {person.initials} ·{" "}
                  {person.role === "creator_admin"
                    ? "JA Admin"
                    : person.pending
                      ? "Pending agent"
                      : "Agent"}
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
            <p>
              Generating a new code revokes a prior unused invite for these
              initials.
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
              <button className="primary-action">Generate Invite</button>
            </div>
          </form>
        </div>
      )}
      {selected && (
        <TeamDialog
          person={selected}
          onClose={() => setSelected(null)}
          onAction={action}
        />
      )}
    </section>
  );
}

export function UsageAnalytics() {
  const state = useData(loadUsage);
  return (
    <section className="console-view">
      <p className="eyebrow">Privacy-safe metadata</p>
      <h1>Usage Analytics</h1>
      <State state={state}>
        {(data) => (
          <>
            <div className="real-summary">
              <div>
                <strong>{data.events.length}</strong>
                <span>recent recorded events</span>
              </div>
              <div>
                <strong>
                  {
                    data.presence.filter(
                      (presence) => presence.state === "active",
                    ).length
                  }
                </strong>
                <span>active now</span>
              </div>
              <div>
                <strong>
                  {
                    data.presence.filter(
                      (presence) => presence.state === "idle",
                    ).length
                  }
                </strong>
                <span>idle</span>
              </div>
            </div>
            <p>
              Counts use identifiers and timestamps only; no support-call
              content is tracked.
            </p>
          </>
        )}
      </State>
    </section>
  );
}
export function FeedbackQueue() {
  const state = useData(loadFeedback);
  return (
    <section className="console-view">
      <p className="eyebrow">JA only</p>
      <h1>Feedback Queue</h1>
      <State state={state}>
        {(items) =>
          items.length ? (
            <div className="feedback-list">
              {items.map((item) => (
                <article key={item.id}>
                  <header>
                    <strong>{item.type.replaceAll("_", " ")}</strong>
                    <span>{item.status}</span>
                  </header>
                  <p>{item.what_noticed}</p>
                  {item.suggested_change && (
                    <p>
                      <b>Suggestion:</b> {item.suggested_change}
                    </p>
                  )}
                  <small>
                    {item.page_label}
                    {item.process_id ? ` · ${item.process_id}` : ""}
                  </small>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>No feedback submitted yet</h2>
            </div>
          )
        }
      </State>
    </section>
  );
}
