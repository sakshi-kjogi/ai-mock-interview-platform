import json
import re

from google import genai

from app.core.config import settings

_client = genai.Client(api_key=settings.GEMINI_API_KEY)

_CATEGORY_HINTS = {
    "technical": "algorithms, data structures, system design, language-specific, problem solving",
    "behavioral": "leadership, teamwork, conflict resolution, communication, adaptability",
    "system_design": "scalability, database design, API design, architecture, trade-offs",
}

_MOCK_QUESTIONS = {
    "technical": [
        {"question_text": "Explain the difference between a stack and a queue. How would you use each in your role?", "category": "data structures"},
        {"question_text": "What is the time complexity of binary search and when would you use it?", "category": "algorithms"},
        {"question_text": "How would you design a RESTful API for a large-scale application?", "category": "system design"},
        {"question_text": "Explain recursion with a real-world example and its trade-offs.", "category": "problem solving"},
        {"question_text": "What is the difference between SQL and NoSQL databases? When would you choose one over the other?", "category": "system design"},
    ],
    "behavioral": [
        {"question_text": "Tell me about a time you had to meet a tight deadline. How did you manage it?", "category": "adaptability"},
        {"question_text": "Describe a situation where you had a conflict with a teammate. How did you resolve it?", "category": "conflict resolution"},
        {"question_text": "Give an example of when you took ownership of a project beyond your assigned responsibilities.", "category": "leadership"},
        {"question_text": "Tell me about a time you had to learn something new quickly to complete a task.", "category": "adaptability"},
        {"question_text": "Describe a project you're most proud of and what your specific contribution was.", "category": "communication"},
    ],
    "system_design": [
        {"question_text": "How would you design a scalable URL shortening service like bit.ly?", "category": "scalability"},
        {"question_text": "Design a rate-limiting system for a public API. Walk me through your approach.", "category": "architecture"},
        {"question_text": "How would you design a database schema for a multi-tenant SaaS product?", "category": "database design"},
        {"question_text": "What are the trade-offs between microservices and a monolithic architecture?", "category": "trade-offs"},
        {"question_text": "How would you design an API gateway for a distributed system?", "category": "API design"},
    ],
}


def generate_interview_questions(
    role_title: str,
    interview_type: str,
    num_questions: int = 5,
) -> list[dict]:
    # ── MOCK MODE ──────────────────────────────────────────────────────────────
    # Gemini free-tier quota is currently unavailable (limit: 0).
    # To re-enable real AI generation, delete the 3 lines below and uncomment
    # the block that starts with "prompt = f\"\"\"..."
    questions = _MOCK_QUESTIONS.get(interview_type, _MOCK_QUESTIONS["technical"])
    return questions[:num_questions]
    # ──────────────────────────────────────────────────────────────────────────

    # ── REAL GEMINI CALL (uncomment when quota is available) ──────────────────
    # category_hint = _CATEGORY_HINTS.get(interview_type, "general")
    # prompt = f"""You are an expert technical interviewer.
    # Generate exactly {num_questions} {interview_type} interview questions for the role: {role_title}.
    #
    # Use one of these categories for each question: {category_hint}.
    #
    # Return ONLY a valid JSON object. No markdown, no code fences, no explanation:
    # {{
    #   "questions": [
    #     {{
    #       "question_text": "full question text here",
    #       "category": "category name here"
    #     }}
    #   ]
    # }}"""
    #
    # response = _client.models.generate_content(
    #     model="gemini-2.0-flash-lite",
    #     contents=prompt,
    # )
    # raw = response.text.strip()
    # raw = re.sub(r"^```[a-z]*\n?", "", raw)
    # raw = re.sub(r"\n?```$", "", raw)
    # raw = raw.strip()
    # try:
    #     data = json.loads(raw)
    #     return data["questions"]
    # except (json.JSONDecodeError, KeyError) as e:
    #     raise ValueError(f"Gemini returned unparseable output: {e}\nRaw: {raw}")
    # ──────────────────────────────────────────────────────────────────────────