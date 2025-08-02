/**
 * CulinaryGPT Server - A comprehensive culinary AI assistant using RAG (Retrieval-Augmented Generation)
 *
 * This server implements a semantic search system that:
 * 1. Loads culinary documents from JSON files
 * 2. Converts documents to vector embeddings using Cohere's embedding model
 * 3. Performs similarity search against user queries
 * 4. Uses retrieved context to generate accurate responses via Cohere's chat model
 *
 * Architecture: Express.js REST API + Cohere AI + Vector Similarity Search
 *
 */

// ============================================================================
// IMPORTS AND DEPENDENCIES
// ============================================================================

import "dotenv/config"; // Load environment variables from .env file
import express from "express"; // Web framework for Node.js
import cors from "cors"; // Enable Cross-Origin Resource Sharing
import { CohereClient } from "cohere-ai"; // Cohere AI SDK for embeddings and chat
import fs from "fs/promises"; // File system operations with Promise support
import path from "path"; // Path utilities for cross-platform compatibility

// ============================================================================
// SERVER SETUP AND CONFIGURATION
// ============================================================================

const app = express();

// Middleware setup
app.use(cors()); // Allow cross-origin requests from frontend
app.use(express.json()); // Parse JSON request bodies

// Initialize Cohere AI client with API key from environment variables
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY, // Requires COHERE_API_KEY in .env file
});

// File path for storing pre-computed embeddings to avoid re-computation
const EMBEDDINGS_FILE = path.join(
  process.cwd(),
  "embeddings",
  "embeddings.json"
);

// ============================================================================
// VECTOR SIMILARITY FUNCTIONS
// ============================================================================

/**
 * Calculate cosine similarity between two vectors
 *
 * Cosine similarity measures the cosine of the angle between two vectors,
 * providing a metric of how similar they are regardless of magnitude.
 *
 * Formula: cos(θ) = (A·B) / (|A| × |B|)
 *
 * @param {number[]} vecA - First vector (embedding)
 * @param {number[]} vecB - Second vector (embedding)
 * @returns {number} Similarity score between -1 and 1 (1 = identical, 0 = orthogonal, -1 = opposite)
 */
function cosineSimilarity(vecA, vecB) {
  // Calculate dot product: sum of element-wise multiplication
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);

  // Calculate magnitude (length) of vector A: √(sum of squares)
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));

  // Calculate magnitude (length) of vector B: √(sum of squares)
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  // Return cosine similarity: dot product divided by product of magnitudes
  return dotProduct / (magA * magB);
}

/**
 * Find the top K most similar documents to a query embedding
 *
 * This implements the core semantic search functionality by:
 * 1. Computing similarity scores between query and all documents
 * 2. Sorting documents by similarity score (highest first)
 * 3. Returning the top K most relevant documents
 *
 * @param {number[]} queryEmbedding - Vector embedding of user's query
 * @param {Object[]} documents - Array of document objects with embeddings
 * @param {number} k - Number of top documents to return (default: 8)
 * @returns {Object[]} Top K most similar documents
 */
