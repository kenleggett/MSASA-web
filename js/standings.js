// =====================================================
// MISSISSIPPI ASA
// 2026 SHOOTER OF THE YEAR
// =====================================================

const INVALID_CLASSES = [
    "Total Entries",
    "Column E",
    "Column G",
    "Column I",
    "Column K",
    "Column M",
    "Column O"
];


// Check whether this is a real shooter record
function isValidShooter(shooter) {

    if (!shooter || !shooter.name || !shooter.class) {
        return false;
    }

    return !INVALID_CLASSES.some(
        invalid =>
            shooter.class
                .toLowerCase()
                .startsWith(invalid.toLowerCase())
    );
}


// Calculate one shooter
function calculateShooter(shooter) {

    const qualifyingEvents = shooter.events
        .filter(event =>
            typeof event.score === "number" &&
            event.score > 0
        )
        .sort((a, b) => b.score - a.score);


    // Highest three qualifying scores
    const bestThree =
        qualifyingEvents.slice(0, 3);


    // Championship
    const championshipScore =
        shooter.championship &&
        typeof shooter.championship.score === "number"
            ? shooter.championship.score
            : 0;


    const qualifyingTotal =
        bestThree.reduce(
            (total, event) =>
                total + event.score,
            0
        );


    const totalScore =
        qualifyingTotal +
        championshipScore;


    const qualifyingTwelves =
        bestThree.reduce(
            (total, event) =>
                total + (event.twelves || 0),
            0
        );


    const championshipTwelves =
        shooter.championship &&
        typeof shooter.championship.twelves === "number"
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
// CALCULATE STANDINGS
// =====================================================

function calculateStandings() {

    return shooters
        .filter(isValidShooter)
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

    const table =
        document.getElementById("standings-body");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    let standings =
        calculateStandings();


    if (filter !== "all") {

        standings =
            standings.filter(
                shooter =>
                    shooter.class.toLowerCase() ===
                    filter.toLowerCase()
            );
    }


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


    standings.forEach((shooter, index) => {

        const row =
            document.createElement("div");

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

    });
}

// =====================================================
// CLASS FILTER
// =====================================================

const classFilter =
    document.getElementById("class-filter");


function buildClassFilter() {

    if (!classFilter) {
        return;
    }

    // Remove the temporary options
    classFilter.innerHTML = "";

    // All classes option
    const allOption =
        document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "All Classes";

    classFilter.appendChild(allOption);


    // Get actual classes from the data file
    const classes = [...asaClasses].sort(
        (a, b) => a.localeCompare(b)
    );


    classes.forEach(className => {

        const option =
            document.createElement("option");

        option.value = className;

        option.textContent = className;

        classFilter.appendChild(option);

    });


    // Filter when selection changes
    classFilter.addEventListener(
        "change",
        function () {

            displayStandings(this.value);

        }
    );

}


// =====================================================
// INITIALIZE
// =====================================================

buildClassFilter();

displayStandings();


// =====================================================
// INITIALIZE
// =====================================================

displayStandings();
