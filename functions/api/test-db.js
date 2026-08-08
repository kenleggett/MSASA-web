export async function onRequestGet({ env }) {
  const result = await env.DB
    .prepare("SELECT COUNT(*) AS shooter_count FROM shooters")
    .first();

  return Response.json({
    ok: true,
    shooter_count: result?.shooter_count ?? 0
  });
}
