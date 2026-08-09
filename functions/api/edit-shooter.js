// =======================================================
// MISSISSIPPI ASA
// EDIT SHOOTER API
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


    const name =
      String(
        body.name || ""
      ).trim();


    const asa_number =
      String(
        body.asa_number || ""
      )
      .trim()
      .toUpperCase();


    const class_name =
      String(
        body.class_name || ""
      ).trim();


    // ---------------------------------------------------
    // VALIDATE REQUIRED FIELDS
    // ---------------------------------------------------

    if (
      !shooter_id ||
      !name ||
      !asa_number ||
      !class_name
    ) {

      return Response.json({

        ok: false,

        error:
          "Shooter ID, name, ASA number, and class are required."

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
    // DO NOT EDIT INACTIVE SHOOTERS
    // ---------------------------------------------------

    if (
      Number(shooter.active) !== 1
    ) {

      return Response.json({

        ok: false,

        error:
          "Inactive shooters cannot be edited."

      }, {
        status: 409
      });

    }


    // ---------------------------------------------------
    // CHECK ASA NUMBER
    //
    // The ASA number may belong to this shooter,
    // but may not belong to another active shooter.
    // ---------------------------------------------------

    const existing =
      await env.DB.prepare(
        `
        SELECT
          id,
          name,
          asa_number,
          class_name

        FROM shooters

        WHERE
          UPPER(TRIM(asa_number)) = ?
          AND active = 1
          AND id != ?

        LIMIT 1
        `
      )
      .bind(
        asa_number,
        shooter_id
      )
      .first();


    // ---------------------------------------------------
    // DUPLICATE ASA NUMBER
    // ---------------------------------------------------

    if (existing) {

      return Response.json({

        ok: false,

        error:
          `ASA number ${asa_number} is already assigned to ${existing.name}.`,

        code:
          "DUPLICATE_ASA_NUMBER",

        shooter:
          existing

      }, {
        status: 409
      });

    }


    // ---------------------------------------------------
    // UPDATE SHOOTER
    // ---------------------------------------------------

    await env.DB.prepare(
      `
      UPDATE shooters

      SET
        name = ?,
        asa_number = ?,
        class_name = ?

      WHERE id = ?
      `
    )
    .bind(
      name,
      asa_number,
      class_name,
      shooter_id
    )
    .run();


    // ---------------------------------------------------
    // SUCCESS
    // ---------------------------------------------------

    return Response.json({

      ok: true,

      message:
        "Shooter updated successfully.",

      shooter: {

        id:
          shooter_id,

        name:
          name,

        asa_number:
          asa_number,

        class_name:
          class_name

      }

    });


  } catch (error) {

    console.error(
      "Edit shooter error:",
      error
    );


    return Response.json({

      ok: false,

      error:
        error.message ||
        "Unable to update shooter."

    }, {
      status: 500
    });

  }

}
