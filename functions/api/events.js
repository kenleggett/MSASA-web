// =======================================================
// MISSISSIPPI ASA
// EVENTS API
// =======================================================

export async function onRequestGet({ env }) {

  try {

    const { results } = await env.DB.prepare(`
      SELECT
        id,
        name,
        event_date,
        event_type,
        address,
        contact,
        details,
        active

      FROM events

      WHERE active = 1

      ORDER BY
        CASE
          WHEN event_date IS NULL OR event_date = ''
          THEN 1
          ELSE 0
        END,

        event_date ASC,
        id ASC

    `).all();


    const events = results.map(event => ({

      id: event.id,

      name: event.name,

      event_date:
        event.event_date || null,

      event_type:
        event.event_type || "ASA Qualifier",

      address:
        event.address || "Location TBD",

      contact:
        event.contact ||
        "Contact information coming soon.",

      details:
        event.details ||
        "Event information will be posted soon.",

      active:
        Number(event.active) === 1

    }));


    return Response.json({

      ok: true,

      season: 2026,

      events: events

    });


  } catch (error) {

    return Response.json({

      ok: false,

      error: error.message

    }, {
      status: 500
    });

  }

}
