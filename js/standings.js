// =====================================================
// MISSISSIPPI ASA
// 2026 SHOOTER OF THE YEAR
// =====================================================


// Calculate one shooter's standings information
function calculateShooter(shooter) {

    // Get qualifying events that have a score
    const qualifyingEvents = shooter.events
        .filter(event =>
            typeof event.score === "number" &&
            event.score > 0
        )
        .sort((a, b) =>
            b.score - a.score
        );


    // Highest three qualifying scores
    const bestThree =
        qualifyingEvents.slice(0, 3);


    // Championship score
    const championshipScore =
        shooter.championship &&
        typeof shooter.championship.score === "number"
            ? shooter.championship.score
            : 0;


    // Total of highest three qualifying scores
    const qualifyingTotal =
        bestThree.reduce(
            (total, event) =>
                total + event.score,
            0
        );


    // Shooter of the Year total
    const totalScore =
        qualifyingTotal +
        championshipScore;


    // 12s from the three counting qualifying events
    const qualifyingTwelves =
        bestThree.reduce(
            (total, event) =>
                total + (event.twelves || 0),
            0
        );


    // Championship 12s
    const championshipTwelves =
        shooter.championship &&
        shooter.championship.twelves
            ? shooter.championship.twelves
            : 0;


    const totalTwelves =
        qualifyingTwelves +
        championshipTwelves;


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

            // Highest score first
            if (
                b.totalScore !==
                a.totalScore
            ) {

                return (
                    b.totalScore -
                    a.totalScore
                );

            }


            // Tie breaker:
            // highest total 12 count
            return (
                b.totalTwelves -
                a.totalTwelves
            );

        });

}



// =====================================================
// DISPLAY STANDINGS
// =====================================================

function displayStandings(
    filter = "all"
) {

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


    // Filter by class
    if (filter !== "all") {

        standings =
            standings.filter(
                shooter =>
                    shooter.class
                        .toLowerCase() ===
                    filter.toLowerCase()
            );

    }


    // No shooters
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


    // Create rows
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
// INITIALIZE
// =====================================================

displayStandings();
