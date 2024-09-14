require('dotenv').config();

const CLOUDFLARE_API_ENDPOINT = process.env.CLOUDFLARE_API_ENDPOINT;
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;

async function createEmbedding(text) {
  const response = await fetch(CLOUDFLARE_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: [text]
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create embedding');
  }

  const data = await response.json();
  return data.result.data[0];
}

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function searchSimilarDocs(queryEmbedding, documents, topK = 3) {
  const similarities = await Promise.all(
    documents.map(async (doc) => {
      const docEmbedding = await createEmbedding(doc.content);
      return {
        ...doc,
        similarity: cosineSimilarity(queryEmbedding, docEmbedding),
      };
    })
  );
  
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

module.exports = { createEmbedding, searchSimilarDocs };