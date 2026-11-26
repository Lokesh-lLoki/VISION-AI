# VISION AI — Personal Voice Assistant

VISION AI is a Python Flask web application with a futuristic dashboard, browser-based voice input, spoken responses, and predefined assistant commands.

## Features
- Browser voice recognition (Chrome/Edge support varies by platform)
- Text chat fallback
- Text-to-speech responses
- Time and date
- Wikipedia summaries
- Jokes
- Open Google, YouTube, ChatGPT, and Instagram
- Google search shortcuts

## Run locally (Windows PowerShell)

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Open https://vision-ai-3idd.onrender.com/

If PowerShell blocks activation, run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.venv\Scripts\Activate.ps1
```

## Deploy to Render
1. Push this project to a GitHub repository named `vision-ai`.
2. In Render, choose **New +** → **Blueprint** and connect the repository.
3. Render reads `render.yaml`, installs requirements, and starts Gunicorn.
4. Open the generated `https://...onrender.com` URL.
5. Allow microphone permission in the browser.

You can also create a Render Web Service manually:
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`

## Important notes
- Voice recognition is handled by the browser's Web Speech API, not by a continuously running Python microphone listener.
- Browser speech recognition availability and language support vary. Use a recent Chrome or Edge browser and allow microphone access.
- The time/date command currently uses the server's local clock, which may differ from your device's timezone.
- This is a rule-based assistant, not a generative AI chatbot. Wikipedia lookups require an internet connection.
- Render free instances may sleep when inactive, so the first request after inactivity can take longer.
