import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { Trash2, Shield, AlertTriangle } from "lucide-react";

export default function ManageStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await axios.get("/stories");
      setStories(res.data);
    } catch (err) {
      alert("Failed to fetch stories");
    } finally {
      setLoading(false);
    }
  };

  const deleteStory = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this story?")) return;
    try {
      await axios.delete(`/stories/${id}`);
      setStories(stories.filter((s) => s._id !== id));
    } catch (err) {
      alert("Failed to delete story");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-stone-900">Manage Stories</h1>
          <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 text-sm font-bold text-stone-600 shadow-sm">
            Total Stories: {stories.length}
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : stories.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center border border-stone-200">
            <p className="text-stone-500">No stories submitted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {stories.map((story) => (
              <div key={story._id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-100">
                       {story.category}
                    </span>
                    <span className="text-xs text-stone-400">
                       {new Date(story.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-stone-900 mb-2">{story.title}</h3>
                  <p className="text-sm text-stone-600 italic mb-3">"{story.redactedBody}"</p>
                  
                  <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                    <p className="text-xs font-bold text-stone-500 uppercase mb-1 flex items-center gap-1">
                       <Shield size={12}/> AI Insight
                    </p>
                    <p className="text-sm text-stone-800">{story.insight}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[120px]">
                   <button 
                     onClick={() => deleteStory(story._id)}
                     className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition"
                   >
                     <Trash2 size={16} /> Delete
                   </button>
                   <div className="text-[10px] text-center text-stone-400 mt-2">
                      <AlertTriangle size={12} className="inline mr-1"/>
                      Irreversible
                   </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}