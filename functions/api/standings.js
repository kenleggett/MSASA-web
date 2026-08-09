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

      FROM scores

      JOIN shooters
        ON scores.shooter_id = shooters.id

      JOIN events
        ON scores.event_id = events.id

      WHERE shooters.active = 1

      ORDER BY shooters.name
    `).all();


    // ---------------------------------------------------
    // GROUP SCORES BY SHOOTER
    // ---------------------------------------------------

    const shooterData = {};


    results.forEach(row => {

      if (!shooterData[row.shooter_id]) {

        shooterData[row.shooter_id] = {

          shooter_id: row.shooter_id,

          name: row.name,

          class_name: row.class_name,

          qualifiers: [],

          championship: null

        };

      }


      // State Championship is mandatory
      if (row.event === "State Championship") {

        shooterData[row.shooter_id].championship = {

          event_id: row.event_id,

          event: row.event,

          score: Number(row.score),

          twelves: Number(row.twelves)

        };

      } else {

        // All other events are qualifying events
        shooterData[row.shooter_id].qualifiers.push({

          event_id: row.event_id,

          event: row.event,

          score: Number(row.score),

          twelves: Number(row.twelves)

        });

      }

    });


    // ---------------------------------------------------
    // CALCULATE EACH SHOOTER
    // ---------------------------------------------------

    const standings = Object.values(shooterData).map(shooter => {


      // Sort highest qualifying scores first
      const sortedQualifiers = [...shooter.qualifiers]
        .sort((a, b) => {

          if (b.score !== a.score) {
            return b.score - a.score;
          }

          return b.twelves - a.twelves;

        });


      // Take the best three qualifying scores
      const topThree = sortedQualifiers.slice(0, 3);


      // A completed SOTY score requires:
      // 3 qualifying scores + State Championship
      const hasThreeQualifiers = topThree.length >= 3;

      const hasChampionship = shooter.championship !== null;

      const eligible = hasThreeQualifiers && hasChampionship;


      // Calculate qualifying score
      const qualifierScore = topThree.reduce(
        (total, shoot) => total + shoot.score,
        0
      );


      // Calculate qualifying 12s
      const qualifierTwelves = topThree.reduce(
        (total, shoot) => total + shoot.twelves,
        0
      );


      // Championship score
      const championshipScore =
        shooter.championship?.score || 0;


      // Championship 12s
      const championshipTwelves =
        shooter.championship?.twelves || 0;


      // Final SOTY totals
      const totalScore =
        qualifierScore + championshipScore;


      const totalTwelves =
        qualifierTwelves + championshipTwelves;


      return {

        shooter_id: shooter.shooter_id,

        name: shooter.name,

        class_name: shooter.class_name,

        eligible: eligible,

        qualification_status: eligible
          ? "Complete"
          : !hasThreeQualifiers && !hasChampionship
            ? "Needs 3 qualifiers + State Championship"
            : !hasThreeQualifiers
              ? "Needs more qualifying scores"
              : "Needs State Championship",


        total_score: totalScore,

        total_twelves: totalTwelves,


        qualifier_score: qualifierScore,

        qualifier_twelves: qualifierTwelves,


        qualifier_count: shooter.qualifiers.length,


        top_three: topThree,


        championship: shooter.championship

      };

    });


    // ---------------------------------------------------
    // SORT ALL SHOOTERS
    //
    // Completed shooters first.
    // Then score.
    // Then 12-count.
    // ---------------------------------------------------

    standings.sort((a, b) => {

      // Eligible shooters first
      if (a.eligible !== b.eligible) {
        return a.eligible ? -1 : 1;
      }


      // Higher total score wins
      if (b.total_score !== a.total_score) {
        return b.total_score - a.total_score;
      }


      // Higher 12 count breaks ties
      if (b.total_twelves !== a.total_twelves) {
        return b.total_twelves - a.total_twelves;
      }


      // Final alphabetical tie breaker
      return a.name.localeCompare(b.name);

    });


    // ---------------------------------------------------
    // RANK SHOOTERS WITHIN EACH CLASS
    // ---------------------------------------------------

    const classCounters = {};


    standings.forEach(shooter => {

      const className = shooter.class_name || "Unclassified";


      if (!classCounters[className]) {
        classCounters[className] = 0;
      }


      // Only completed shooters receive a SOTY rank
      if (shooter.eligible) {

        classCounters[className]++;

        shooter.rank = classCounters[className];

      } else {

        shooter.rank = null;

      }

    });


    // ---------------------------------------------------
    // CREATE CLASS GROUPS
    // ---------------------------------------------------

    const classes = {};


    standings.forEach(shooter => {

      const className = shooter.class_name || "Unclassified";


      if (!classes[className]) {
        classes[className] = [];
      }


      classes[className].push(shooter);

    });


    // ---------------------------------------------------
    // RETURN API RESPONSE
    // ---------------------------------------------------

    return Response.json({

      ok: true,

      season: 2026,

      standings: standings,

      classes: classes

    });


  } catch (error) {

    return Response.json({

      ok: false,

      error: error.message

    }, { status: 500 });

  }

}
