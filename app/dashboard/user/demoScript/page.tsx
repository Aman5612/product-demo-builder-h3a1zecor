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

  const generatePrompt = (url: string, steps: string) => {
    return `Given this website URL: ${url}
    
And these steps to automate:
${steps}

Generate AgentQL queries following this EXACT structure without any deviation:

const QUERIES = {
  LOGIN_FORM: \`{
    login_form {
      email_input
      password_input
      login_button
    }
  }\`,

  DASHBOARD: \`{
    create_test_button
    test_table {
      test_row(JSM) {
        action_button
      }
    }
    action_popup {
      view_option_button
      edit_option_button
    }
  }\`
};

IMPORTANT RULES:
1. Follow the EXACT format shown above - do not add any selector attributes, fill(), click(), or other methods
2. Use simple field names without any parentheses or attributes
3. Use proper indentation with 2 spaces
4. Organize queries by page/section with clear names in UPPERCASE
5. Use nested objects to represent parent-child relationships
6. Do not include any implementation details like selectors or actions
7. Keep field names simple and descriptive (e.g., email_input, not email_input_field)
8. Start the response with "const QUERIES = {"
9. End with "};"
10. Use backticks (\`) for each query string
11. Place commas between multiple queries

Your response should ONLY contain the QUERIES object in the exact format shown above, nothing else.`;
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
              content: 'You are an expert at converting user steps into AgentQL queries. You must follow the exact format provided without any deviation. Do not include any implementation details, selectors, or methods in the queries.'
            },
            {
              role: 'user',
              content: generatePrompt(url, steps)
            }
          ],
          temperature: 0.3, // Reduced temperature for more consistent output
          max_tokens: 2000
        })
      });

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      // No additional formatting needed since we want the exact format
      setGeneratedQueries(generatedContent);
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