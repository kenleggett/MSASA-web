// =====================================================
// MISSISSIPPI ASA
// SHOOTER OF THE YEAR DATA
// =====================================================

const shooters = [

    // Example structure:
    //
    // {
    //     name: "Shooter Name",
    //     class: "Known",
    //     scores: [
    //         { score: 0, twelves: 0 },
    //         { score: 0, twelves: 0 },
    //         { score: 0, twelves: 0 },
    //         { score: 0, twelves: 0 }
    //     ]
    // }

];


// =====================================================
// CALCULATE SHOOTER TOTAL
// =====================================================

function calculateShooter(shooter) {

    const validScores = shooter.scores
        .filter(event => event.score > 0)
        .sort((a, b) => b.score - a.score);

    const countingScores = validScores.slice(0, 4);

    const totalScore = countingScores.reduce(
        (total, event) => total + event.score,
        0
    );

    const totalTwelves = countingScores.reduce(
        (total, event) => total + event.twelves,
        0
    );

    return {
        ...shooter,
        totalScore,
        totalTwelves
    };
}


// =====================================================
// SORT STANDINGS
// =====================================================

function calculateStandings() {

    return shooters
        .map(calculateShooter)
        .sort((a, b) => {

            if (b.totalScore !== a.totalScore) {
                return b.totalScore - a.totalScore;
            }

            return b.totalTwelves - a.totalTwelves;

        });

}


// =====================================================
// DISPLAY STANDINGS
// =====================================================

function displayStandings(filter = "all") {

    const table = document.getElementById(
        "standings-body"
    );

    if (!table) {
        return;
    }

    table.innerHTML = "";

    let standings = calculateStandings();

    if (filter !== "all") {

        standings = standings.filter(
            shooter =>
                shooter.class.toLowerCase() === filter
        );

    }


    if (standings.length === 0) {

        table.innerHTML = `
            <div class="standing-row">
                <strong>—</strong>
                <span>Standings Coming Soon</span>
                <span>—</span>
                <strong>—</strong>
                <strong>—</strong>
            </div>
        `;

        return;
    }


    standings.forEach((shooter, index) => {

        const row = document.createElement("div");

        row.className = "standing-row";

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

    });

}


// =====================================================
// CLASS FILTER
// =====================================================

const classFilter =
    document.getElementById("class-filter");

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
// INITIAL DISPLAY
// =====================================================

displayStandings();
