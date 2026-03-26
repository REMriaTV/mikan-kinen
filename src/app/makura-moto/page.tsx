import MakuraMotoClient from "./MakuraMotoClient";

export default async function MakuraMotoPage({
  searchParams,
}: {
  searchParams?: { token?: string | string[] } | Promise<{ token?: string | string[] }>;
}) {
  const expected = process.env.ADMIN_BROADCAST_TOKEN;
  const resolved = await searchParams;
  const rawToken = resolved?.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  if (!expected) {
    return <div style={{ padding: 24 }}>ADMIN_BROADCAST_TOKEN is not configured on the server.</div>;
  }

  if (!token || token !== expected) {
    return <div style={{ padding: 24 }}>Unauthorized.</div>;
  }

  return <MakuraMotoClient token={token} />;
}

