// =====================================================
// MISSISSIPPI ASA
// 2026 SHOOTER OF THE YEAR
// =====================================================

// The actual shooter data is stored in:
// js/standings-data.js

function calculateShooter(shooter) {

    // Get the six qualifying event scores.
    // Championship is NOT included here.
    const qualifyingEvents = shooter.scores
        .filter(event => event.score > 0)
        .sort((a, b) => b.score - a.score);


    // Shooter of the Year counts the
    // three highest qualifying scores.
    const bestThree = qualifyingEvents.slice(0, 3);


    // Add the championship separately.
    const championshipScore =
        shooter.championship?.score || 0;


    // Calculate total score.
    const qualifyingTotal = bestThree.reduce(
        (total, event) => total + event.score,
        0
    );


    const totalScore =
        qualifyingTotal + championshipScore;


    // Calculate qualifying-event 12s.
    const qualifyingTwelves = bestThree.reduce(
        (total, event) => total + event.twelves,
        0
    );


    // Add championship 12s.
    const championshipTwelves =
        shooter.championship?.twelves || 0;


    const totalTwelves =
        qualifyingTwelves + championshipTwelves;


    return {

        ...shooter,

        totalScore,

        totalTwelves,

        countingEvents: bestThree

    };

}


// =====================================================
// CALCULATE ALL STANDINGS
// =====================================================

function calculateStandings() {

    return shooters

        .map(calculateShooter)

        .sort((a, b) => {

            // Highest total score first.
            if (b.totalScore !== a.totalScore) {

                return b.totalScore - a.totalScore;

            }

            // If scores are tied,
            // highest 12 count wins.
            return b.totalTwelves -
                   a.totalTwelves;

        });

}


// =====================================================
// DISPLAY STANDINGS
// =====================================================

function displayStandings(filter = "all") {

    const table =
        document.getElementById(
            "standings-body"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    let standings =
        calculateStandings();


    // Filter by class.
    if (filter !== "all") {

        standings =
            standings.filter(

                shooter =>

                    shooter.class
                        .toLowerCase()
                        === filter.toLowerCase()

            );

    }


    // No shooters found.
    if (standings.length === 0) {

        table.innerHTML = `

            <div class="standing-row">

                <strong>—</strong>

                <span>
                    No shooters found
                </span>

                <span>—</span>

                <strong>—</strong>

                <strong>—</strong>

            </div>

        `;

        return;

    }


    // Display each shooter.
    standings.forEach(

        (shooter, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "standing-row";


            row.innerHTML = `

                <strong>
                    ${index + 1}
                </strong>

                <span>
                    ${shooter.name}
                </span>

                <span>
                    ${shooter.class}
                </span>

                <strong>
                    ${shooter.totalScore}
                </strong>

                <strong>
                    ${shooter.totalTwelves}
                </strong>

            `;


            table.appendChild(row);

        }

    );

}


// =====================================================
// CLASS FILTER
// =====================================================

const classFilter =
    document.getElementById(
        "class-filter"
    );


if (classFilter) {

    classFilter.addEventListener(

        "change",

        function () {

            displayStandings(
                this.value
            );

        }

    );

}


// =====================================================
// INITIAL LOAD
// =====================================================

displayStandings();
