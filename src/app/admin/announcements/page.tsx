import AdminAnnouncementsClient from "./AdminAnnouncementsClient";

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams?: { token?: string | string[] } | Promise<{ token?: string | string[] }>;
}) {
  const resolved = await searchParams;
  const rawToken = resolved?.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
  const expected = process.env.ADMIN_BROADCAST_TOKEN;

  if (!expected) {
    return (
      <div style={{ padding: 24 }}>
        ADMIN_BROADCAST_TOKEN is not configured on the server.
      </div>
    );
  }

  if (!token || token !== expected) {
    return (
      <div style={{ padding: 24 }}>
        Unauthorized.
      </div>
    );
  }

  return (
    <main
      style={{
        background: "#0D0F12",
        color: "#E8E4DF",
        minHeight: "100vh",
        fontFamily: "var(--font-shippori), serif",
      }}
    >
      <AdminAnnouncementsClient token={token} />
    </main>
  );
}
