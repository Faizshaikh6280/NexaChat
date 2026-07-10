(function() {
    // Determine the base URL dynamically based on where this script is loaded from
    var scriptTag = document.currentScript;
    var apiBaseUrl = "http://localhost:8000";
    if (scriptTag && scriptTag.src) {
        try {
            var url = new URL(scriptTag.src);
            apiBaseUrl = url.protocol + "//" + url.host;
        } catch (e) {
            console.error("NexaChat: Failed to parse script source:", e);
        }
    }
    // Also check for a data attribute override
    if (scriptTag && scriptTag.getAttribute("data-api-url")) {
        apiBaseUrl = scriptTag.getAttribute("data-api-url");
    }

    // Read bot_id from the script tag — THIS IS REQUIRED for multi-tenant isolation
    var botId = "";
    if (scriptTag && scriptTag.getAttribute("data-bot-id")) {
        botId = scriptTag.getAttribute("data-bot-id");
    }

    // Default configuration (will be overwritten by API)
    var config = {
        name: "NexaChat Assistant",
        primary_color: "#2563eb",
        welcome_message: "Hi there! How can I help you today?"
    };

    var isChatOpen = false;

    // Inject CSS
    var style = document.createElement("style");
    style.textContent = [
        ".sitegpt-widget-container {",
        "  position: fixed; bottom: 24px; right: 24px; z-index: 999999;",
        "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;",
        "}",
        ".sitegpt-launcher {",
        "  width: 60px; height: 60px; border-radius: 50%;",
        "  background-color: var(--sitegpt-primary, #2563eb);",
        "  color: white; border: none; cursor: pointer;",
        "  box-shadow: 0 4px 12px rgba(0,0,0,0.15);",
        "  display: flex; align-items: center; justify-content: center;",
        "  transition: transform 0.2s;",
        "}",
        ".sitegpt-launcher:hover { transform: scale(1.1); }",
        ".sitegpt-launcher svg { width: 28px; height: 28px; fill: currentColor; }",
        ".sitegpt-chat-window {",
        "  position: absolute; bottom: 80px; right: 0;",
        "  width: 360px; height: 500px; max-height: calc(100vh - 100px);",
        "  background: white; border-radius: 12px;",
        "  box-shadow: 0 8px 24px rgba(0,0,0,0.15);",
        "  display: flex; flex-direction: column; overflow: hidden;",
        "  opacity: 0; pointer-events: none; transform: translateY(10px);",
        "  transition: all 0.25s ease-out; border: 1px solid #e5e7eb;",
        "}",
        ".sitegpt-chat-window.sitegpt-open {",
        "  opacity: 1; pointer-events: auto; transform: translateY(0);",
        "}",
        ".sitegpt-header {",
        "  background-color: var(--sitegpt-primary, #2563eb);",
        "  color: white; padding: 16px; font-weight: 600; font-size: 16px;",
        "  display: flex; justify-content: space-between; align-items: center;",
        "}",
        ".sitegpt-close-btn {",
        "  background: none; border: none; color: white; cursor: pointer;",
        "  opacity: 0.8; font-size: 18px; padding: 0; line-height: 1;",
        "}",
        ".sitegpt-close-btn:hover { opacity: 1; }",
        ".sitegpt-messages {",
        "  flex: 1; padding: 16px; overflow-y: auto;",
        "  display: flex; flex-direction: column; gap: 12px; background: #f9fafb;",
        "}",
        ".sitegpt-msg {",
        "  max-width: 85%; padding: 12px 14px; border-radius: 12px;",
        "  font-size: 14px; line-height: 1.5; word-wrap: break-word;",
        "}",
        ".sitegpt-msg-bot {",
        "  background: white; color: #111827; align-self: flex-start;",
        "  border: 1px solid #e5e7eb; border-bottom-left-radius: 4px;",
        "}",
        ".sitegpt-msg-user {",
        "  background-color: var(--sitegpt-primary, #2563eb); color: white;",
        "  align-self: flex-end; border-bottom-right-radius: 4px;",
        "}",
        ".sitegpt-input-area {",
        "  padding: 12px; border-top: 1px solid #e5e7eb; background: white;",
        "  display: flex; gap: 8px;",
        "}",
        ".sitegpt-input {",
        "  flex: 1; border: 1px solid #e5e7eb; border-radius: 20px;",
        "  padding: 10px 14px; font-size: 14px; outline: none; color: #111827;",
        "}",
        ".sitegpt-input:focus { border-color: var(--sitegpt-primary, #2563eb); }",
        ".sitegpt-send-btn {",
        "  background-color: var(--sitegpt-primary, #2563eb); color: white;",
        "  border: none; border-radius: 50%; width: 40px; height: 40px;",
        "  display: flex; align-items: center; justify-content: center; cursor: pointer;",
        "}",
        ".sitegpt-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }",
        ".sitegpt-typing { display: inline-block; }",
        ".sitegpt-typing::after {",
        "  content: '.'; animation: sitegpt-dots 1.5s steps(5, end) infinite;",
        "}",
        "@keyframes sitegpt-dots {",
        "  0%, 20% { color: rgba(0,0,0,0); text-shadow: .25em 0 0 rgba(0,0,0,0), .5em 0 0 rgba(0,0,0,0); }",
        "  40% { color: inherit; text-shadow: .25em 0 0 rgba(0,0,0,0), .5em 0 0 rgba(0,0,0,0); }",
        "  60% { text-shadow: .25em 0 0 inherit, .5em 0 0 rgba(0,0,0,0); }",
        "  80%, 100% { text-shadow: .25em 0 0 inherit, .5em 0 0 inherit; }",
        "}",
        "@media (max-width: 480px) {",
        "  .sitegpt-chat-window {",
        "    position: fixed; bottom: 0; right: 0; width: 100%; height: 100%;",
        "    max-height: 100%; border-radius: 0; z-index: 1000000;",
        "  }",
        "}"
    ].join("\n");
    document.head.appendChild(style);

    // Create Container
    var container = document.createElement("div");
    container.className = "sitegpt-widget-container";

    function boot() {
        document.body.appendChild(container);

        if (!botId) {
            console.error("NexaChat: No data-bot-id attribute found on the script tag. Widget cannot load.");
            return;
        }
        
        // Fetch config for THIS specific bot
        var xhr = new XMLHttpRequest();
        xhr.open("GET", apiBaseUrl + "/api/config?bot_id=" + encodeURIComponent(botId), true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data.name) config.name = data.name;
                    if (data.primary_color) config.primary_color = data.primary_color;
                    if (data.welcome_message) config.welcome_message = data.welcome_message;
                } catch(e) { /* use defaults */ }
            }
            renderWidget();
        };
        xhr.onerror = function() {
            console.warn("NexaChat: Could not reach API, using defaults.");
            renderWidget();
        };
        xhr.send();
    }

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    function renderWidget() {
        container.style.setProperty("--sitegpt-primary", config.primary_color);

        // Build HTML using string concat (no template literals for max compat)
        var html = [
            '<button class="sitegpt-launcher" aria-label="Open chat">',
            '  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
            '    <path d="M12 2C6.477 2 2 6.03 2 11c0 2.87 1.54 5.43 3.93 7.07.19 1.13-.19 2.58-.93 3.69-.14.21-.05.5.17.62.15.08.33.07.47-.02 1.93-1.16 3.65-1.12 4.67-.97C10.84 21.72 11.41 21.8 12 21.8c5.523 0 10-4.03 10-9s-4.477-9-10-9z"/>',
            '  </svg>',
            '</button>',
            '<div class="sitegpt-chat-window">',
            '  <div class="sitegpt-header">',
            '    <span>' + escapeHtml(config.name) + '</span>',
            '    <button class="sitegpt-close-btn" aria-label="Close chat">&times;</button>',
            '  </div>',
            '  <div class="sitegpt-messages">',
            '    <div class="sitegpt-msg sitegpt-msg-bot">' + escapeHtml(config.welcome_message) + '</div>',
            '  </div>',
            '  <form class="sitegpt-input-area">',
            '    <input type="text" class="sitegpt-input" placeholder="Type your message..." autocomplete="off">',
            '    <button type="submit" class="sitegpt-send-btn">',
            '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
            '    </button>',
            '  </form>',
            '</div>'
        ].join("\n");

        container.innerHTML = html;

        // Bind events
        var launcher = container.querySelector(".sitegpt-launcher");
        var chatWindow = container.querySelector(".sitegpt-chat-window");
        var closeBtn = container.querySelector(".sitegpt-close-btn");
        var form = container.querySelector(".sitegpt-input-area");
        var input = container.querySelector(".sitegpt-input");
        var messagesEl = container.querySelector(".sitegpt-messages");
        var sendBtn = container.querySelector(".sitegpt-send-btn");

        function toggleChat() {
            isChatOpen = !isChatOpen;
            if (isChatOpen) {
                chatWindow.classList.add("sitegpt-open");
                input.focus();
            } else {
                chatWindow.classList.remove("sitegpt-open");
            }
        }

        launcher.addEventListener("click", toggleChat);
        closeBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            toggleChat();
        });

        function addMessage(text, type) {
            var el = document.createElement("div");
            el.className = "sitegpt-msg sitegpt-msg-" + type;
            el.textContent = text;
            messagesEl.appendChild(el);
            messagesEl.scrollTop = messagesEl.scrollHeight;
            return el;
        }

        form.addEventListener("submit", function(e) {
            e.preventDefault();
            var query = input.value.trim();
            if (!query) return;

            input.value = "";
            addMessage(query, "user");
            sendBtn.disabled = true;

            // Show typing indicator
            var typingEl = document.createElement("div");
            typingEl.className = "sitegpt-msg sitegpt-msg-bot";
            typingEl.innerHTML = '<span class="sitegpt-typing">Thinking</span>';
            messagesEl.appendChild(typingEl);
            messagesEl.scrollTop = messagesEl.scrollHeight;

            var chatXhr = new XMLHttpRequest();
            chatXhr.open("POST", apiBaseUrl + "/api/chat", true);
            chatXhr.setRequestHeader("Content-Type", "application/json");
            chatXhr.onload = function() {
                typingEl.remove();
                if (chatXhr.status === 200) {
                    try {
                        var resp = JSON.parse(chatXhr.responseText);
                        addMessage(resp.answer || "No response received.", "bot");
                    } catch(err) {
                        addMessage("Sorry, I received an invalid response.", "bot");
                    }
                } else {
                    addMessage("Sorry, I encountered an error. Please try again later.", "bot");
                }
                sendBtn.disabled = false;
                input.focus();
            };
            chatXhr.onerror = function() {
                typingEl.remove();
                addMessage("Network error. Please check your connection.", "bot");
                sendBtn.disabled = false;
                input.focus();
            };
            // Send bot_id with every chat request for data isolation
            chatXhr.send(JSON.stringify({ query: query, bot_id: botId, session_id: "widget-session" }));
        });
    }

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }
})();
