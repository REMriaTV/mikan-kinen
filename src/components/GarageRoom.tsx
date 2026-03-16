"use client";

import React from "react";

// 期限優先のため、いったんルームURLを直書き
const GARAGE_ROOM_URL = "https://remreal-tv.daily.co/garage-room";

export default function GarageRoom() {

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
          src={GARAGE_ROOM_URL}
          allow="camera; microphone; display-capture; autoplay; encrypted-media; fullscreen"
          className="absolute inset-0 w-full h-full"
          style={{ border: "none" }}
          title="Garage Hunt Broadcast Room"
        />
      </div>
    </div>
  );
}

