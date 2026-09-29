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

Practice MCQ sets are English-medium and medium difficulty. Students can generate a set of 5 or 10 questions, navigate through that set, then choose **New set** to generate another one. Ollama fallback generation can take longer for 10-question sets.
