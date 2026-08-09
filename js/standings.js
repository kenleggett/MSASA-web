// =====================================================
// MISSISSIPPI ASA
// 2026 SHOOTER OF THE YEAR
// PUBLIC STANDINGS PAGE
// =====================================================

let standingsData = [];
let shooterData = [];


// =====================================================
// PUBLIC CLASS NAMES
// =====================================================
//
// IMPORTANT:
// The database may contain "Semi-Pro Open".
// The public website will display it as "Semi-Pro".
//

const ASA_CLASSES = [

    "Semi-Pro",
    "Known 50",
    "Senior Known 50",

    "Men's Open 45",
    "Known 45",
    "Hunter 45",
    "Senior Open",
    "Senior Known",
    "Senior Hunter 45",

    "Women's Open 45",
    "Women's Known 45",

    "Open 40",
    "Known 40",
    "Men's Pins 40",
    "Crossbow",

    "Super Senior",
    "Super Senior Known",
    "Senior Masters",
    "Senior Masters Known",
    "Senior Pins",
    "Super Senior Pins",

    "Women's Known 40",
    "Women's Pins 40",
    "Women's Senior Known",
    "Women's Super Senior Known",

    "Young Adult Open Male",
    "Young Adult Open Female",
    "Young Adult Pins Male",
    "Young Adult Pins Female",

    "Women's Pins 30",
    "Men's Pins 30",
    "Senior Legends",
    "Barebow Recurve",
    "Olympic Recurve",

    "Youth Open Boys",
    "Youth Open Girls",
    "Youth Pins Boys",
    "Youth Pins Girls",
    "Youth Olympic Recurve",
    "Youth Barebow Recurve",

    "Eagle Open Boys",
    "Eagle Open Girls",
    "Eagle Pins Boys",
    "Eagle Pins Girls",
    "Eagle Recurve",
    "Jr Eagle Open"

];


// =====================================================
// DISPLAY CLASS NAME
// =====================================================

function displayClassName(className) {

    if (className === "Semi-Pro Open") {
        return "Semi-Pro";
    }

    return className || "Unclassified";

}


// =====================================================
// CLASS MATCHING
// =====================================================
//
// Allows the public "Semi-Pro" filter to match either:
//     Semi-Pro
//     Semi-Pro Open
//
// This lets us keep existing database records intact.
//

function classMatches(actualClass, selectedClass) {

    if (selectedClass === "all") {
        return true;
    }

    if (selectedClass === "Semi-Pro") {

        return (
            actualClass === "Semi-Pro" ||
            actualClass === "Semi-Pro Open"
        );

    }

    return actualClass === selectedClass;

}


// =====================================================
// LOAD DATA
// =====================================================

