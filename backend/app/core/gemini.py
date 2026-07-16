import json
import logging
import random
import re

from google import genai

from app.core.config import settings

logger = logging.getLogger(__name__)

_client = genai.Client(api_key=settings.GEMINI_API_KEY)
_MODEL = "gemini-2.0-flash-lite"

_CATEGORY_HINTS = {
    "technical": "algorithms, data structures, system design, language-specific, problem solving",
    "behavioral": "leadership, teamwork, conflict resolution, communication, adaptability",
    "system_design": "scalability, database design, API design, architecture, trade-offs",
}

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


def _clean_json(raw: str) -> str:
    raw = re.sub(r"^```[a-z]*\n?", "", raw.strip())
    raw = re.sub(r"\n?```$", "", raw).strip()
    return raw


def _mock_questions(
    role_title: str, interview_type: str, num_questions: int, exclude_questions: list[str] | None = None
) -> list[dict]:
    exclude_questions = set(exclude_questions or [])
    pool = _MOCK_QUESTION_POOL.get(interview_type, _MOCK_QUESTION_POOL["technical"])

    # Filter out any pool entry whose formatted text matches something the
    # user has already been asked before.
    fresh_pool = [
        q for q in pool
        if q["question_text"].format(role=role_title) not in exclude_questions
    ]

    # If exclusion wiped out too much of the pool (e.g. a long-time user who
    # has cycled through most of it), fall back to the full pool rather than
    # erroring out — a rare repeat is better than a broken interview.
    usable_pool = fresh_pool if len(fresh_pool) >= num_questions else pool

    selected = random.sample(usable_pool, min(num_questions, len(usable_pool)))
    return [
        {"question_text": q["question_text"].format(role=role_title), "category": q["category"]}
        for q in selected
    ]


def generate_interview_questions(
    role_title: str,
    interview_type: str,
    num_questions: int = 5,
    exclude_questions: list[str] | None = None,
) -> list[dict]:
    exclude_questions = exclude_questions or []
    category_hint = _CATEGORY_HINTS.get(interview_type, "general")

    exclusion_clause = ""
    if exclude_questions:
        # Cap how many we list in the prompt so it doesn't balloon for
        # long-time users — the most recent ones are the most likely to
        # still be fresh in the user's memory, so those matter most.
        recent_exclusions = exclude_questions[:30]
        joined = "\n".join(f"- {q}" for q in recent_exclusions)
        exclusion_clause = f"""
Do NOT repeat or closely paraphrase any of these questions the candidate has already been asked:
{joined}
"""

    prompt = f"""You are an expert technical interviewer.
Generate exactly {num_questions} {interview_type} interview questions for the role: {role_title}.
Use one of these categories for each question: {category_hint}.
{exclusion_clause}
Return ONLY a valid JSON object. No markdown, no code fences, no explanation:
{{"questions": [{{"question_text": "...", "category": "..."}}]}}"""

    try:
        response = _client.models.generate_content(model=_MODEL, contents=prompt)
        data = json.loads(_clean_json(response.text))
        questions = data["questions"]
        if not questions:
            raise ValueError("Gemini returned an empty questions list")
        return questions
    except Exception as e:
        logger.warning(f"Gemini generate_interview_questions failed, falling back to mock: {e}")
        return _mock_questions(role_title, interview_type, num_questions, exclude_questions)


def evaluate_answer(question_text: str, answer_text: str) -> dict:
    prompt = f"""You are an expert interviewer evaluating a candidate's response.
Question: {question_text}
Candidate's Answer: {answer_text}
Return ONLY valid JSON, no markdown:
{{"score": 75, "strengths": "...", "improvements": "..."}}
Score: 0-100"""

    try:
        response = _client.models.generate_content(model=_MODEL, contents=prompt)
        data = json.loads(_clean_json(response.text))
        return {
            "score": int(data["score"]),
            "strengths": data["strengths"],
            "improvements": data["improvements"],
            "raw": data,
        }
    except Exception as e:
        logger.warning(f"Gemini evaluate_answer failed, falling back to mock: {e}")
        word_count = len(answer_text.strip().split())
        if word_count < 20:
            score, strengths, improvements = (35, "Attempted to address the question.", "Answer is too brief. Elaborate with specific examples and cover edge cases.")
        elif word_count < 50:
            score, strengths, improvements = (58, "Shows basic understanding. Covers the main point adequately.", "Expand with concrete examples. Discuss trade-offs and real-world applications.")
        elif word_count < 100:
            score, strengths, improvements = (74, "Good understanding demonstrated. Clear explanation with reasonable depth.", "Consider discussing edge cases. A concrete example would strengthen this further.")
        else:
            score, strengths, improvements = (88, "Comprehensive answer showing strong understanding. Well-structured with good depth.", "Minor refinements: ensure conciseness and that key points are clearly highlighted.")
        return {"score": score, "strengths": strengths, "improvements": improvements, "raw": {"word_count": word_count, "mock": True}}


