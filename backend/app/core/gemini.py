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


def generate_interview_questions(
    role_title: str,
    interview_type: str,
    num_questions: int = 5,
) -> list[dict]:
    # Temporary mock — swap back to real Gemini call once API quota is resolved
    mock_questions = {
        "technical": [
            {"question_text": f"Explain the difference between a stack and a queue. How would you use each in a {role_title} role?", "category": "data structures"},
            {"question_text": "What is the time complexity of binary search and when would you use it?", "category": "algorithms"},
            {"question_text": f"How would you design a RESTful API for a {role_title} project?", "category": "system design"},
            {"question_text": "Explain the concept of recursion with an example.", "category": "problem solving"},
            {"question_text": "What is the difference between SQL and NoSQL databases?", "category": "system design"},
        ],
        "behavioral": [
            {"question_text": "Tell me about a time you had to meet a tight deadline. How did you manage it?", "category": "adaptability"},
            {"question_text": "Describe a situation where you had a conflict with a teammate. How did you resolve it?", "category": "conflict resolution"},
            {"question_text": f"What does success look like for you as a {role_title}?", "category": "leadership"},
            {"question_text": "Give an example of when you had to learn something new quickly.", "category": "adaptability"},
            {"question_text": "Tell me about a project you're most proud of.", "category": "communication"},
        ],
        "system_design": [
            {"question_text": f"How would you design a scalable backend system for a {role_title} application?", "category": "scalability"},
            {"question_text": "Design a rate-limiting system for a public API.", "category": "architecture"},
            {"question_text": "How would you design a database schema for a multi-tenant SaaS product?", "category": "database design"},
            {"question_text": "What are the trade-offs between microservices and a monolithic architecture?", "category": "trade-offs"},
            {"question_text": "How would you design an API gateway for a distributed system?", "category": "API design"},
        ],
    }

    questions = mock_questions.get(interview_type, mock_questions["technical"])
    return questions[:num_questions]

    response = _client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents=prompt,
    )

    raw = response.text.strip()
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)
    raw = raw.strip()

    try:
        data = json.loads(raw)
        return data["questions"]
    except (json.JSONDecodeError, KeyError) as e:
        raise ValueError(f"Gemini returned unparseable output: {e}\nRaw: {raw}")