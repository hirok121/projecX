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
    
    async def process_text_message(self, message: str, chat_history: List[Dict] = None) -> dict:
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
            
            app_logger.info(f"Generated text response in {processing_time:.2f}s for message: {message[:50]}...")
            
            return {
                "content": response,
                "model_used": settings.groq_model,
                "processing_time": processing_time,
                "tokens_used": None,  # Groq doesn't provide token count in response
                "processing_status": "completed"
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
                "error": str(e)
            }
    
    async def process_file_message(self, file_content: bytes, content_type: str, filename: str, user_message: str = "") -> dict:
        """Process file with AI analysis."""
        start_time = time.time()
        
        try:
            # First, process the file to extract content
            file_result = await FileProcessor.process_file(file_content, content_type, filename)
            
            if file_result["processing_status"] == "error":
                return {
                    "content": f"Sorry, I couldn't process the file: {file_result['content']}",
                    "model_used": settings.groq_model,
                    "processing_time": time.time() - start_time,
                    "processing_status": "error",
                    "file_metadata": file_result["metadata"]
                }
            
            # Use the already analyzed content from FileProcessor
            content = file_result['content']
            
            # Add user message context if provided
            if user_message:
                content = f"{content}\n\nUser's additional context: {user_message}"
            
            processing_time = time.time() - start_time
            
            app_logger.info(f"Processed file analysis for {filename} in {processing_time:.2f}s")
            
            return {
                "content": content,
                "model_used": settings.groq_model,
                "processing_time": processing_time,
                "tokens_used": None,
                "processing_status": "completed",
                "file_metadata": file_result["metadata"]
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
                "error": str(e)
            }
    
    async def generate_chat_title(self, first_message: str) -> str:
        """Generate a title for a chat based on the first message."""
        try:
            title_prompt = ChatPromptTemplate.from_messages([
                ("system", """Generate a brief, descriptive title (3-6 words) for a chat conversation based on the first user message. 
                The title should be concise and capture the main topic or intent of the message.
                Do not use quotes or special formatting in the title."""),
                ("user", f"First message: {first_message}")
            ])
            
            chain = title_prompt | self.llm | self.text_parser
            title = await chain.ainvoke({})
            
            # Clean and limit the title
            title = title.strip().replace('"', '').replace("'", "")
            if len(title) > 50:
                title = title[:47] + "..."
            
            return title if title else "New Chat"
            
        except Exception as e:
            app_logger.error(f"Error generating chat title: {str(e)}")
            return "New Chat"
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for general conversation."""
        return """You are a helpful AI assistant integrated into ProjectX application. 
        You can help users with various tasks, answer questions, provide information, and analyze content.
        
        Key guidelines:
        - Be conversational, helpful, and concise in your responses
        - Provide accurate and relevant information
        - If you're unsure about something, admit it rather than making up information
        - When analyzing content, be thorough and specific
        - Maintain a professional yet friendly tone
        - If asked about sensitive topics, respond responsibly and appropriately
        
        You have access to the current conversation history, so feel free to reference previous messages when relevant."""

# Singleton instance
ai_service = AIService()