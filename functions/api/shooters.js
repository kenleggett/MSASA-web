export async function onRequestGet({ env }) {
  const { results } = await env.DB
    .prepare(`
      SELECT 
        id,
        name,
        asa_number,
        class_name,
        active
      FROM shooters
      ORDER BY class_name, name
    `)
    .all();

  return Response.json({
    ok: true,
    shooters: results
  });
}
