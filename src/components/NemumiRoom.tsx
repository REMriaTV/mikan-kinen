"use client";

import React from "react";

const NEMUMI_ROOM_URL = "https://remreal-tv.daily.co/nemumi-room";

export default function NemumiRoom() {
  return (
    <div className="w-full rounded-lg overflow-hidden border border-[rgba(255,255,255,0.2)] bg-black/60">
      <div
        className="relative w-full"
        style={{
          paddingBottom: "56.25%",
          minHeight: "320px",
        }}
      >
        <iframe
          src={NEMUMI_ROOM_URL}
          allow="camera; microphone; display-capture; autoplay; encrypted-media; fullscreen"
          title="Nemumi Audio Room"
          className="absolute inset-0 w-full h-full"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}

