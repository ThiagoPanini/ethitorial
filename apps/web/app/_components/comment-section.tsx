"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Avatar, hueFromText } from "./primitives";

export interface Comment {
  id: string;
  artifact_id: string;
  body: string;
  created_at: string;
  user_id: string;
  user_name: string;
  username: string;
  image: string | null;
  is_author: boolean;
}

function mentionify(text: string) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    const key = `${part}-${i}`;
    return /^@\w+$/.test(part) ? (
      <mark className="mention" key={key}>
        {part}
      </mark>
    ) : (
      <span key={key}>{part}</span>
    );
  });
}

function CommentItem({
  comment,
  currentUserId,
  isCurrentAdmin,
  onDelete,
}: {
  comment: Comment;
  currentUserId?: string;
  isCurrentAdmin?: boolean;
  onDelete: (id: string) => void;
}) {
  const canDelete = isCurrentAdmin || comment.user_id === currentUserId;
  const date = new Date(comment.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="cmt-item">
      <div className="cmt-header">
        <Avatar hue={hueFromText(comment.user_name)} name={comment.user_name} size={28} />
        <span className="cmt-username">{comment.username}</span>
        {comment.is_author && <span className="cmt-badge">AUTOR</span>}
        <span className="cmt-date">{date}</span>
        {canDelete && (
          <button
            type="button"
            className="cmt-del"
            aria-label="Remover comentário"
            onClick={() => onDelete(comment.id)}
          >
            ×
          </button>
        )}
      </div>
      <p className="cmt-body">{mentionify(comment.body)}</p>
    </div>
  );
}

function CommentForm({
  artifactId,
  onPosted,
}: {
  artifactId: string;
  onPosted: (comment: Comment) => void;
}) {
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/comments/${artifactId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.status === 429) {
        setError("Muitos comentários — aguarde antes de comentar novamente.");
        return;
      }
      if (!res.ok) {
        setError("Erro ao enviar comentário. Tente novamente.");
        return;
      }
      const created: Comment = await res.json();
      onPosted(created);
      setBody("");
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="cmt-form" onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className="cmt-textarea"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Escreva um comentário… Use @username para mencionar alguém."
        rows={3}
        maxLength={2000}
        disabled={pending}
      />
      {error && <p className="cmt-error">{error}</p>}
      <div className="cmt-form-foot">
        <span className="cmt-chars">{body.length}/2000</span>
        <button type="submit" className="cmt-submit" disabled={pending || !body.trim()}>
          {pending ? "Enviando…" : "Comentar"}
        </button>
      </div>
    </form>
  );
}

export function CommentSection({
  artifactId,
  initialComments,
}: {
  artifactId: string;
  initialComments: Comment[];
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const [comments, setComments] = useState<Comment[]>(initialComments);

  useEffect(() => {
    fetch(`/api/comments/${artifactId}`)
      .then((r) => r.json())
      .then((data: Comment[]) => setComments(data))
      .catch(() => {});
  }, [artifactId]);

  function handlePosted(comment: Comment) {
    setComments((prev) => [...prev, comment]);
  }

  async function handleDelete(commentId: string) {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  }

  return (
    <section className="disc">
      <h3 className="disc-head">DISCUSSÃO</h3>
      <span className="disc-count">{comments.length}</span>

      {comments.length > 0 && (
        <div className="cmt-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              isCurrentAdmin={user?.role === "admin"}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <div className="cmt-write">
        {user ? (
          <CommentForm artifactId={artifactId} onPosted={handlePosted} />
        ) : (
          <p className="cmt-cta">
            <Link href="/auth/sign-in">Entre para comentar</Link>
          </p>
        )}
      </div>
    </section>
  );
}
