import { useEffect, useState } from "react";
import {
  type Comment,
  deleteComment,
  fetchComments,
  isGuestbookShared,
} from "../api/guestbook";
import {
  addSupporter,
  deleteSupporter,
  fetchSupporters,
} from "../api/supporters";
import { isTouchDevice } from "../scene/player/input";
import { requestLock } from "../scene/player/usePointerLock";
import { useStore } from "../store";
import styles from "./AdminPanel.module.css";

export function AdminPanel() {
  const open = useStore((s) => s.viewMode === "admin");
  const adminKey = useStore((s) => s.adminKey);
  const setAdminKey = useStore((s) => s.setAdminKey);
  const supporters = useStore((s) => s.supporters);
  const setSupporters = useStore((s) => s.setSupporters);

  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetchComments().then(setComments).catch(() => setComments([]));
    fetchSupporters().then(setSupporters).catch(() => undefined);
  }, [open, setSupporters]);

  if (!open) return null;

  const close = () => {
    useStore.getState().setViewMode("walking");
    if (!isTouchDevice()) requestLock();
  };

  const guard = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg(ok);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const removeComment = (id: string) =>
    guard(async () => {
      await deleteComment(id, adminKey);
      setComments((c) => c.filter((x) => x.id !== id));
    }, "Comment removed.");

  const removeSupporter = (id: string) =>
    guard(async () => {
      await deleteSupporter(id, adminKey);
      setSupporters(supporters.filter((s) => s.id !== id));
    }, "Supporter removed.");

  const add = () =>
    guard(async () => {
      const created = await addSupporter(name, note, adminKey);
      setSupporters([...supporters, created]);
      setName("");
      setNote("");
    }, "Supporter added.");

  return (
    <div className={styles.backdrop} onClick={close}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={close} aria-label="Close">
          ✕
        </button>
        <h2 className={styles.title}>🔒 Admin</h2>

        <label className={styles.keyRow}>
          <span>Admin passphrase</span>
          <input
            type="password"
            className={styles.input}
            value={adminKey}
            placeholder={
              isGuestbookShared()
                ? "matches your Supabase policy secret"
                : "(local mode — any value)"
            }
            onChange={(e) => setAdminKey(e.target.value)}
          />
        </label>
        {msg && <p className={styles.msg}>{msg}</p>}

        <section className={styles.section}>
          <h3 className={styles.heading}>Top supporters ({supporters.length})</h3>
          <ul className={styles.list}>
            {supporters.map((s) => (
              <li key={s.id} className={styles.row}>
                <span>
                  {s.name}
                  {s.note ? ` · ${s.note}` : ""}
                </span>
                <button
                  className={styles.del}
                  disabled={busy}
                  onClick={() => removeSupporter(s.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.addRow}>
            <input
              className={styles.input}
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Note (e.g. Gold Supporter)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button className={styles.add} disabled={busy || !name.trim()} onClick={add}>
              Add
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>Guest-book comments ({comments.length})</h3>
          <ul className={styles.list}>
            {comments.length === 0 && <li className={styles.muted}>No comments.</li>}
            {comments.map((c) => (
              <li key={c.id} className={styles.commentRow}>
                <div className={styles.commentText}>
                  <strong>{c.name || "Anonymous"}</strong>
                  <span>{c.message}</span>
                </div>
                <button
                  className={styles.del}
                  disabled={busy}
                  onClick={() => removeComment(c.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>

        <p className={styles.foot}>
          {isGuestbookShared()
            ? "Changes are saved to Supabase (authorized by your passphrase)."
            : "Local mode: changes are saved to this browser only."}
        </p>
      </div>
    </div>
  );
}
