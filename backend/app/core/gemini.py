import json
import random
import re

from google import genai

from app.core.config import settings

_client = genai.Client(api_key=settings.GEMINI_API_KEY)

_CATEGORY_HINTS = {
    "technical": "algorithms, data structures, system design, language-specific, problem solving",
    "behavioral": "leadership, teamwork, conflict resolution, communication, adaptability",
    "system_design": "scalability, database design, API design, architecture, trade-offs",
}

# Larger pool — {role} is replaced with the actual role_title at runtime.
# random.sample picks a fresh subset every call, so Regenerate gives new questions.
_MOCK_QUESTION_POOL = {
    "technical": [
        {"question_text": "As a {role}, explain the difference between a stack and a queue and give a real-world use case for each.", "category": "data structures"},
        {"question_text": "What is the time complexity of binary search and when would you use it in a {role} context?", "category": "algorithms"},
        {"question_text": "How would you design a RESTful API for a {role} project? Walk me through your decisions.", "category": "system design"},
        {"question_text": "Explain recursion with a concrete example relevant to {role} work.", "category": "problem solving"},
        {"question_text": "What is the difference between SQL and NoSQL databases? When would you choose each as a {role}?", "category": "system design"},
        {"question_text": "How do you handle errors and exceptions in your code? Describe your approach as a {role}.", "category": "language-specific"},
        {"question_text": "Explain the concept of caching and how you would implement it in a {role} project.", "category": "system design"},
        {"question_text": "What is the difference between concurrency and parallelism? When does it matter for a {role}?", "category": "problem solving"},
        {"question_text": "Describe a time when you optimised a slow function or query. What was your approach?", "category": "problem solving"},
        {"question_text": "What are SOLID principles and which ones do you apply most often as a {role}?", "category": "language-specific"},
        {"question_text": "How would you implement rate limiting for a public API as a {role}?", "category": "system design"},
        {"question_text": "Explain the difference between a process and a thread. When does this matter in {role} work?", "category": "algorithms"},
    ],
    "behavioral": [
        {"question_text": "Tell me about a time you had to meet a tight deadline as a {role}. How did you manage it?", "category": "adaptability"},
        {"question_text": "Describe a situation where you had a conflict with a teammate. How did you resolve it?", "category": "conflict resolution"},
        {"question_text": "Give an example of when you took ownership of a {role} project beyond your assigned responsibilities.", "category": "leadership"},
        {"question_text": "Tell me about a time you had to learn something new quickly to complete a {role} task.", "category": "adaptability"},
        {"question_text": "Describe the {role} project you're most proud of and what your specific contribution was.", "category": "communication"},
        {"question_text": "Tell me about a time you disagreed with your manager's decision. How did you handle it?", "category": "conflict resolution"},
        {"question_text": "Describe a situation where you had to give difficult feedback to a colleague.", "category": "communication"},
        {"question_text": "How do you prioritise tasks when everything feels urgent? Give a specific example from your {role} experience.", "category": "adaptability"},
        {"question_text": "Tell me about a failure in your {role} career. What did you learn from it?", "category": "leadership"},
        {"question_text": "Give an example of when you went above and beyond for a user or stakeholder.", "category": "leadership"},
        {"question_text": "Describe a time you had to work with limited information. How did you move forward?", "category": "adaptability"},
        {"question_text": "How have you mentored or helped a junior colleague in your {role} work?", "category": "teamwork"},
    ],
    "system_design": [
        {"question_text": "How would you design a scalable backend system for a {role} application serving 1 million users?", "category": "scalability"},
        {"question_text": "Design a rate-limiting system for a public API. Walk me through your choices.", "category": "architecture"},
        {"question_text": "How would you design a database schema for a multi-tenant SaaS product relevant to {role}?", "category": "database design"},
        {"question_text": "What are the trade-offs between microservices and a monolithic architecture for a {role} team?", "category": "trade-offs"},
        {"question_text": "How would you design an API gateway for a distributed system as a {role}?", "category": "API design"},
        {"question_text": "Design a notification system (email, push, SMS) for a large-scale product. What are the key components?", "category": "architecture"},
        {"question_text": "How would you design a search feature that handles typos and fuzzy matching at scale?", "category": "scalability"},
        {"question_text": "Explain the CAP theorem and how it would influence your architecture decisions as a {role}.", "category": "trade-offs"},
        {"question_text": "How would you approach database sharding for a high-traffic {role} application?", "category": "database design"},
        {"question_text": "Design a URL shortener like bit.ly. Focus on scalability and reliability.", "category": "scalability"},
        {"question_text": "How would you handle schema migrations in a live production database without downtime?", "category": "database design"},
        {"question_text": "Design an event-driven architecture for a {role} system. What message broker would you choose and why?", "category": "architecture"},
    ],
}


def generate_interview_questions(
    role_title: str,
    interview_type: str,
    num_questions: int = 5,
) -> list[dict]:
    # ── MOCK MODE ──────────────────────────────────────────────────────────────
    # Uses a pool of 12 questions per type. random.sample picks a fresh subset
    # every call so Regenerate returns different questions.
    # {role} in question_text is replaced with the actual role_title.
    pool = _MOCK_QUESTION_POOL.get(interview_type, _MOCK_QUESTION_POOL["technical"])
    selected = random.sample(pool, min(num_questions, len(pool)))
    return [
        {
            "question_text": q["question_text"].format(role=role_title),
            "category": q["category"],
        }
        for q in selected
    ]
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