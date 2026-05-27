import { useState, useRef } from 'react';
import { Mic, MicOff, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function VoiceNoteRecorder({ contactId, onNoteSaved }) {
  const [state, setState] = useState('idle'); // idle | recording | processing | done
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = e => chunksRef.current.push(e.data);
    recorder.onstop = processAudio;
    mediaRef.current = recorder;
    recorder.start();
    setState('recording');
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    mediaRef.current?.stream?.getTracks().forEach(t => t.stop());
    setState('processing');
  };

  const processAudio = async () => {
    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const text = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
      setTranscript(text);

      const { note_summary } = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarise this voice note / call note for a publishing CRM. Keep it concise (2-4 sentences), professional, and action-focused. Highlight any client requests, decisions made, or next steps mentioned.\n\nTranscript: "${text}"`,
        response_json_schema: { type: 'object', properties: { note_summary: { type: 'string' } } },
      });
      setSummary(note_summary || text);
      setState('done');
    } catch (err) {
      toast.error('Transcription failed: ' + err.message);
      setState('idle');
    }
  };

  const saveNote = async () => {
    if (!summary && !transcript) return;
    await base44.entities.Note.create({
      contact_id: contactId,
      content: `Voice Note (AI Summary):\n\n${summary}\n\n---\nFull Transcript:\n${transcript}`,
      note_type: 'call',
    });
    toast.success('Voice note saved to client profile');
    setTranscript('');
    setSummary('');
    setState('idle');
    onNoteSaved?.();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">Voice Note</p>
        <span className="text-xs text-gray-400">Recorded then AI transcribed then saved to client</span>
      </div>

      {state === 'idle' && (
        <button onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B87333] hover:bg-[#A06828] text-white rounded-xl text-sm font-semibold transition-colors w-full justify-center">
          <Mic className="w-4 h-4" /> Start Recording
        </button>
      )}

      {state === 'recording' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recording in progress...
          </div>
          <button onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors w-full justify-center">
            <MicOff className="w-4 h-4" /> Stop and Transcribe
          </button>
        </div>
      )}

      {state === 'processing' && (
        <div className="flex items-center justify-center gap-3 py-4 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin text-[#B87333]" />
          <span className="text-sm">Transcribing and summarising with AI...</span>
        </div>
      )}

      {state === 'done' && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-amber-700 mb-1">AI Summary</p>
            <p className="text-sm text-amber-900">{summary}</p>
          </div>
          <details className="text-xs text-gray-400 cursor-pointer">
            <summary className="hover:text-gray-600">View full transcript</summary>
            <p className="mt-2 bg-gray-50 rounded-lg p-2 whitespace-pre-wrap text-gray-600">{transcript}</p>
          </details>
          <div className="flex gap-2">
            <button onClick={saveNote}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors">
              <CheckCircle className="w-4 h-4" /> Save to Client Notes
            </button>
            <button onClick={() => { setTranscript(''); setSummary(''); setState('idle'); }}
              className="px-3 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Trash2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}