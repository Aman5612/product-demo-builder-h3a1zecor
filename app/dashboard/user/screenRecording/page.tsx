"use client";
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const parseAutomationScript = (aiResponse, url, credentials) => {
  // Helper to convert GraphQL-style queries to executable Playwright commands
  const convertQueryToCommands = (queryString) => {
    const commands = [];
    
    // Extract selector and action patterns
    const selectorPattern = /selector:\s*['"]([^'"]+)['"]/g;
    const actionPattern = /(value|click):\s*["']([^"']*)['"]/g;
    
    let match;
    
    while ((match = selectorPattern.exec(queryString)) !== null) {
      const selector = match[1];
      actionPattern.lastIndex = match.index;
      const actionMatch = actionPattern.exec(queryString);
      
      if (actionMatch) {
        const [_, action, value] = actionMatch;
        if (action === 'value') {
          commands.push({
            type: 'fill',
            selector,
            value
          });
        } else if (action === 'click') {
          commands.push({
            type: 'click',
            selector
          });
        }
      }
    }
    
    return commands;
  };

  // Generate executable script from commands
  const generateExecutableScript = (queries) => {
    const script = `
const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the website
    await page.goto('${url}');
    console.log('✓ Navigation completed');

    ${credentials.email && credentials.password ? `
    // Handle login
    await page.waitForTimeout(2000);
    await page.fill('input[type="email"]', '${credentials.email}');
    await page.waitForTimeout(1000);
    await page.fill('input[type="password"]', '${credentials.password}');
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    console.log('✓ Login completed');
    ` : ''}

    // Execute commands
    ${queries.map(query => {
      const commands = convertQueryToCommands(query);
      return commands.map(cmd => {
        if (cmd.type === 'fill') {
          return `
    await page.waitForSelector('${cmd.selector}');
    await page.fill('${cmd.selector}', '${cmd.value}');
    await page.waitForTimeout(1000);`;
        } else if (cmd.type === 'click') {
          return `
    await page.waitForSelector('${cmd.selector}');
    await page.click('${cmd.selector}');
    await page.waitForTimeout(1000);`;
        }
      }).join('\n');
    }).join('\n')}

    console.log('✓ Automation completed successfully');

  } catch (error) {
    console.error('Error during automation:', error);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);`;
    return script;
  };

  // Extract queries from AI response
  const queryMatches = aiResponse.match(/`{([^`]+)}`/g);
  if (!queryMatches) {
    throw new Error('No valid queries found in AI response');
  }

  const queries = queryMatches.map(q => q.replace(/^`{|}`$/g, ''));
  return generateExecutableScript(queries);
};

const ScriptExecutor = () => {
  const [queries, setQueries] = useState('');
  const [url, setUrl] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [generatedScript, setGeneratedScript] = useState('');
  const [executionStatus, setExecutionStatus] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const generateScript = () => {
    setIsGenerating(true);
    try {
      const script = parseAutomationScript(queries, url, credentials);
      setGeneratedScript(script);
      setExecutionStatus('Script generated and parsed successfully');
    } catch (error) {
      setExecutionStatus('Error generating script: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const executeScript = async () => {
    setIsExecuting(true);
    setExecutionStatus('Executing script...');

    try {
      // In a real implementation, you would need to:
      // 1. Send the script to a backend service
      // 2. Have the service execute it in a controlled environment
      // 3. Stream back the results
      const response = await fetch('/api/execute-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: generatedScript })
      });

      if (!response.ok) {
        throw new Error('Script execution failed');
      }

      const result = await response.json();
      setExecutionStatus('Script execution completed: ' + result.message);
    } catch (error) {
      setExecutionStatus('Error executing script: ' + error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AgentQL Script Executor</CardTitle>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Login Email</label>
              <Input
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter login email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Login Password</label>
              <Input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter login password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">AI-Generated Queries</label>
            <Textarea
              value={queries}
              onChange={(e) => setQueries(e.target.value)}
              placeholder="Paste the AI-generated queries here"
              className="w-full h-40 font-mono text-sm"
            />
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={generateScript}
              disabled={isGenerating || !queries || !url}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing & Generating...
                </>
              ) : 'Parse & Generate Script'}
            </Button>

            <Button
              onClick={executeScript}
              disabled={isExecuting || !generatedScript}
              className="flex-1"
              variant="outline"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : 'Execute Script'}
            </Button>
          </div>

          {executionStatus && (
            <Alert>
              <AlertDescription>{executionStatus}</AlertDescription>
            </Alert>
          )}

          {generatedScript && (
            <div>
              <label className="block text-sm font-medium mb-2">Generated Executable Script</label>
              <Textarea
                value={generatedScript}
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

export default ScriptExecutor;