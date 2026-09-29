<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/4a4858a9-9ad4-44e5-9b0a-83367661d57c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure question generation in `.env` or `.env.local`:
   - `GEMINI_API_KEY` is optional. When set, Gemini is tried first; Ollama is used if Gemini is unavailable.
   - Ollama must be running on the app server. By default, the app uses `http://127.0.0.1:11434` and `llama3:latest` when it needs the fallback.
   - To change the Ollama endpoint or model, set `OLLAMA_BASE_URL` or `OLLAMA_MODEL`.
   - For Ollama-only generation, leave `GEMINI_API_KEY` unset or blank.
3. Run the app:
   `npm run dev`

Practice MCQ sets are English-medium and challenging A/L difficulty. Students can generate a set of 5 or 10 questions, navigate through that set, then choose **New set** to generate another one.

Administrators can create examination papers for any subject from the **Exam Papers** admin tab. AI drafts contain 10 MCQs and 3 easy structured questions, each with 3–5 sub-questions. Review the generated draft before publishing. Students in the selected batch can answer and submit papers; administrators and super-admins can review submissions from the same tab.

Paper generation tries Gemini when `GEMINI_API_KEY` is configured, then falls back to the configured Ollama model if Gemini is unavailable or its response is invalid. With no Gemini key, Ollama is used directly. Ollama must be installed, running, and have the selected model pulled on the app server.

## Exam Paper Storage

Exam papers and student submissions use the MongoDB database already configured by `MONGODB_URI` and `MONGODB_DB_NAME` in `.env`; no additional database is needed. The app creates/updates these collections on first save:

- `examPapers` stores the paper, subject, batch, MCQs, and structured questions.
- `paperSubmissions` stores each student's selected MCQ options and written answers, linked by `paperId`.

To inspect them, open the configured database in MongoDB Atlas **Data Explorer** or MongoDB Compass, then select `examPapers` or `paperSubmissions`. Collections appear after the first paper is published or submitted; they do not need manual setup. Keep database credentials in `.env` and never publish them in source control.
