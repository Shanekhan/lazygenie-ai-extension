

/**
 * background.js
 * Handles API calls for LazyGenie Chrome Extension.
 * Acts as the middle layer between popup.js (frontend) and external APIs (Prompt + Gemini).
 */

/**
 * On extension installation:
 * - Preloads API keys into chrome.storage.local so they can be accessed later.
 * - ⚠️ NOTE: Keys are hardcoded here for demo purposes only.
 *   In production, this should be replaced with a secure options page or server-side handling.
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    promptApiKey: "AtSzVH0gZ5bSEXmhEqoxq1LwhjMikBBMEQ29/Y/D6qF/87MZRnnzw5O7FI3x5cfErMl2YEwg0pvUMJ2l2Xxp0QYAAAB7eyJvcmlnaW4iOiJjaHJvbWUtZXh0ZW5zaW9uOi8vbmNvZGxwZWptZWRnbWJwcGJjYWVtaW9ka2pqbmhsb2kiLCJmZWF0dXJlIjoiQUlQcm9tcHRBUElNdWx0aW1vZGFsSW5wdXQiLCJleHBpcmkiOjE3NzQzMTA0MDB9", // Placeholder demo key
    geminiApiKey: "AIzaSyCR_NwM02L5l95kvoLyBc-YZVNxGeEGeJk"  // Placeholder demo key
  });
  console.log('LazyGenie: API keys initialized.');
});

// --- API Endpoints ---
// Primary "Prompt API" endpoint (used for summarize & proofread).
const PROMPT_API_ENDPOINT = 'https://api.promptapi.com/v1/process';

// Gemini API endpoint (used for multimodal + fallback cases).
// Supports text, translation, and image + text inputs.
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';


/**
 * Listener for messages from popup.js.
 * Each user action (summarize, flashcards, translate, etc.) comes in as a request here.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action) {
    // Route to the handler and return result asynchronously.
    handleApiRequest(request)
      .then(sendResponse)
      .catch(error => {
        console.error("LazyGenie Error:", error);
        sendResponse({ success: false, error: error.message });
      });
  }
  return true; // Required: ensures Chrome keeps sendResponse alive for async.
});


/**
 * Main request router.
 * Decides which API to call based on the requested action.
 * Falls back to Gemini API if Prompt API fails.
 */
async function handleApiRequest(request) {
  const { promptApiKey, geminiApiKey } = await chrome.storage.local.get(['promptApiKey', 'geminiApiKey']);
  const { action, text, imageData, language } = request;

  switch (action) {
    // --- Text-only actions ---
    case 'summarize':
    case 'proofread':
      try {
        console.log(`Attempting to ${action} with Prompt API.`);
        const result = await callPromptApi(action, text, promptApiKey);
        return { success: true, data: result };
      } catch (error) {
        // If Prompt API fails → fallback to Gemini API.
        console.warn(`Prompt API failed: ${error.message}. Falling back to Gemini API.`);
        const fallbackPrompt = `The primary API service is unavailable. Please perform the user's intended action: '${action}'.\n\nContent:\n"""\n${text}\n"""`;
        const result = await callGeminiApi(fallbackPrompt, imageData, geminiApiKey);
        return { success: true, data: result, fallback: true };
      }

    // --- Flashcards ---
    case 'flashcards':
      console.log('Generating flashcards with Gemini API.');
      const flashcardPrompt = `Generate flashcards from the provided content. Format each as "Q: [Question]\\nA: [Answer]". Separate each pair with a double newline.\n\nContent:\n"""\n${text}\n"""`;
      const flashcardResult = await callGeminiApi(flashcardPrompt, imageData, geminiApiKey);
      return { success: true, data: flashcardResult };

    // --- Translation ---
    case 'translate':
      console.log(`Translating to ${language} with Gemini API.`);
      const translatePrompt = `Translate the following text to ${language}. Provide only the translated text.\n\nText:\n"""\n${text}\n"""`;
      const translateResult = await callGeminiApi(translatePrompt, imageData, geminiApiKey);
      return { success: true, data: translateResult };

    // --- Unknown Action ---
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}


/**
 * Wrapper for Prompt API calls.
 * Only supports simple text-based tasks (summarize, proofread).
 * @param {string} action - The requested task.
 * @param {string} text - User input text.
 * @param {string} apiKey - API key for authentication.
 */
async function callPromptApi(action, text, apiKey) {
  const response = await fetch(PROMPT_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ action, text })
  });

  if (!response.ok) {
    throw new Error(`Prompt API Error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.processedText; // Assumes API responds with { processedText: "..." }
}


/**
 * Wrapper for Gemini API calls.
 * Supports text-only and multimodal (text + image) inputs.
 * @param {string} prompt - The instruction for Gemini.
 * @param {string|null} imageData - Base64 encoded image (optional).
 * @param {string} apiKey - Gemini API key.
 */
async function callGeminiApi(prompt, imageData, apiKey) {
  const url = `${GEMINI_API_ENDPOINT}?key=${apiKey}`;
  const parts = [{ text: prompt }];

  // If image data exists, detect MIME type and attach inline.
  if (imageData) {
    const mimeMatch = imageData.match(/^data:(.*?);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: imageData.split(',')[1] // Strip off prefix before sending
      }
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errorBody}`);
  }

  const result = await response.json();
  // Extracts the first candidate's text (if available), otherwise safe fallback.
  return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response text generated.";
}
