// =====================================================
// MISSISSIPPI ASA
// 2026 SHOOTER OF THE YEAR
// =====================================================

function isValidShooter(shooter) {

    if (!shooter) {
        return false;
    }

    if (!shooter.name || !shooter.class) {
        return false;
    }

    const invalidClasses = [
        "Total Entries",
        "Column E",
        "Column G",
        "Column I",
        "Column K",
        "Column M",
        "Column O"
    ];

    return !invalidClasses.some(
        invalid =>
            shooter.class
                .toLowerCase()
                .startsWith(
                    invalid.toLowerCase()
                )
    );
}


// =====================================================
// CALCULATE SHOOTER
// =====================================================

function calculateShooter(shooter) {

    const qualifyingEvents =
        (shooter.events || [])
            .filter(
                event =>
                    typeof event.score === "number" &&
                    event.score > 0
            )
            .sort(
                (a, b) =>
                    b.score - a.score
            );


    // Best three qualifying scores
    const bestThree =
        qualifyingEvents.slice(0, 3);


    // State Championship score
    const championshipScore =
        shooter.championship &&
        typeof shooter.championship.score === "number"
            ? shooter.championship.score
            : 0;


    // Add best three qualifying scores
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


    // 12s from best three qualifying events
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


    // Final 12 count
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
        .filter(isValidShooter)
        .map(calculateShooter)
        .sort(
            (a, b) => {

                if (
                    b.totalScore !==
                    a.totalScore
                ) {

                    return (
                        b.totalScore -
                        a.totalScore
                    );

                }

                return (
                    b.totalTwelves -
                    a.totalTwelves
                );

            }
        );
}


// =====================================================
// DISPLAY STANDINGS
// =====================================================

function displayStandings(
    selectedClass = "all",
    searchText = ""
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


    // Class filter
    if (selectedClass !== "all") {

        standings =
            standings.filter(
                shooter =>
                    shooter.class ===
                    selectedClass
            );

    }


    // Shooter search
    const search =
        searchText
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


    // Clear old rows
    table.innerHTML = "";


    // No results
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


    // Display shooters
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
// BUILD CLASS DROPDOWN
// =====================================================

function buildClassDropdown() {

    const dropdown =
        document.getElementById(
            "class-filter"
        );


    if (!dropdown) {
        return;
    }


    // Clear existing options
    dropdown.innerHTML = "";


    // All Classes
    const allOption =
        document.createElement(
            "option"
        );


    allOption.value = "all";

    allOption.textContent =
        "All Classes";


    dropdown.appendChild(
        allOption
    );


    // Get classes from actual shooter data
    const classes =
        [...new Set(

            shooters
                .filter(isValidShooter)
                .map(
                    shooter =>
                        shooter.class
                )

        )].sort(
            (a, b) =>
                a.localeCompare(b)
        );


    // Add each class
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


            dropdown.appendChild(
                option
            );

        }
    );
}


// =====================================================
// CONNECT CONTROLS
// =====================================================

function connectControls() {

    const dropdown =
        document.getElementById(
            "class-filter"
        );


    const searchBox =
        document.getElementById(
            "shooter-search"
        );


    // Class filter
    if (dropdown) {

        dropdown.addEventListener(
            "change",
            function () {

                displayStandings(
                    dropdown.value,

                    searchBox
                        ? searchBox.value
                        : ""
                );

            }
        );

    }


    // Shooter search
    if (searchBox) {

        searchBox.addEventListener(
            "input",
            function () {

                displayStandings(

                    dropdown
                        ? dropdown.value
                        : "all",

                    searchBox.value

                );

            }
        );

    }
}


// =====================================================
// START PAGE
// =====================================================

buildClassDropdown();

connectControls();

displayStandings();
