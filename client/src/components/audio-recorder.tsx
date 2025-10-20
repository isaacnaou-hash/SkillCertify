import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Play, Pause, Square } from "lucide-react";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number; // in seconds
}

export default function AudioRecorder({ onRecordingComplete, maxDuration = 120 }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Cross-browser MIME type detection for production use
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Safari/iOS fallback
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else {
          throw new Error('No supported audio format found for this browser');
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(100); // Collect 100ms chunks
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.ontimeupdate = () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="audio-recorder">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold">
            {isRecording ? "Recording..." : audioBlob ? "Recording Complete" : "Ready to Record"}
          </div>
          
          <div className="text-2xl font-mono">
            {formatTime(duration)}
            {maxDuration && (
              <span className="text-sm text-muted-foreground ml-2">
                / {formatTime(maxDuration)}
              </span>
            )}
          </div>

          <div className="flex justify-center gap-2">
            {!isRecording && !audioBlob && (
              <Button 
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white"
                data-testid="button-start-recording"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            )}

            {isRecording && (
              <Button 
                onClick={stopRecording}
                variant="destructive"
                data-testid="button-stop-recording"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}

            {audioBlob && !isRecording && (
              <>
                <Button 
                  onClick={playAudio}
                  disabled={isPlaying}
                  variant="outline"
                  data-testid="button-play-recording"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
                
                <Button 
                  onClick={pauseAudio}
                  disabled={!isPlaying}
                  variant="outline"
                  data-testid="button-pause-recording"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>

                <Button 
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl("");
                    setDuration(0);
                    setCurrentTime(0);
                  }}
                  variant="outline"
                  data-testid="button-restart-recording"
                >
                  <MicOff className="w-4 h-4 mr-2" />
                  Record Again
                </Button>
              </>
            )}
          </div>

          {audioBlob && (
            <div className="mt-4">
              <audio 
                ref={audioRef} 
                src={audioUrl} 
                className="w-full"
                onLoadedMetadata={() => {
                  if (audioRef.current) {
                    setDuration(audioRef.current.duration);
                  }
                }}
              />
              
              {isPlaying && (
                <div className="text-sm text-muted-foreground mt-2">
                  Playing: {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Maximum recording time: {formatTime(maxDuration)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}