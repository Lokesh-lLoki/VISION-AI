
from flask import Flask, render_template, request, jsonify
from datetime import datetime
import random
import wikipedia
from urllib.parse import quote_plus

app = Flask(__name__)

JOKES = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "Why did the computer go to the doctor? It had a virus.",
    "There are 10 types of people: those who understand binary and those who don't."
]


@app.get("/")
def home():
    return render_template("index.html")


@app.post("/api/command")
def command():
    data = request.get_json(silent=True) or {}
    raw = str(data.get("message", "")).strip()
    text = raw.lower()

    if not raw:
        return jsonify(reply="I didn't receive a command.", action=None)

    if any(word in text for word in ["hello", "hi", "hey"]):
        return jsonify(
            reply="Hello! I'm Vision AI. How can I help you?",
            action=None
        )

    if "time" in text:
        current_time = datetime.now().strftime("%I:%M %p")
        return jsonify(
            reply=f"The current server time is {current_time}.",
            action=None
        )

    if "date" in text or "today" in text:
        current_date = datetime.now().strftime("%A, %d %B %Y")
        return jsonify(
            reply=f"Today is {current_date}.",
            action=None
        )

    if "joke" in text:
        return jsonify(reply=random.choice(JOKES), action=None)

    if "open google" in text or text == "google":
        return jsonify(
            reply="Opening Google in a new tab.",
            action={"type": "open_url", "url": "https://www.google.com"}
        )

    if "open youtube" in text or text == "youtube":
        return jsonify(
            reply="Opening YouTube in a new tab.",
            action={"type": "open_url", "url": "https://www.youtube.com"}
        )

    if "open chatgpt" in text or text == "chatgpt":
        return jsonify(
            reply="Opening ChatGPT in a new tab.",
            action={"type": "open_url", "url": "https://chatgpt.com"}
        )

    if "open instagram" in text or text == "instagram":
        return jsonify(
            reply="Opening Instagram in a new tab.",
            action={"type": "open_url", "url": "https://www.instagram.com"}
        )

    if text.startswith("search for "):
        query = raw[11:].strip()

        if query:
            url = "https://www.google.com/search?q=" + quote_plus(query)
            return jsonify(
                reply=f"Searching Google for {query}.",
                action={"type": "open_url", "url": url}
            )

    if (
        text.startswith("who is ")
        or text.startswith("what is ")
        or text.startswith("tell me about ")
    ):
        if text.startswith("who is "):
            topic = raw[7:].strip()
        elif text.startswith("what is "):
            topic = raw[8:].strip()
        else:
            topic = raw[14:].strip()

        if topic:
            try:
                answer = wikipedia.summary(
                    topic,
                    sentences=2,
                    auto_suggest=True
                )
                return jsonify(reply=answer, action=None)

            except wikipedia.exceptions.DisambiguationError as exc:
                choices = ", ".join(exc.options[:4])
                return jsonify(
                    reply=f"I found multiple matches. Please be more specific. Some options are: {choices}.",
                    action=None
                )

            except Exception:
                return jsonify(
                    reply="Sorry, I couldn't find a suitable Wikipedia summary. Try rephrasing your question.",
                    action=None
                )

    if any(word in text for word in ["exit", "stop", "bye", "goodbye"]):
        return jsonify(
            reply="Goodbye! It was nice assisting you.",
            action={"type": "stop_listening"}
        )

    return jsonify(
        reply=(
            "I can help with greetings, time, date, jokes, Wikipedia questions, "
            "Google, YouTube, ChatGPT, Instagram, and Google searches. "
            "Try saying 'help' or 'search for Python tutorials'."
        ),
        action=None
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
