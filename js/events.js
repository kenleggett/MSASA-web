/* =========================================================
   MISSISSIPPI ASA
   DYNAMIC EVENTS + EVENT DETAILS
   ========================================================= */


/* =========================================================
   GLOBAL EVENT DATA
   ========================================================= */

let events = [];


/* =========================================================
   LOAD EVENTS FROM D1 DATABASE
   ========================================================= */

async function loadEvents() {

    const eventList =
        document.querySelector(".event-list");


    if (!eventList) {
        return;
    }


    try {

        eventList.innerHTML = `
            <div class="event-loading">
                Loading Mississippi ASA events...
            </div>
        `;


        const response =
            await fetch("/api/events");


        if (!response.ok) {
            throw new Error(
                "Unable to load events."
            );
        }


        const data =
            await response.json();


        if (!data.ok) {
            throw new Error(
                data.error ||
                "Unable to load events."
            );
        }


        events =
            Array.isArray(data.events)
                ? data.events
                : [];


        renderEvents();


    } catch (error) {

        console.error(
            "Events API error:",
            error
        );


        eventList.innerHTML = `
            <div class="event-loading">
                <strong>
                    Unable to load events.
                </strong>

                <p>
                    Please try again later.
                </p>
            </div>
        `;

    }

}


/* =========================================================
   FORMAT EVENT DATE
   ========================================================= */

function formatEventDate(dateValue) {

    if (!dateValue) {

        return {
            month: "TBD",
            day: "—"
        };

    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {

        return {
            month: "TBD",
            day: "—"
        };

    }


    return {

        month:
            date.toLocaleDateString(
                "en-US",
                {
                    month: "short"
                }
            ).toUpperCase(),

        day:
            date.toLocaleDateString(
                "en-US",
                {
                    day: "numeric"
                }
            )

    };

}


/* =========================================================
   FORMAT FULL DATE FOR MODAL
   ========================================================= */

function formatFullDate(dateValue) {

    if (!dateValue) {
        return "Date TBD";
    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================================================
   ESCAPE HTML
   Prevents database text from being interpreted as HTML.
   ========================================================= */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   BUILD EVENT CARDS
   ========================================================= */

function renderEvents() {

    const eventList =
        document.querySelector(".event-list");


    if (!eventList) {
        return;
    }


    if (!events.length) {

        eventList.innerHTML = `
            <div class="event-loading">
                No events are currently scheduled.
            </div>
        `;

        return;

    }


    eventList.innerHTML =
        events.map(event => {

            const date =
                formatEventDate(
                    event.event_date
                );


            const isChampionship =
                String(
                    event.event_type || ""
                ).toLowerCase()
                .includes("championship");


            const location =
                event.address ||
                "Location TBD";


            return `

                <article
                    class="event-card ${
                        isChampionship
                            ? "featured-event"
                            : ""
                    }"
                >

                    <div class="event-date">

                        <span>
                            ${escapeHtml(
                                date.month
                            )}
                        </span>

                        <strong>
                            ${escapeHtml(
                                date.day
                            )}
                        </strong>

                    </div>


                    <div class="event-info">

                        <span class="event-type">

                            ${escapeHtml(
                                event.event_type ||
                                "ASA EVENT"
                            )}

                        </span>


                        <h3>

                            ${escapeHtml(
                                event.name
                            )}

                        </h3>


                        <p>

                            ${escapeHtml(
                                location
                            )}

                        </p>

                    </div>


                    <button

                        type="button"

                        class="event-link event-details-button"

                        onclick="
                            openEventDetails(
                                ${Number(event.id)}
                            )
                        "

                    >

                        View Details →

                    </button>

                </article>

            `;

        }).join("");

}


/* =========================================================
   OPEN EVENT DETAILS
   ========================================================= */

function openEventDetails(eventId) {

    const event =
        events.find(
            item =>
                Number(item.id) ===
                Number(eventId)
        );


    if (!event) {

        console.error(
            "Event not found:",
            eventId
        );

        return;

    }


    const modal =
        document.getElementById(
            "event-details-modal"
        );


    if (!modal) {
        return;
    }


    /* -----------------------------------------------------
       EVENT NAME
    ----------------------------------------------------- */

    const nameElement =
        document.getElementById(
            "event-details-name"
        );


    if (nameElement) {

        nameElement.textContent =
            event.name ||
            "Mississippi ASA Event";

    }


    /* -----------------------------------------------------
       DATE
    ----------------------------------------------------- */

    const dateElement =
        document.getElementById(
            "event-details-date"
        );


    if (dateElement) {

        dateElement.textContent =
            formatFullDate(
                event.event_date
            );

    }


    /* -----------------------------------------------------
       EVENT TYPE
    ----------------------------------------------------- */

    const typeElement =
        document.getElementById(
            "event-details-type"
        );


    if (typeElement) {

        typeElement.textContent =
            event.event_type ||
            "ASA Event";

    }


    /* -----------------------------------------------------
       LOCATION
    ----------------------------------------------------- */

    const locationElement =
        document.getElementById(
            "event-details-location"
        );


    if (locationElement) {

        locationElement.textContent =
            event.address ||
            "Location TBD";

    }


    /* -----------------------------------------------------
       CONTACT
    ----------------------------------------------------- */

    const contactElement =
        document.getElementById(
            "event-details-contact"
        );


    if (contactElement) {

        contactElement.textContent =
            event.contact ||
            "Contact information coming soon.";

    }


    /* -----------------------------------------------------
       EVENT INFORMATION
    ----------------------------------------------------- */

    const detailsElement =
        document.getElementById(
            "event-details-details"
        );


    if (detailsElement) {

        detailsElement.textContent =
            event.details ||
            "Event information will be posted soon.";

    }


    /* -----------------------------------------------------
       RESULTS LINK
    ----------------------------------------------------- */

    const resultsElement =
        document.getElementById(
            "event-details-results"
        );


    if (resultsElement) {

        resultsElement.innerHTML = "";


        const resultsLink =
            document.createElement("a");


        resultsLink.href =
            "standings.html?event=" +
            encodeURIComponent(
                event.name
            );


        resultsLink.textContent =
            "View Event Results →";


        resultsLink.className =
            "event-results-link";


        resultsElement.appendChild(
            resultsLink
        );

    }


    /* -----------------------------------------------------
       OPEN MODAL
    ----------------------------------------------------- */

    modal.classList.add(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE EVENT DETAILS
   ========================================================= */

function closeEventDetails() {

    const modal =
        document.getElementById(
            "event-details-modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   CLOSE WHEN CLICKING OUTSIDE MODAL
   ========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "event-details-modal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeEventDetails();

        }

    }
);


/* =========================================================
   CLOSE WITH ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeEventDetails();

        }

    }
);


/* =========================================================
   LOAD EVENTS WHEN PAGE IS READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    loadEvents
);
