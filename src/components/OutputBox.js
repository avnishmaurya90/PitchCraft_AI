"use client";

import { useState } from "react";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";

export default function OutputBox({
  outputs = [],
  answers = [],
  loading,
  onRegenerate,
}) {
  const [editIndex, setEditIndex] = useState(null);
  const [editedText, setEditedText] = useState("");

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadDoc = async (text) => {
    const doc = new Document({
      sections: [{ children: [new Paragraph(text)] }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "proposal.docx");
  };

  const startEdit = (index, text) => {
    setEditIndex(index);
    setEditedText(text);
  };

  // ⚠️ FIX: avoid direct mutation
  const saveEdit = () => {
    setEditIndex(null);
  };

  // ✅ Safe score handling
  const bestScore =
    outputs.length > 0
      ? Math.max(
          ...outputs.map((o) =>
            typeof o === "object" ? o.score || 0 : 0
          )
        )
      : 0;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">

      <h3 className="text-lg font-semibold mb-4">
        AI Generated Proposals
      </h3>

      {/* ✅ LOADER */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-4 border border-gray-700 bg-black/30 animate-pulse"
            >
              <div className="h-4 w-24 bg-gray-600 rounded mb-3"></div>
              <div className="h-3 w-full bg-gray-700 rounded mb-2"></div>
              <div className="h-3 w-5/6 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 w-2/3 bg-gray-700 rounded"></div>
            </div>
          ))}
          <p className="text-sm text-gray-400 text-center animate-pulse">
            🤖 AI is generating your proposals...
          </p>
        </div>
      )}

      {/* ✅ EMPTY */}
      {!loading && outputs.length === 0 && answers.length === 0 && (
        <p className="text-gray-500">
          Your results will appear here.
        </p>
      )}

      {/* ===================== */}
      {/* ✅ PROPOSALS SECTION */}
      {/* ===================== */}
      {!loading && outputs.length > 0 && (
        <div className="space-y-4">

          {outputs.map((item, index) => {
            const text =
              typeof item === "string" ? item : item.text;

            const score =
              typeof item === "object" ? item.score : null;

            const reason =
              typeof item === "object" ? item.reason : null;

            const isBest = score === bestScore && score !== null;

            return (
              <div
                key={index}
                className={`rounded-xl p-4 border ${
                  isBest
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-gray-700 bg-black/30"
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-2">

                  <div className="flex gap-2 items-center">
                    <p className="text-sm text-indigo-400">
                      Version {index + 1}
                    </p>

                    {isBest && (
                      <span className="text-xs bg-indigo-500 px-2 py-1 rounded text-white">
                        Best
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">

                    {score !== null && (
                      <span className="text-xs bg-white/10 px-2 py-1 rounded">
                        ⭐ {score}
                      </span>
                    )}

                    <button
                      onClick={() => copyText(text)}
                      className="text-xs bg-white/10 px-2 py-1 rounded"
                    >
                      Copy
                    </button>

                    <button
                      onClick={() => downloadDoc(text)}
                      className="text-xs bg-green-500 px-2 py-1 rounded text-white"
                    >
                      Download
                    </button>

                    <button
                      onClick={() => startEdit(index, text)}
                      className="text-xs bg-yellow-500 px-2 py-1 rounded text-black"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onRegenerate(index)}
                      className="text-xs bg-purple-500 px-2 py-1 rounded text-white"
                    >
                      Improve
                    </button>
                  </div>
                </div>

                {/* Reason */}
                {reason && (
                  <p className="text-xs text-gray-400 mb-2">
                    {reason}
                  </p>
                )}

                {/* Editable */}
                {editIndex === index ? (
                  <div>
                    <textarea
                      value={editedText}
                      onChange={(e) =>
                        setEditedText(e.target.value)
                      }
                      className="w-full p-2 rounded bg-black/40 border border-gray-600 text-sm"
                      rows={6}
                    />
                    <button
                      onClick={saveEdit}
                      className="mt-2 text-xs bg-indigo-500 px-3 py-1 rounded"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 whitespace-pre-line">
                    {text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===================== */}
      {/* ✅ ANSWERS SECTION */}
      {/* ===================== */}
      {!loading && answers.length > 0 && (
        <div className="mt-6 border-t border-gray-700 pt-4">

          <h4 className="text-md font-semibold mb-3 text-indigo-400">
            AI Answers
          </h4>

          <div className="space-y-3">
            {answers.map((ans, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-black/30 border border-gray-700"
              >
                <p className="text-xs text-gray-400 mb-1">
                  Question {i + 1}
                </p>
                <p className="text-sm text-gray-300 whitespace-pre-line">
                  {ans}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}