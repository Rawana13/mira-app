function getRecordsSummaryPrompt(language, entries, userName) {
  const entryDescriptions = entries.map((e, i) => {
    const date = new Date(e.date).toLocaleDateString();
    return `${i + 1}. [${e.type.toUpperCase()}] ${date}: ${e.summary}`;
  }).join('\n');

  return `You are Mira. Generate a structured health summary document for ${userName} to share with a doctor in their home country.
Respond entirely in ${language}. Do not switch languages mid-response.
The receiving doctor may have no knowledge of the US healthcare system — explain everything clearly.

Here are the patient's health entries:
${entryDescriptions}

Return ONLY a valid JSON object:
{
  "patient_name": "${userName}",
  "document_title": "Healthcare Summary — United States",
  "us_system_note": "Brief explanation of the US healthcare system for international doctors (insurance, referrals, prescriptions, specialists)",
  "visit_history": [
    { "date": "date string", "type": "type", "summary": "plain-language summary" }
  ],
  "current_medications": ["medication 1", "medication 2"],
  "outstanding_followups": ["pending follow-up 1", "pending follow-up 2"],
  "lab_results": ["lab result summary 1"],
  "generated_date": "${new Date().toLocaleDateString()}"
}`;
}

module.exports = { getRecordsSummaryPrompt };
