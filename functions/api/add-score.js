export async function onRequestPost({ request, env }) {

  try {

    const body = await request.json();

    const {
      shooter_id,
      event_id,
      score,
      twelves
    } = body;

    if (!shooter_id || !event_id || !score) {
      return Response.json({
        ok: false,
        error: "Missing required fields"
      }, { status: 400 });
    }

    await env.DB.prepare(`
      INSERT INTO scores
      (
        shooter_id,
        event_id,
        score,
        twelves
      )
      VALUES (?, ?, ?, ?)
    `)
    .bind(
      shooter_id,
      event_id,
      score,
      twelves || 0
    )
    .run();

    return Response.json({
      ok: true,
      message: "Score added successfully"
    });

  } catch (error) {

    const message = String(error?.message || error);

    if (
      message.toLowerCase().includes("unique") ||
      message.toLowerCase().includes("constraint")
    ) {
      return Response.json({
        ok: false,
        error: "A score already exists for this shooter and event."
      }, { status: 409 });
    }

    return Response.json({
      ok: false,
      error: "Unable to save score: " + message
    }, { status: 500 });
  }
}
