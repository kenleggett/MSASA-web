export async function onRequestGet({ env }) {

  const { results } = await env.DB
    .prepare(`
      SELECT
        shooters.id,
        shooters.name,
        shooters.asa_number,
        shooters.class_name,

        events.id AS event_id,
        events.name AS event_name,

        scores.score,
        scores.twelves

      FROM shooters

      LEFT JOIN scores
        ON shooters.id = scores.shooter_id

      LEFT JOIN events
        ON scores.event_id = events.id

      WHERE shooters.active = 1

      ORDER BY
        shooters.class_name,
        shooters.name,
        events.id
    `)
    .all();


  const shooters = {};


  results.forEach(row => {

    if (!shooters[row.id]) {

      shooters[row.id] = {

        id: row.id,

        name: row.name,

        asa_number: row.asa_number,

        class: row.class_name,

        events: [],

        championship: null

      };

    }


    if (row.event_name) {


      const event = {

        event: row.event_name,

        score: row.score,

        twelves: row.twelves

      };


      if (
        row.event_name ===
        "State Championship"
      ) {

        shooters[row.id].championship =
          event;

      }

      else {

        shooters[row.id].events.push(
          event
        );

      }

    }

  });


  return Response.json({

    ok: true,

    shooters:
      Object.values(shooters)

  });

}
