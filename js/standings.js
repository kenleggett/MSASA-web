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


    // -------------------------------------------------
    // GET COMPLETE STANDINGS FIRST
    // -------------------------------------------------

    const allStandings =
        calculateStandings();


    // -------------------------------------------------
    // DETERMINE THE RANKING GROUP
    // -------------------------------------------------

    let rankingStandings =
        allStandings;


    if (selectedClass !== "all") {

        rankingStandings =
            allStandings.filter(
                shooter =>
                    shooter.class ===
                    selectedClass
            );

    }


    // -------------------------------------------------
    // CREATE RANK LOOKUP
    // -------------------------------------------------

    const rankLookup =
        new Map();


    rankingStandings.forEach(
        (shooter, index) => {

            rankLookup.set(
                shooter.name,
                {
                    rank: index + 1,
                    total: rankingStandings.length
                }
            );

        }
    );


    // -------------------------------------------------
    // APPLY CLASS FILTER
    // -------------------------------------------------

    let standings =
        rankingStandings;


    // -------------------------------------------------
    // APPLY SHOOTER SEARCH
    // -------------------------------------------------

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


    // -------------------------------------------------
    // CLEAR CURRENT LIST
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
    // DISPLAY SHOOTERS
    // -------------------------------------------------

    standings.forEach(
        (shooter) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className = "standing-row soy-result-row";


            const ranking =
                rankLookup.get(
                    shooter.name
                );


            row.innerHTML = `

                <strong>
                    ${ranking.rank}
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


            // -------------------------------------------------
            // SHOOTER SCORECARD
            // -------------------------------------------------

            row.style.cursor =
                "pointer";


            row.addEventListener(
                "click",
                function () {

                    const existing =
                        document.getElementById(
                            "details-" +
                            shooter.name
                                .replace(
                                    /\s+/g,
                                    "-"
                                )
                        );


                    if (existing) {

                        existing.remove();

                        return;

                    }


                    const details =
                        document.createElement(
                            "div"
                        );


                    details.id =
                        "details-" +
                        shooter.name
                            .replace(
                                /\s+/g,
                                "-"
                            );


                    details.className =
                        "shooter-details";


                    const countingEvents =
                        shooter.countingEvents ||
                        [];


                    let countingHTML =
                        "";


                    countingEvents.forEach(
                        event => {

                            countingHTML += `

                                <div class="score-line">

                                    <span>
                                        ${event.event}
                                    </span>

                                    <strong>
                                        ${event.score}
                                    </strong>

                                    <strong>
                                        ${event.twelves || 0}
                                    </strong>

                                    <span>
                                        COUNTS
                                    </span>

                                </div>

                            `;

                        }
                    );


                    const nonCountingEvents =
                        (shooter.events || [])
                            .filter(
                                event =>
                                    !countingEvents
                                        .includes(
                                            event
                                        )
                            );


                    let droppedHTML =
                        "";


                    nonCountingEvents.forEach(
                        event => {

                            droppedHTML += `

                                <div class="score-line dropped">

                                    <span>
                                        ${event.event}
                                    </span>

                                    <span>
                                        ${
                                            event.score ||
                                            "—"
                                        }
                                    </span>

                                    <span>
                                        ${
                                            event.twelves ||
                                            0
                                        }
                                    </span>

                                    <span>
                                        —
                                    </span>

                                </div>

                            `;

                        }
                    );


                    const championship =
                        shooter.championship ||
                        {};


                    details.innerHTML = `

                        <div class="scorecard">

                            <h3>
                                ${shooter.name}
                            </h3>

                            <p>
                                ${shooter.class}
                            </p>


                            <h4>
                                Counting Scores
                            </h4>


                            <div class="score-header">

                                <span>
                                    EVENT
                                </span>

                                <span>
                                    SCORE
                                </span>

                                <span>
                                    12s
                                </span>

                                <span>
                                    STATUS
                                </span>

                            </div>


                            ${countingHTML}


                            ${
                                droppedHTML
                                    ? `

                                        <h4>
                                            Non-Counting Events
                                        </h4>

                                        ${droppedHTML}

                                    `
                                    : ""
                            }


                            <h4>
                                State Championship
                            </h4>


                            <div class="score-line championship">

                                <span>
                                    State Championship
                                </span>

                                <strong>
                                    ${
                                        championship.score ||
                                        "—"
                                    }
                                </strong>

                                <strong>
                                    ${
                                        championship.twelves ||
                                        0
                                    }
                                </strong>

                                <span>
                                    COUNTS
                                </span>

                            </div>


                            <div class="score-total">

                                <span>
                                    SHOOTER OF THE YEAR
                                </span>

                                <strong>
                                    ${shooter.totalScore}
                                </strong>

                                <strong>
                                    ${shooter.totalTwelves}
                                    12s
                                </strong>

                            </div>


                        </div>

                    `;


                    row.insertAdjacentElement(
                        "afterend",
                        details
                    );

                }
            );

        }
    );
}

// =====================================================
// EVENT RESULTS
// =====================================================

function displayEventStandings(eventName) {

    const table =
        document.getElementById(
            "standings-body"
        );

    const classFilter =
        document.getElementById(
            "class-filter"
        );

    const searchBox =
        document.getElementById(
            "shooter-search"
        );


    if (!table) {
        return;
    }


    let results = [];


    // -------------------------------------------------
    // BUILD EVENT RESULTS
    // -------------------------------------------------

    shooters
        .filter(isValidShooter)
        .forEach(shooter => {

            let result = null;


            // State Championship
            if (
                eventName ===
                "State Championship"
            ) {

                if (
                    shooter.championship &&
                    typeof shooter.championship.score ===
                        "number" &&
                    shooter.championship.score > 0
                ) {

                    result = {

                        name:
                            shooter.name,

                        class:
                            shooter.class,

                        score:
                            shooter.championship.score,

                        twelves:
                            shooter.championship.twelves ||
                            0

                    };

                }

            }


            // Regular event
            else {

                const event =
                    (shooter.events || [])
                        .find(
                            item =>
                                item.event ===
                                eventName
                        );


                if (
                    event &&
                    typeof event.score ===
                        "number" &&
                    event.score > 0
                ) {

                    result = {

                        name:
                            shooter.name,

                        class:
                            shooter.class,

                        score:
                            event.score,

                        twelves:
                            event.twelves ||
                            0

                    };

                }

            }


            if (result) {

                results.push(result);

            }

        });


    // -------------------------------------------------
    // CLASS FILTER
    // -------------------------------------------------

    const selectedClass =
        classFilter
            ? classFilter.value
            : "all";


    if (
        selectedClass !==
        "all"
    ) {

        results =
            results.filter(
                shooter =>
                    shooter.class ===
                    selectedClass
            );

    }


    // -------------------------------------------------
    // SEARCH FILTER
    // -------------------------------------------------

    const search =
        searchBox
            ? searchBox.value
                .trim()
                .toLowerCase()
            : "";


    if (search !== "") {

        results =
            results.filter(
                shooter =>
                    shooter.name
                        .toLowerCase()
                        .includes(search)
            );

    }


    // -------------------------------------------------
    // SORT RESULTS
    // -------------------------------------------------

    results.sort(
        (a, b) => {

            if (
                b.score !==
                a.score
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


    // -------------------------------------------------
    // CLEAR TABLE
    // -------------------------------------------------

    table.innerHTML = "";


    // -------------------------------------------------
    // NO RESULTS
    // -------------------------------------------------

    if (
        results.length === 0
    ) {

        table.innerHTML = `

            <div class="standing-row">

                <strong>—</strong>

                <span>
                    No results found
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

    results.forEach(
        (shooter, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "standing-row event-result-row";


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
                    ${shooter.score}
                </strong>

                <strong>
                    ${shooter.twelves}
                </strong>

            `;


            table.appendChild(
                row
            );

        }
    );


    // -------------------------------------------------
    // UPDATE PAGE TITLE
    // -------------------------------------------------

    const title =
        document.querySelector(
            ".page-hero h1"
        );


    if (title) {

        title.textContent =
            eventName +
            " Results";

    }

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

    const eventFilter =
    document.getElementById(
        "event-filter"
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

             if (
    eventFilter &&
    eventFilter.value !==
        "soy"
) {

    displayEventStandings(
        eventFilter.value
    );

}

else {

    displayStandings(
        dropdown.value,

        searchBox
            ? searchBox.value
            : ""
    );

}

            }
        );
// Event results selector
if (eventFilter) {

    eventFilter.addEventListener(
        "change",
        function () {

            if (
                this.value ===
                "soy"
            ) {

                displayStandings(
                    dropdown
                        ? dropdown.value
                        : "all",

                    searchBox
                        ? searchBox.value
                        : ""
                );

            }

            else {

                displayEventStandings(
                    this.value
                );

            }

        }
    );

}
    }


    // Shooter search
    if (searchBox) {

        searchBox.addEventListener(
            "input",
            function () {

               if (
    eventFilter &&
    eventFilter.value !==
        "soy"
) {

    displayEventStandings(
        eventFilter.value
    );

}

else {

    displayStandings(
        dropdown
            ? dropdown.value
            : "all",

        searchBox.value
    );

}

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
