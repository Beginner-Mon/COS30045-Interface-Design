# ECA Frontend Integration Spec (Framework Agnostic)

This document describes how to implement the same behavior as the current ECA UI in any frontend framework (React, Vue, Angular, Svelte, Flutter Web, Next.js, Nuxt, etc.).

Source behavior mirrored from:
- ECA_UI/index.html
- ECA_UI/api.js

## 1) Product Behavior to Reproduce

Implement a chat interface with:
- User message send
- Assistant text response that can appear early while motion is still generating
- Optional motion artifact URL (GLB) shown when available
- Optional TTS audio URL playback when available
- Session-based conversation history
- Task-progress UX stages (queued, text_ready, motion_generation, completed, failed)
- Retry motion polling using the same task id

The client must support partial results and asynchronous completion.

## 2) API Base URL Resolution

Use the same priority order:
1. Query parameter api_base
2. Global override window.ECA_API_BASE_URL (or equivalent runtime env override)
3. Local default if hostname is localhost or 127.0.0.1: http://localhost:8000
4. Otherwise: same-origin

Ngrok behavior:
- If UI is hosted via ngrok, prefer same-origin unless api_base override is provided.

## 3) Backend Endpoints Used by ECA UI

Primary answer flow:
- POST /answer
- GET /answer/status/{request_id}

Session APIs:
- POST /sessions
- GET /sessions/{user_id}
- GET /sessions/{user_id}/{session_id}
- DELETE /sessions/{user_id}/{session_id}

Session endpoint meaning:
- Create session: POST /sessions
- Continue existing session: send session_id in POST /answer payload
- Load existing session detail: GET /sessions/{user_id}/{session_id}
- Delete session: DELETE /sessions/{user_id}/{session_id}

History API:
- GET /history/{user_id}

Motion artifact URL consumed by frontend:
- /download/{filename} (already returned in payload as motion_file_url or nested motion url)

## 4) Request Payloads

### 4.1 Submit query
POST /answer

Body:
- query: string (required)
- user_id: string (required)
- session_id: string (optional)

Example:
{
  "query": "Show me a shoulder stretch",
  "user_id": "user_123",
  "session_id": "abc-session-id"
}

## 4.2 Session API payloads

Create session request (POST /sessions):
{
  "user_id": "user_123"
}

Create session response (typical):
{
  "session_id": "uuid-or-id",
  "user_id": "user_123",
  "title": "New conversation",
  "created_at": "ISO-8601 timestamp"
}

List sessions response (GET /sessions/{user_id}):
[
  {
    "session_id": "uuid-or-id",
    "title": "Session title",
    "created_at": "ISO-8601 timestamp",
    "updated_at": "ISO-8601 timestamp",
    "message_count": 4,
    "is_summarized": false
  }
]

Get single session response (GET /sessions/{user_id}/{session_id}):
{
  "session_id": "uuid-or-id",
  "title": "Session title",
  "messages": [
    { "role": "user", "content": "...", "timestamp": "..." },
    { "role": "assistant", "content": "...", "timestamp": "..." }
  ]
}

Delete session response (DELETE /sessions/{user_id}/{session_id}):
{
  "deleted": true,
  "session_id": "uuid-or-id",
  "user_id": "user_123"
}

## 5) Response Normalization Contract

Because backend responses can be either direct or nested, normalize to one frontend contract.

Normalized object fields:
- task_id: string | null
- status: processing | completed | failed
- progress_stage: queued | text_ready | motion_generation | completed | failed
- error: string | null
- text_answer: string
- clinical_advice: string
- motion_duration_seconds: number | null
- motion_error: string | null
- tts: object | null
- motion: object | null

Normalized motion object:
- motion_file_url: string
- prompt: string | null
- frames: number | null
- fps: number | null
- duration_seconds: number | null
- stage: string | null

Normalization rules used by current ECA UI:
- If payload has text_answer at root, treat as direct answer payload.
- Else read from payload.result.
- motion_file_url precedence:
  1) result.motion_file_url
  2) result.motion.motion_file_url
  3) result.motion_job.motion_file_url
- prompt precedence:
  1) result.exercise_motion_prompt
  2) result.motion.text_prompt
  3) result.motion_job.selected_candidate.rewritten_prompt
  4) result.motion_job.selected_candidate.text_description
- tts precedence:
  1) result.metadata.tts
  2) root.tts
  3) result.tts

## 5.1 Raw answer/status response format (before normalization)

POST /answer response (common shape):
{
  "request_id": "task-or-request-id",
  "status": "processing | completed | failed",
  "progress_stage": "queued | text_ready | motion_generation | completed | failed",
  "result": {
    "text_answer": "...",
    "clinical_advice": "...",
    "motion_file_url": "/download/file.glb",
    "motion": { "motion_file_url": "...", "fps": 30, "frames": 120 },
    "motion_job": { "job_id": "...", "status": "queued|processing|completed|failed" },
    "tts": { "audio_url": "https://..." },
    "metadata": { "tts": { "audio_url": "https://..." } }
  },
  "error": null
}

GET /answer/status/{request_id} response:
- Same envelope as above, with status/progress updates over time.

## 6) Core Client Flow

Implement this exact sequence.

### 6.1 Send flow
1. Add user message to UI.
2. Add placeholder assistant message.
3. If no active session, create one via POST /sessions.
4. Call POST /answer.
5. If submit response already terminal (completed or failed):
   - Normalize and render immediately.
6. If not terminal:
   - If text_answer missing: poll until text becomes available.
   - Return early to UI with text when available.
   - Continue polling in background until final terminal status.

### 6.2 Polling behavior
- Poll GET /answer/status/{request_id} every 1500 ms.
- Timeout after 600000 ms equivalent polling attempts.
- Retry transient 404 up to 3 times before failing.
- Stop early when text is available if caller requests early text mode.
- Continue background polling to fetch motion and/or final status.

### 6.3 Progress callback behavior
For each polling tick:
- Update active stage
- If text is present, stream/animate into assistant message
- If motion url arrives, update motion panel and message badge
- If motion_error arrives, display warning/error non-blocking

## 7) UI State Machine (Must Match Behavior)

Suggested state flags:
- thinking: boolean
- generatingMotion: boolean
- activeTaskStage: string
- activeTaskId: string | null
- motionError: string

Stage transitions:
- On send: queued, thinking true
- During processing with no text: thinking true
- During motion generation stage: generatingMotion true, thinking false
- On completed: both false
- On failed: both false, show error

## 8) Session and History Behavior

### 8.1 Lazy session creation
- Do not create session on app load.
- Create session only at first message send.

### 8.2 Session list
- Fetch via GET /sessions/{user_id}
- Accept either array response, object with sessions array, or object map fallback.

### 8.3 Load session
- GET /sessions/{user_id}/{session_id}
- Convert backend message records to chat timeline entries.

### 8.4 Delete session
- DELETE /sessions/{user_id}/{session_id}
- Refresh list after deletion.

### 8.5 Optional file-backed history
- GET /history/{user_id}
- Use for older compatibility/history views.

## 9) Error Handling Rules

Submit and poll failures:
- If failure contains partial text, keep text and show motion-specific error.
- If no text exists, show assistant error message.

Network/CORS guidance:
- If same-origin ngrok cannot access API endpoints, allow api_base override.
- Keep user-readable fallback message for CORS/origin mismatch.

Polling timeout:
- Throw error with partial payload if available.
- UI should preserve partial text and expose retry motion action.

## 10) Motion Retry Feature

Implement retry button/function:
1. Requires activeTaskId.
2. Calls polling again on existing task id.
3. Updates motion url/meta if artifact appears.
4. Keeps existing text answer unchanged.

## 11) Audio/TTS Behavior

- If normalized payload contains tts.audio_url, play audio.
- If final payload includes a newer audio_url, replace/replay as needed.
- Audio failure should not fail the entire interaction.

## 12) Minimal Data Types for Other Agents

Use these app-level types (language-agnostic):

ChatMessage:
- id: string | number
- role: user | assistant
- text: string
- time: string
- motion: null | { label: string, motion_file_url: string }
- audioUrl: string | null
- isStreamingText: boolean

AskResult:
- text_answer: string
- clinical_advice: string
- task_id: string
- status: string
- progress_stage: string
- motion: null | MotionInfo
- tts: null | { audio_url: string }
- motion_error: string | null
- finalPromise: Promise<AskResult> | null

MotionInfo:
- motion_file_url: string
- prompt: string | null
- frames: number | null
- fps: number | null
- duration_seconds: number | null
- stage: string | null

## 13) Implementation Checklist

A compatible implementation is complete when all are true:
- Sends POST /answer with query, user_id, optional session_id.
- Polls GET /answer/status/{request_id} with the same retry/timeout behavior.
- Supports early text rendering before final task completion.
- Handles finalPromise/background completion for motion.
- Supports session create/list/get/delete.
- Supports motion retry by existing task id.
- Correctly normalizes direct and nested payload formats.
- Handles tts audio url playback when present.
- Preserves partial results on failures.

## 14) Recommended File Layout in New Frontend Projects

- api/client.*: http client + base-url resolver
- api/normalizers.*: flattenTaskPayload logic
- api/eca.*: ask flow + poll flow + session APIs
- state/chat.*: message/task state machine
- ui/chat/*: chat views/components
- ui/motion/*: motion panel + metadata
- ui/audio/*: audio playback utility

This split makes it easy for multiple agents to work in parallel while preserving consistent behavior.
