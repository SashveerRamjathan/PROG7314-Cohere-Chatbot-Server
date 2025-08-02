# 🍳 CulinaryGPT Chatbot Server

Welcome to **CulinaryGPT**! 👨‍🍳✨  
A comprehensive culinary AI assistant powered by RAG (Retrieval-Augmented Generation) architecture. This server combines the power of Cohere AI with semantic search to deliver expert-level cooking guidance grounded in verified culinary knowledge.

---

## 📚 Table of Contents

- [✨ Features](#features)
- [🏗️ Architecture](#architecture)
- [⚡ Getting Started](#getting-started)
- [🛠️ Tech Stack](#tech-stack)
- [📁 Project Structure](#project-structure) 
- [🔌 API Endpoints](#api-endpoints)
- [🤓 Usage Examples](#usage-examples)
- [👨‍🍳 Knowledge Base](#knowledge-base)
- [🚀 Performance](#performance)
- [👤 Author & Module Info](#author--module-info)
- [👥 Contributing](#contributing)
- [🙏 Acknowledgements](#acknowledgements)
- [📄 License](#license)

---

## ✨ Features

- 🤖 **RAG-Powered AI:** Retrieval-Augmented Generation for accurate, grounded responses
- 🔍 **Semantic Search:** Vector embeddings with cosine similarity for intelligent document retrieval
- 📚 **Comprehensive Knowledge Base:** 7 specialized categories of culinary expertise
- ⚡ **Fast Response Times:** Pre-computed embeddings with in-memory caching
- 🎯 **Context-Aware:** Top-K document retrieval ensures relevant responses
- 📊 **Built-in Analytics:** Health checks and knowledge base statistics
- 🌍 **Multilingual Support:** Powered by Cohere's multilingual embedding model
- 🔄 **Batch Processing:** Efficient embedding generation with rate limiting

---

## 🏗️ Architecture

**RAG (Retrieval-Augmented Generation) Implementation:**

1. **📥 Indexing Phase (Startup):**
   - Load culinary documents from JSON files
   - Generate vector embeddings using Cohere's `embed-multilingual-v3.0`
   - Cache embeddings to disk for fast startup

2. **🔍 Retrieval Phase (Per Query):**
   - Convert user query to vector embedding
   - Perform cosine similarity search against document embeddings
   - Select top-8 most relevant documents

3. **🎯 Generation Phase (Per Query):**
   - Provide retrieved documents as context to `command-r-plus` model
   - Generate grounded response with citations
   - Return structured response with metadata

---

## ⚡ Getting Started

### 🧰 Prerequisites

- Node.js (v16 or newer)
- npm or yarn package manager
- Cohere API key ([Get one here](https://cohere.ai))

### 🏗️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SashveerRamjathan/PROG7314-Cohere-Chatbot-Server.git
   cd PROG7314-Cohere-Chatbot-Server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env file
   echo "COHERE_API_KEY=your_cohere_api_key_here" > .env
   ```

4. **Prepare knowledge base:**
   ```bash
   # Ensure documents directory exists with JSON files:
   # documents/recipes.json
   # documents/techniques_Tips.json
   # documents/nutrition_Advice.json
   # documents/ingredient_Substitutions.json
   # documents/food_Safety.json
   # documents/equipment_Usage.json
   # documents/cooking_Advice.json
   ```

5. **Start the server:**
   ```bash
   node server.js
   ```

6. **Verify it's running:**
   ```bash
   curl http://localhost:5000/health
   ```

---

## 🛠️ Tech Stack

- **Runtime:** Node.js with ES6 modules
- **Language:** JavaScript
- **AI Platform:** Cohere AI
  - **Embedding Model:** `embed-multilingual-v3.0`
  - **Chat Model:** `command-r-plus`
- **Framework:** Express.js
- **Vector Search:** Cosine similarity
- **Storage:** JSON files + cached embeddings
- **Environment:** dotenv

---

## 📁 Project Structure

```
PROG7314-Cohere-Chatbot-Server/
├── server.js                    # Main server file with RAG implementation
├── documents/                   # Knowledge base JSON files
│   ├── recipes.json            # Recipe instructions and ingredients
│   ├── techniques_Tips.json    # Cooking techniques and tips
│   ├── nutrition_Advice.json   # Nutrition advice and health info
│   ├── ingredient_Substitutions.json # Ingredient substitutions
│   ├── food_Safety.json        # Food safety guidelines
│   ├── equipment_Usage.json    # Kitchen equipment usage
│   └── cooking_Advice.json     # General cooking advice
├── embeddings/                  # Cached vector embeddings
│   └── embeddings.json         # Pre-computed embeddings (auto-generated)
├── .env                        # Environment variables (create this)
├── package.json               # Dependencies and scripts
└── README.md                  # You are here! 📍
```

---

## 🔌 API Endpoints

### 🎯 Main Chat Interface
```http
POST /prompt
Content-Type: application/json

{
  "prompt": "How do I make perfect pasta?"
}
```

**Response Structure:**
```json
{
  "text": "To make perfect pasta, start with a large pot of salted water...",
  "citations": [
    {
      "start": 15,
      "end": 42,
      "document_id": "recipes_1"
    }
  ],
  "documentsUsed": 5,
  "categoriesReferenced": ["recipes", "techniques", "cooking_advice"]
}
```

### 🏥 Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "documentsLoaded": 1247,
  "timestamp": "2025-08-02T14:53:20.123Z"
}
```

### 📊 Knowledge Base Statistics
```http
GET /stats
```

**Response:**
```json
{
  "totalDocuments": 1247,
  "categoriesCount": 7,
  "categoryBreakdown": {
    "recipes": 312,
    "techniques": 185,
    "nutrition": 201,
    "substitutions": 156,
    "food_safety": 143,
    "equipment": 127,
    "cooking_advice": 123
  }
}
```

---

## 🤓 Usage Examples

### Basic Cooking Question
```javascript
const response = await fetch('http://localhost:5000/prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "What's the best way to sear a steak?"
  })
});

const result = await response.json();
console.log(result.text);
console.log(`Used ${result.documentsUsed} documents from categories: ${result.categoriesReferenced.join(', ')}`);
```

### Ingredient Substitution Query
```javascript
const response = await fetch('http://localhost:5000/prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "I'm out of eggs for my cake recipe. What can I use instead?"
  })
});

const advice = await response.json();
// Response will include substitution options with citations from the knowledge base
```

### Health Check Integration
```javascript
// Monitor server health in your application
const healthCheck = async () => {
  try {
    const response = await fetch('http://localhost:5000/health');
    const status = await response.json();
    console.log(`Server healthy. ${status.documentsLoaded} documents loaded.`);
  } catch (error) {
    console.error('Server health check failed:', error);
  }
};
```

---

## 👨‍🍳 Knowledge Base

CulinaryGPT's expertise spans **7 specialized categories**:

### 🍽️ **Recipes** (`recipes.json`)
- Traditional and modern recipes from around the world
- Step-by-step cooking instructions
- Ingredient lists and measurements
- Cooking times and temperatures

### 🎯 **Techniques & Tips** (`techniques_Tips.json`)
- Professional cooking techniques adapted for home cooks
- Kitchen tips and tricks
- Troubleshooting common cooking problems
- Skill development guidance

### 🥗 **Nutrition & Health** (`nutrition_Advice.json`)
- Nutritional information and dietary guidance
- Healthy eating tips and meal planning
- Special dietary needs (keto, vegan, gluten-free, etc.)
- Calorie and macro information

### 🔄 **Ingredient Substitutions** (`ingredient_Substitutions.json`)
- Creative alternatives for dietary restrictions
- Allergy-friendly ingredient swaps
- Emergency substitutions for missing ingredients
- Seasonal ingredient recommendations

### 🛡️ **Food Safety** (`food_Safety.json`)
- Safe storage temperatures and guidelines
- Spoilage detection and prevention
- Proper food handling techniques
- Cross-contamination prevention

### 🔪 **Equipment Usage** (`equipment_Usage.json`)
- Proper use and maintenance of cookware
- Appliance selection and recommendations
- Tool techniques and best practices
- Kitchen organization tips

### 💡 **Cooking Advice** (`cooking_Advice.json`)
- General cooking wisdom and best practices
- Flavor pairing and combination suggestions
- Meal planning strategies
- Kitchen management tips

---

## 🚀 Performance

### ⚡ **Optimization Features:**
- **Pre-computed Embeddings:** Documents are embedded once at startup, then cached
- **Batch Processing:** Embeddings generated in batches of 96 to respect API limits
- **Rate Limiting:** 10-second delays between batches to avoid API throttling
- **Memory Caching:** All embeddings stored in memory for instant retrieval
- **Top-K Search:** Only retrieves most relevant documents (default: 8) for optimal context

### 📊 **Performance Metrics:**
- **Cold Start:** ~2-5 minutes (first run while computing embeddings)
- **Warm Start:** ~5-10 seconds (using cached embeddings)
- **Query Response:** ~1-3 seconds (depending on complexity)
- **Memory Usage:** ~50-200MB (varies with knowledge base size)

---

## 👤 Author & Module Info

- **Name:** Sashveer Lakhan Ramjathan  
- **Student Number:** ST10361554  
- **Module:** PROG7314  
- **Project:** Cohere Chatbot Server - CulinaryGPT
- **Architecture:** RAG (Retrieval-Augmented Generation)
- **Date:** August 2025

---

## 👥 Contributing

We welcome contributions from fellow developers and culinary enthusiasts! 🤝

### 🔧 **Development Setup:**
```bash
# Fork and clone the repository
git clone https://github.com/yourusername/PROG7314-Cohere-Chatbot-Server.git
cd PROG7314-Cohere-Chatbot-Server

# Install dependencies
npm install

# Set up your environment
cp .env.example .env
# Add your Cohere API key to .env

# Run the server
node server.js
```

### 📝 **Adding Knowledge:**
1. Add new entries to appropriate JSON files in `/documents/`
2. Delete `/embeddings/embeddings.json` to force re-computation
3. Restart server to generate new embeddings
4. Test your additions with relevant queries

### 🧪 **Testing:**
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test stats endpoint
curl http://localhost:5000/stats

# Test chat functionality
curl -X POST http://localhost:5000/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "How do I boil water?"}'
```

---

## 🙏 Acknowledgements

- 🤖 **Cohere AI** for providing powerful embedding and chat models
- 📚 **Culinary experts** whose knowledge forms our comprehensive database
- 🔬 **RAG Architecture** pioneers for the retrieval-augmented generation concept
- 👨‍🍳 **Home cooks everywhere** who inspire us to make cooking accessible
- 🌟 **Open source community** for the incredible tools and libraries

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy Cooking with AI! 🍳🤖**

*"Where artificial intelligence meets culinary excellence!"* ✨

---

### 🔧 **Technical Notes:**

**Vector Similarity Search:**
- Uses cosine similarity for document ranking
- Embedding dimension: 1024 (Cohere's embed-multilingual-v3.0)
- Temperature setting: 0.3 for consistent, factual responses

**Rate Limiting:**
- Batch size: 96 documents per API call
- Delay: 10 seconds between batches
- Optimized for Cohere's API limits

**Memory Management:**
- Embeddings cached in memory for fast retrieval
- JSON files loaded once at startup
- Automatic embedding persistence to disk

---
