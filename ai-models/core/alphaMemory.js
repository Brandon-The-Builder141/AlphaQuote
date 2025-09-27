const MEMORY_KEY = "alphaquote_memory";

export function saveEstimateToMemory(estimateData) {
  let memory = JSON.parse(localStorage.getItem(MEMORY_KEY)) || [];

  memory.unshift(estimateData); // add to top
  if (memory.length > 5) memory.pop(); // keep last 5

  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

export function getMemoryContext() {
  const memory = JSON.parse(localStorage.getItem(MEMORY_KEY)) || [];

  if (memory.length === 0) return "No past jobs found.";

  let result = "Recent Estimate History:\n";

  memory.forEach((job, idx) => {
    result += `Job ${idx + 1}:
- Room: ${job.roomType}
- SqFt: ${job.sqft}
- Material: ${job.materialType}
- Labor: ${job.laborType}
- Markup: ${job.markup}%
- Total: $${job.totalEstimate}\n\n`;
  });

  return result.trim();
}
