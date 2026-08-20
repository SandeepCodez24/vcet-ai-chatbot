import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'vcet-rag-chatbot-secret-key-2024')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # Groq API
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    
    # Models
    EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'BAAI/bge-base-en-v1.5')
    LLM_MODEL = os.getenv('LLM_MODEL', 'llama-3.3-70b-versatile')
    
    # Paths
    DATA_DIR = 'data'
    FAISS_STORE_DIR = 'faiss_store'
    
    # RAG Settings
    TOP_K_RESULTS = int(os.getenv('TOP_K_RESULTS', '5'))
    CHUNK_SIZE = int(os.getenv('CHUNK_SIZE', '1000'))
    CHUNK_OVERLAP = int(os.getenv('CHUNK_OVERLAP', '200'))
    
    # Rate Limiting
    RATE_LIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'True').lower() == 'true'
    MAX_REQUESTS_PER_MINUTE = int(os.getenv('MAX_REQUESTS_PER_MINUTE', '30'))
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'vcet_chatbot.log')
