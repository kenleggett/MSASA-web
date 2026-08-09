// =======================================================
// MISSISSIPPI ASA
// 2026 SHOOTER OF THE YEAR
// STANDINGS PAGE JAVASCRIPT
// =======================================================

let standings = [];


// =======================================================
// LOAD STANDINGS FROM API
// =======================================================

async function loadStandings() {

    const body =
        document.getElementById("standings-body");

    try {

        const response =
            await fetch("/api/soty", {
                cache: "no-store"
            });

        if (!response.ok) {
            throw new Error(
                `HTTP error ${response.status}`
            );
        }

        const data =
            await response.json();

        if (!data.ok) {
            throw new Error(
                data.error || "API returned an error"
            );
        }

        standings =
            Array.isArray(data.standings)
                ? data.standings
                : [];

        populateClasses();

        renderStandings();

    }

    catch (error) {

        console.error(
            "Unable to load standings:",
            error
        );

        if (body) {

            body.innerHTML = `
                <div class="standing-row">
                    <span>—</span>
                    <span>Unable to load standings</span>
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
        document.getElementById("class-filter");

    if (!select) {
        return;
    }

    // Remember current selection
    const currentValue =
        select.value || "all";

    // Remove everything except All Classes
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
    ].sort((a, b) =>
        a.localeCompare(b)
    );

    classes.forEach(className => {

        const option =
            document.createElement("option");

        option.value =
            className;

        option.textContent =
            className;

        select.appendChild(option);

    });

    // Restore selection if it still exists
    if (
        [...select.options]
            .some(option =>
                option.value === currentValue
            )
    ) {

        select.value =
            currentValue;

    }

}


// =======================================================
// GET EVENT RESULT FOR A SHOOTER
// =======================================================

function getEventResult(shooter, eventName) {

    // -----------------------------------------------
    // STATE CHAMPIONSHIP
    // -----------------------------------------------

    if (eventName === "State Championship") {

        if (
            shooter.championship &&
            shooter.championship.event ===
                "State Championship"
        ) {

            return {
                event_id:
                    shooter.championship.event_id,

                event:
                    shooter.championship.event,

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

        return null;
    }


    // -----------------------------------------------
    // QUALIFYING EVENT
    // -----------------------------------------------

    if (
        !Array.isArray(
            shooter.qualifiers
        )
    ) {

        return null;

    }

    const result =
        shooter.qualifiers.find(
            event =>
                event.event === eventName
        );

    if (!result) {
        return null;
    }

    return {
        event_id:
            result.event_id,

        event:
            result.event,

        score:
            Number(result.score || 0),

        twelves:
            Number(result.twelves || 0)
    };

}


// =======================================================
// RENDER SOTY RESULTS
// =======================================================

function renderSotyResults(filtered) {

    const body =
        document.getElementById(
            "standings-body"
        );

    body.innerHTML = "";


    if (filtered.length === 0) {

        body.innerHTML = `
            <div class="standing-row">
                <span>—</span>
                <span>No shooters found</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
            </div>
        `;

        return;
    }


    filtered.forEach(shooter => {

        const row =
            document.createElement("div");

        row.className =
            "standing-row";


        // IMPORTANT:
        // Only completed SOTY shooters
        // receive a rank.

        const rank =
            shooter.eligible &&
            shooter.rank !== null &&
            shooter.rank !== undefined
                ? shooter.rank
                : "—";


        row.innerHTML = `

            <span>
                ${rank}
            </span>

            <span>
                ${escapeHtml(
                    shooter.name || "Unknown"
                )}
            </span>

            <span>
                ${escapeHtml(
                    shooter.class_name ||
                    "Unclassified"
                )}
            </span>

            <span>
                ${Number(
                    shooter.total_score || 0
                )}
            </span>

            <span>
                ${Number(
                    shooter.total_twelves || 0
                )}
            </span>

        `;

        body.appendChild(row);

    });

}


// =======================================================
// RENDER EVENT RESULTS
// =======================================================

function renderEventResults(
    filtered,
    eventName
) {

    const body =
        document.getElementById(
            "standings-body"
        );

    body.innerHTML = "";


    // -----------------------------------------------
    // BUILD EVENT RESULTS
    // -----------------------------------------------

    const eventResults = [];


    filtered.forEach(shooter => {

        const result =
            getEventResult(
                shooter,
                eventName
            );

        if (!result) {
            return;
        }


        eventResults.push({

            shooter,

            score:
                result.score,

            twelves:
                result.twelves

        });

    });


    // -----------------------------------------------
    // SORT EVENT RESULTS
    //
    // Highest score first.
    // 12s break ties.
    // -----------------------------------------------

    eventResults.sort((a, b) => {

        if (b.score !== a.score) {

            return b.score - a.score;

        }

        if (b.twelves !== a.twelves) {

            return b.twelves - a.twelves;

        }

        return a.shooter.name.localeCompare(
            b.shooter.name
        );

    });


    // -----------------------------------------------
    // NO RESULTS
    // -----------------------------------------------

    if (eventResults.length === 0) {

        body.innerHTML = `
            <div class="standing-row">
                <span>—</span>
                <span>No results found</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
            </div>
        `;

        return;
    }


    // -----------------------------------------------
    // DISPLAY RESULTS
    // -----------------------------------------------

    eventResults.forEach(
        (entry, index) => {

            const shooter =
                entry.shooter;

            const row =
                document.createElement("div");

            row.className =
                "standing-row";


            row.innerHTML = `

                <span>
                    ${index + 1}
                </span>

                <span>
                    ${escapeHtml(
                        shooter.name ||
                        "Unknown"
                    )}
                </span>

                <span>
                    ${escapeHtml(
                        shooter.class_name ||
                        "Unclassified"
                    )}
                </span>

                <span>
                    ${entry.score}
                </span>

                <span>
                    ${entry.twelves}
                </span>

            `;


            body.appendChild(row);

        }
    );

}


// =======================================================
// MAIN RENDER FUNCTION
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


    // -----------------------------------------------
    // FILTER SHOOTERS
    // -----------------------------------------------

    const filtered =
        standings.filter(shooter => {

            const name =
                String(
                    shooter.name || ""
                ).toLowerCase();


            const classMatches =
                selectedClass === "all" ||
                shooter.class_name ===
                    selectedClass;


            const nameMatches =
                name.includes(search);


            return (
                classMatches &&
                nameMatches
            );

        });


    // -----------------------------------------------
    // SHOOTER OF THE YEAR
    // -----------------------------------------------

    if (
        selectedEvent === "soy"
    ) {

        renderSotyResults(
            filtered
        );

        return;

    }


    // -----------------------------------------------
    // INDIVIDUAL EVENT
    // -----------------------------------------------

    renderEventResults(
        filtered,
        selectedEvent
    );

}


// =======================================================
// SIMPLE HTML ESCAPE
// =======================================================

function escapeHtml(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


// =======================================================
// EVENT LISTENERS
// =======================================================

function initializeStandingsPage() {

    const search =
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


    if (search) {

        search.addEventListener(
            "input",
            renderStandings
        );

    }


    if (classFilter) {

        classFilter.addEventListener(
            "change",
            renderStandings
        );

    }


    if (eventFilter) {

        eventFilter.addEventListener(
            "change",
            renderStandings
        );

    }


    loadStandings();

}


// =======================================================
// START APPLICATION
// =======================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeStandingsPage
    );

} else {

    initializeStandingsPage();

}
