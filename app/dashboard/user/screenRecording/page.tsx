"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const ScriptExecutor = () => {
  const [queries, setQueries] = useState("");
  const [url, setUrl] = useState("");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [generatedScript, setGeneratedScript] = useState("");
  const [executionStatus, setExecutionStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const parseQueries = (queryString: string) => {
    const matches = queryString.match(/(\w+):\s*`{([^`]+)}`/g);
    if (!matches) return {};

    const queries: Record<string, string> = {};
    matches.forEach((match) => {
      const [queryName, queryContent] = match.split(/:\s*`/);
      queries[queryName.trim()] = queryContent.slice(0, -1);
    });
    return queries;
  };

  const generateScript = () => {
    setIsGenerating(true);
    try {
      const parsedQueries = parseQueries(queries);
      // Store script logic as a string without require statements
      const scriptLogic = `
// Script configuration
const QUERIES = ${JSON.stringify(parsedQueries, null, 2)};
const CONFIG = {
  url: '${url}',
  credentials: ${JSON.stringify(credentials)}
};

// Main automation logic
async function executeAutomation(page) {
  try {
    await page.goto(CONFIG.url);
    console.log('✓ Navigation completed');

    ${
      credentials.email && credentials.password
        ? `
    // Handle login
    const loginElements = await page.queryElements(QUERIES.LOGIN_FORM);
    if (loginElements?.login_form) {
      console.log('✓ Found login form elements');
      await loginElements.login_form.email_input.fill(CONFIG.credentials.email);
      await page.waitForTimeout(1000);
      await loginElements.login_form.password_input.fill(CONFIG.credentials.password);
      await page.waitForTimeout(1000);
      await loginElements.login_form.login_button.click();
      await page.waitForNavigation();
      console.log('✓ Login completed');
    }`
        : ""
    }

    // Handle main automation steps
    ${Object.keys(parsedQueries)
      .map((queryName) => {
        if (queryName === "LOGIN_FORM") return "";
        return `
    console.log('Executing ${queryName} steps...');
    const ${queryName.toLowerCase()}Elements = await page.queryElements(QUERIES["${queryName}"]);
    if (${queryName.toLowerCase()}Elements) {
      console.log('Found ${queryName} elements:', ${queryName.toLowerCase()}Elements);
    }`;
      })
      .join("\n")}

    console.log('✓ Automation completed successfully');
    return { success: true, message: 'Automation completed successfully' };

  } catch (error) {
    console.error('Error during automation:', error);
    return { success: false, message: error.message };
  }
}`;

      setGeneratedScript(scriptLogic);
      setExecutionStatus("Script generated successfully. Ready for execution.");
    } catch (error: any) {
      setExecutionStatus("Error generating script: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const executeScript = async () => {
    setIsExecuting(true);
    setExecutionStatus("Executing script...");

    console.log("This is the generated script");

    try {
      const response = await fetch("/api/execute-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          queries: parseQueries(queries),
          credentials,
          script: generatedScript,
        }),
      });

      if (!response.ok) {
        console.log(
          "This is api response after execution error->>>>",
          response
        );
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      setExecutionStatus(result?.message || "Script executed successfully!");
    } catch (error: any) {
      console.error("Execution error:", error);
      setExecutionStatus(`Execution error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const copyScriptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript);
      setExecutionStatus("Script copied to clipboard!");
    } catch (err) {
      setExecutionStatus("Failed to copy script. Please copy manually.");
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
            <label className="block text-sm font-medium mb-2">
              Website URL
            </label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Login Email
              </label>
              <Input
                value={credentials.email}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Enter login email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Login Password
              </label>
              <Input
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                placeholder="Enter login password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              AI-Generated Queries
            </label>
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
              ) : (
                "Parse & Generate Script"
              )}
            </Button>

            <Button
              onClick={()=>{
                console.log("Executing script->>");
                executeScript();
              }}
              disabled={isExecuting || !generatedScript}
              className="flex-1"
              variant="default"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing Script...
                </>
              ) : (
                "Execute Script"
              )}
            </Button>

            {generatedScript && (
              <Button
                onClick={copyScriptToClipboard}
                className="flex-1"
                variant="outline"
              >
                Copy Script to Clipboard
              </Button>
            )}
          </div>

          {executionStatus && (
            <Alert>
              <AlertDescription>{executionStatus}</AlertDescription>
            </Alert>
          )}

          {generatedScript && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Generated Script
              </label>
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
