"use client";
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const StepToQueryConverter = () => {
  const [url, setUrl] = useState('');
  const [steps, setSteps] = useState('');
  const [generatedQueries, setGeneratedQueries] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generatePrompt = (url:string, steps:any) => {
    return `Given this website URL: ${url}
    
And these steps to automate:
${steps}

Generate AgentQL queries following these rules:
1. Create separate queries for different pages/sections
2. Include proper element selectors that will be visible at that step
3. Consider parent-child relationships for elements that appear after clicking others
4. Use clear, descriptive names for query fields
5. Format as a JavaScript object with named queries

Example format:
{
  LOGIN_FORM: \`{
    login_form {
      email_input
      password_input
      login_button
    }
  }\`
}`;
  };

  const generateQueries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://opengig-mvp-dev.openai.azure.com/openai/deployments/gpt-4o-mvp-dev/chat/completions?api-version=2024-02-15-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': 'c41e9ded584f4593a1046dc46026e81f'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert at converting user steps into AgentQL queries. Consider element visibility and proper wait times between actions.'
            },
            {
              role: 'user',
              content: generatePrompt(url, steps)
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      // Format the response
      const formattedQueries = `const QUERIES = ${generatedContent};\n\n` +
        `// Example usage with playwright:\n` +
        `async function automateSteps(page) {\n` +
        `  // Remember to add proper wait times between actions\n` +
        `  await page.waitForTimeout(2000);\n` +
        `  const elements = await page.queryElements(QUERIES.SOME_QUERY);\n` +
        `  // Continue with your automation steps\n` +
        `}`;

      setGeneratedQueries(formattedQueries);
    } catch (error) {
      console.error('Error generating queries:', error);
      setGeneratedQueries('Error generating queries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Step to AgentQL Query Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Website URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Steps to Automate</label>
            <Textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="Enter steps to automate (one per line)"
              className="w-full h-40"
            />
          </div>

          <Button
            onClick={generateQueries}
            disabled={isLoading || !url || !steps}
            className="w-full"
          >
            {isLoading ? 'Generating...' : 'Generate Queries'}
          </Button>

          {generatedQueries && (
            <div>
              <label className="block text-sm font-medium mb-2">Generated Queries</label>
              <Textarea
                value={generatedQueries}
                readOnly
                className="w-full h-96 font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StepToQueryConverter;