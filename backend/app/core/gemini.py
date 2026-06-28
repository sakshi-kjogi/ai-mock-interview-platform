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


def evaluate_answer(question_text: str, answer_text: str) -> dict:
    # ── MOCK MODE ──────────────────────────────────────────────────────────────
    # Replace this block with the real Gemini call once API quota is available.
    word_count = len(answer_text.strip().split())

    if word_count < 20:
        score, strengths, improvements = (
            35,
            "Attempted to address the question.",
            "Answer is too brief. Elaborate with specific examples and cover edge cases.",
        )
    elif word_count < 50:
        score, strengths, improvements = (
            58,
            "Shows basic understanding. Covers the main point adequately.",
            "Expand with concrete examples. Discuss trade-offs and real-world applications.",
        )
    elif word_count < 100:
        score, strengths, improvements = (
            74,
            "Good understanding demonstrated. Clear explanation with reasonable depth.",
            "Consider discussing edge cases. A concrete example would strengthen this further.",
        )
    else:
        score, strengths, improvements = (
            88,
            "Comprehensive answer showing strong understanding. Well-structured with good depth.",
            "Minor refinements: ensure conciseness and that key points are clearly highlighted.",
        )

    return {
        "score": score,
        "strengths": strengths,
        "improvements": improvements,
        "raw": {"word_count": word_count, "mock": True},
    }
    # ──────────────────────────────────────────────────────────────────────────

    # ── REAL GEMINI CALL (uncomment when quota is available) ──────────────────
    # prompt = f"""You are an expert interviewer evaluating a candidate's response.
    #
    # Question: {question_text}
    # Candidate's Answer: {answer_text}
    #
    # Evaluate the answer and return ONLY a valid JSON object, no markdown:
    # {{
    #   "score": 75,
    #   "strengths": "what the candidate did well",
    #   "improvements": "specific areas to improve"
    # }}
    #
    # Score: 0-100 (0 = no answer, 50 = adequate, 100 = perfect)"""
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
    #     return {
    #         "score": int(data["score"]),
    #         "strengths": data["strengths"],
    #         "improvements": data["improvements"],
    #         "raw": data,
    #     }
    # except (json.JSONDecodeError, KeyError) as e:
    #     raise ValueError(f"Gemini returned unparseable output: {e}\nRaw: {raw}")
    # ──────────────────────────────────────────────────────────────────────────