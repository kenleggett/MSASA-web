export async function onRequestPost({ request, env }) {

  try {
    const body = await request.json();

    const {
      shooter_id,
      event_id,
      score,
      twelves
    } = body;

    if (
      !shooter_id ||
      !event_id ||
      score === undefined ||
      score === null
    ) {
      return Response.json({
        ok: false,
        error: "Missing required fields"
      }, { status: 400 });
    }

    // Check whether this shooter already has a score
    // for this event.
    const existing = await env.DB.prepare(
      `
      SELECT id
      FROM scores
      WHERE shooter_id = ?
        AND event_id = ?
      LIMIT 1
      `
    )
    .bind(shooter_id, event_id)
    .first();

    // ---------------------------------------------
    // UPDATE EXISTING SCORE
    // ---------------------------------------------

    if (existing) {

      await env.DB.prepare(
        `
        UPDATE scores
        SET score = ?,
            twelves = ?
        WHERE id = ?
        `
      )
      .bind(
        score,
        twelves || 0,
        existing.id
      )
      .run();

      return Response.json({
        ok: true,
        message: "Score updated successfully",
        action: "updated",
        score_id: existing.id
      });
    }

    // ---------------------------------------------
    // ADD NEW SCORE
    // ---------------------------------------------

    const result = await env.DB.prepare(
      `
      INSERT INTO scores
      (
        shooter_id,
        event_id,
        score,
        twelves
      )
      VALUES (?, ?, ?, ?)
      `
    )
    .bind(
      shooter_id,
      event_id,
      score,
      twelves || 0
    )
    .run();

    return Response.json({
      ok: true,
      message: "Score added successfully",
      action: "added",
      score_id: result.meta?.last_row_id ?? null
    });

  } catch (error) {

    return Response.json({
      ok: false,
      error: error.message || "Unable to save score"
    }, { status: 500 });

  }

}
