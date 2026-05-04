export async function POST(req) {
  try {
    const body = await req.json();

    const {
      jobDescription,
      profile,
      tone,
      currentText,
      questions = [],
    } = body;

    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json({ result: "Missing API key" });
    }

    // ✅ Format questions
    const questionText =
      questions.length > 0
        ? `User Instructions:\n${questions.map(q => "- " + q).join("\n")}`
        : "";

    let prompt = "";

    // =========================
    // ✅ 1. QUESTION ONLY MODE
    // =========================
    if (!jobDescription && questions.length > 0) {
      prompt = `
Answer each question clearly and separately.
Rules:
 - Each must be unique in tone and structure
 - Make it more engaging and personalized 
 - Keep human tone (not AI-like) 
 - Sound natural and human

Format:
1. Answer...
2. Answer...

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`;
    }

    // =========================
    // ✅ 2. IMPROVE MODE
    // =========================
    else if (currentText) {
      prompt = `
Improve the following Upwork cover letter.
Rules:
 - Each must be unique in tone and structure
 - Make it more engaging and personalized 
 - Keep human tone (not AI-like) 
 - Sound natural and human
${questionText}

Original:
${currentText}

Job:
${jobDescription}

Profile:
${profile}

Tone:
${tone}

Rules: 
- Sound human and natural
 - Each must be unique in tone and structure
 - Make it more engaging and personalized 
 - Keep human tone (not AI-like) 
 - Sound natural and human

Return ONLY improved version.
`;
    }

    // =========================
    // ✅ 3. GENERATE MODE
    // =========================
    else {
      prompt = `
Generate EXACTLY 3 Upwork cover letters.


${questionText}

Rules: 
- Sound human and natural
 - Each must be unique in tone and structure
 - Make it more engaging and personalized 
 - Keep human tone (not AI-like) 
 - Sound natural and human

Format STRICTLY:

---VERSION 1---
...

---VERSION 2---
...

---VERSION 3---
...

Job:
${jobDescription}

Profile:
${profile}

Tone:
${tone}
`;
    }

    // =========================
    // 🔥 MAIN AI CALL (PROPOSALS / ANSWERS)
    // =========================
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "PitchCraft AI",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("API ERROR:", err);
      return Response.json({ result: "API Error: " + err });
    }

    const data = await response.json();

    const output =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      "";

    console.log("AI OUTPUT:", output);

    // =========================
    // ✅ QUESTION MODE RESPONSE
    // =========================
    if (!jobDescription && questions.length > 0) {
      const answers = output
        .split(/\d+\./)
        .map(a => a.trim())
        .filter(Boolean);

      return Response.json({ answers });
    }

    // =========================
    // ✅ IMPROVE MODE RESPONSE
    // =========================
    if (currentText) {
      return Response.json({ result: output });
    }

    // =========================
    // ✅ GENERATE MODE RESPONSE
    // =========================

    // 👉 Extract proposals
    const versions = output
      .split(/---VERSION \d+---/)
      .map(v => v.trim())
      .filter(v => v.length > 0);

    let answers = [];

    // 👉 If questions exist → get answers separately
    if (questions.length > 0) {
      const answerPrompt = `
Answer each question clearly:

${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`;

      const answerRes = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3-8b-instruct",
            messages: [{ role: "user", content: answerPrompt }],
          }),
        }
      );

      const answerData = await answerRes.json();

      const rawAnswers =
        answerData?.choices?.[0]?.message?.content || "";

      answers = rawAnswers
        .split(/\d+\./)
        .map(a => a.trim())
        .filter(Boolean);
    }

    return Response.json({
      results: versions.length ? versions : [output],
      answers, // ✅ separate answers
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return Response.json({
      result: "Server error",
    });
  }
}