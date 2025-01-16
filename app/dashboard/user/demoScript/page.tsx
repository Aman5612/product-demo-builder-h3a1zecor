"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { LoaderCircle, Plus, Trash, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from "@/lib/api";


interface Script {
  id: number;
  content: string;
  createdAt: string;
}

const DemoScriptPage = () => {
  const { data: session } = useSession();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [editScriptId, setEditScriptId] = useState<number | null>(null);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/users/${session?.user?.id}/scripts`);
      if (response.data?.data) {
        setScripts(response.data.data);
      } else {
        toast.error("No scripts found");
        setScripts([]);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 
          error.response?.data?.error ||
          "Failed to fetch scripts";
        toast.error(errorMessage);
      } else {
        console.error(error);
        toast.error("An unexpected error occurred while fetching scripts");
      }
      setScripts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchScripts();
    }
  }, [session]);

  const handleSaveScript = async () => {
    try {
      if (!content.trim()) {
        toast.error("Script content cannot be empty");
        return;
      }

      setLoading(true);
      const payload = { content };
      let response;
      
      if (editScriptId) {
        response = await api.patch(
          `/api/users/${session?.user?.id}/scripts/${editScriptId}`,
          payload
        );
        toast.success(response.data?.message || "Script updated successfully");
      } else {
        response = await api.post(
          `/api/users/${session?.user?.id}/scripts`, 
          payload
        );
        toast.success(response.data?.message || "Script saved successfully");
      }

      setContent("");
      setEditScriptId(null);
      await fetchScripts();
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 
          error.response?.data?.error ||
          "Something went wrong";
        toast.error(errorMessage);
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScript = async (scriptId: number) => {
    try {
      setLoading(true);
      const response = await api.delete(
        `/api/users/${session?.user?.id}/scripts/${scriptId}`
      );
      toast.success(response.data?.message || "Script deleted successfully");
      await fetchScripts();
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 
          error.response?.data?.error ||
          "Failed to delete script";
        toast.error(errorMessage);
      } else {
        console.error(error);
        toast.error("An unexpected error occurred while deleting script");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Demo Scripts</h2>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Script</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content}
            onChange={(e: any) => setContent(e.target.value)}
            placeholder="Enter your script content..."
            className="min-h-[200px]"
          />
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSaveScript}
            disabled={loading || !content.trim()}
            className="w-full"
          >
            {loading ? (
              <LoaderCircle className="animate-spin" />
            ) : editScriptId ? (
              "Update Script"
            ) : (
              "Save Script"
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        {scripts?.map((script) => (
          <Card key={script?.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Script #{script?.id}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setContent(script?.content);
                      setEditScriptId(script?.id);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the script.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteScript(script?.id)}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{script?.content}</p>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Created at: {new Date(script?.createdAt).toLocaleString()}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DemoScriptPage;
