'use client'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface ScriptStep {
  action: string
  selector: string
  value?: string
}

interface Script {
  url: string
  credentials: {
    username: string
    password: string
  }
  steps: ScriptStep[]
}

interface RecordingState {
  recording: boolean
  recordingUrl: string
  isLoading: boolean
  error: string | null
  script: Script | null
  scriptRunning: boolean
}

export default function ScreenRecordingPage() {
  const [recording, setRecording] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [script, setScript] = useState<Script | null>(null)
  const [scriptRunning, setScriptRunning] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const recordedChunks = useRef<Blob[]>([])
  const { toast } = useToast()
  const { data: session, status } = useSession()

  // Cleanup media resources
  useEffect(() => {
    return () => {
      if (mediaRecorder.current) {
        mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
      }
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl)
      }
    }
  }, [recordingUrl])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session?.user?.id) {
    return <div>Please sign in to access screen recording</div>
  }

  const executeScript = async () => {
    if (!script || !session?.user?.id) return
    
    try {
      setScriptRunning(true)
      setIsLoading(true)
      
      const response = await fetch(`/api/users/${session.user.id}/scripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(script)
      })
      
      if (!response.ok) {
        throw new Error('Failed to execute script')
      }
      
      // Start recording after successful script execution
      await startRecording()
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to execute script',
        variant: 'destructive'
      })
    } finally {
      setScriptRunning(false)
      setIsLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })
      
      mediaRecorder.current = new MediaRecorder(stream)
      mediaRecorder.current.ondataavailable = handleDataAvailable
      mediaRecorder.current.onstop = handleStop
      mediaRecorder.current.start()
      setRecording(true)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to start recording',
        variant: 'destructive'
      })
    }
  }

  const handleDataAvailable = (e: BlobEvent) => {
    if (e.data.size > 0) {
      recordedChunks.current.push(e.data)
    }
  }

  const handleStop = async () => {
    if (!mediaRecorder.current) return
    
    const blob = new Blob(recordedChunks.current, {
      type: 'video/webm'
    })
    
    const url = URL.createObjectURL(blob)
    setRecordingUrl(url)
    setRecording(false)
    
    try {
      const formData = new FormData()
      formData.append('file', blob, `recording_${Date.now()}.webm`)
      
      const uploadResponse = await fetch(`/api/users/${session.user.id}/recordings/upload`, {
        method: 'POST',
        body: formData
      })
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload recording')
      }
      
      const { driveUrl } = await uploadResponse.json()
      await saveRecording(driveUrl)
      
      toast({
        title: 'Success',
        description: 'Recording uploaded successfully',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to upload recording',
        variant: 'destructive'
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop()
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const saveRecording = async (driveUrl: string) => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch(`/api/users/${session.user.id}/recordings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driveUrl })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save recording')
      }
    } catch (err) {
      console.error('Error saving recording:', err)
      throw err
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Screen Recording</h1>
      
      <div className="space-y-4 mb-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Script Configuration</h2>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Enter script JSON"
            onChange={(e) => {
              try {
                setScript(JSON.parse(e.target.value))
              } catch {
                setScript(null)
              }
            }}
          />
        </div>

        <div className="space-x-4">
          <Button 
            onClick={executeScript}
            disabled={!script || scriptRunning}
          >
            {scriptRunning ? 'Executing Script...' : 'Execute Script'}
          </Button>
          <Button 
            onClick={startRecording}
            disabled={recording || scriptRunning}
          >
            Start Recording
          </Button>
          <Button 
            onClick={stopRecording}
            disabled={!recording}
            variant="destructive"
          >
            Stop Recording
          </Button>
        </div>
      </div>

      {recordingUrl && (
        <video 
          src={recordingUrl} 
          controls 
          className="w-full max-w-2xl"
        />
      )}
    </div>
  )
}
