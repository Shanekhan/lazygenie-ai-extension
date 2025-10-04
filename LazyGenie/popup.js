// ================================
// popup.js (FINAL POLISHED VERSION)
// ================================

document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText');
  const outputContent = document.getElementById('outputContent');
  const imageUpload = document.getElementById('imageUpload');
  const imageStatus = document.getElementById('imageStatus');

  const summarizeBtn = document.getElementById('summarizeBtn');
  const flashcardBtn = document.getElementById('flashcardBtn');
  const proofreadBtn = document.getElementById('proofreadBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const exitBtn = document.getElementById('exitBtn');
  const customLangBtn = document.getElementById('customLangBtn');
  const langButtons = document.querySelectorAll('.lang-btn');

  let uploadedImageData = null;

  // ✅ Helper: Disable all feature buttons during request
  const toggleButtons = (disable) => {
    [
      summarizeBtn, flashcardBtn, proofreadBtn,
      customLangBtn, refreshBtn, exitBtn,
      ...langButtons
    ].forEach(btn => {
      if (btn) btn.disabled = disable;
    });
  };

  const processAction = (action, language = null) => {
    const text = inputText.value;

    if (!text && !uploadedImageData) {
      displayOutput('⚠️ Please enter text or upload an image first.');
      return;
    }

    showLoading();
    toggleButtons(true); // ⛔ disable buttons during API call

    chrome.runtime.sendMessage(
      { action, text, imageData: uploadedImageData, language },
      (response) => {
        toggleButtons(false); // ✅ enable buttons again

        if (response?.success) {
          displayOutput(response.data);
          if (response.fallback) {
            console.log("⚠️ Response generated via Gemini API fallback.");
          }
        } else {
          displayError(response?.error || "Unknown error occurred.");
        }
      }
    );
  };

  // --- Image Upload ---
  imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedImageData = e.target.result;
        imageStatus.textContent = `✅ Image loaded: ${file.name}`;
      };
      reader.readAsDataURL(file);
    }
  });

  // --- UI Helpers ---
  const showLoading = () => {
    outputContent.innerHTML = 'Thinking... 🤔';
    outputContent.classList.add('loading');
  };

  const displayOutput = (content) => {
    outputContent.innerText = content || "⚠️ No response received.";
    outputContent.classList.remove('loading');
  };

  const displayError = (error) => {
    outputContent.innerHTML = `❌ Error: <br><span class="error-text">${error}</span>`;
    outputContent.classList.remove('loading');
  };

  const resetUI = () => {
    inputText.value = '';
    outputContent.innerHTML = 'Processed text will appear here.';
    imageUpload.value = '';
    uploadedImageData = null;
    imageStatus.textContent = 'Upload a photo of notes or any image for analysis.';
  };

  // --- Event Listeners ---
  summarizeBtn.addEventListener('click', () => processAction('summarize'));
  flashcardBtn.addEventListener('click', () => processAction('flashcards'));
  proofreadBtn.addEventListener('click', () => processAction('proofread'));

  langButtons.forEach(button => {
    button.addEventListener('click', () => {
      const lang = button.getAttribute('data-lang');
      processAction('translate', lang);
    });
  });

  customLangBtn.addEventListener('click', () => {
    const customLanguage = document.getElementById('customLanguage').value;
    if (customLanguage) {
      processAction('translate', customLanguage);
    } else {
      displayOutput('⚠️ Please enter a language to translate to.');
    }
  });

  refreshBtn.addEventListener('click', resetUI);
  exitBtn.addEventListener('click', () => window.close());
});
