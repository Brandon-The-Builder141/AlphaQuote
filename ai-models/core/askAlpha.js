// askAlpha.js
// This module sends a smart estimation request to Mistral (via Ollama)

export default async function askAlpha({ transcript, formData, profile }) {
  const prompt = `
You are AlphaQuote, an AI assistant designed to help contractors generate accurate project estimates from minimal inputs.

Here is a job description, spoken by the user:
"${transcript}"

Form Data:
- Room Type: ${formData.roomType}
- Square Footage: ${formData.squareFootage}
- Notes: ${formData.notes}

Company Profile:
- Business Name: ${profile.businessName}
- Labor Rate: $${profile.laborRate}/hr
- Markup: ${profile.markup}%
- Preferred Vendor: ${profile.materialVendor}

Your job is to:
1. Generate an itemized labor and material estimate
2. Apply the markup
3. Suggest a short scope-of-work summary in bullet points
4. Provide a clean total cost at the end

Respond as if you're writing a report for a contractor to send to their client.
  `;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral", // change to "mixtral" or "llama3" later if needed
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.response;
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw new Error(`Failed to generate AI estimate: ${error.message}`);
  }
}
