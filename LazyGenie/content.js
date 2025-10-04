// content.js

console.log("LazyGenie content script loaded.");

/**
 * This script runs in the context of the web page.
 * It's useful for interacting with the page's DOM, such as getting selected text.
 * * For now, it doesn't have an active role but is set up for future features.
 *
 * Example Future Use Case:
 * * chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
 * if (request.action === 'getSelectedText') {
 * const selectedText = window.getSelection().toString();
 * sendResponse({ text: selectedText });
 * }
 * });
 *
 * To use this, the popup would send a message like:
 * * chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
 * chrome.tabs.sendMessage(tabs[0].id, { action: "getSelectedText" }, (response) => {
 * if (response && response.text) {
 * document.getElementById('inputText').value = response.text;
 * }
 * });
 * });
 * */