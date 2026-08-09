// =======================================================
// MISSISSIPPI ASA
// 2026 SHOOTER OF THE YEAR STANDINGS API
// =======================================================

export async function onRequestGet({ env }) {

  try {

    // ---------------------------------------------------
    // LOAD SHOOTERS + SCORES + EVENTS
    // ---------------------------------------------------

    const { results } = await env.DB.prepare(`
      SELECT
        shooters.id AS shooter_id,
        shooters.name,
        shooters.class_name,
        scores.score,
        scores.twelves,
        events.id AS event_id,
        events.name AS event

      FROM shooters

      LEFT JOIN scores
        ON scores.shooter_id = shooters.id

      LEFT JOIN events
        ON scores.event_id = events.id

      WHERE shooters.active = 1

      ORDER BY
        shooters.class_name,
        shooters.name,
        events.id
    `).all();


    // ---------------------------------------------------
    // GROUP RESULTS BY SHOOTER
    // ---------------------------------------------------

    const shooterData = {};


    results.forEach(row => {

      if (!shooterData[row.shooter_id]) {

        shooterData[row.shooter_id] = {

          shooter_id: row.shooter_id,

          name: row.name,

          class_name:
            row.class_name || "Unclassified",

          qualifiers: [],

          championship: null

        };

      }


      if (!row.event_id) {
        return;
      }


      const result = {

        event_id: row.event_id,

        event: row.event,

        score: Number(row.score || 0),

        twelves: Number(row.twelves || 0)

      };


      // State Championship is always
      // handled separately.

      if (
        row.event === "State Championship"
      ) {

        shooterData[
          row.shooter_id
        ].championship = result;

      }

      else {

        shooterData[
          row.shooter_id
        ].qualifiers.push(result);

      }

    });


    // ---------------------------------------------------
    // CALCULATE SOTY FOR EACH SHOOTER
    // ---------------------------------------------------

    const standings =
      Object.values(shooterData).map(
        shooter => {


          // Sort qualifying scores:
          // highest score first,
          // then highest 12-count.

          const sortedQualifiers =
            [...shooter.qualifiers].sort(
              (a, b) => {

                if (
                  b.score !== a.score
                ) {

                  return (
                    b.score -
                    a.score
                  );

                }

                return (
                  b.twelves -
                  a.twelves
                );

              }
            );


          // Best three qualifying scores.

          const topThree =
            sortedQualifiers.slice(0, 3);


          const hasThreeQualifiers =
            topThree.length >= 3;


          const hasChampionship =
            shooter.championship !== null;


          const eligible =
            hasThreeQualifiers &&
            hasChampionship;


          // ------------------------------------------------
          // QUALIFIER TOTAL
          // ------------------------------------------------

          const qualifierScore =
            topThree.reduce(
              (total, event) =>
                total + event.score,
              0
            );


          const qualifierTwelves =
            topThree.reduce(
              (total, event) =>
                total + event.twelves,
              0
            );


          // ------------------------------------------------
          // STATE CHAMPIONSHIP
          // ------------------------------------------------

          const championshipScore =
            shooter.championship?.score || 0;


          const championshipTwelves =
            shooter.championship?.twelves || 0;


          // ------------------------------------------------
          // FINAL SOTY TOTAL
          // ------------------------------------------------

          const totalScore =
            qualifierScore +
            championshipScore;


          const totalTwelves =
            qualifierTwelves +
            championshipTwelves;


          return {

            shooter_id:
              shooter.shooter_id,

            name:
              shooter.name,

            class_name:
              shooter.class_name,

            eligible:
              eligible,


            qualification_status:

              eligible

                ? "Complete"

                : !hasThreeQualifiers &&
                  !hasChampionship

                  ? "Needs 3 qualifiers + State Championship"

                  : !hasThreeQualifiers

                    ? "Needs more qualifying scores"

                    : "Needs State Championship",


            total_score:
              totalScore,

            total_twelves:
              totalTwelves,


            qualifier_score:
              qualifierScore,

            qualifier_twelves:
              qualifierTwelves,

            qualifier_count:
              shooter.qualifiers.length,


            // ALL qualifying events.
            // This is important for the
            // public event-results filter.

            qualifiers:
              shooter.qualifiers,


            // Best three qualifying events.

            top_three:
              topThree,


            championship:
              shooter.championship

          };

        }
      );


    // ---------------------------------------------------
    // OVERALL SORT
    // ---------------------------------------------------

    standings.sort(
      (a, b) => {

        // Completed shooters first.

        if (
          a.eligible !== b.eligible
        ) {

          return a.eligible
            ? -1
            : 1;

        }


        // Highest SOTY score.

        if (
          b.total_score !==
          a.total_score
        ) {

          return (
            b.total_score -
            a.total_score
          );

        }


        // Highest 12-count.

        if (
          b.total_twelves !==
          a.total_twelves
        ) {

          return (
            b.total_twelves -
            a.total_twelves
          );

        }


        // Alphabetical final tie-breaker.

        return a.name.localeCompare(
          b.name
        );

      }
    );


    // ---------------------------------------------------
    // RANK WITHIN EACH CLASS
    // ---------------------------------------------------

    const classCounters = {};


    standings.forEach(
      shooter => {

        const className =
          shooter.class_name ||
          "Unclassified";


        if (
          !classCounters[className]
        ) {

          classCounters[className] = 0;

        }


        if (shooter.eligible) {

          classCounters[className]++;


          shooter.rank =
            classCounters[className];

        }

        else {

          shooter.rank = null;

        }

      }
    );


    // ---------------------------------------------------
    // CREATE CLASS GROUPS
    // ---------------------------------------------------

    const classes = {};


    standings.forEach(
      shooter => {

        const className =
          shooter.class_name ||
          "Unclassified";


        if (!classes[className]) {

          classes[className] = [];

        }


        classes[className].push(
          shooter
        );

      }
    );


    // ---------------------------------------------------
    // RETURN API RESPONSE
    // ---------------------------------------------------

    return Response.json({

      ok: true,

      season: 2026,

      standings,

      classes

    });


  }

  catch (error) {

    return Response.json({

      ok: false,

      error:
        error?.message ||
        "Unable to calculate standings"

    }, {
      status: 500
    });

  }

}