def analyze_resume(resume_text: str) -> list[dict]:
    prompt = f"""You are an expert resume reviewer. Analyse this resume and provide specific improvement suggestions.
Return ONLY valid JSON, no markdown:
{{"suggestions": [{{"category": "skills|experience|formatting|education", "action_type": "add|remove|rephrase", "suggestion_text": "...", "priority": "high|medium|low"}}]}}
Resume: {resume_text[:3000]}"""

    try:
        response = _client.models.generate_content(model=_MODEL, contents=prompt)
        data = json.loads(_clean_json(response.text))
        suggestions = data["suggestions"]
        if not suggestions:
            raise ValueError("Gemini returned an empty suggestions list")
        return suggestions
    except Exception as e:
        logger.warning(f"Gemini analyze_resume failed, falling back to mock: {e}")
        return [
            {"category": "experience", "action_type": "rephrase", "suggestion_text": "Start every bullet point with a strong action verb (Led, Built, Optimised, Delivered) instead of passive phrases like 'Responsible for' or 'Helped with'.", "priority": "high"},
            {"category": "skills", "action_type": "add", "suggestion_text": "Add quantifiable metrics to achievements — e.g. 'Reduced API response time by 40%' instead of 'Improved API performance'.", "priority": "high"},
            {"category": "formatting", "action_type": "remove", "suggestion_text": "Remove a generic Objective or Summary section. Replace with a focused 2-line professional summary tailored to your target role.", "priority": "medium"},
            {"category": "skills", "action_type": "add", "suggestion_text": "Add a dedicated Technical Skills section grouped by category: Languages, Frameworks, Databases, Tools. Recruiters scan for this pattern.", "priority": "medium"},
            {"category": "experience", "action_type": "remove", "suggestion_text": "Remove work experience older than 10 years unless directly relevant. Older roles dilute focus and add unnecessary length.", "priority": "low"},
            {"category": "education", "action_type": "rephrase", "suggestion_text": "If you have 3+ years of experience, move Education below Experience. Recruiters prioritise what you have built over where you studied.", "priority": "low"},
        ]


def generate_resume_questions(
    resume_text: str,
    role_title: str,
    interview_type: str,
    num_questions: int = 5,
    exclude_questions: list[str] | None = None,
) -> list[dict]:
    exclude_questions = exclude_questions or []
    exclusion_clause = ""
    if exclude_questions:
        recent_exclusions = exclude_questions[:30]
        joined = "\n".join(f"- {q}" for q in recent_exclusions)
        exclusion_clause = f"""
Do NOT repeat or closely paraphrase any of these questions the candidate has already been asked:
{joined}
"""

    prompt = f"""You are an expert interviewer. Generate {num_questions} {interview_type} interview questions
for a {role_title} candidate based on their resume. Questions should reference their specific experience.
Resume (first 2000 chars): {resume_text[:2000]}
{exclusion_clause}
Return ONLY valid JSON: {{"questions": [{{"question_text": "...", "category": "..."}}]}}"""

    try:
        response = _client.models.generate_content(model=_MODEL, contents=prompt)
        data = json.loads(_clean_json(response.text))
        questions = data["questions"]
        if not questions:
            raise ValueError("Gemini returned an empty questions list")
        return questions
    except Exception as e:
        logger.warning(f"Gemini generate_resume_questions failed, falling back to mock: {e}")
        pool = [
            {"question_text": f"Walk me through your most relevant experience for the {role_title} role.", "category": "experience"},
            {"question_text": "Tell me about the project on your resume you're most proud of. What was your specific contribution?", "category": "experience"},
            {"question_text": f"How has your background prepared you for the challenges of a {role_title} position?", "category": "experience"},
            {"question_text": "Pick one skill from your resume and give a concrete example of how you used it to solve a real problem.", "category": "problem solving"},
            {"question_text": "Is there a gap or area of growth in your resume you'd like to address? How are you working on it?", "category": "adaptability"},
            {"question_text": "Describe the most technically complex project on your resume. What were the key decisions you made?", "category": "system design"},
            {"question_text": "How have your skills evolved since your earliest role? What drove that growth?", "category": "adaptability"},
            {"question_text": f"Which experience on your resume best qualifies you for the {role_title} role and why?", "category": "communication"},
            {"question_text": "Tell me about a time from your work history when you had to learn a new technology quickly.", "category": "adaptability"},
            {"question_text": "Which role on your resume taught you the most? What did you take away from it?", "category": "leadership"},
            {"question_text": "Describe a situation from your resume where you had to collaborate across teams. What was your approach?", "category": "teamwork"},
            {"question_text": f"What achievement on your resume are you most proud of and how does it relate to being a {role_title}?", "category": "communication"},
        ]
        exclude_set = set(exclude_questions)
        fresh_pool = [q for q in pool if q["question_text"] not in exclude_set]
        usable_pool = fresh_pool if len(fresh_pool) >= num_questions else pool
        return random.sample(usable_pool, min(num_questions, len(usable_pool)))
