# VCET AI Chatbot - Retrieval-Augmented Generation System

<div align="center">

![VCET Logo](https://img.shields.io/badge/VCET-AI%20Assistant-1e3a8a?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-black?style=for-the-badge&logo=flask)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**An intelligent chatbot system for Velammal College of Engineering and Technology**

</div>

---

## 🌟 Features

### Core Functionality
- ✨ **RAG Technology** - Retrieval-Augmented Generation for accurate responses
- 🚀 **Fast Response Times** - Optimized with intelligent caching
- 🎯 **Context-Aware** - Understands and retrieves relevant information
- 📚 **Multi-Format Support** - PDF, TXT, CSV, Excel, Word, JSON

### User Experience
- 💬 **Modern Chat Interface** - Clean, intuitive design
- 🌓 **Dark/Light Mode** - Comfortable viewing in any environment
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Real-Time Updates** - Live typing indicators and instant responses
- 💾 **Chat History** - Persistent conversation storage
- 🎨 **VCET Branding** - Custom color scheme and styling

### Technical Features
- 🔒 **Rate Limiting** - Prevents API abuse
- 📊 **Statistics Dashboard** - Monitor system performance
- 🗄️ **Query Caching** - Improved performance for common queries
- 📝 **Comprehensive Logging** - Debug and monitor easily
- 🔄 **Auto-Scroll** - Smooth chat experience
- 📋 **Copy Responses** - Easy content sharing

---

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │ ────▶│ Flask Server │ ────▶│  RAG Engine │
│  (HTML/JS)  │ ◀──── │   (API)      │ ◀──── │   (Vector   │
└─────────────┘      └──────────────┘      │  Store + LLM)│
                                            └─────────────┘
                                                   │
                                                   ▼
                                            ┌─────────────┐
                                            │ FAISS Index │
                                            │  Documents  │
                                            └─────────────┘
```

---

## 📋 Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment (recommended)
- Groq API key ([Get one here](https://console.groq.com))

---

## 🚀 Quick Start

### 1. Clone or Download

```bash
cd VCET_V6
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Mac/Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Create a `.env` file in the root directory:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional (defaults provided)
EMBEDDING_MODEL=BAAI/bge-base-en-v1.5
LLM_MODEL=llama-3.3-70b-versatile
DEBUG=False
PORT=5000
TOP_K_RESULTS=5
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
MAX_REQUESTS_PER_MINUTE=30
```

### 5. Prepare Your Data

Place your documents in the `data/` folder:

```
data/
├── document1.pdf
├── document2.txt
├── data.csv
└── info.docx
```

Supported formats: PDF, TXT, CSV, XLSX, DOCX, JSON

### 6. Build Vector Store (First Time Only)

If you don't have an existing FAISS index:

```bash
python
>>> from src.data_loader import load_all_documents
>>> from src.vectorstore import FaissVectorStore
>>> docs = load_all_documents("data")
>>> store = FaissVectorStore("faiss_store", "BAAI/bge-base-en-v1.5")
>>> store.build_from_documents(docs)
>>> exit()
```

Or use the API endpoint after starting the server:
```bash
curl -X POST http://localhost:5000/api/rebuild-index
```

### 7. Start the Server

```bash
python server.py
```

The application will be available at: **http://localhost:5000**

---

## 📁 Project Structure

```
VCET_V6/
├── server.py              # Flask application
├── config.py              # Configuration settings
├── app.py                 # CLI test script
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (create this)
├── .env.example          # Environment template
│
├── src/                   # Source code
│   ├── __init__.py
│   ├── data_loader.py    # Document loading
│   ├── embedding.py      # Embedding generation
│   ├── vectorstore.py    # FAISS vector store
│   └── search.py         # RAG search logic
│
├── utils/                 # Utility modules
│   ├── __init__.py
│   ├── logger.py         # Logging setup
│   ├── cache.py          # Query caching
│   └── rate_limiter.py   # Rate limiting
│
├── templates/            # HTML templates
│   └── index.html       # Main chat interface
│
├── static/              # Static assets
│   ├── css/
│   │   └── style.css   # Stylesheet
│   ├── js/
│   │   └── main.js     # JavaScript
│   └── images/
│
├── data/                # Your documents (you add these)
├── faiss_store/        # Vector store (generated)
└── vcet_chatbot.log   # Application logs
```

---

## 🔌 API Endpoints

### Query
```http
POST /api/query
Content-Type: application/json

{
  "query": "What is attention mechanism?",
  "top_k": 5
}
```

**Response:**
```json
{
  "status": "success",
  "response": "The attention mechanism is...",
  "sources": [],
  "response_time": 1.23,
  "cached": false,
  "remaining_requests": 28
}
```

### Health Check
```http
GET /api/health
```

### Statistics
```http
GET /api/stats
```

### Suggestions
```http
GET /api/suggestions
```

### Rebuild Index
```http
POST /api/rebuild-index
```

### Clear Cache
```http
POST /api/clear-cache
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Your Groq API key | *Required* |
| `EMBEDDING_MODEL` | Sentence transformer model | `BAAI/bge-base-en-v1.5` |
| `LLM_MODEL` | Groq LLM model | `llama-3.3-70b-versatile` |
| `DEBUG` | Debug mode | `False` |
| `PORT` | Server port | `5000` |
| `TOP_K_RESULTS` | Number of chunks to retrieve | `5` |
| `CHUNK_SIZE` | Document chunk size | `1000` |
| `CHUNK_OVERLAP` | Chunk overlap size | `200` |
| `MAX_REQUESTS_PER_MINUTE` | Rate limit | `30` |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | `True` |

---

## 🎨 Customization

### Colors
Edit `static/css/style.css`:

```css
:root {
    --primary: #1e3a8a;       /* Your primary color */
    --secondary: #f59e0b;     /* Your secondary color */
    --accent: #10b981;        /* Your accent color */
}
```

### Suggestions
Edit in `server.py` under the `/api/suggestions` route.

### Logo
Replace with your logo in the HTML or add image to `static/images/`.

---

## 🧪 Testing

### Test Query via CLI
```bash
python app.py
```

### Test API
```bash
# Health check
curl http://localhost:5000/api/health

# Query
curl -X POST http://localhost:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query":"Tell me about VCET"}'

# Stats
curl http://localhost:5000/api/stats
```

---

## 📊 Monitoring

### View Logs
```bash
tail -f vcet_chatbot.log
```

### Statistics Dashboard
Click the stats icon in the UI or visit:
```
http://localhost:5000 (click stats button)
```

---

## 🚨 Troubleshooting

### Issue: "Module not found"
```bash
pip install -r requirements.txt
```

### Issue: "GROQ_API_KEY not set"
Check your `.env` file exists and contains the API key.

### Issue: "No documents found"
Add documents to the `data/` folder and rebuild the index.

### Issue: "FAISS index error"
Delete `faiss_store/` and rebuild:
```bash
rm -rf faiss_store
python server.py
# Then access API to rebuild or use Python script
```

### Issue: Port already in use
Change the port in `.env`:
```env
PORT=8000
```

---

## 🔐 Security Notes

- ✅ Never commit `.env` file to version control
- ✅ Keep API keys secure
- ✅ Enable rate limiting in production
- ✅ Use HTTPS in production
- ✅ Implement authentication for sensitive data
- ✅ Sanitize user inputs (already done)

---

## 📈 Performance Tips

1. **Caching**: Enabled by default for common queries
2. **Chunk Size**: Adjust `CHUNK_SIZE` based on your documents
3. **Top-K**: Lower `TOP_K_RESULTS` for faster responses
4. **Model**: Try different embedding models for your use case
5. **Rate Limiting**: Adjust based on your server capacity

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Credits

**Developed for:** Velammal College of Engineering and Technology (VCET)

**Technologies Used:**
- Flask - Web framework
- LangChain - RAG framework
- FAISS - Vector similarity search
- Groq - Fast LLM inference
- Sentence Transformers - Text embeddings

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review the logs: `vcet_chatbot.log`
- Open an issue on GitHub

---

## 🎯 Roadmap

- [ ] User authentication
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Document upload via UI
- [ ] Admin dashboard
- [ ] Export chat transcripts
- [ ] Advanced analytics
- [ ] Mobile app

---

<div align="center">

**Made with ❤️ for VCET**

*Empowering education through AI*

</div>
