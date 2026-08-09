export async function onRequest({ request, env }) {

  try {

    // GET — load all scores
    if (request.method === "GET") {

      const { results } = await env.DB.prepare(`
        SELECT
          scores.id,
          scores.shooter_id,
          shooters.name AS shooter,
          shooters.class_name,
          scores.event_id,
          events.name AS event,
          scores.score,
          scores.twelves
        FROM scores
        JOIN shooters
          ON shooters.id = scores.shooter_id
        JOIN events
          ON events.id = scores.event_id
        ORDER BY scores.id DESC
      `).all();

      return Response.json({
        ok: true,
        scores: results
      });
    }


    const body = await request.json();

    const id = Number(body.id);

    if (!id) {
      return Response.json({
        ok: false,
        error: "Missing score ID"
      }, { status: 400 });
    }


    // PUT — edit score
    if (request.method === "PUT") {

      const score = Number(body.score);
      const twelves = Number(body.twelves || 0);

      if (!score) {
        return Response.json({
          ok: false,
          error: "Score is required"
        }, { status: 400 });
      }

      await env.DB.prepare(`
        UPDATE scores
        SET score = ?, twelves = ?
        WHERE id = ?
      `)
      .bind(score, twelves, id)
      .run();

      return Response.json({
        ok: true,
        message: "Score updated successfully"
      });
    }


    // DELETE — remove score
    if (request.method === "DELETE") {

      await env.DB.prepare(`
        DELETE FROM scores
        WHERE id = ?
      `)
      .bind(id)
      .run();

      return Response.json({
        ok: true,
        message: "Score deleted successfully"
      });
    }


    return Response.json({
      ok: false,
      error: "Method not allowed"
    }, { status: 405 });


  } catch (error) {

    return Response.json({
      ok: false,
      error: error?.message || String(error)
    }, { status: 500 });

  }
}
