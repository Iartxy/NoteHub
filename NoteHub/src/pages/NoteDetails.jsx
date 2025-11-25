import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchNote() {
      try {
        const noteDoc = await getDoc(doc(db, "notes", id));
        
        if (!noteDoc.exists()) {
          setError("Note not found");
          setLoading(false);
          return;
        }

        const noteData = { id: noteDoc.id, ...noteDoc.data() };
        setNote(noteData);

        // Increment view count
        if (currentUser && currentUser.uid !== noteData.authorId) {
          await updateDoc(doc(db, "notes", id), {
            views: (noteData.views || 0) + 1,
          });
        }
      } catch (err) {
        setError("Failed to load note");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [id, currentUser]);

  function handleCopyLink() {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(timestamp) {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading note...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 text-lg">{error || "Note not found"}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-indigo-600 hover:text-indigo-700 mb-4 inline-flex items-center"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{note.title}</h1>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
              <div className="flex items-center space-x-4">
                <span>By {note.authorName || note.authorEmail}</span>
                <span>•</span>
                <span>{formatDate(note.createdAt)}</span>
                {note.views !== undefined && (
                  <>
                    <span>•</span>
                    <span>{note.views} views</span>
                  </>
                )}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm font-medium"
              >
                {copied ? "✓ Copied!" : "Share Link"}
              </button>
            </div>

            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {note.description && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {note.description}
              </p>
            </div>
          )}

          {note.fileUrl && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Attached File</h2>
              <a
                href={note.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download {note.fileName || "File"}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

