from langchain_groq import ChatGroq
from app.core.config import settings

# Initialize Groq LLMs for text and vision
text_llm = ChatGroq(
    api_key=settings.groq_api_key,
    model_name=settings.groq_model,
    temperature=settings.groq_temperature,
    max_tokens=settings.max_tokens
)

vision_llm = ChatGroq(
    api_key=settings.groq_api_key,
    model_name=settings.llama_vision_model,
    temperature=settings.groq_temperature,
    max_tokens=settings.max_tokens
)
