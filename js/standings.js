// =======================================================
// MISSISSIPPI ASA
// PUBLIC STANDINGS PAGE
// =======================================================

let standings = [];


// =======================================================
// LOAD STANDINGS
// =======================================================

async function loadStandings() {

  const body =
    document.getElementById("standings-body");

  try {

    const response =
      await fetch("/api/standings", {
        cache: "no-store"
      });

    if (!response.ok) {

      throw new Error(
        `API request failed: ${response.status}`
      );

    }

    const data =
      await response.json();

    if (!data.ok) {

      throw new Error(
        data.error ||
        "Standings API returned an error."
      );

    }

    if (!Array.isArray(data.standings)) {

      throw new Error(
        "Invalid standings data."
      );

    }

    standings = data.standings;

    populateClasses();

    renderStandings();

  }

  catch (error) {

    console.error(
      "Standings error:",
      error
    );

    if (body) {

      body.innerHTML = `

        <div class="standing-row">

          <span>—</span>

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
    document.getElementById("class-filter");

  if (!select) {
    return;
  }

  const currentValue =
    select.value || "all";

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
    .sort((a, b) => a.localeCompare(b))
    .forEach(className => {

      const option =
        document.createElement("option");

      option.value = className;
      option.textContent = className;

      select.appendChild(option);

    });

  if (
    [...select.options].some(
      option => option.value === currentValue
    )
  ) {

    select.value = currentValue;

  }

}


// =======================================================
// GET EVENT RESULT
// =======================================================

function getEventResult(
  shooter,
  eventName
) {

  // ---------------------------------------------------
  // SHOOTER OF THE YEAR
  // ---------------------------------------------------

  if (eventName === "soy") {

    /*
     * SOTY standings use the calculated values
     * returned by the API.
     *
     * Eligibility is handled separately in
     * renderStandings().
     */

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


  // ---------------------------------------------------
  // STATE CHAMPIONSHIP
  // ---------------------------------------------------

  if (
    eventName === "State Championship"
  ) {

    if (!shooter.championship) {
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


  // ---------------------------------------------------
  // QUALIFYING EVENT
  // ---------------------------------------------------

  if (
    Array.isArray(shooter.qualifiers)
  ) {

    const event =
      shooter.qualifiers.find(
        item =>
          item.event === eventName
      );

    if (event) {

      return {

        score:
          Number(
            event.score || 0
          ),

        twelves:
          Number(
            event.twelves || 0
          )

      };

    }

  }

  return null;

}


// =======================================================
// RENDER STANDINGS
// =======================================================

function renderStandings() {

  const body =
    document.getElementById(
      "standings-body"
    );

  if (!body) {
    return;
  }

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


  const results = [];


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


      // -------------------------------------------------
      // SEARCH FILTER
      // -------------------------------------------------

      if (
        search &&
        !name
          .toLowerCase()
          .includes(search)
      ) {

        return;

      }


      // -------------------------------------------------
      // CLASS FILTER
      // -------------------------------------------------

      if (
        selectedClass !== "all" &&
        className !== selectedClass
      ) {

        return;

      }


      // -------------------------------------------------
      // SOTY ELIGIBILITY
      // -------------------------------------------------

      /*
       * IMPORTANT:
       *
       * Only eligible shooters should appear in the
       * official Shooter of the Year standings.
       *
       * Event-specific views continue to display
       * shooters who have a result for that event.
       */

      if (
        selectedEvent === "soy" &&
        shooter.eligible !== true
      ) {

        return;

      }


      // -------------------------------------------------
      // GET RESULT
      // -------------------------------------------------

      const result =
        getEventResult(
          shooter,
          selectedEvent
        );


      if (!result) {
        return;
      }


      results.push({

        shooter,

        name,

        className,

        score:
          result.score,

        twelves:
          result.twelves

      });

    }
  );


  // =====================================================
  // RANK RESULTS
  // =====================================================

  results.sort(
    (a, b) => {

      // Highest score first
      if (
        b.score !== a.score
      ) {

        return (
          b.score -
          a.score
        );

      }


      // Highest 12 count breaks ties
      if (
        b.twelves !==
        a.twelves
      ) {

        return (
          b.twelves -
          a.twelves
        );

      }


      // Alphabetical final tie breaker
      return a.name.localeCompare(
        b.name
      );

    }
  );


  // =====================================================
  // NO RESULTS
  // =====================================================

  if (
    results.length === 0
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


  // =====================================================
  // DISPLAY RESULTS
  // =====================================================

  body.innerHTML = "";


  results.forEach(
    (result, index) => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "standing-row";


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
// HTML ESCAPE
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
// INITIALIZE
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


    if (searchInput) {

      searchInput.addEventListener(
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
);
