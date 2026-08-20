"""
Simple admin/test script for VCET RAG Chatbot
This is useful for quick testing without using the web interface
"""

import os
from dotenv import load_dotenv
from src.search import RAGSearch
from utils.logger import setup_logger

load_dotenv()
logger = setup_logger(__name__)

def main():
    print("=" * 60)
    print("VCET AI Assistant - Quick Test")
    print("=" * 60)
    print()
    
    # Initialize RAG
    print("Initializing RAG system...")
    embedding_model = os.getenv("EMBEDDING_MODEL", "BAAI/bge-base-en-v1.5")
    llm_model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    
    try:
        rag_search = RAGSearch(
            embedding_model=embedding_model,
            llm_model=llm_model
        )
        print("✓ RAG system initialized successfully\n")
    except Exception as e:
        print(f"✗ Failed to initialize RAG system: {e}")
        return
    
    # Interactive loop
    print("Type your questions (or 'quit' to exit)")
    print("=" * 60)
    print()
    
    while True:
        query = input("\nYour Question: ").strip()
        
        if query.lower() in ['quit', 'exit', 'q']:
            print("\nGoodbye!")
            break
        
        if not query:
            continue
        
        print("\n🤖 Thinking...")
        
        try:
            response = rag_search.search_and_summarize(query, top_k=3)
            print("\n" + "=" * 60)
            print("Response:")
            print("=" * 60)
            print(response)
            print("=" * 60)
        except Exception as e:
            print(f"\n✗ Error: {e}")

if __name__ == "__main__":
    main()