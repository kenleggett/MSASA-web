// =====================================================
// MISSISSIPPI ASA
// 2026 SHOOTER OF THE YEAR
// =====================================================


// -----------------------------------------------------
// INVALID DATA ROWS
// -----------------------------------------------------

const INVALID_CLASSES = [
    "Total Entries",
    "Column E",
    "Column G",
    "Column I",
    "Column K",
    "Column M",
    "Column O"
];


// -----------------------------------------------------
// CHECK FOR VALID SHOOTER
// -----------------------------------------------------

function isValidShooter(shooter) {

    if (!shooter) {
        return false;
    }

    if (!shooter.name || !shooter.class) {
        return false;
    }

    return !INVALID_CLASSES.some(
        invalid =>
            shooter.class
                .toLowerCase()
                .startsWith(invalid.toLowerCase())
    );
}


// -----------------------------------------------------
// CALCULATE SHOOTER
// -----------------------------------------------------

function calculateShooter(shooter) {

    const qualifyingEvents =
        shooter.events
            .filter(event =>
                typeof event.score === "number" &&
                event.score > 0
            )
            .sort(
                (a, b) => b.score - a.score
            );


    // Highest three qualifying scores
    const bestThree =
        qualifyingEvents.slice(0, 3);


    // State Championship
    const championshipScore =
        shooter.championship &&
        typeof shooter.championship.score === "number"
            ? shooter.championship.score
            : 0;


    // Add the three best qualifying scores
    const qualifyingTotal =
        bestThree.reduce(
            (total, event) =>
                total + event.score,
            0
        );


    // Final Shooter of the Year score
    const totalScore =
        qualifyingTotal +
        championshipScore;


    // 12s from the three counting qualifying scores
    const qualifyingTwelves =
        bestThree.reduce(
            (total, event) =>
                total + (event.twelves || 0),
            0
        );


    // Championship 12s
    const championshipTwelves =
        shooter.championship &&
        typeof shooter.championship.twelves === "number"
            ? shooter.championship.twelves
            : 0;


    // Final Shooter of the Year 12 count
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


// -----------------------------------------------------
// CALCULATE ALL STANDINGS
// -----------------------------------------------------

function calculateStandings() {

    return shooters
        .filter(isValidShooter)
        .map(calculateShooter)
        .sort((a, b) => {

            // Highest score first
            if (b.totalScore !== a.totalScore) {

                return (
                    b.totalScore -
                    a.totalScore
                );
            }


            // Tie breaker = 12 count
            return (
                b.totalTwelves -
                a.totalTwelves
            );

        });
}


// -----------------------------------------------------
// DISPLAY STANDINGS
// -----------------------------------------------------

function displayStandings(
    classFilterValue = "all",
    searchValue = ""
) {

    const table =
        document.getElementById(
            "standings-body"
        );


    if (!table) {
        return;
    }


    let standings =
        calculateStandings();


    // -------------------------------------------------
    // CLASS FILTER
    // -------------------------------------------------

    if (classFilterValue !== "all") {

        standings =
            standings.filter(
                shooter =>
                    shooter.class ===
                    classFilterValue
            );
    }


    // -------------------------------------------------
    // SEARCH FILTER
    // -------------------------------------------------

    const search =
        searchValue
            .trim()
            .toLowerCase();


    if (search !== "") {

        standings =
            standings.filter(
                shooter =>
                    shooter.name
                        .toLowerCase()
                        .includes(search)
            );
    }


    // -------------------------------------------------
    // CLEAR TABLE
    // -------------------------------------------------

    table.innerHTML = "";


    // -------------------------------------------------
    // NO RESULTS
    // -------------------------------------------------

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


    // -------------------------------------------------
    // DISPLAY RESULTS
    // -------------------------------------------------

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


// -----------------------------------------------------
// BUILD CLASS DROPDOWN
// -----------------------------------------------------

function buildClassFilter() {

    const classFilter =
        document.getElementById(
            "class-filter"
        );


    if (!classFilter) {
        return;
    }


    // Clear existing options
    classFilter.innerHTML = "";


    // All Classes
    const allOption =
        document.createElement(
            "option"
        );


    allOption.value = "all";

    allOption.textContent =
        "All Classes";


    classFilter.appendChild(
        allOption
    );


    // Get classes from data file
    const classes =
        [...asaClasses].sort(
            (a, b) =>
                a.localeCompare(b)
        );


    classes.forEach(
        className => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                className;


            option.textContent =
                className;


            classFilter.appendChild(
                option
            );

        }
    );
}


// -----------------------------------------------------
// CONNECT CONTROLS
// -----------------------------------------------------

function connectControls() {

    const classFilter =
        document.getElementById(
            "class-filter"
        );


    const shooterSearch =
        document.getElementById(
            "shooter-search"
        );


    // Class dropdown
    if (classFilter) {

        classFilter.addEventListener(
            "change",
            function () {

                displayStandings(
                    this.value,
                    shooterSearch
                        ? shooterSearch.value
                        : ""
                );

            }
        );
    }


    // Shooter search
    if (shooterSearch) {

        shooterSearch.addEventListener(
            "input",
            function () {

                displayStandings(
                    classFilter
                        ? classFilter.value
                        : "all",

                    this.value
                );

            }
        );
    }
}


// -----------------------------------------------------
// INITIALIZE PAGE
// -----------------------------------------------------

buildClassFilter();

connectControls();

displayStandings();
