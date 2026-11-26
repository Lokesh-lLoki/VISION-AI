
const micButton = document.getElementById("micButton");
const micLabel = document.getElementById("micLabel");
const micNote = document.getElementById("micNote");
const assistantState = document.getElementById("assistantState");
const assistantHint = document.getElementById("assistantHint");
const orbWrap = document.getElementById("orbWrap");
const messages = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const clearButton = document.getElementById("clearButton");

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;

function addMessage(text, sender) {
    const div = document.createElement("div");

    div.className = sender === "user"
        ? "message user-message"
        : "message assistant-message";

    const tag = document.createElement("span");
    tag.className = "message-tag";
    tag.textContent = sender === "user" ? "YOU" : "VISION AI";

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    div.appendChild(tag);
    div.appendChild(paragraph);

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function speak(text) {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}

function setListening(value) {
    isListening = value;

    orbWrap.classList.toggle("listening", value);

    micLabel.textContent = value
        ? "STOP LISTENING"
        : "START LISTENING";

    assistantState.textContent = value
        ? "VISION AI IS LISTENING"
        : "VISION AI IS READY";

    assistantHint.textContent = value
        ? "Speak your command clearly."
        : "Tap the microphone or type a command.";
}

async function sendCommand(command) {
    command = command.trim();

    if (!command) return;

    addMessage(command, "user");

    assistantState.textContent = "VISION AI IS THINKING";

    try {
        const response = await fetch("/api/command", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: command
            })
        });

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        const data = await response.json();

        if (!data.reply) {
            throw new Error("No reply received from Flask.");
        }

        addMessage(data.reply, "assistant");
        speak(data.reply);

        if (data.action && data.action.type === "open_url") {
            const newTab = window.open(data.action.url, "_blank");

            if (!newTab) {
                assistantHint.textContent =
                    "Allow pop-ups to open websites.";
            }
        }

        if (
            data.action &&
            data.action.type === "stop_listening" &&
            recognition &&
            isListening
        ) {
            recognition.stop();
        }

        assistantState.textContent = "VISION AI IS READY";

    } catch (error) {
        console.error("VISION AI Error:", error);

        addMessage(
            "Unable to connect to the server. Please try again.",
            "assistant"
        );

        assistantState.textContent = "CONNECTION ERROR";
    }
}

// Text command submission
chatForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const command = messageInput.value.trim();

    if (command) {
        sendCommand(command);
        messageInput.value = "";
    }
});

// Suggested command buttons
document.querySelectorAll("[data-command]").forEach(button => {
    button.addEventListener("click", function() {
        sendCommand(this.dataset.command);
    });
});

// Browser voice recognition
if (SpeechRecognition) {
    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function() {
        setListening(true);
        micNote.textContent = "Listening to your voice...";
    };

    recognition.onresult = function(event) {
        const command = event.results[0][0].transcript;

        assistantHint.textContent = "You said: " + command;

        sendCommand(command);
    };

    recognition.onerror = function(event) {
        micNote.textContent = "Microphone error: " + event.error;

        if (event.error === "not-allowed" ||
            event.error === "service-not-allowed") {
            micNote.textContent =
                "Allow microphone access in Chrome site settings.";
        }
    };

    recognition.onend = function() {
        setListening(false);
    };

    micButton.addEventListener("click", function() {
        if (isListening) {
            recognition.stop();
            return;
        }

        try {
            recognition.start();
        } catch (error) {
            micNote.textContent =
                "Please try clicking the microphone again.";
        }
    });

} else {
    micButton.disabled = true;

    micNote.textContent =
        "Voice recognition is unavailable. Try Google Chrome.";
}

// Clear chat
clearButton.addEventListener("click", function() {
    messages.replaceChildren();

    addMessage(
        "Hello! I'm Vision AI. How can I help you?",
        "assistant"
    );

    window.speechSynthesis.cancel();
});