async function loadStandings() {

    try {

        const [
            standingsResponse,
            shootersResponse
        ] = await Promise.all([

            fetch("/api/standings"),

            fetch("/api/shooters")

        ]);


        if (!standingsResponse.ok) {

            throw new Error(
                "Unable to load standings."
            );

        }


        if (!shootersResponse.ok) {

            throw new Error(
                "Unable to load shooter data."
            );

        }


        const standingsJson =
            await standingsResponse.json();


        const shootersJson =
            await shootersResponse.json();


        standingsData =
            standingsJson.standings || [];


        shooterData =
            shootersJson.shooters || [];


        buildClassDropdown();

        connectControls();

        initializeStandingsView();

    }

    catch (error) {

        console.error(error);


        const table =
            document.getElementById(
                "standings-body"
            );


        if (table) {

            table.innerHTML = `

                <div class="standing-row">

                    <strong>!</strong>

                    <span>
                        Unable to load standings
                    </span>

                    <span>—</span>

                    <strong>—</strong>

                    <strong>—</strong>

                </div>

            `;

        }

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


    dropdown.innerHTML = `

        <option value="all">
            All Classes
        </option>

    `;


    ASA_CLASSES.forEach(className => {

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

    });

}


// =====================================================
// CONNECT CONTROLS
// =====================================================

function connectControls() {

    const searchBox =
        document.getElementById(
            "shooter-search"
        );


    const classFilter =
        document.getElementById(
            "class-filter"
        );


    const eventFilter =
        document.getElementById(
            "event-filter"
        );


    if (searchBox) {

        searchBox.addEventListener(
            "input",
            refreshStandings
        );

    }


    if (classFilter) {

        classFilter.addEventListener(
            "change",
            refreshStandings
        );

    }


    if (eventFilter) {

        eventFilter.addEventListener(
            "change",
            refreshStandings
        );

    }

}


// =====================================================
// INITIALIZE
// =====================================================

function initializeStandingsView() {

    const eventFilter =
        document.getElementById(
            "event-filter"
        );


    if (eventFilter) {

        eventFilter.value =
            "soy";

    }


    displayStandings();

}


// =====================================================
// REFRESH
// =====================================================

function refreshStandings() {

    const eventFilter =
        document.getElementById(
            "event-filter"
        );


    const classFilter =
        document.getElementById(
            "class-filter"
        );


    const searchBox =
        document.getElementById(
            "shooter-search"
        );


    const selectedEvent =
        eventFilter
            ? eventFilter.value
            : "soy";


    const selectedClass =
        classFilter
            ? classFilter.value
            : "all";


    const searchText =
        searchBox
            ? searchBox.value
            : "";


    if (selectedEvent === "soy") {

        displayStandings(
            selectedClass,
            searchText
        );

    }

    else {

        displayEventStandings(
            selectedEvent,
            selectedClass,
            searchText
        );

    }

}


// =====================================================
// DISPLAY SHOOTER OF THE YEAR
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
    // ONLY COMPLETED / ELIGIBLE SOTY SHOOTERS
    // -------------------------------------------------

    let results =
        standingsData.filter(
            shooter =>
                shooter.eligible === true
        );


    // -------------------------------------------------
    // CLASS FILTER
    // -------------------------------------------------

    if (selectedClass !== "all") {

        results =
            results.filter(
                shooter =>
                    classMatches(
                        shooter.class_name,
                        selectedClass
                    )
            );

    }


    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------

    const search =
        searchText
            .trim()
            .toLowerCase();


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
    // SORT
    // -------------------------------------------------

    results.sort((a, b) => {

        // Class first
        if (
            a.class_name !==
            b.class_name
        ) {

            return displayClassName(
                a.class_name
            ).localeCompare(
                displayClassName(
                    b.class_name
                )
            );

        }


        // Higher score first
        if (
            b.total_score !==
            a.total_score
        ) {

            return (
                b.total_score -
                a.total_score
            );

        }


        // Higher 12 count
        return (
            b.total_twelves -
            a.total_twelves
        );

    });


    table.innerHTML = "";


    // -------------------------------------------------
    // NO RESULTS
    // -------------------------------------------------

    if (results.length === 0) {

        table.innerHTML = `

            <div class="standing-row">

                <strong>—</strong>

                <span>
                    No completed Shooter of the Year
                    standings found
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

    results.forEach(shooter => {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "standing-row soy-result-row";


        if (shooter.rank === 1) {

            row.classList.add(
                "podium-first"
            );

        }


        if (shooter.rank === 2) {

            row.classList.add(
                "podium-second"
            );

        }


        if (shooter.rank === 3) {

            row.classList.add(
                "podium-third"
            );

        }


        row.innerHTML = `

            <strong>
                ${shooter.rank || "—"}
            </strong>

            <span>
                ${shooter.name}
            </span>

            <span>
                ${displayClassName(
                    shooter.class_name
                )}
            </span>

            <strong>
                ${shooter.total_score}
            </strong>

            <strong>
                ${shooter.total_twelves}
            </strong>

        `;


        table.appendChild(
            row
        );


        // -------------------------------------------------
        // CLICK FOR SCORECARD
        // -------------------------------------------------

        row.style.cursor =
            "pointer";


        row.addEventListener(
            "click",
            function () {

                const existing =
                    document.getElementById(
                        "details-" +
                        shooter.shooter_id
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
                    shooter.shooter_id;


                details.className =
                    "shooter-details";


                const topThree =
                    shooter.top_three || [];


                let countingHTML =
                    "";


                topThree.forEach(
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
                                    ${event.twelves}
                                </strong>

                                <span>
                                    COUNTS
                                </span>

                            </div>

                        `;

                    }
                );


                const championship =
                    shooter.championship;


                details.innerHTML = `

                    <div class="scorecard">

                        <h3>
                            ${shooter.name}
                        </h3>

                        <p>
                            ${displayClassName(
                                shooter.class_name
                            )}
                        </p>

                        <p>

                            <strong>
                                Qualification Status:
                            </strong>

                            ${shooter.qualification_status}

                        </p>


                        <h4>
                            Counting Qualifying Scores
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


                        <div class="score-line">

                            <span>
                                Qualifying Total
                            </span>

                            <strong>
                                ${shooter.qualifier_score}
                            </strong>

                            <strong>
                                ${shooter.qualifier_twelves}
                            </strong>

                            <span>
                                BEST 3
                            </span>

                        </div>


                        <h4>
                            State Championship
                        </h4>


                        <div class="score-line championship">

                            <span>
                                State Championship
                            </span>

                            <strong>
                                ${
                                    championship
                                        ? championship.score
                                        : "—"
                                }
                            </strong>

                            <strong>
                                ${
                                    championship
                                        ? championship.twelves
                                        : "—"
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
                                ${shooter.total_score}
                            </strong>

                            <strong>
                                ${shooter.total_twelves}
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

    });

}


// =====================================================
// EVENT RESULTS
// =====================================================

function displayEventStandings(
    eventName,
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


    let results = [];


    shooterData.forEach(
        shooter => {

            let eventResult =
                null;


            // -------------------------------------------------
            // STATE CHAMPIONSHIP
            // -------------------------------------------------

            if (
                eventName ===
                "State Championship"
            ) {

                if (
                    shooter.championship &&
                    typeof shooter
                        .championship
                        .score ===
                        "number"
                ) {

                    eventResult = {

                        name:
                            shooter.name,

                        class_name:
                            shooter.class,

                        score:
                            shooter
                                .championship
                                .score,

                        twelves:
                            shooter
                                .championship
                                .twelves || 0

                    };

                }

            }


            // -------------------------------------------------
            // NORMAL QUALIFIER
            // -------------------------------------------------

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
                        "number"
                ) {

                    eventResult = {

                        name:
                            shooter.name,

                        class_name:
                            shooter.class,

                        score:
                            event.score,

                        twelves:
                            event.twelves || 0

                    };

                }

            }


            if (eventResult) {

                results.push(
                    eventResult
                );

            }

        }
    );


    // -------------------------------------------------
    // CLASS FILTER
    // -------------------------------------------------

    if (selectedClass !== "all") {

        results =
            results.filter(
                shooter =>
                    classMatches(
                        shooter.class_name,
                        selectedClass
                    )
            );

    }


    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------

    const search =
        searchText
            .trim()
            .toLowerCase();


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
    // SORT
    // -------------------------------------------------

    results.sort((a, b) => {

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

    });


    table.innerHTML = "";


    // -------------------------------------------------
    // NO RESULTS
    // -------------------------------------------------

    if (results.length === 0) {

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
    // DISPLAY EVENT RESULTS
    // -------------------------------------------------

    results.forEach(
        (shooter, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "standing-row event-result-row";


            if (index === 0) {

                row.classList.add(
                    "podium-first"
                );

            }


            if (index === 1) {

                row.classList.add(
                    "podium-second"
                );

            }


            if (index === 2) {

                row.classList.add(
                    "podium-third"
                );

            }


            row.innerHTML = `

                <strong>
                    ${index + 1}
                </strong>

                <span>
                    ${shooter.name}
                </span>

                <span>
                    ${displayClassName(
                        shooter.class_name
                    )}
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

}


// =====================================================
// START APPLICATION
// =====================================================

loadStandings();
