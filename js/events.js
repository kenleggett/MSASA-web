/* =========================================================
   MISSISSIPPI ASA
   EVENT DETAILS
========================================================= */

const eventData = {

    waldos: {
        name: "Waldo's Archery Club",
        date: "February 28, 2026",
        type: "ASA Qualifier",
        location: "Venue information available from event organizer.",
        contact: "Event organizer contact information.",
        details: "Specific event information will be posted here.",
        results: "Results will be posted after the event."
    },

    percyquin: {
        name: "Percy Quin Archery",
        date: "March 14, 2026",
        type: "ASA Qualifier",
        location: "Venue information available from event organizer.",
        contact: "Event organizer contact information.",
        details: "Specific event information will be posted here.",
        results: "Results will be posted after the event."
    },

    pearlriver: {
        name: "Pearl River Archery",
        date: "April 11, 2026",
        type: "ASA Qualifier",
        location: "Venue information available from event organizer.",
        contact: "Event organizer contact information.",
        details: "Specific event information will be posted here.",
        results: "Results will be posted after the event."
    },

    laurel: {
        name: "Laurel Bowhunters",
        date: "May 16, 2026",
        type: "ASA Qualifier",
        location: "Venue information available from event organizer.",
        contact: "Event organizer contact information.",
        details: "Specific event information will be posted here.",
        results: "Results will be posted after the event."
    },

    littleriver: {
        name: "Little River Bowmen",
        date: "June 6, 2026",
        type: "ASA Qualifier",
        location: "Venue information available from event organizer.",
        contact: "Event organizer contact information.",
        details: "Specific event information will be posted here.",
        results: "Results will be posted after the event."
    },

    statechampionship: {
        name: "Mississippi ASA Federation Championship",
        date: "July 11, 2026",
        type: "State Championship",
        location: "TBD",
        contact: "TBD",
        details: "Specific event information will be posted here.",
        results: "State Championship results will be posted after the event."
    }

};


/* =========================================================
   OPEN EVENT DETAILS
========================================================= */

function openEventDetails(eventId) {

    const event = eventData[eventId];

    if (!event) {
        return;
    }

    const modal = document.getElementById(
        "event-details-modal"
    );

    if (!modal) {
        return;
    }

    document.getElementById(
        "event-details-name"
    ).textContent = event.name;

    document.getElementById(
        "event-details-date"
    ).textContent = event.date;

    document.getElementById(
        "event-details-type"
    ).textContent = event.type;

    document.getElementById(
        "event-details-location"
    ).textContent = event.location;

    document.getElementById(
        "event-details-contact"
    ).textContent = event.contact;

    document.getElementById(
        "event-details-registration"
    ).textContent = event.registration;

    document.getElementById(
        "event-details-results"
    ).textContent = event.results;

    modal.classList.add("active");

    document.body.classList.add("modal-open");

}


/* =========================================================
   CLOSE EVENT DETAILS
========================================================= */

function closeEventDetails() {

    const modal = document.getElementById(
        "event-details-modal"
    );

    if (!modal) {
        return;
    }

    modal.classList.remove("active");

    document.body.classList.remove("modal-open");

}


/* =========================================================
   CLOSE WHEN CLICKING OUTSIDE PANEL
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "event-details-modal"
            );

        if (event.target === modal) {

            closeEventDetails();

        }

    }
);


/* =========================================================
   CLOSE WITH ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeEventDetails();

        }

    }
);
