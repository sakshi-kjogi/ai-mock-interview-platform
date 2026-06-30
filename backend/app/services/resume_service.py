import io
import uuid
from datetime import datetime

from pypdf import PdfReader
from sqlalchemy.orm import Session

from app.core.gemini import analyze_resume, generate_resume_questions
from app.models.interview_session import InterviewSession
from app.models.question import Question
from app.models.resume import Resume
from app.models.resume_feedback import ResumeFeedback

_TECH_SKILLS = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
    "React", "Vue", "Angular", "Next.js", "Node.js", "FastAPI", "Django",
    "Flask", "Express", "Spring", "PostgreSQL", "MySQL", "MongoDB", "Redis",
    "SQLite", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Git", "Linux",
    "REST API", "GraphQL", "HTML", "CSS", "Tailwind", "Bootstrap", "CI/CD",
    "TensorFlow", "PyTorch", "Machine Learning", "Bash", "Terraform",
]
_SOFT_SKILLS = [
    "Leadership", "Communication", "Teamwork", "Problem Solving",
    "Time Management", "Project Management", "Agile", "Scrum",
    "Mentoring", "Collaboration", "Adaptability",
]


def parse_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages).strip()


def extract_skills(text: str) -> dict:
    lower = text.lower()
    technical = [s for s in _TECH_SKILLS if s.lower() in lower]
    soft      = [s for s in _SOFT_SKILLS  if s.lower() in lower]
    return {"technical": technical, "soft": soft}


def upload_and_parse(
    db: Session, user_id: uuid.UUID, filename: str, file_bytes: bytes
) -> Resume:
    parsed_text   = parse_pdf(file_bytes)
    parsed_skills = extract_skills(parsed_text)

    resume = Resume(
        user_id=user_id,
        file_url=f"parsed:{filename}:{datetime.utcnow().timestamp():.0f}",
        parsed_text=parsed_text,
        parsed_skills=parsed_skills,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


def get_user_resumes(db: Session, user_id: uuid.UUID) -> list[Resume]:
    return (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.uploaded_at.desc())
        .all()
    )


def get_resume_by_id(
    db: Session, resume_id: uuid.UUID, user_id: uuid.UUID
) -> Resume | None:
    return (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == user_id)
        .first()
    )


def generate_and_save_resume_feedback(
    db: Session, resume: Resume
) -> list[ResumeFeedback]:
    existing = db.query(ResumeFeedback).filter(ResumeFeedback.resume_id == resume.id).all()
    if existing:
        return existing

    suggestions = analyze_resume(resume.parsed_text or "")
    feedbacks   = []

    for s in suggestions:
        fb = ResumeFeedback(
            resume_id=resume.id,
            category=s["category"],
            action_type=s["action_type"],
            suggestion_text=s["suggestion_text"],
            priority=s["priority"],
        )
        db.add(fb)
        feedbacks.append(fb)

    db.commit()
    for f in feedbacks:
        db.refresh(f)
    return feedbacks


def get_resume_feedback(db: Session, resume_id: uuid.UUID) -> list[ResumeFeedback]:
    return (
        db.query(ResumeFeedback)
        .filter(ResumeFeedback.resume_id == resume_id)
        .order_by(ResumeFeedback.priority)
        .all()
    )


def create_resume_interview_questions(
    db: Session,
    session: InterviewSession,
    resume: Resume,
) -> list[Question]:
    db.query(Question).filter(Question.session_id == session.id).delete()
    db.commit()

    raw = generate_resume_questions(
        resume_text=resume.parsed_text or "",
        role_title=session.role_title,
        interview_type=session.interview_type.value,
    )

    questions = []
    for idx, q in enumerate(raw):
        question = Question(
            session_id=session.id,
            question_text=q["question_text"],
            category=q.get("category"),
            order_index=idx,
        )
        db.add(question)
        questions.append(question)

    db.commit()
    for q in questions:
        db.refresh(q)
    return questions