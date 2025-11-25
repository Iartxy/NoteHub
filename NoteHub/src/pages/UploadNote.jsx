import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function UploadNote() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      return setError("Title is required");
    }

    try {
      setError("");
      setLoading(true);

      let fileUrl = null;
      
      if (file) {
        try {
          const fileRef = ref(storage, `notes/${currentUser.uid}/${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          fileUrl = await getDownloadURL(fileRef);
        } catch (storageErr) {
          console.error("Storage error:", storageErr);
          if (storageErr.code === "storage/unauthorized") {
            throw new Error("Storage permission denied. Please check Firebase Storage rules.");
          } else if (storageErr.code === "storage/unknown") {
            throw new Error("Firebase Storage not configured. Please enable Storage in Firebase Console.");
          } else {
            throw new Error(`File upload failed: ${storageErr.message}`);
          }
        }
      }

      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      try {
        await addDoc(collection(db, "notes"), {
          title: title.trim(),
          description: description.trim(),
          tags: tagsArray,
          fileUrl,
          fileName: file ? file.name : null,
          authorId: currentUser.uid,
          authorEmail: currentUser.email,
          authorName: currentUser.displayName || currentUser.email.split("@")[0],
          createdAt: serverTimestamp(),
          views: 0,
        });
      } catch (firestoreErr) {
        console.error("Firestore error:", firestoreErr);
        if (firestoreErr.code === "permission-denied") {
          throw new Error("Database permission denied. Please check Firestore security rules.");
        } else if (firestoreErr.code === "unavailable") {
          throw new Error("Firestore database not available. Please create a Firestore database in Firebase Console.");
        } else {
          throw new Error(`Database error: ${firestoreErr.message}`);
        }
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to upload note. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please log in to upload notes.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload a Note</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Enter note title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                placeholder="Enter note description"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="e.g., math, physics, study-notes"
              />
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                Upload File (PDF, DOCX, TXT, etc.)
              </label>
              <input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                accept=".pdf,.doc,.docx,.txt,.md"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Uploading..." : "Upload Note"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

