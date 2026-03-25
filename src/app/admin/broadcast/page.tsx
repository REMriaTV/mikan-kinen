import AdminBroadcastClient from "./AdminBroadcastClient";

export default async function AdminBroadcastPage({
  searchParams,
}: {
  searchParams?: { token?: string | string[] } | Promise<{ token?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawToken = resolvedSearchParams?.token;
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

  return <AdminBroadcastClient token={token} />;
}

