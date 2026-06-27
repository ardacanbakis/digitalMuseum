import { useEffect, useState } from "react";
import {
  type Comment,
  fetchComments,
  isGuestbookShared,
  postComment,
  screenMessage,
} from "../api/guestbook";
import {
  COFFEE_URL,
  CREDITS,
  DONATORS,
  frameById,
  WELCOME,
  type FrameDef,
} from "../data/lobbyFrames";
import { closeFrame } from "../scene/artworks/interaction";
import { useStore } from "../store";
import { Footer } from "./Footer";
import styles from "./FramePanel.module.css";

function CoffeeButton() {
  return (
    <a
      className={styles.coffee}
      href={COFFEE_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      ☕ Buy me a coffee
    </a>
  );
}

export function FramePanel() {
  const frameId = useStore((s) => s.selectedFrame);
  const open = useStore((s) => s.viewMode === "frame");
  if (!open || !frameId) return null;
  const frame = frameById.get(frameId);
  if (!frame) return null;

  return (
    <div className={styles.backdrop} onClick={() => closeFrame(true)}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.close}
          onClick={() => closeFrame(true)}
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className={styles.title}>{frame.title}</h2>
        <FrameBody frame={frame} />
      </div>
    </div>
  );
}

function FrameBody({ frame }: { frame: FrameDef }) {
  switch (frame.kind) {
    case "welcome":
      return (
        <div className={styles.body}>
          {WELCOME.paragraphs.map((p, i) => (
            <p key={i} className={styles.para}>
              {p}
            </p>
          ))}
          <div className={styles.footerWrap}>
            <Footer />
          </div>
        </div>
      );
    case "donators":
      return (
        <div className={styles.body}>
          <p className={styles.para}>
            This museum is kept free and open thanks to the kindness of these
            supporters. Thank you. 🙏
          </p>
          <ul className={styles.donators}>
            {DONATORS.map((d, i) => (
              <li key={i}>
                <span className={styles.donatorName}>{d.name}</span>
                {d.note && <span className={styles.donatorNote}>{d.note}</span>}
              </li>
            ))}
          </ul>
          <p className={styles.para}>
            Want your name on this wall? Support the museum:
          </p>
          <CoffeeButton />
        </div>
      );
    case "credits":
      return (
        <div className={styles.body}>
          <p className={styles.para}>{CREDITS.author}</p>
          <p className={styles.para}>{CREDITS.blurb}</p>
          <CoffeeButton />
          <div className={styles.footerWrap}>
            <Footer />
          </div>
        </div>
      );
    case "guestbook":
      return <Guestbook />;
    default:
      return null;
  }
}

function Guestbook() {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchComments()
      .then((c) => !cancelled && setComments(c))
      .catch(() => !cancelled && setComments([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async () => {
    const problem = screenMessage(message);
    if (problem) {
      setError(problem);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const created = await postComment(name, message);
      setComments((prev) => [created, ...(prev ?? [])]);
      setMessage("");
    } catch {
      setError("Couldn't post right now — please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.body}>
      {!isGuestbookShared() && (
        <p className={styles.notice}>
          Saved to this browser only — set up Supabase to share entries
          (see <code>src/api/guestbook.ts</code>).
        </p>
      )}
      <div className={styles.form}>
        <input
          className={styles.input}
          placeholder="Your name (optional)"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className={styles.textarea}
          placeholder="Leave a note for future visitors…"
          maxLength={1000}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button
          className={styles.submit}
          onClick={submit}
          disabled={sending}
        >
          {sending ? "Signing…" : "Sign the book"}
        </button>
      </div>

      <div className={styles.comments}>
        {comments === null && <p className={styles.muted}>Loading…</p>}
        {comments?.length === 0 && (
          <p className={styles.muted}>Be the first to sign the book.</p>
        )}
        {comments?.map((c) => (
          <div key={c.id} className={styles.comment}>
            <div className={styles.commentHead}>
              <span className={styles.commentName}>{c.name || "Anonymous"}</span>
              <span className={styles.commentDate}>
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className={styles.commentBody}>{c.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
