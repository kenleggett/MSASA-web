// =======================================================
// MISSISSIPPI ASA
// ADD / UPDATE EVENT SCORE API
// =======================================================

export async function onRequestPost({ request, env }) {

  try {

    const body =
      await request.json();


    const {
      shooter_id,
      event_id,
      score,
      twelves
    } = body;


    // ---------------------------------------------------
    // VALIDATE
    // ---------------------------------------------------

    if (
      !shooter_id ||
      !event_id ||
      score === undefined ||
      score === null ||
      score === ""
    ) {

      return Response.json({

        ok: false,

        error:
          "Shooter, event, and score are required."

      }, {
        status: 400
      });

    }


    const numericScore =
      Number(score);


    const numericTwelves =
      Number(twelves || 0);


    if (
      !Number.isFinite(numericScore) ||
      numericScore < 0
    ) {

      return Response.json({

        ok: false,

        error:
          "Score must be a valid number."

      }, {
        status: 400
      });

    }


    if (
      !Number.isFinite(numericTwelves) ||
      numericTwelves < 0
    ) {

      return Response.json({

        ok: false,

        error:
          "12 count must be a valid number."

      }, {
        status: 400
      });

    }


    // ---------------------------------------------------
    // VERIFY SHOOTER EXISTS
    // ---------------------------------------------------

    const shooter =
      await env.DB.prepare(`
        SELECT id
        FROM shooters
        WHERE id = ?
          AND active = 1
        LIMIT 1
      `)
      .bind(shooter_id)
      .first();


    if (!shooter) {

      return Response.json({

        ok: false,

        error:
          "Shooter not found."

      }, {
        status: 404
      });

    }


    // ---------------------------------------------------
    // VERIFY EVENT EXISTS
    // ---------------------------------------------------

    const event =
      await env.DB.prepare(`
        SELECT id, name
        FROM events
        WHERE id = ?
          AND active = 1
        LIMIT 1
      `)
      .bind(event_id)
      .first();


    if (!event) {

      return Response.json({

        ok: false,

        error:
          "Event not found."

      }, {
        status: 404
      });

    }


    // ---------------------------------------------------
    // CHECK FOR EXISTING SCORE
    // ---------------------------------------------------

    const existing =
      await env.DB.prepare(`
        SELECT id
        FROM scores
        WHERE shooter_id = ?
          AND event_id = ?
        LIMIT 1
      `)
      .bind(
        shooter_id,
        event_id
      )
      .first();


    // ---------------------------------------------------
    // UPDATE EXISTING SCORE
    // ---------------------------------------------------

    if (existing) {

      await env.DB.prepare(`
        UPDATE scores

        SET
          score = ?,
          twelves = ?

        WHERE id = ?
      `)
      .bind(
        numericScore,
        numericTwelves,
        existing.id
      )
      .run();


      return Response.json({

        ok: true,

        message:
          "Score updated successfully.",

        action:
          "updated",

        score_id:
          existing.id

      });

    }


    // ---------------------------------------------------
    // INSERT NEW SCORE
    // ---------------------------------------------------

    const result =
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
        numericScore,
        numericTwelves
      )
      .run();


    return Response.json({

      ok: true,

      message:
        "Score added successfully.",

      action:
        "added",

      score_id:
        result.meta?.last_row_id ??
        null

    });


  }

  catch (error) {

    return Response.json({

      ok: false,

      error:
        error?.message ||
        "Unable to save score."

    }, {
      status: 500
    });

  }

}
