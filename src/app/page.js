"use client";

import { useState } from "react";
import GeneratorForm from "@/components/GeneratorForm";
import OutputBox from "@/components/OutputBox";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [outputs, setOutputs] = useState([]);
  const [answers, setAnswers] = useState([]); // ✅ NEW
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState(null); // ✅ for regenerate

  // =========================
  // ✅ GENERATE
  // =========================
  const handleGenerate = async (data) => {
    setInputs(data);
    setLoading(true);

    setOutputs([]);
    setAnswers([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await res.json();

      // ✅ QUESTION ONLY MODE
      if (result.answer) {
        setOutputs([]);
        setAnswers([result.answer]);
      }

      // ✅ NORMAL GENERATE MODE
      else {
        // convert string array → object structure (for UI)
        const parsed = (result.results || []).map((text) => ({
          text,
          score: 0,   // placeholder (you can add AI scoring later)
          reason: "",
        }));

        setOutputs(parsed);
        setAnswers(result.answers || []);
      }

    } catch (err) {
      console.error(err);
      setOutputs([]);
      setAnswers([]);
    }

    setLoading(false);
  };

  // =========================
  // ✅ IMPROVE (REGENERATE)
  // =========================
  const handleRegenerate = async (index) => {
    if (!inputs) return;

    const current = outputs[index];

    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          ...inputs,
          currentText: current.text,
        }),
      });

      const result = await res.json();

      const updated = [...outputs];
      updated[index] = {
        ...current,
        text: result.result,
      };

      setOutputs(updated);

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white p-6">
      <Navbar />

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">

        {/* ✅ FORM */}
        <GeneratorForm
          onGenerate={handleGenerate}
          loading={loading}
        />

        {/* ✅ OUTPUT */}
        <OutputBox
          outputs={outputs}
          answers={answers} // 👈 NEW
          loading={loading}
          onRegenerate={handleRegenerate} // 👈 FIXED
        />

      </div>
    </main>
  );
}