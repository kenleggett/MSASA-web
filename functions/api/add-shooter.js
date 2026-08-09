// =======================================================
// MISSISSIPPI ASA
// ADD SHOOTER API
// =======================================================

export async function onRequestPost({ request, env }) {

  try {

    // ---------------------------------------------------
    // READ REQUEST
    // ---------------------------------------------------

    const body =
      await request.json();


    // ---------------------------------------------------
    // CLEAN INPUT
    // ---------------------------------------------------

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
    // REQUIRED FIELDS
    // ---------------------------------------------------

    if (
      !name ||
      !asa_number ||
      !class_name
    ) {

      return Response.json({

        ok: false,

        error:
          "Shooter name, ASA number, and class are required."

      }, {
        status: 400
      });

    }


    // ---------------------------------------------------
    // CHECK FOR EXISTING ACTIVE ASA NUMBER
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

        LIMIT 1
        `
      )
      .bind(
        asa_number
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

        shooter: existing

      }, {
        status: 409
      });

    }


    // ---------------------------------------------------
    // CREATE SHOOTER
    // ---------------------------------------------------

    const result =
      await env.DB.prepare(
        `
        INSERT INTO shooters
        (
          name,
          asa_number,
          class_name,
          active
        )

        VALUES
        (?, ?, ?, 1)
        `
      )
      .bind(
        name,
        asa_number,
        class_name
      )
      .run();


    // ---------------------------------------------------
    // SUCCESS
    // ---------------------------------------------------

    return Response.json({

      ok: true,

      message:
        "Shooter added successfully.",

      shooter_id:
        result.meta?.last_row_id ?? null

    });


  } catch (error) {

    // ---------------------------------------------------
    // ERROR
    // ---------------------------------------------------

    console.error(
      "Add shooter error:",
      error
    );


    return Response.json({

      ok: false,

      error:
        error.message ||
        "Unable to add shooter."

    }, {
      status: 500
    });

  }

}
