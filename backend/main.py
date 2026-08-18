from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import UploadFile, File
from pypdf import PdfReader
import io

app = FastAPI(
    title="Student Question API",
    description="A simple FastAPI backend for a React application",
    version="1.0.0",
)


# React runs on port 5173.
# FastAPI runs on port 8000.
# Since these are different origins, CORS permission is required.



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://new-askmynotes-g6n9.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str


class QuestionResponse(BaseModel):
    question: str
    answer: str


@app.get("/")
def home():
    return {
        "message": "FastAPI backend is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/ask", response_model=QuestionResponse)
def ask_question(request: QuestionRequest):
    cleaned_question = request.question.strip()

    if not cleaned_question:
        return QuestionResponse(
            question="",
            answer="Please enter a question.",
        )

    return QuestionResponse(
        question=cleaned_question,
        answer=f'Your question "{cleaned_question}" was received successfully.',
    )

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    reader = PdfReader(io.BytesIO(contents))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return {"text_length": len(text), "preview": text[:300]}