import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.interview_session import InterviewType
from app.models.user import User
from app.schemas.interview_session import InterviewSessionCreate
from app.schemas.resume import ResumeInterviewRequest, ResumeFeedbackResponse, ResumeResponse
from app.services import resume_service, notification_service
from app.services.interview_service import create_session

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5 MB")

    try:
        resume = resume_service.upload_and_parse(db, current_user.id, file.filename, contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {e}")

    await notification_service.create_notification(
        db,
        current_user.id,
        type="resume_parsed",
        title="Resume parsed successfully",
        description="Your resume has been parsed and is ready for tailored interviews.",
    )

    return resume


@router.get("/", response_model=list[ResumeResponse])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return resume_service.get_user_resumes(db, current_user.id)


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = resume_service.get_resume_by_id(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.post("/{resume_id}/analyze", response_model=list[ResumeFeedbackResponse], status_code=status.HTTP_201_CREATED)
def analyze_resume(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = resume_service.get_resume_by_id(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume_service.generate_and_save_resume_feedback(db, resume)


@router.get("/{resume_id}/feedback", response_model=list[ResumeFeedbackResponse])
def get_resume_feedback(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = resume_service.get_resume_by_id(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume_service.get_resume_feedback(db, resume_id)


@router.post("/{resume_id}/start-interview", status_code=status.HTTP_201_CREATED)
def start_resume_interview(
    resume_id: uuid.UUID,
    data: ResumeInterviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = resume_service.get_resume_by_id(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    session = create_session(
        db, current_user.id,
        InterviewSessionCreate(
            role_title=data.role_title,
            interview_type=InterviewType(data.interview_type),
        ),
    )

    questions = resume_service.create_resume_interview_questions(db, session, resume)

    return {
        "session_id": str(session.id),
        "questions": [
            {
                "id": str(q.id),
                "question_text": q.question_text,
                "category": q.category,
                "order_index": q.order_index,
            }
            for q in questions
        ],
    }