from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from app.core.config import settings
from app.core.logging import app_logger
from app.services.file_processor import FileProcessor
from app.utils.ai_models import text_llm, vision_llm
import json
from typing import List, Dict, Optional
import time
import asyncio


class AIService:
    """Service class for AI operations using Groq API."""

    def __init__(self):
        """Initialize with shared AI models from ai_models module."""
        if not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY is required but not set in environment")

        # Use shared LLM instances from ai_models
        self.llm = text_llm

        # Output parsers
        self.json_parser = JsonOutputParser()
        self.text_parser = StrOutputParser()

        app_logger.info(f"AIService initialized with shared models")

    async def process_text_message(
        self, message: str, chat_history: List[Dict] = None
    ) -> dict:
        """Process text message with conversation context."""
        start_time = time.time()

        try:
            # Build conversation context
            messages = [("system", self._get_system_prompt())]

            # Add chat history if provided (last 10 messages for context)
            if chat_history:
                for msg in chat_history[-10:]:
                    role = "user" if msg["role"] == "user" else "assistant"
                    messages.append((role, msg["content"]))

            # Add current message
            messages.append(("user", message))

            # Create prompt and chain
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | self.llm | self.text_parser

            # Get response
            response = await chain.ainvoke({"input": message})

            processing_time = time.time() - start_time

            app_logger.info(
                f"Generated text response in {processing_time:.2f}s for message: {message[:50]}..."
            )

            return {
                "content": response,
                "model_used": settings.groq_model,
                "processing_time": processing_time,
                "tokens_used": None,  # Groq doesn't provide token count in response
                "processing_status": "completed",
            }

        except Exception as e:
            processing_time = time.time() - start_time
            app_logger.error(f"Error processing text message: {str(e)}")

            return {
                "content": "I apologize, but I encountered an error processing your message. Please try again.",
                "model_used": settings.groq_model,
                "processing_time": processing_time,
                "tokens_used": None,
                "processing_status": "error",
                "error": str(e),
            }

    async def process_file_message(
        self,
        file_content: bytes,
        content_type: str,
        filename: str,
        user_message: str = "",
    ) -> dict:
        """Process file with AI analysis."""
        start_time = time.time()

        try:
            # First, process the file to extract content
            file_result = await FileProcessor.process_file(
                file_content, content_type, filename
            )

            if file_result["processing_status"] == "error":
                return {
                    "content": f"Sorry, I couldn't process the file: {file_result['content']}",
                    "model_used": settings.groq_model,
                    "processing_time": time.time() - start_time,
                    "processing_status": "error",
                    "file_metadata": file_result["metadata"],
                }

            # Use the already analyzed content from FileProcessor
            content = file_result["content"]

            # Add user message context if provided
            if user_message:
                content = f"{content}\n\nUser's additional context: {user_message}"

            processing_time = time.time() - start_time

            app_logger.info(
                f"Processed file analysis for {filename} in {processing_time:.2f}s"
            )

            return {
                "content": content,
                "model_used": settings.groq_model,
                "processing_time": processing_time,
                "tokens_used": None,
                "processing_status": "completed",
                "file_metadata": file_result["metadata"],
            }

        except Exception as e:
            processing_time = time.time() - start_time
            app_logger.error(f"Error processing file {filename}: {str(e)}")

            return {
                "content": f"I apologize, but I encountered an error analyzing your {FileProcessor.get_file_type_description(content_type).lower()}. Please try again.",
                "model_used": settings.groq_model,
                "processing_time": processing_time,
                "tokens_used": None,
                "processing_status": "error",
                "error": str(e),
            }

    async def generate_chat_title(self, first_message: str) -> str:
        """Generate a title for a chat based on the first message."""
        try:
            title_prompt = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        """Generate a brief, descriptive title (3-6 words) for a chat conversation based on the first user message. 
                The title should be concise and capture the main topic or intent of the message.
                Do not use quotes or special formatting in the title.""",
                    ),
                    ("user", f"First message: {first_message}"),
                ]
            )

            chain = title_prompt | self.llm | self.text_parser
            title = await chain.ainvoke({})

            # Clean and limit the title
            title = title.strip().replace('"', "").replace("'", "")
            if len(title) > 50:
                title = title[:47] + "..."

            return title if title else "New Chat"

        except Exception as e:
            app_logger.error(f"Error generating chat title: {str(e)}")
            return "New Chat"

    def _get_system_prompt(self) -> str:
        """Get the system prompt for medical assistant conversation."""
        return """You are MedAI Assistant, a knowledgeable and compassionate medical AI companion integrated into an advanced AI-powered medical diagnosis platform. Your role is to provide accurate, evidence-based health information while maintaining a warm, professional demeanor.

CORE IDENTITY & PERSONALITY:
- Professional yet empathetic healthcare companion
- Clear communicator who avoids medical jargon (or explains it when necessary)
- Patient educator who empowers users with knowledge
- Supportive listener who validates health concerns
- Evidence-based advisor who references medical guidelines when relevant

PLATFORM CONTEXT:
You are part of a comprehensive medical diagnosis platform that:
- Provides access to 50+ research-grade ML models from peer-reviewed sources
- Covers 15+ disease categories including HCV, Diabetes, Pneumonia, Heart Disease, Cancer, and more
- Accepts multiple input types: X-rays, CT scans, MRI images, lab results, and clinical parameters
- Delivers transparent predictions with confidence scores and explainable AI reasoning

SPECIALIZED KNOWLEDGE AREAS:
- Multiple disease categories: Hepatitis C, Diabetes, Heart Disease, Pneumonia, Cancer, etc.
- Medical imaging interpretation: X-rays, CT scans, MRI analysis
- Lab test interpretation: blood work, liver function, metabolic panels, etc.
- Clinical parameters and vital signs
- Treatment options and medication information across various conditions
- Disease monitoring and progression tracking
- Preventive care and lifestyle recommendations

COMMUNICATION GUIDELINES:
1. **Empathy First**: Acknowledge emotions and concerns before providing information
2. **Clear Language**: Use simple terms; explain medical terminology when used
3. **Structured Responses**: Organize information with headers, bullet points, and numbering
4. **Actionable Advice**: Provide practical, implementable suggestions
5. **Safety Boundaries**: Always recommend professional medical consultation for:
   - Diagnosis and treatment decisions
   - Medication changes or side effects
   - Urgent symptoms or emergencies
   - Personalized medical advice

RESPONSE FORMAT:
- Start with acknowledgment of the user's concern/question
- Provide clear, organized information
- Include relevant context or background when helpful
- When discussing diseases, mention which diagnosis tools are available on the platform
- End with supportive encouragement or next steps
- Use emoji sparingly for warmth (🩺💊📊✅🔬💔)

IMPORTANT LIMITATIONS:
⚠️ You CANNOT and MUST NOT:
- Diagnose medical conditions
- Prescribe medications or dosages
- Replace consultations with healthcare providers
- Provide emergency medical advice
- Make treatment decisions for patients

Always remind users to consult their healthcare provider for personalized medical advice.

TONE EXAMPLES:
✅ "I understand lab results can feel overwhelming. Let me break down what these values typically indicate..."
✅ "That's a great question about treatment options. Here's what current medical guidelines suggest..."
✅ "Our platform has specialized models for analyzing chest X-rays for pneumonia detection. Would you like to try that?"
❌ "You definitely have..." (avoid definitive diagnoses)
❌ "You should take..." (avoid prescribing)

Remember: You're here to educate, support, and guide users through our multi-disease diagnosis platform—not to replace medical professionals."""


# Singleton instance
ai_service = AIService()
