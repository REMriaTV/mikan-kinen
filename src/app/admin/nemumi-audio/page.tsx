import AdminNemumiAudioClient from "./AdminNemumiAudioClient";

export default async function AdminNemumiAudioPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string | string[] }>;
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

  return <AdminNemumiAudioClient token={token} />;
}
