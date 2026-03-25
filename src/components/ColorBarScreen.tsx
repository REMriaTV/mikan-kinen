"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function ColorBarScreen() {
  return (
    <div
      style={{
        background: "#0D0F12",
        color: "#E8E4DF",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* カラーバー部分 - アスペクト比 16:9 で最大幅制限 */}
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          aspectRatio: "16/9",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: "4px",
        }}
      >
        {/* メインバー 67% */}
        <div style={{ flex: 67, display: "flex" }}>
          <div style={{ flex: 1, background: "#C0C0C0" }} />
          <div style={{ flex: 1, background: "#C0C000" }} />
          <div style={{ flex: 1, background: "#00C0C0" }} />
          <div style={{ flex: 1, background: "#00C000" }} />
          <div style={{ flex: 1, background: "#C000C0" }} />
          <div style={{ flex: 1, background: "#C00000" }} />
          <div style={{ flex: 1, background: "#0000C0" }} />
        </div>

        {/* カステレーション 8% */}
        <div style={{ flex: 8, display: "flex" }}>
          <div style={{ flex: 1, background: "#0000C0" }} />
          <div style={{ flex: 1, background: "#131313" }} />
          <div style={{ flex: 1, background: "#C000C0" }} />
          <div style={{ flex: 1, background: "#131313" }} />
          <div style={{ flex: 1, background: "#00C0C0" }} />
          <div style={{ flex: 1, background: "#131313" }} />
          <div style={{ flex: 1, background: "#C0C0C0" }} />
        </div>

        {/* PLUGE バー 25% */}
        <div style={{ flex: 25, display: "flex" }}>
          <div style={{ flex: 2, background: "#00214C" }} />
          <div style={{ flex: 2, background: "#FFFFFF" }} />
          <div style={{ flex: 2, background: "#32006A" }} />
          <div style={{ flex: 1, background: "#131313" }} />
          <div style={{ flex: 0.5, background: "#090909" }} />
          <div style={{ flex: 1, background: "#131313" }} />
          <div style={{ flex: 0.5, background: "#1D1D1D" }} />
          <div style={{ flex: 5, background: "#131313" }} />
        </div>
      </div>

      {/* 案内テキスト */}
      <div style={{ textAlign: "center", marginTop: "18px" }}>
        <div
          style={{
            color: "#E8E4DF",
            fontSize: "14px",
            letterSpacing: "0.15em",
            fontWeight: 500,
            marginBottom: "16px",
          }}
        >
          REMREAL TELEPATHIC NETWORK
        </div>
        <div
          style={{
            color: "#E8E4DF",
            fontSize: "13px",
            opacity: 0.5,
            marginBottom: "6px",
          }}
        >
          只今放送休眠中
        </div>
        <div style={{ color: "#E8E4DF", fontSize: "15px", fontWeight: 500 }}>
          次回の夢でお会いしましょう
        </div>
      </div>

      <div style={{ marginTop: "14px" }}>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "999px",
            textDecoration: "none",
            color: "#E8E4DF",
            background: "rgba(0,0,0,0.10)",
            border: "none",
            backdropFilter: "blur(6px)",
          }}
        >
          <span style={{ fontSize: 12, opacity: 0.9, letterSpacing: "0.1em" }}>
            おきる
          </span>
        </Link>
      </div>
    </div>
  );
}

