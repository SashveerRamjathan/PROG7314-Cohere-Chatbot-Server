# 🍳 CulinaryGPT Chatbot Server

Welcome to **CulinaryGPT**! 👨‍🍳✨  
A comprehensive culinary AI assistant powered by RAG (Retrieval-Augmented Generation) architecture. This server combines the power of Cohere AI with semantic search to deliver expert-level cooking guidance grounded in verified culinary knowledge.

---

## 📚 Table of Contents

- [✨ Features](#features)
- [🏗️ Architecture](#architecture)
- [⚡ Getting Started](#getting-started)
- [🚀 Deployment](#deployment)
- [🛠️ Tech Stack](#tech-stack)
- [📁 Project Structure](#project-structure) 
- [🔌 API Endpoints](#api-endpoints)
- [📊 Monitoring & Analytics](#monitoring--analytics)
- [🤓 Usage Examples](#usage-examples)
- [👨‍🍳 Knowledge Base](#knowledge-base)
- [🚀 Performance](#performance)
- [👥 Contributing](#contributing)
- [🙏 Acknowledgements](#acknowledgements)

---

## ✨ Features

- 🤖 **RAG-Powered AI:** Retrieval-Augmented Generation for accurate, grounded responses
- 🔍 **Semantic Search:** Vector embeddings with cosine similarity for intelligent document retrieval
- 📚 **Comprehensive Knowledge Base:** 7 specialized categories of culinary expertise
- ⚡ **Fast Response Times:** Pre-computed embeddings with in-memory caching
- 🎯 **Context-Aware:** Top-K document retrieval ensures relevant responses
- 📊 **Advanced Analytics:** Comprehensive health monitoring and knowledge base statistics
- 🌍 **Multilingual Support:** Powered by Cohere's multilingual embedding model
- 🔄 **Batch Processing:** Efficient embedding generation with rate limiting
- ☁️ **Cloud-Ready:** Optimized for Vercel serverless deployment
- 🔍 **Real-time Monitoring:** Query tracking, performance metrics, and system health

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

- Node.js (v18 or newer)
- npm or yarn package manager
- Cohere API key ([Get one here](https://cohere.ai))

### 🏗️ Local Development

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

4. **Ensure knowledge base files exist:**
   ```bash
   # Verify documents directory contains:
   # documents/recipes.json
   # documents/techniques_Tips.json
   # documents/nutrition_Advice.json
   # documents/ingredient_Substitutions.json
   # documents/food_Safety.json
   # documents/equipment_Usage.json
   # documents/cooking_Advice.json
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Verify it's running:**
   ```bash
   curl http://localhost:5000/health
   ```

---

## 🚀 Deployment

### ☁️ Vercel Deployment (Recommended)

**CulinaryGPT is optimized for Vercel serverless deployment:**

1. **Prepare for deployment:**
   ```bash
   # Ensure embeddings/ is in .gitignore
   echo "embeddings/" >> .gitignore
   
   # Commit your changes
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com) and import your GitHub repository
   - **No build commands needed** - Vercel auto-detects everything!
   - Set environment variables in Vercel dashboard:
     ```
     COHERE_API_KEY = your_cohere_api_key_here
     NODE_ENV = production
     ```

3. **Your live endpoints:**
   ```
   https://your-project.vercel.app/prompt  - Main chat interface
   https://your-project.vercel.app/health - Comprehensive health check
   https://your-project.vercel.app/stats  - Detailed analytics dashboard
   ```

### 🐳 Alternative Deployment Options

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**Traditional Hosting:**
- Set `PORT` environment variable
- Ensure all document files are present
- Run `npm start`

---

## 🛠️ Tech Stack

- **Runtime:** Node.js v18+ with ES6 modules
- **Language:** JavaScript
- **AI Platform:** Cohere AI
  - **Embedding Model:** `embed-multilingual-v3.0`
  - **Chat Model:** `command-r-plus`
- **Framework:** Express.js v5.1.0
- **Vector Search:** Cosine similarity
- **Storage:** JSON files + cached embeddings
- **Environment:** dotenv
- **Deployment:** Vercel Serverless Functions
- **Monitoring:** Built-in analytics and health checks

---

## 📁 Project Structure

```
PROG7314-Cohere-Chatbot-Server/
├── server.js                    # Main server file with RAG implementation
├── vercel.json                  # Vercel deployment configuration
├── documents/                   # Knowledge base JSON files
│   ├── recipes.json            # Recipe instructions and ingredients
│   ├── techniques_Tips.json    # Cooking techniques and tips
│   ├── nutrition_Advice.json   # Nutrition advice and health info
│   ├── ingredient_Substitutions.json # Ingredient substitutions
│   ├── food_Safety.json        # Food safety guidelines
│   ├── equipment_Usage.json    # Kitchen equipment usage
│   └── cooking_Advice.json     # General cooking advice
├── embeddings/                  # Cached vector embeddings (auto-generated)
│   └── embeddings.json         # Pre-computed embeddings
├── .env                        # Environment variables (local development)
├── .gitignore                  # Git ignore file
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

### 🏥 Enhanced Health Check
```http
GET /health
```

**Response Structure:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-02T16:04:17.000Z",
  "server": {
    "uptime": "2h 15m 42s",
    "startedAt": "2025-08-02T13:48:35.000Z",
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "environment": "production"
  },
  "knowledgeBase": {
    "documentsLoaded": 1247,
    "categoriesCount": 7,
    "categories": ["cooking_advice", "equipment", "food_safety", "nutrition", "recipes", "substitutions", "techniques"],
    "embeddingsReady": true,
    "embeddingsComputedAt": "2025-08-02T13:51:22.000Z",
    "embeddingsFileExists": true,  
    "embeddingsFileSize": "45 MB"
  },
  "usage": {
    "totalQueries": 127,
    "lastQueryAt": "2025-08-02T16:03:45.000Z",
    "queriesPerHour": 57
  },
  "system": {
    "memory": {
      "rss": 142,
      "heapUsed": 89,
      "heapTotal": 123,
      "external": 15
    },
    "pid": 12345
  },
  "config": {
    "cohereApiConfigured": true,
    "corsEnabled": true,
    "rateLimitingActive": true
  }
}
```

### 📊 Detailed Analytics Dashboard
```http
GET /stats
```

**Response Structure:**
```json
{
  "overview": {
    "totalDocuments": 1247,
    "totalCategories": 7,
    "dataLoadedAt": "2025-08-02T13:48:35.000Z",
    "embeddingsComputedAt": "2025-08-02T13:51:22.000Z",
    "lastQueryAt": "2025-08-02T16:03:45.000Z",
    "totalQueries": 127
  },
  "categories": {
    "recipes": {
      "count": 312,
      "percentage": 25,
      "avgTitleLength": 67,
      "avgSnippetLength": 245
    },
    "techniques": {
      "count": 185,
      "percentage": 15,
      "avgTitleLength": 52,
      "avgSnippetLength": 198
    }
  },
  "content": {
    "averages": {
      "titleLength": 58,
      "snippetLength": 223
    },
    "extremes": {
      "longestTitle": {
        "text": "What are the best techniques for achieving perfect caramelization when making French onion soup...",
        "length": 127
      },
      "shortestTitle": {
        "text": "Salt types",
        "length": 10
      },
      "longestSnippetLength": 856
    },
    "distribution": {
      "shortTitles": 234,
      "mediumTitles": 789,
      "longTitles": 224,
      "shortSnippets": 156,
      "mediumSnippets": 923,
      "longSnippets": 168
    }
  },
  "embeddings": {
    "dimension": 1024,
    "averageMagnitude": 0.987,
    "model": "embed-multilingual-v3.0",
    "inputType": "search_document",
    "fileInfo": {
      "exists": true,
      "size": 47185920,
      "sizeFormatted": "45 MB",
      "lastModified": "2025-08-02T13:51:25.000Z",
      "created": "2025-08-02T13:51:25.000Z"
    }
  },
  "performance": {
    "memoryUsage": {
      "rss": 142,
      "heapUsed": 89,
      "heapTotal": 123,
      "external": 15
    },
    "queriesPerHour": 57,
    "averageDocumentsPerQuery": 8
  },
  "system": {
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "environment": "production",
    "serverUptime": "2h 15m 42s"
  }
}
```

---

## 📊 Monitoring & Analytics

### 🔍 **Real-time Health Monitoring**

CulinaryGPT provides comprehensive monitoring capabilities:

**System Health:**
- Server uptime and performance metrics
- Memory usage tracking (RSS, Heap, External)
- Node.js version and platform information
- Process ID and environment status

**Knowledge Base Status:**
- Document loading status and count
- Embeddings computation and caching status
- Category distribution and breakdown
- File system information (embeddings file size, timestamps)

**API Usage Analytics:**
- Total query count since server start
- Queries per hour calculation
- Last query timestamp
- Response time tracking

**Configuration Validation:**
- Cohere API key configuration status
- CORS and rate limiting status
- Environment variable validation

### 📈 **Performance Insights**

**Content Analytics:**
- Average title and snippet lengths per category
- Content distribution analysis (short/medium/long)
- Longest and shortest content identification
- Category-specific performance metrics

**Vector Embedding Metrics:**
- Embedding dimension and model information
- Average embedding magnitude calculation
- File storage optimization tracking
- Batch processing efficiency metrics

**Resource Monitoring:**
- Memory usage patterns and optimization
- Query processing performance
- Serverless function efficiency
- Cold start vs. warm start metrics

### 🎯 **Usage Tracking**

Monitor your CulinaryGPT deployment with:
- **Real-time Queries:** Track active usage patterns
- **Category Usage:** Identify most popular knowledge areas
- **Performance Trends:** Monitor response times and efficiency
- **Resource Utilization:** Optimize memory and compute usage

---

## 🤓 Usage Examples

### Basic Cooking Question
```javascript
const response = await fetch('https://your-project.vercel.app/prompt', {
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
const response = await fetch('https://your-project.vercel.app/prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "I'm out of eggs for my cake recipe. What can I use instead?"
  })
});

const advice = await response.json();
// Response will include substitution options with citations from the knowledge base
```

### Comprehensive Health Monitoring
```javascript
// Monitor server health and performance
const healthCheck = async () => {
  try {
    const response = await fetch('https://your-project.vercel.app/health');
    const status = await response.json();
    
    console.log(`Server Status: ${status.status}`);
    console.log(`Uptime: ${status.server.uptime}`);
    console.log(`Documents Loaded: ${status.knowledgeBase.documentsLoaded}`);
    console.log(`Total Queries: ${status.usage.totalQueries}`);
    console.log(`Memory Usage: ${status.system.memory.heapUsed}MB`);
    console.log(`Queries/Hour: ${status.usage.queriesPerHour}`);
  } catch (error) {
    console.error('Health check failed:', error);
  }
};
```

### Analytics Dashboard Integration
```javascript
// Get detailed analytics for dashboard
const getAnalytics = async () => {
  try {
    const response = await fetch('https://your-project.vercel.app/stats');
    const stats = await response.json();
    
    // Display overview metrics
    console.log('=== CulinaryGPT Analytics ===');
    console.log(`Total Documents: ${stats.overview.totalDocuments}`);
    console.log(`Categories: ${stats.overview.totalCategories}`);
    console.log(`Total Queries Processed: ${stats.overview.totalQueries}`);
    
    // Category breakdown
    console.log('\n=== Category Breakdown ===');
    Object.entries(stats.categories).forEach(([category, data]) => {
      console.log(`${category}: ${data.count} docs (${data.percentage}%)`);
    });
    
    // Performance metrics
    console.log('\n=== Performance ===');
    console.log(`Average Title Length: ${stats.content.averages.titleLength} chars`);
    console.log(`Embedding Dimension: ${stats.embeddings.dimension}`);
    console.log(`Memory Usage: ${stats.performance.memoryUsage.heapUsed}MB`);
    console.log(`Queries/Hour: ${stats.performance.queriesPerHour}`);
    
  } catch (error) {
    console.error('Analytics fetch failed:', error);
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
- **Smart Rate Limiting:** 2-second delays optimized for serverless environments
- **Memory Caching:** All embeddings stored in memory for instant retrieval
- **Top-K Search:** Only retrieves most relevant documents (default: 8) for optimal context
- **Initialization Guards:** Prevents race conditions in serverless environments
- **Real-time Monitoring:** Query tracking and performance analytics

### 📊 **Performance Metrics:**

**Local Development:**
- **Cold Start:** ~2-5 minutes (first run while computing embeddings)
- **Warm Start:** ~5-10 seconds (using cached embeddings)
- **Query Response:** ~1-3 seconds (depending on complexity)
- **Memory Usage:** ~50-200MB (tracked in real-time)

**Vercel Deployment:**
- **Cold Start:** ~10-30 seconds (serverless function initialization)
- **Warm Queries:** ~1-2 seconds (cached function)
- **Memory Usage:** ~50-200MB (varies with knowledge base size)
- **Function Timeout:** 60 seconds (configured for embedding operations)
- **Uptime Tracking:** Real-time server uptime monitoring

**Analytics & Monitoring:**
- **Query Tracking:** Real-time query count and rate calculation
- **Category Usage:** Most popular knowledge areas identification
- **Performance Trends:** Response time and efficiency monitoring
- **Resource Optimization:** Memory usage patterns and optimization

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
echo "COHERE_API_KEY=your_api_key_here" > .env

# Run the development server
npm run dev
```

### 📝 **Adding Knowledge:**
1. Add new entries to appropriate JSON files in `/documents/`
2. Delete `/embeddings/embeddings.json` to force re-computation
3. Restart server to generate new embeddings
4. Test your additions with relevant queries
5. Monitor the impact using `/health` and `/stats` endpoints

### 🧪 **Testing:**
```bash
# Test enhanced health endpoint
curl http://localhost:5000/health

# Test detailed stats endpoint
curl http://localhost:5000/stats

# Test chat functionality
curl -X POST http://localhost:5000/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "How do I boil water?"}'
```

### 🚀 **Deployment Testing:**
```bash
# Test your Vercel deployment health
curl https://your-project.vercel.app/health

# Test analytics endpoint
curl https://your-project.vercel.app/stats

# Test chat functionality
curl -X POST https://your-project.vercel.app/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Tell me about food safety"}'
```

### 📊 **Monitoring Your Contributions:**
Use the enhanced analytics endpoints to:
- Track the impact of new knowledge additions
- Monitor query patterns and popular categories
- Analyze performance improvements
- Validate system health after changes

---

## 🙏 Acknowledgements

- 🤖 **Cohere AI** for providing powerful embedding and chat models
- ☁️ **Vercel** for seamless serverless deployment platform
- 📚 **Culinary experts** whose knowledge forms our comprehensive database
- 🔬 **RAG Architecture** pioneers for the retrieval-augmented generation concept
- 👨‍🍳 **Home cooks everywhere** who inspire us to make cooking accessible
- 🌟 **Open source community** for the incredible tools and libraries
- 📊 **Analytics Community** for monitoring and observability best practices

---

**Happy Cooking with AI! 🍳🤖**

*"Where artificial intelligence meets culinary excellence!"* ✨

---

### 🔧 **Technical Notes:**

**Vector Similarity Search:**
- Uses cosine similarity for document ranking
- Embedding dimension: 1024 (Cohere's embed-multilingual-v3.0)
- Temperature setting: 0.3 for consistent, factual responses
- Real-time embedding magnitude tracking

**Serverless Optimizations:**
- Initialization guards prevent race conditions
- Reduced rate limiting for faster cold starts
- Cross-platform file path handling
- Graceful degradation for missing embeddings
- Enhanced monitoring for serverless environments

**API Rate Limiting:**
- Batch size: 96 documents per API call
- Delay: 2 seconds between batches (optimized for Vercel)
- Automatic retry logic for transient failures
- Real-time tracking of API usage patterns

**Memory Management:**
- Embeddings cached in memory for fast retrieval
- JSON files loaded once at startup
- Automatic embedding persistence to disk
- Efficient garbage collection for large datasets
- Real-time memory usage monitoring and reporting

**Analytics & Monitoring:**
- Comprehensive health checks with system metrics
- Real-time query tracking and performance monitoring
- Detailed knowledge base statistics and content analysis
- Memory usage patterns and resource optimization
- Serverless function performance tracking

---

**🚀 Ready to deploy to Vercel with comprehensive monitoring!** Simply push your code and deploy - no additional configuration needed!

**📊 Monitor your deployment:** Use `/health` and `/stats` endpoints to track performance, usage patterns, and system health in real-time.