function getTopKDocuments(queryEmbedding, documents, k = 8) {
  // Calculate similarity score for each document
  const similarities = documents.map((doc) => ({
    doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  // Sort by similarity score in descending order (most similar first)
  similarities.sort((a, b) => b.score - a.score);

  // Return top K documents (without similarity scores)
  return similarities.slice(0, k).map((item) => item.doc);
}

// ============================================================================
// DOCUMENT LOADING AND PROCESSING
// ============================================================================

/**
 * Load and categorize culinary documents from JSON files
 *
 * This function:
 * 1. Reads multiple JSON files containing culinary knowledge
 * 2. Categorizes documents based on filename patterns
 * 3. Structures data for embedding and retrieval
 * 4. Provides logging for monitoring the loading process
 *
 * @returns {Object[]} Array of structured document objects
 */
async function loadDocuments() {
  // Define all JSON files containing culinary knowledge
  const files = [
    path.join(process.cwd(), "documents", "recipes.json"), // Recipe instructions and ingredients
    path.join(process.cwd(), "documents", "techniques_Tips.json"), // Cooking techniques and tips
    path.join(process.cwd(), "documents", "nutrition_Advice.json"), // Nutrition advice and health info
    path.join(process.cwd(), "documents", "ingredient_Substitutions.json"), // Ingredient substitutions
    path.join(process.cwd(), "documents", "food_Safety.json"), // Food safety guidelines
    path.join(process.cwd(), "documents", "equipment_Usage.json"), // Kitchen equipment usage
    path.join(process.cwd(), "documents", "cooking_Advice.json"), // General cooking advice
  ];

  const documents = [];

  // Process each file sequentially
  for (const file of files) {
    try {
      // Read and parse JSON file
      const content = await fs.readFile(file, "utf-8");
      const json = JSON.parse(content);

      // Determine document category based on filename for better organization
      let category = "general"; // Default category
      if (file.includes("nutrition_Advice")) category = "nutrition";
      else if (file.includes("ingredient_Substitutions"))
        category = "substitutions";
      else if (file.includes("food_Safety")) category = "food_safety";
      else if (file.includes("equipment_Usage")) category = "equipment";
      else if (file.includes("recipes")) category = "recipes";
      else if (file.includes("techniques_Tips")) category = "techniques";
      else if (file.includes("cooking_Advice")) category = "cooking_advice";

      // Process each item in the JSON array
      json.forEach((item, idx) => {
        documents.push({
          id: `${category}_${idx + 1}`, // Unique identifier for each document
          data: {
            title: item.prompt, // Question/topic (used for embedding)
            snippet: item.response, // Answer/content (used for embedding and context)
            category: category, // Document category for filtering/stats
          },
        });
      });
    } catch (err) {
      // Log errors but continue processing other files
      console.error(`Error reading ${file}:`, err);
    }
  }

  console.log(`Loaded ${documents.length} documents across all categories`);

  // Calculate and log category distribution for monitoring
  const categoryCount = documents.reduce((acc, doc) => {
    acc[doc.data.category] = (acc[doc.data.category] || 0) + 1;
    return acc;
  }, {});

  console.log("Document breakdown by category:", categoryCount);
  return documents;
}

// ============================================================================
// EMBEDDING PROCESSING FUNCTIONS
// ============================================================================

/**
 * Utility function to pause execution for rate limiting
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after specified time
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate embeddings for documents in batches to respect API rate limits
 *
 * This function processes documents in batches to:
 * 1. Avoid hitting Cohere API rate limits
 * 2. Provide progress feedback for large document sets
 * 3. Handle potential API errors gracefully
 *
 * @param {Object[]} documents - Array of document objects to embed
 * @param {number} batchSize - Number of documents to process per batch (default: 96)
 * @returns {number[][]} Array of embedding vectors
 */
async function embedDocumentsInBatches(documents, batchSize = 96) {
  const allEmbeddings = [];

  // Process documents in batches
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);

    // Log progress for monitoring
    console.log(
      `Embedding batch ${i / batchSize + 1} of ${Math.ceil(
        documents.length / batchSize
      )}...`
    );

    // Generate embeddings for current batch
    const response = await cohere.embed({
      // Combine title and snippet for comprehensive context
      texts: batch.map((doc) => `${doc.data.title}. ${doc.data.snippet}`),
      model: "embed-multilingual-v3.0", // Cohere's multilingual embedding model
      input_type: "search_document", // Optimizes embeddings for search/retrieval
    });

    // Collect embeddings from this batch
    allEmbeddings.push(...response.embeddings);

    // Rate limiting: shorter wait for Vercel (reduced from 10 seconds)
    if (i + batchSize < documents.length) {
      await sleep(2000);
    }
  }

  return allEmbeddings;
}

/**
 * Save computed embeddings to file for persistence
 *
 * Saves embeddings to avoid re-computation on server restart.
 * This significantly improves startup time for large document collections.
 *
 * @param {Object[]} documents - Documents with computed embeddings
 */
async function saveEmbeddingsToFile(documents) {
  // Ensure embeddings directory exists
  const embeddingsDir = path.dirname(EMBEDDINGS_FILE);
  await fs.mkdir(embeddingsDir, { recursive: true });

  // Structure data for JSON serialization
  const embeddingsData = documents.map((doc) => ({
    id: doc.id,
    title: doc.data.title,
    snippet: doc.data.snippet,
    category: doc.data.category,
    embedding: doc.embedding, // Vector embedding array
  }));

  // Write to file with pretty formatting
  await fs.writeFile(
    EMBEDDINGS_FILE,
    JSON.stringify(embeddingsData, null, 2),
    "utf-8"
  );
  console.log(`Embeddings saved to ${EMBEDDINGS_FILE}`);
}

/**
 * Load pre-computed embeddings from file if available
 *
 * This function checks for existing embeddings to avoid re-computation,
 * which can take significant time and API calls for large document sets.
 *
 * @returns {Object[]|null} Array of documents with embeddings, or null if file doesn't exist
 */
async function loadEmbeddingsFromFile() {
  try {
    // Attempt to read existing embeddings file
    const content = await fs.readFile(EMBEDDINGS_FILE, "utf-8");
    const embeddingsData = JSON.parse(content);

    console.log(
      `Loaded ${embeddingsData.length} embeddings from ${EMBEDDINGS_FILE}`
    );

    // Restructure data to match expected format
    return embeddingsData.map((item) => ({
      id: item.id,
      data: {
        title: item.title,
        snippet: item.snippet,
        category: item.category || "general", // Fallback for older data
      },
      embedding: item.embedding,
    }));
  } catch (err) {
    // File doesn't exist or is corrupted - will need to compute embeddings
    console.warn("No existing embeddings file found. Will compute embeddings.");
    return null;
  }
}

// ============================================================================
// DOCUMENT INITIALIZATION AND CACHING
// ============================================================================

// Global cache for documents with embeddings (loaded once at startup)
let cachedDocuments = [];
let isInitializing = false;

/**
 * Initialize document embeddings system
 *
 * This function orchestrates the entire document loading and embedding process:
 * 1. Try to load existing embeddings from file
 * 2. If not found, load documents and compute embeddings
 * 3. Save computed embeddings for future use
 * 4. Cache documents in memory for fast retrieval
 */
async function initializeDocuments() {
  // Prevent multiple initialization attempts
  if (isInitializing) {
    while (isInitializing) {
      await sleep(1000);
    }
    return cachedDocuments;
  }

  if (cachedDocuments.length > 0) {
    return cachedDocuments;
  }

  isInitializing = true;

  try {
    // First, try to load pre-computed embeddings
    cachedDocuments = await loadEmbeddingsFromFile();

    if (!cachedDocuments) {
      // No existing embeddings found - need to compute them
      console.log("Computing embeddings for the first time...");

      // Load documents from JSON files
      const documents = await loadDocuments();

      console.log("Embedding documents...");
      // Generate embeddings in batches
      const allEmbeddings = await embedDocumentsInBatches(documents);

      // Attach embeddings to document objects
      allEmbeddings.forEach((embedding, i) => {
        documents[i].embedding = embedding;
      });

      // Save embeddings to file for future use
      await saveEmbeddingsToFile(documents);

      // Cache documents in memory
      cachedDocuments = documents;
      console.log("Embeddings ready.");
    } else {
      console.log("Using cached embeddings from file.");
    }
  } finally {
    isInitializing = false;
  }

  return cachedDocuments;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Main chat endpoint - handles user queries with RAG (Retrieval-Augmented Generation)
 *
 * Process flow:
 * 1. Embed user's query
 * 2. Find most similar documents using cosine similarity
 * 3. Use retrieved documents as context for AI response
 * 4. Return AI-generated response with citations
 */
app.post("/prompt", async (req, res) => {
  const { prompt } = req.body;

  // Validate input
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    console.log(`Processing user prompt: "${prompt.substring(0, 50)}..."`);

    // Initialize documents if not already done
    const documents = await initializeDocuments();

    // STEP 1: Convert user query to vector embedding
    const embedResponse = await cohere.embed({
      texts: [prompt],
      model: "embed-multilingual-v3.0",
      input_type: "search_query", // Optimized for search queries (vs documents)
    });

    const queryEmbedding = embedResponse.embeddings[0];

    // STEP 2: Find most relevant documents using semantic similarity
    const topDocuments = getTopKDocuments(queryEmbedding, documents, 8);

    // Log retrieval results for monitoring
    console.log(`Retrieved top ${topDocuments.length} documents.`);
    console.log("Categories found:", [
      ...new Set(topDocuments.map((doc) => doc.data.category)),
    ]);

    // STEP 3: Generate AI response using retrieved context
    const response = await cohere.chat({
      model: "command-r-plus", // Cohere's most capable chat model
      message: prompt,

      // Provide retrieved documents as context
      documents: topDocuments.map((doc) => ({
        text: `${doc.data.title}. ${doc.data.snippet}`,
      })),

      // System prompt defining AI assistant's role and behavior
      preamble: `You are CulinaryGPT, a comprehensive culinary AI assistant with expertise across all aspects of cooking, food, and kitchen management. You have access to extensive knowledge covering:

  COOKING & RECIPES: Traditional and modern recipes, cooking techniques, flavor combinations, and meal planning
  INGREDIENT SUBSTITUTIONS: Creative alternatives for dietary restrictions, allergies, and missing ingredients
  NUTRITION & HEALTH: Dietary guidance, nutritional information, healthy eating tips, and special dietary needs
  KITCHEN EQUIPMENT: Proper use, maintenance, and selection of cookware, appliances, and tools
  FOOD SAFETY: Storage guidelines, temperature requirements, spoilage detection, and safe food handling
  CULINARY TECHNIQUES: Professional methods adapted for home cooks, troubleshooting, and skill development

  RESPONSE GUIDELINES:
  • Answer using the provided documents whenever possible - they contain expert-verified information
  • If documents don't cover the topic, use your culinary knowledge but stay within food/cooking domains
  • Provide practical, actionable advice that home cooks can implement
  • Include safety warnings when relevant (especially for food safety, equipment use)
  • Explain the "why" behind techniques and recommendations when helpful
  • Use clear, friendly language suitable for cooks of all skill levels
  • For complex topics, break down information into digestible steps
  • If asked about non-culinary topics, politely redirect to food/cooking questions
      
  Remember: You're here to make cooking accessible, safe, and enjoyable for everyone!`,

      temperature: 0.3, // Low temperature for consistent, factual responses
    });

    console.log("Response generated successfully");

    // STEP 4: Return structured response with metadata
    res.json({
      text: response.text, // AI-generated response
      citations: response.citations ?? [], // Source citations from documents
      documentsUsed: topDocuments.length, // Number of documents used
      categoriesReferenced: [
        // Categories of knowledge used
        ...new Set(topDocuments.map((doc) => doc.data.category)),
      ],
    });
  } catch (err) {
    console.error("Error communicating with Cohere API:", err);
    res.status(500).json({ error: "Cohere request failed" });
  }
});

/**
 * Health check endpoint - returns server status and basic metrics
 * Useful for monitoring, load balancers, and debugging
 */
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    documentsLoaded: cachedDocuments.length, // Number of documents in memory
    timestamp: new Date().toISOString(), // Current server time
  });
});

