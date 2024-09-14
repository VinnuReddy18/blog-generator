require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createEmbedding, searchSimilarDocs } = require('./embeddingUtils');
const trainingData = require('./trainingData');

const app = express();
app.use(cors());  // Add this line
app.use(express.json());

const CLOUDFLARE_API_ENDPOINT = process.env.CLOUDFLARE_API_ENDPOINT;
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;

const highQualityBlogs = [
  `Title: The Future of Artificial Intelligence: Transforming Industries and Everyday Life

Introduction:
Artificial Intelligence (AI) has become one of the most transformative technologies of our time. From voice assistants to autonomous vehicles, AI is reshaping industries and changing the way we live and work. In this blog post, we'll explore the current state of AI, its potential future applications, and the impact it may have on various sectors.

1. Current State of AI
AI has made significant strides in recent years, with advancements in machine learning, natural language processing, and computer vision. Today, AI powers recommendation systems, chatbots, and predictive analytics tools used by businesses worldwide.

2. AI in Healthcare
One of the most promising applications of AI is in healthcare. AI-powered systems can analyze medical images, assist in drug discovery, and even predict patient outcomes. For example, AI algorithms have shown remarkable accuracy in detecting early-stage cancers from medical scans, potentially saving countless lives through early intervention.

3. AI in Finance
The financial sector has embraced AI for fraud detection, algorithmic trading, and personalized banking experiences. AI-driven robo-advisors are democratizing investment management, making it accessible to a broader range of individuals.

4. AI in Transportation
Self-driving cars are perhaps the most visible example of AI in transportation. Companies like Tesla, Waymo, and Uber are investing heavily in autonomous vehicle technology, which has the potential to revolutionize personal and public transportation, reducing accidents and improving efficiency.

5. Ethical Considerations
As AI becomes more prevalent, it's crucial to address ethical concerns such as bias in AI algorithms, data privacy, and the potential impact on employment. Developing responsible AI practices and regulations will be essential for ensuring that the benefits of AI are distributed equitably.

Conclusion:
The future of AI is bright and full of possibilities. As the technology continues to evolve, we can expect to see even more innovative applications across industries. From healthcare to finance, transportation to education, AI has the potential to solve complex problems and improve our quality of life in countless ways.

Call-to-Action:
Stay informed about AI developments and consider how this technology might impact your industry or daily life. Engage in discussions about the ethical implications of AI and support initiatives that promote responsible AI development. The future of AI is being shaped today, and your voice matters in determining how this powerful technology will be used to benefit society.`,
  // Add more high-quality blog examples here
];

app.post('/generate-blog', async (req, res) => {
  const { keywords, context } = req.body;
  
  // Select a random high-quality blog as an example
  const exampleBlog = highQualityBlogs[Math.floor(Math.random() * highQualityBlogs.length)];

  const prompt = `Generate a high-quality blog post about ${keywords}. Context: ${context}

  Please include the following elements in the blog post:
  1. An attention-grabbing title
  2. An engaging introduction
  3. Well-structured main content with subheadings
  4. Relevant examples or case studies
  5. A conclusion that summarizes the main points
  6. A call-to-action for readers

  Here's an example of a high-quality blog post for reference:
  ${exampleBlog}

  Now, generate a new blog post in a similar style:`;

  try {
    const response = await fetch(CLOUDFLARE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 1000
      })
    });

    if (response.ok) {
      const data = await response.json();
      res.json({ blog: data.result.response });
    } else {
      res.status(500).json({ error: 'Failed to generate blog' });
    }
  } catch (error) {
    console.error('Error generating blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  
  try {
    console.log('Received prompt:', prompt);

    const aiPrompt = `
      You are an AI trained to write high-quality blog posts in Markdown format. Write a completely new and original blog post on the following topic:

      ${prompt}

      Follow these steps to create a wonderful blog post:

      1. Choose a Compelling Topic: Ensure the topic is specific and resonates with the audience.
      2. Understand Your Audience: Adjust tone and style to suit the target readers.
      3. Create an Outline: Include a clear introduction, body with subheadings, and conclusion with a call to action.
      4. Craft a Captivating Headline: Make it catchy, informative, and concise.
      5. Write a Strong Introduction: Hook the reader and clearly state the purpose of the post.
      6. Develop the Body with Engaging Content: Use subheadings, examples, and a conversational tone.
      7. Incorporate Visuals: Suggest relevant images or infographics that could enhance the post (use Markdown image syntax).
      8. Optimize for SEO: Include relevant keywords naturally throughout the post.
      9. Write a Memorable Conclusion: Summarize main points and include a call to action.
      10. Format for Readability: Use Markdown syntax for headings, lists, emphasis, and other formatting.

      Generate a unique, informative, and engaging blog post now, following these guidelines and using proper Markdown syntax:
    `;
    
    const response = await fetch(CLOUDFLARE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: aiPrompt,
        max_tokens: 1000
      })
    });

    if (response.ok) {
      const data = await response.json();
      res.json({ generatedText: data.result.response });
    } else {
      const errorData = await response.json();
      console.error('Cloudflare API error:', errorData);
      res.status(500).json({ error: 'Failed to generate blog post', details: errorData });
    }
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: 'An error occurred while generating the blog post.', details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));