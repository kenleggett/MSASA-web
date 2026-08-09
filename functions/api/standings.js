export async function onRequestGet({ env }) {

  const { results } = await env.DB.prepare(`
    SELECT 
      shooters.name,
      shooters.class_name,
      scores.score,
      scores.twelves,
      events.name AS event
    FROM scores
    JOIN shooters 
      ON scores.shooter_id = shooters.id
    JOIN events
      ON scores.event_id = events.id
  `).all();


  return Response.json({
    ok: true,
    scores: results
  });

}