/**
 * Statistics endpoint - returns detailed information about the knowledge base
 * Useful for administrators and debugging
 */
app.get("/stats", (req, res) => {
  // Calculate document distribution by category
  const categoryStats = cachedDocuments.reduce((acc, doc) => {
    acc[doc.data.category] = (acc[doc.data.category] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalDocuments: cachedDocuments.length, // Total number of documents
    categoriesCount: Object.keys(categoryStats).length, // Number of different categories
    categoryBreakdown: categoryStats, // Documents per category
  });
});

// ============================================================================
// VERCEL SERVERLESS EXPORT
// ============================================================================

// For Vercel serverless deployment
export default app;

// ============================================================================
// LOCAL DEVELOPMENT SERVER (only runs when not in Vercel)
// ============================================================================

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log("📚 Loading comprehensive culinary knowledge base...");
    console.log("💡 Endpoints available:");
    console.log("   POST /prompt  - Main chat interface");
    console.log("   GET  /health  - Server health check");
    console.log("   GET  /stats   - Knowledge base statistics");
    console.log(`🍳 CulinaryGPT Server listening on http://localhost:${PORT}`);
  });
}

// ============================================================================
// ARCHITECTURE NOTES
// ============================================================================

/*
RAG (Retrieval-Augmented Generation) Architecture:

1. INDEXING PHASE (Startup):
   - Load culinary documents from JSON files
   - Convert documents to vector embeddings using Cohere
   - Store embeddings for fast retrieval

2. RETRIEVAL PHASE (Per Query):
   - Convert user query to vector embedding
   - Find most similar document embeddings using cosine similarity
   - Select top-K most relevant documents

3. GENERATION PHASE (Per Query):
   - Provide retrieved documents as context to AI model
   - Generate response grounded in retrieved knowledge
   - Return response with citations and metadata

Benefits:
- Provides accurate, domain-specific responses
- Reduces hallucination by grounding in verified content
- Maintains up-to-date knowledge through document updates
- Scales to large knowledge bases efficiently

Performance Optimizations:
- Batch embedding generation to respect API limits
- Cache embeddings to disk to avoid re-computation
- Use cosine similarity for fast vector search
- Limit context to top-K documents for response quality

Vercel Optimizations:
- Serverless function export for deployment
- Reduced rate limiting delays
- Path utilities for cross-platform compatibility
- Initialization guards to prevent race conditions
*/
