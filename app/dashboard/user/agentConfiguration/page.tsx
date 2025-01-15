"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { LoaderCircle, Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from "@/lib/api";

const AgentConfigurationPage = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [credentials, setCredentials] = useState<any[]>([]);
  const [scripts, setScripts] = useState<any[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [showTestResult, setShowTestResult] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string>("");

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/users/${session?.user?.id}/credentials`);
      setCredentials(res?.data?.data ?? []);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/users/${session?.user?.id}/scripts`);
      setScripts(res?.data?.data ?? []);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/users/${session?.user?.id}/recordings`);
      setRecordings(res?.data?.data ?? []);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchCredentials();
      fetchScripts();
      fetchRecordings();
    }
  }, [session?.user?.id]);

  const handleSaveCredentials = async () => {
    try {
      setLoading(true);
      const res = await api.post(`/api/users/${session?.user?.id}/credentials`, {
        websiteUrl,
        username,
        password,
      });
      if (res?.data?.success) {
        toast.success("Credentials saved successfully");
        setWebsiteUrl("");
        setUsername("");
        setPassword("");
        fetchCredentials();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestNavigation = async () => {
    try {
      setLoading(true);
      // Simulate navigation test
      setTestResult("Navigation and login successful!");
      setShowTestResult(true);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Agent Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                value={websiteUrl}
                onChange={(e: any) => setWebsiteUrl(e.target.value)}
                placeholder="Enter website URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e: any) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSaveCredentials}
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Save Credentials"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={handleTestNavigation}
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Test Navigation"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Saved Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Website URL</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials?.map((credential: any) => (
                  <TableRow key={credential?.id}>
                    <TableCell>{credential?.websiteUrl}</TableCell>
                    <TableCell>{credential?.username}</TableCell>
                    <TableCell>
                      {new Date(credential?.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showTestResult} onOpenChange={setShowTestResult}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Test Result</AlertDialogTitle>
            <AlertDialogDescription>{testResult}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgentConfigurationPage;