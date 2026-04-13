"use client";

import {
  useLocalSessionId,
  useMediaTrack,
  useParticipantIds,
} from "@daily-co/daily-react";
import type { DailyParticipantTracks } from "@daily-co/daily-js";
import { useEffect, useRef } from "react";
import { REM_GARAGE_CUSTOM_TRACK_NAME } from "@/lib/rem-garage-audio-constants";

/**
 * リモート参加者が publish した remMusic カスタムトラックを <audio> に流す。
 * DailyAudio はマイク用のため、カスタムトラックは明示的に再生する。
 */
function SingleRemoteRemMusic({
  sessionId,
  trackKey,
}: {
  sessionId: string;
  trackKey: keyof DailyParticipantTracks;
}) {
  const state = useMediaTrack(sessionId, trackKey);
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    const track = state.track ?? state.persistentTrack;
    if (!el || !track || track.kind !== "audio") {
      if (el) el.srcObject = null;
      return;
    }
    const stream = new MediaStream([track]);
    el.srcObject = stream;
    el.play().catch(() => {});
    return () => {
      el.srcObject = null;
    };
  }, [state.track, state.persistentTrack, state.state]);

  return (
    <audio ref={ref} autoPlay playsInline className="hidden" aria-hidden />
  );
}

/**
 * 全リモート参加者の remMusic を購読（該当トラックが無いときは無音）。
 */
export default function GarageRemoteRemMusicAudio() {
  const ids = useParticipantIds();
  const localId = useLocalSessionId();
  const trackKey = REM_GARAGE_CUSTOM_TRACK_NAME as keyof DailyParticipantTracks;

  return (
    <>
      {ids
        .filter((id) => id && id !== localId)
        .map((id) => (
          <SingleRemoteRemMusic key={id} sessionId={id} trackKey={trackKey} />
        ))}
    </>
  );
}
