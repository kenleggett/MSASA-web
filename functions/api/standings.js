// =======================================================
// MISSISSIPPI ASA
// SHOOTER OF THE YEAR STANDINGS API
// =======================================================

export async function onRequestGet({ env }) {

  // Load all shooter scores with event information
  const { results } = await env.DB.prepare(`
    SELECT
      shooters.id AS shooter_id,
      shooters.name,
      shooters.class_name,
      scores.score,
      scores.twelves,
      events.name AS event

    FROM scores

    JOIN shooters
      ON scores.shooter_id = shooters.id

    JOIN events
      ON scores.event_id = events.id
  `).all();


  // Group scores by shooter
  const shooterData = {};


  results.forEach(score => {

    if (!shooterData[score.shooter_id]) {

      shooterData[score.shooter_id] = {

        name: score.name,

        class_name: score.class_name,

        qualifiers: [],

        championship: null

      };

    }


    // State Championship is mandatory
    if (score.event === "State Championship") {

      shooterData[score.shooter_id].championship = {

        score: score.score,

        twelves: score.twelves

      };


    } else {

      // All other shoots are qualifiers
      shooterData[score.shooter_id].qualifiers.push({

        event: score.event,

        score: score.score,

        twelves: score.twelves

      });

    }

  });



  // Calculate Shooter of the Year totals
  const rankings = Object.values(shooterData).map(shooter => {


    // Highest three qualifier scores
    const topThree = shooter.qualifiers

      .sort((a,b) => b.score - a.score)

      .slice(0,3);



    const totalScore =

      topThree.reduce(

        (total, shoot) => total + shoot.score,

        0

      )

      +

      (shooter.championship?.score || 0);



    const totalTwelves =

      topThree.reduce(

        (total, shoot) => total + shoot.twelves,

        0

      )

      +

      (shooter.championship?.twelves || 0);



    return {

      name: shooter.name,

      class_name: shooter.class_name,

      total_score: totalScore,

      total_twelves: totalTwelves,

      qualifier_scores: topThree,

      championship: shooter.championship

    };


  });



  // Rank shooters
  rankings.sort((a,b)=>{


    // Higher score wins

    if (b.total_score !== a.total_score) {

      return b.total_score - a.total_score;

    }


    // Tie breaker = most 12 rings

    return b.total_twelves - a.total_twelves;


  });



  return Response.json({

    ok: true,

    standings: rankings

  });


}
