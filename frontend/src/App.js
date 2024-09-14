import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import './App.css'; // We'll create this file for styling

function App() {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState('markdown');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/generate', { prompt });      
      setGeneratedText(response.data.generatedText);
    } catch (error) {
      console.error('Error:', error);
      setGeneratedText('An error occurred while generating the blog post.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (format) {
      case 'html':
        return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generatedText) }} />;
      case 'markdown':
        return <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedText}</ReactMarkdown>;
      case 'text':
        return <pre>{generatedText}</pre>;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <h1>AI-Powered Blog Generator</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your blog topic or idea..."
          rows={4}
          cols={50}
        />
        <br />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Blog Post'}
        </button>
      </form>
      {generatedText && (
        <div className="blog-post">
          <h2>Generated Blog Post:</h2>
          <div className="format-selector">
            <label>
              <input
                type="radio"
                value="markdown"
                checked={format === 'markdown'}
                onChange={() => setFormat('markdown')}
              />
              Markdown
            </label>
            <label>
              <input
                type="radio"
                value="html"
                checked={format === 'html'}
                onChange={() => setFormat('html')}
              />
              HTML
            </label>
            <label>
              <input
                type="radio"
                value="text"
                checked={format === 'text'}
                onChange={() => setFormat('text')}
              />
              Plain Text
            </label>
          </div>
          {renderContent()}
        </div>
      )}
    </div>
  );
}

export default App;