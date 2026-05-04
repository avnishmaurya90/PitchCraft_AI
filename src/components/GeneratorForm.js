"use client";
import { useState } from "react";

export default function GeneratorForm({ onGenerate, loading }) {
  const [job, setJob] = useState("");
  const [profile, setProfile] = useState("");
  const [tone, setTone] = useState("friendly");

  // ✅ Multiple optional questions
  const [questions, setQuestions] = useState([""]);

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated.length ? updated : [""]);
  };

  const handleSubmit = () => {
    if (!job || !profile) return alert("Fill required fields");

    // ✅ Remove empty questions
    const filteredQuestions = questions.filter(q => q.trim() !== "");

    onGenerate({
      jobDescription: job,
      profile,
      tone,
      questions: filteredQuestions, // 👈 send array
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">

      <h3 className="text-lg font-semibold">Input Details</h3>

      {/* Job */}
      <div>
        <label className="text-xs text-gray-400">Job Description</label>
        <textarea
          value={job}
          onChange={(e) => setJob(e.target.value)}
          placeholder="Paste job description..."
          className="w-full mt-2 p-3 rounded-lg bg-black/30 border border-gray-700"
          rows={5}
        />
      </div>

      {/* Profile */}
      <div>
        <label className="text-xs text-gray-400">Your Profile</label>
        <textarea
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          placeholder="Skills, experience..."
          className="w-full mt-2 p-3 rounded-lg bg-black/30 border border-gray-700"
          rows={3}
        />
      </div>

      {/* Tone */}
      <div>
        <label className="text-xs text-gray-400">Tone</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full mt-2 p-3 rounded-lg bg-black/30 border border-gray-700"
        >
          <option value="friendly">Friendly</option>
          <option value="professional">Professional</option>
          <option value="confident">Confident</option>
        </select>
      </div>

      {/* ✅ Questions Section */}
      <div>
        <label className="text-xs text-gray-400">
          Optional Questions / Instructions
        </label>

        {questions.map((q, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <input
              type="text"
              value={q}
              onChange={(e) =>
                handleQuestionChange(index, e.target.value)
              }
              placeholder="e.g. Add strong hook"
              className="flex-1 p-3 rounded-lg bg-black/30 border border-gray-700"
            />

            <button
              onClick={() => removeQuestion(index)}
              className="px-3 bg-red-500 rounded text-white text-sm"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="mt-2 text-xs text-indigo-400 hover:underline"
        >
          + Add another
        </button>
      </div>

      {/* Button */}
      <button
        onClick={handleSubmit}
        className="w-full bg-linear-to-r from-indigo-500 to-purple-500 py-3 rounded-lg font-medium"
      >
        {loading ? "Generating..." : "✨ Generate Proposal"}
      </button>

    </div>
  );
}