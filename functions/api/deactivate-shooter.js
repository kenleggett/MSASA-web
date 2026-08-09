// =======================================================
// MISSISSIPPI ASA
// DEACTIVATE SHOOTER API
// =======================================================

export async function onRequestPost({ request, env }) {

  try {

    // ---------------------------------------------------
    // READ REQUEST
    // ---------------------------------------------------

    const body =
      await request.json();


    const shooter_id =
      Number(
        body.shooter_id
      );


    // ---------------------------------------------------
    // VALIDATE SHOOTER ID
    // ---------------------------------------------------

    if (!shooter_id) {

      return Response.json({

        ok: false,

        error:
          "Shooter ID is required."

      }, {
        status: 400
      });

    }


    // ---------------------------------------------------
    // FIND SHOOTER
    // ---------------------------------------------------

    const shooter =
      await env.DB.prepare(
        `
        SELECT
          id,
          name,
          asa_number,
          class_name,
          active

        FROM shooters

        WHERE id = ?

        LIMIT 1
        `
      )
      .bind(
        shooter_id
      )
      .first();


    // ---------------------------------------------------
    // SHOOTER NOT FOUND
    // ---------------------------------------------------

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
    // ALREADY INACTIVE
    // ---------------------------------------------------

    if (
      Number(shooter.active) !== 1
    ) {

      return Response.json({

        ok: false,

        error:
          `${shooter.name} is already inactive.`

      }, {
        status: 409
      });

    }


    // ---------------------------------------------------
    // DEACTIVATE SHOOTER
    //
    // IMPORTANT:
    // This does NOT delete the shooter.
    //
    // Historical scores remain in the database.
    // ---------------------------------------------------

    await env.DB.prepare(
      `
      UPDATE shooters

      SET
        active = 0

      WHERE id = ?
      `
    )
    .bind(
      shooter_id
    )
    .run();


    // ---------------------------------------------------
    // SUCCESS
    // ---------------------------------------------------

    return Response.json({

      ok: true,

      message:
        `${shooter.name} has been deactivated.`,

      shooter: {

        id:
          shooter.id,

        name:
          shooter.name,

        asa_number:
          shooter.asa_number,

        class_name:
          shooter.class_name,

        active:
          false

      }

    });


  } catch (error) {

    // ---------------------------------------------------
    // ERROR
    // ---------------------------------------------------

    console.error(
      "Deactivate shooter error:",
      error
    );


    return Response.json({

      ok: false,

      error:
        error?.message ||
        "Unable to deactivate shooter."

    }, {
      status: 500
    });

  }

}
