"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { LoaderCircle, Play, StopCircle, Download, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from "@/lib/api";

const ScreenRecordingPage = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [googleDriveToken, setGoogleDriveToken] = useState<string>("");

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/users/${session?.user?.id}/recordings`);
      setRecordings(res.data.data);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      const res = await api.post(`/api/users/${session?.user?.id}/recordings`, {
        googleDriveAccessToken: googleDriveToken,
      });
      toast.success("Recording started successfully!");
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Failed to start recording");
      } else {
        console.error(error);
        toast.error("Failed to start recording");
      }
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      toast.success("Recording stopped successfully!");
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Failed to stop recording");
      } else {
        console.error(error);
        toast.error("Failed to stop recording");
      }
    }
  };

  const deleteRecording = async (recordingId: string) => {
    try {
      await api.delete(
        `/api/users/${session?.user?.id}/recordings/${recordingId}`
      );
      toast.success("Recording deleted successfully!");
      fetchRecordings();
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Failed to delete recording");
      } else {
        console.error(error);
        toast.error("Failed to delete recording");
      }
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchRecordings();
    }
  }, [session]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Screen Recordings</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recording Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleDriveToken">Google Drive Access Token</Label>
              <Input
                id="googleDriveToken"
                value={googleDriveToken}
                onChange={(e: any) => setGoogleDriveToken(e.target.value)}
                placeholder="Enter Google Drive access token"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={startRecording}
                disabled={isRecording || !googleDriveToken}
              >
                {isRecording ? (
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isRecording ? "Recording..." : "Start Recording"}
              </Button>
              <Button
                onClick={stopRecording}
                disabled={!isRecording}
                variant="destructive"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recordings List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recording</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recordings?.map((recording: any) => (
                <TableRow key={recording.id}>
                  <TableCell>
                    <a
                      href={recording.googleDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {recording.googleDriveUrl}
                    </a>
                  </TableCell>
                  <TableCell>
                    {new Date(recording.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(recording.googleDriveUrl, "_blank")
                        }
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure you want to delete this recording?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the recording from Google Drive.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteRecording(recording.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreenRecordingPage;