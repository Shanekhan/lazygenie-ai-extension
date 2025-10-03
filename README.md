# LazyGenie: Your AI Study Sidekick  

**Submission to:** Google Built-in AI Challenge  
**Team/Author:** [ShanzayKhan]  

---

## 📖 Project Overview  

Students often struggle with information overload, time pressure, and language barriers when studying. Managing notes, summarizing lectures, proofreading essays, and preparing for exams becomes overwhelming.  

**LazyGenie** solves this by acting as an AI-powered Chrome Extension study companion. With one click, students can summarize text, proofread assignments, translate content, or generate flashcards—all directly inside the browser. LazyGenie also supports multimodal input, allowing diagrams, handwritten notes, or images to be analyzed by AI.  

---

## 🚀 Features  

- **Summarization**: Convert lengthy content into concise, structured notes.  
- **Proofreading**: Grammar, spelling, and clarity checks for essays and assignments.  
- **Flashcards**: Generate active recall Q&A flashcards from any text.  
- **Translation**: Real-time translation into multiple languages.  
- **Multimodal Analysis**: Upload diagrams or handwritten notes and get AI explanations.  

---

## 🛠️ Technical Deep Dive  

LazyGenie’s architecture leverages **Chrome’s Built-in AI APIs** with a fallback to **Gemini API** for reliability and multimodal support.  

| Feature            | Primary API Used          | Fallback / Notes |
|--------------------|---------------------------|------------------|
| Summarization      | **Prompt API** (Built-in) | Falls back to Gemini API if Prompt API fails |
| Proofreading       | **Prompt API** (Built-in) | Falls back to Gemini API if Prompt API fails |
| Flashcards         | **Gemini API**            | Uses custom prompting for Q&A flashcards |
| Translation        | **Gemini API**            | Handles real-time translation |
| Multimodal Images  | **Gemini API**            | Accepts base64 image + text for diagram analysis |

**Workflow:**  
1. **popup.js** captures input text or uploaded images.  
2. Sends action request (`summarize`, `proofread`, `flashcards`, `translate`) to **background.js**.  
3. **background.js** routes to Prompt API first (for text tasks). If unavailable, routes to Gemini API.  
4. Response is returned to the popup UI and displayed instantly.  

---

## 📥 Installation & Setup  

### Prerequisites  
- **Google Chrome** (latest version with AI API support).  
- **Gemini API Key** (for fallback and multimodal). Obtain from [Google AI Studio](https://aistudio.google.com).  

### Local Installation (Developer Mode)  
1. Clone this repository:  
   ```bash
   git clone [YOUR_GITHUB_REPO_URL]
   
2. Open Chrome and navigate to:
   ```bash
    chrome://extensions/
   
4. Enable Developer Mode (toggle in the top-right).

5. Click Load unpacked and select the LazyGenie project folder.

6. Pin LazyGenie to your Chrome toolbar for quick access.

## 📦 Submission Details  

- **GitHub Repository:** [LazyGenie AI Extension](https://github.com/Shanekhan/lazygenie-ai-extension/tree/main)  
- **Demo Video (YouTube):** [Coming Soon]  
- **Description:** LazyGenie is an AI-powered Chrome Extension that helps students and professionals summarize, proofread, translate, and even generate flashcards from notes and images.  
- **License:** MIT License  


💡 Development Feedback

Chrome’s Prompt API is fast and effective for summarization/proofreading, but fallback with Gemini ensures consistent performance during outages.

Gemini API was key for multimodal (image+text) tasks, enabling use cases like diagram analysis and handwritten notes.

Manifest v3 with service workers worked smoothly; however, API key handling currently uses chrome.storage.local and will need a more secure implementation in production.

📜 License

This project is licensed under the MIT License – see the LICENSE file for details.

