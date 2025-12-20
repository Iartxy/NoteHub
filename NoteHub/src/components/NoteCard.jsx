import { Link } from "react-router-dom";
import { useState } from "react";

export default function NoteCard({ note }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const [copied, setCopied] = useState(false);

  async function handleShare(e) {
    // Prevent Link navigation
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/note/${note.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: note.title, text: note.description || "", url });
        return;
      } catch (err) {
        console.warn("Web Share failed or cancelled, falling back to clipboard", err);
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Link
      to={`/note/${note.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
          {note.title}
        </h3>
        <button
          onClick={handleShare}
          onMouseDown={(e) => e.stopPropagation()}
          className="ml-3 px-2 py-1 text-sm text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100"
          title="Share"
        >
          {copied ? "✓ Copied" : "Share"}
        </button>
      </div>
      
      {note.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {note.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>By {note.authorName || note.authorEmail}</span>
        <span>{formatDate(note.createdAt)}</span>
      </div>

      {(note.semester || note.subject) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
          {note.semester && (
            <span className="px-2 py-1 bg-gray-100 rounded-full">Semester: {note.semester}</span>
          )}
          {note.subject && (
            <span className="px-2 py-1 bg-gray-100 rounded-full">Subject: {note.subject}</span>
          )}
        </div>
      )}

      {note.tags && note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

