// =======================================================
// MISSISSIPPI ASA
// SHOOTER OF THE YEAR / STANDINGS
// =======================================================

let standings = [];


// =======================================================
// LOAD STANDINGS FROM API
// =======================================================

async function loadStandings() {

    try {

        const response = await fetch(
            "/api/soty?season=2026",
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                `API request failed: ${response.status}`
            );
        }

        const data = await response.json();

        if (!data.ok) {
            throw new Error(
                data.error || "API returned an error"
            );
        }

        if (!Array.isArray(data.standings)) {
            throw new Error(
                "Invalid standings data received"
            );
        }

        standings = data.standings;

        populateClasses();

        renderStandings();

    }

    catch (error) {

        console.error(
            "Unable to load standings:",
            error
        );

        const body =
            document.getElementById(
                "standings-body"
            );

        if (body) {

            body.innerHTML = `

                <div class="standing-row">

                    <span>!</span>

                    <span>
                        Unable to load standings
                    </span>

                    <span>—</span>

                    <span>—</span>

                    <span>—</span>

                </div>

            `;

        }

    }

}


// =======================================================
// POPULATE CLASS FILTER
// =======================================================

function populateClasses() {

    const select =
        document.getElementById(
            "class-filter"
        );

    if (!select) {
        return;
    }

    // Keep the All Classes option
    select.innerHTML = `
        <option value="all">
            All Classes
        </option>
    `;


    const classes = [
        ...new Set(

            standings
                .map(shooter => shooter.class_name)
                .filter(Boolean)

        )
    ];


    classes
        .sort((a, b) =>
            a.localeCompare(b)
        )
        .forEach(className => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                className;

            option.textContent =
                className;

            select.appendChild(
                option
            );

        });

}


// =======================================================
// GET EVENT SCORE
// =======================================================

function getEventResult(
    shooter,
    eventName
) {

    // Shooter of the Year
    if (eventName === "soy") {

        return {

            score:
                Number(
                    shooter.total_score || 0
                ),

            twelves:
                Number(
                    shooter.total_twelves || 0
                )

        };

    }


    // State Championship
    if (
        eventName ===
        "State Championship"
    ) {

        if (
            !shooter.championship
        ) {

            return null;

        }

        return {

            score:
                Number(
                    shooter.championship.score || 0
                ),

            twelves:
                Number(
                    shooter.championship.twelves || 0
                )

        };

    }


    // Qualifying events
    if (
        Array.isArray(
            shooter.top_three
        )
    ) {

        const result =
            shooter.top_three.find(
                event =>
                    event.event ===
                    eventName
            );

        if (result) {

            return {

                score:
                    Number(
                        result.score || 0
                    ),

                twelves:
                    Number(
                        result.twelves || 0
                    )

            };

        }

    }


    // The event may exist outside
    // the top three.
    //
    // Some API versions may provide
    // all qualifying events as
    // "qualifiers".

    if (
        Array.isArray(
            shooter.qualifiers
        )
    ) {

        const result =
            shooter.qualifiers.find(
                event =>
                    event.event ===
                    eventName
            );

        if (result) {

            return {

                score:
                    Number(
                        result.score || 0
                    ),

                twelves:
                    Number(
                        result.twelves || 0
                    )

            };

        }

    }


    return null;

}


// =======================================================
// RANK EVENT RESULTS
// =======================================================

function rankResults(results) {

    const ranked = [
        ...results
    ];


    ranked.sort(
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


            if (
                b.twelves !==
                a.twelves
            ) {

                return (
                    b.twelves -
                    a.twelves
                );

            }


            return a.name.localeCompare(
                b.name
            );

        }
    );


    return ranked;

}


// =======================================================
// RENDER STANDINGS
// =======================================================

function renderStandings() {

    const searchInput =
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

    const body =
        document.getElementById(
            "standings-body"
        );


    if (!body) {
        return;
    }


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedClass =
        classFilter
            ? classFilter.value
            : "all";


    const selectedEvent =
        eventFilter
            ? eventFilter.value
            : "soy";


    // ===================================================
    // BUILD RESULTS
    // ===================================================

    let results = [];


    standings.forEach(
        shooter => {

            const name =
                String(
                    shooter.name || ""
                );


            const className =
                String(
                    shooter.class_name ||
                    "Unclassified"
                );


            // Search filter
            if (
                search &&
                !name
                    .toLowerCase()
                    .includes(search)
            ) {

                return;

            }


            // Class filter
            if (
                selectedClass !==
                    "all" &&
                className !==
                    selectedClass
            ) {

                return;

            }


            const eventResult =
                getEventResult(
                    shooter,
                    selectedEvent
                );


            // Shooter does not have
            // a result for this event.
            if (!eventResult) {

                return;

            }


            results.push({

                shooter,
                name,
                className,

                score:
                    eventResult.score,

                twelves:
                    eventResult.twelves

            });

        }
    );


    // ===================================================
    // RANK RESULTS
    // ===================================================

    const ranked =
        rankResults(
            results
        );


    // ===================================================
    // NO RESULTS
    // ===================================================

    if (
        ranked.length === 0
    ) {

        body.innerHTML = `

            <div class="standing-row">

                <span>—</span>

                <span>
                    No results found
                </span>

                <span>—</span>

                <span>—</span>

                <span>—</span>

            </div>

        `;

        return;

    }


    // ===================================================
    // DISPLAY RESULTS
    // ===================================================

    body.innerHTML = "";


    ranked.forEach(
        (result, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "standing-row";


            // Highlight first place
            if (index === 0) {

                row.classList.add(
                    "first-place"
                );

            }


            row.innerHTML = `

                <span>
                    ${index + 1}
                </span>

                <span>
                    ${escapeHtml(
                        result.name
                    )}
                </span>

                <span>
                    ${escapeHtml(
                        result.className
                    )}
                </span>

                <span>
                    ${result.score}
                </span>

                <span>
                    ${result.twelves}
                </span>

            `;


            body.appendChild(
                row
            );

        }
    );

}


// =======================================================
// BASIC HTML ESCAPE
// =======================================================

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =======================================================
// INITIALIZE PAGE
// =======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const searchInput =
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


        // -----------------------------------------------
        // SEARCH
        // -----------------------------------------------

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                renderStandings
            );

        }


        // -----------------------------------------------
        // CLASS FILTER
        // -----------------------------------------------

        if (classFilter) {

            classFilter.addEventListener(
                "change",
                renderStandings
            );

        }


        // -----------------------------------------------
        // EVENT FILTER
        // -----------------------------------------------

        if (eventFilter) {

            eventFilter.addEventListener(
                "change",
                renderStandings
            );

        }


        // -----------------------------------------------
        // LOAD DATA
        // -----------------------------------------------

        loadStandings();

    }
);
