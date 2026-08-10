// =======================================================
// MISSISSIPPI ASA
// ADMIN DASHBOARD JAVASCRIPT
// SHOOTER MANAGEMENT + SCORE MANAGEMENT
// =======================================================


// =======================================================
// HELPER FUNCTIONS
// =======================================================

let currentShooters = [];

function getShooterClass(shooter) {

  return String(
    shooter.class_name ||
    shooter.class ||
    ""
  );

}


function escapeHtml(value) {

  return String(value ?? "")

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


// =======================================================
// ADD SHOOTER
// =======================================================

async function addShooter() {

  const nameInput =
    document.getElementById("shooter-name");

  const asaInput =
    document.getElementById("asa-number");

  const classInput =
    document.getElementById("class-name");

  const status =
    document.getElementById("shooter-status");


  const name =
    nameInput.value.trim();


  const asa_number =
    asaInput.value.trim().toUpperCase();


  const class_name =
    classInput.value;


  if (!name) {

    status.textContent =
      "Please enter the shooter's name.";

    return;

  }


  if (!asa_number) {

    status.textContent =
      "Please enter the ASA number.";

    return;

  }


  if (!class_name) {

    status.textContent =
      "Please select a class.";

    return;

  }


  const button =
    document.querySelector(
      'button[onclick="addShooter()"]'
    );


  if (button) {

    button.disabled = true;

    button.textContent =
      "Adding...";

  }


  try {

    const response =
      await fetch(
        "/api/add-shooter",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              name,

              asa_number,

              class_name

            })

        }
      );


    const result =
      await response.json();


    if (!result.ok) {

      if (
        result.code ===
        "DUPLICATE_ASA_NUMBER"
      ) {

        status.textContent =
          result.error ||
          "That ASA number is already assigned.";

      }

      else {

        status.textContent =
          result.error ||
          "Unable to add shooter.";

      }

      return;

    }


    status.textContent =
      "Shooter added successfully.";


    nameInput.value = "";

    asaInput.value = "";

    classInput.value = "";


    await loadShooters();

  }


  catch (error) {

    console.error(
      "Add shooter error:",
      error
    );


    status.textContent =
      "Unable to connect to the server.";

  }


  finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        "Add Shooter";

    }

  }

}


// =======================================================
// LOAD SHOOTERS
// =======================================================

async function loadShooters() {

  const dropdown =
    document.getElementById(
      "score-shooter"
    );


  const list =
    document.getElementById(
      "shooter-list"
    );


  try {

    const response =
      await fetch(
        "/api/shooters",
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    const result =
      await response.json();


    if (
      !result.ok ||
      !Array.isArray(
        result.shooters
      )
    ) {

      throw new Error(
        result.error ||
        "Invalid shooter data."
      );

    }


    const shooters =
      [...result.shooters]
        .sort(
          (a, b) =>
            String(
              a.name || ""
            ).localeCompare(
              String(
                b.name || ""
              )
            )
        );


    currentShooters = shooters;


    // ---------------------------------------------------
    // POPULATE SCORE DROPDOWN
    // ---------------------------------------------------

    if (dropdown) {

      dropdown.innerHTML = "";

      const placeholder =
        document.createElement(
          "option"
        );

      placeholder.value = "";

      placeholder.textContent =
        "Select Shooter";

      dropdown.appendChild(
        placeholder
      );


      shooters.forEach(
        shooter => {

          const option =
            document.createElement(
              "option"
            );


          option.value =
            shooter.id;


          option.textContent =
            `${shooter.name} — ` +
            `${getShooterClass(shooter)} — ` +
            `ASA ${shooter.asa_number}`;


          dropdown.appendChild(
            option
          );

        }
      );

    }


    // ---------------------------------------------------
    // RENDER SHOOTER DIRECTORY
    // ---------------------------------------------------

    renderShooterList(
      shooters
    );

  }


  catch (error) {

    console.error(
      "Load shooters error:",
      error
    );


    if (dropdown) {

      dropdown.innerHTML = `

        <option value="">
          Unable to load shooters
        </option>

      `;

    }


    if (list) {

      list.innerHTML = `

        <p>
          Unable to load shooters.
        </p>

      `;

    }

  }

}


// =======================================================
// RENDER SHOOTER DIRECTORY
// =======================================================

function renderShooterList(
  shooters
) {

  const list =
    document.getElementById(
      "shooter-list"
    );


  if (!list) {
    return;
  }


  const searchInput =
    document.getElementById(
      "shooter-search-admin"
    );


  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  const filtered =
    shooters.filter(
      shooter => {

        const name =
          String(
            shooter.name || ""
          ).toLowerCase();


        const asa =
          String(
            shooter.asa_number || ""
          ).toLowerCase();


        return (
          name.includes(search) ||
          asa.includes(search)
        );

      }
    );


  const summary =
    document.getElementById(
      "shooter-directory-summary"
    );


  if (summary) {

    const count = filtered.length;

    summary.textContent = search
      ? `${count} ${count === 1 ? "shooter" : "shooters"} found`
      : `${count} active ${count === 1 ? "shooter" : "shooters"}`;

  }


  if (
    filtered.length === 0
  ) {

    list.innerHTML = `

      <p>
        No matching shooters found.
      </p>

    `;

    return;

  }


  list.innerHTML = "";


  filtered.forEach(
    shooter => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "shooter-row";


      row.dataset.shooterId =
        shooter.id;


      // -------------------------------------------------
      // SHOOTER INFORMATION
      // -------------------------------------------------

      const info =
        document.createElement(
          "div"
        );


      info.className =
        "shooter-info";


      const name =
        document.createElement(
          "strong"
        );


      name.textContent =
        shooter.name || "";


      name.className =
        "shooter-name";


      const classLine =
        document.createElement(
          "div"
        );


      classLine.textContent =
        getShooterClass(
          shooter
        );


      classLine.className =
        "shooter-class";


      const asaLine =
        document.createElement(
          "div"
        );


      asaLine.textContent =
        `ASA ${shooter.asa_number || ""}`;


      asaLine.className =
        "shooter-asa";


      info.appendChild(
        name
      );


      info.appendChild(
        classLine
      );


      info.appendChild(
        asaLine
      );


      // -------------------------------------------------
      // ACTION BUTTONS
      // -------------------------------------------------

      const actions =
        document.createElement(
          "div"
        );


      actions.className =
        "shooter-actions";


      const editButton =
        document.createElement(
          "button"
        );


      editButton.type =
        "button";


      editButton.textContent =
        "Edit";


      editButton.className =
        "shooter-action-button shooter-edit-button";


      editButton.setAttribute(
        "aria-label",
        `Edit ${shooter.name || "shooter"}`
      );


      editButton.addEventListener(
        "click",
        () => {

          editShooter(
            shooter.id,
            shooter.name || "",
            shooter.asa_number || "",
            getShooterClass(
              shooter
            )
          );

        }
      );


      const deactivateButton =
        document.createElement(
          "button"
        );


      deactivateButton.type =
        "button";


      deactivateButton.textContent =
        "Deactivate";


      deactivateButton.className =
        "shooter-action-button shooter-deactivate-button";


      deactivateButton.setAttribute(
        "aria-label",
        `Deactivate ${shooter.name || "shooter"}`
      );


      deactivateButton.addEventListener(
        "click",
        () => {

          deactivateShooter(
            shooter.id,
            shooter.name || ""
          );

        }
      );


      actions.appendChild(
        editButton
      );


      actions.appendChild(
        deactivateButton
      );


      row.appendChild(
        info
      );


      row.appendChild(
        actions
      );


      list.appendChild(
        row
      );

    }
  );

}


// =======================================================
// EDIT SHOOTER
// =======================================================

async function editShooter(
  shooter_id,
  currentName,
  currentAsa,
  currentClass
) {

  const name =
    prompt(
      "Shooter name:",
      currentName
    );


  if (name === null) {
    return;
  }


  const cleanedName =
    name.trim();


  if (!cleanedName) {

    alert(
      "Shooter name cannot be blank."
    );

    return;

  }


  const asa =
    prompt(
      "ASA number:",
      currentAsa
    );


  if (asa === null) {
    return;
  }


  const cleanedAsa =
    asa.trim().toUpperCase();


  if (!cleanedAsa) {

    alert(
      "ASA number cannot be blank."
    );

    return;

  }


  const className =
    prompt(
      "Class:",
      currentClass
    );


  if (className === null) {
    return;
  }


  const cleanedClass =
    className.trim();


  if (!cleanedClass) {

    alert(
      "Class cannot be blank."
    );

    return;

  }


  try {

    const response =
      await fetch(
        "/api/edit-shooter",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              shooter_id,

              name:
                cleanedName,

              asa_number:
                cleanedAsa,

              class_name:
                cleanedClass

            })

        }
      );


    const result =
      await response.json();


    if (!result.ok) {

      alert(
        result.error ||
        "Unable to update shooter."
      );

      return;

    }


    alert(
      "Shooter updated successfully."
    );


    await loadShooters();

  }


  catch (error) {

    console.error(
      "Edit shooter error:",
      error
    );


    alert(
      "Unable to connect to the server."
    );

  }

}


// =======================================================
// DEACTIVATE SHOOTER
// =======================================================

async function deactivateShooter(
  shooter_id,
  shooterName
) {

  const confirmed =
    confirm(
      `Deactivate ${shooterName}?\n\n` +
      `This will remove the shooter from active ` +
      `entry lists but will NOT delete their ` +
      `historical scores.`
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        "/api/deactivate-shooter",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              shooter_id

            })

        }
      );


    const result =
      await response.json();


    if (!result.ok) {

      alert(
        result.error ||
        "Unable to deactivate shooter."
      );

      return;

    }


    alert(
      `${shooterName} has been deactivated.`
    );


    await loadShooters();

  }


  catch (error) {

    console.error(
      "Deactivate shooter error:",
      error
    );


    alert(
      "Unable to connect to the server."
    );

  }

}


// =======================================================
// SAVE SCORE
// =======================================================

async function saveScore() {

  const shooterSelect =
    document.getElementById(
      "score-shooter"
    );


  const eventSelect =
    document.getElementById(
      "event"
    );


  const scoreInput =
    document.getElementById(
      "score"
    );


  const twelvesInput =
    document.getElementById(
      "twelves"
    );


  const status =
    document.getElementById(
      "score-status"
    );


  const shooter_id =
    Number(
      shooterSelect.value
    );


  const event_id =
    Number(
      eventSelect.value
    );


  const score =
    Number(
      scoreInput.value
    );


  const twelves =
    Number(
      twelvesInput.value
    );


  if (!shooter_id) {

    status.textContent =
      "Please select a shooter.";

    return;

  }


  if (!event_id) {

    status.textContent =
      "Please select an event.";

    return;

  }


  if (
    !Number.isFinite(score) ||
    score < 0
  ) {

    status.textContent =
      "Please enter a valid score.";

    return;

  }


  if (
    !Number.isFinite(twelves) ||
    twelves < 0
  ) {

    status.textContent =
      "Please enter a valid 12 count.";

    return;

  }


  try {

    const response =
      await fetch(
        "/api/add-score",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              shooter_id,

              event_id,

              score,

              twelves

            })

        }
      );


    const result =
      await response.json();


    if (!result.ok) {

      status.textContent =
        result.error ||
        "Unable to save score.";

      return;

    }


    status.textContent =
      result.message ||
      "Score saved successfully.";


    scoreInput.value = "";

    twelvesInput.value = "";


    await loadScores();

  }


  catch (error) {

    console.error(
      "Save score error:",
      error
    );


    status.textContent =
      "Unable to connect to the server.";

  }

}


// =======================================================
// LOAD SCORE MANAGEMENT
// =======================================================

async function loadScores() {

  const list =
    document.getElementById(
      "score-list"
    );


  if (!list) {
    return;
  }


  try {

    const response =
      await fetch(
        "/api/admin-scores",
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    const result =
      await response.json();


    if (
      !result.ok ||
      !Array.isArray(
        result.scores
      )
    ) {

      list.innerHTML =
        "<p>No scores found.</p>";

      return;

    }


    if (
      result.scores.length === 0
    ) {

      list.innerHTML =
        "<p>No scores found.</p>";

      return;

    }


    list.innerHTML = "";


    result.scores.forEach(
      score => {

        const row =
          document.createElement(
            "div"
          );


      row.className =
        "score-row score-management-row";


      const details =
        document.createElement(
          "div"
        );


      details.className =
        "score-details";


      const shooter =
        document.createElement(
          "strong"
        );


      shooter.className =
        "score-shooter-name";


      shooter.textContent =
        score.shooter || "";


      const event =
        document.createElement(
          "span"
        );


      event.className =
        "score-event-name";


      event.textContent =
        score.event || "";


      const metrics =
        document.createElement(
          "div"
        );


      metrics.className =
        "score-metrics";


      const scoreMetric =
        document.createElement(
          "span"
        );


      scoreMetric.innerHTML = `

        <small>Score</small>
        <strong>${Number(score.score || 0)}</strong>

      `;


      const twelvesMetric =
        document.createElement(
          "span"
        );


      twelvesMetric.innerHTML = `

        <small>12 Count</small>
        <strong>${Number(score.twelves || 0)}</strong>

      `;


      metrics.appendChild(
        scoreMetric
      );


      metrics.appendChild(
        twelvesMetric
      );


      details.appendChild(
        shooter
      );


      details.appendChild(
        event
      );


      details.appendChild(
        metrics
      );


      const actions =
        document.createElement(
          "div"
        );


      actions.className =
        "score-actions";


        const editButton =
          document.createElement(
            "button"
          );


        editButton.type =
          "button";


      editButton.textContent =
        "Edit";


      editButton.className =
        "score-action-button score-edit-button";


      editButton.setAttribute(
        "aria-label",
        `Edit ${score.shooter || "shooter"}'s ${score.event || "score"}`
      );


        editButton.addEventListener(
          "click",
          () => {

            editScore(
              Number(score.id),
              Number(
                score.score || 0
              ),
              Number(
                score.twelves || 0
              )
            );

          }
        );


        const deleteButton =
          document.createElement(
            "button"
          );


        deleteButton.type =
          "button";


      deleteButton.textContent =
        "Delete";


      deleteButton.className =
        "score-action-button score-delete-button";


      deleteButton.setAttribute(
        "aria-label",
        `Delete ${score.shooter || "shooter"}'s ${score.event || "score"}`
      );


        deleteButton.addEventListener(
          "click",
          () => {

            deleteScore(
              Number(score.id)
            );

          }
        );


      actions.appendChild(
        editButton
      );


      actions.appendChild(
        deleteButton
      );


      row.appendChild(
        details
      );


      row.appendChild(
        actions
      );


        list.appendChild(
          row
        );

      }
    );

  }


  catch (error) {

    console.error(
      "Load scores error:",
      error
    );


    list.innerHTML = `

      <p>
        Unable to load scores.
      </p>

    `;

  }

}


// =======================================================
// EDIT SCORE
// =======================================================

async function editScore(
  id,
  currentScore,
  currentTwelves
) {

  const score =
    prompt(
      "Enter new score:",
      currentScore
    );


  if (score === null) {
    return;
  }


  const twelves =
    prompt(
      "Enter new 12 count:",
      currentTwelves
    );


  if (twelves === null) {
    return;
  }


  const numericScore =
    Number(score);


  const numericTwelves =
    Number(twelves);


  if (
    !Number.isFinite(
      numericScore
    ) ||
    numericScore < 0 ||
    !Number.isFinite(
      numericTwelves
    ) ||
    numericTwelves < 0
  ) {

    alert(
      "Please enter valid numbers."
    );

    return;

  }


  try {

    const response =
      await fetch(
        "/api/admin-scores",
        {

          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              id,

              score:
                numericScore,

              twelves:
                numericTwelves

            })

        }
      );


    const result =
      await response.json();


    if (!result.ok) {

      alert(
        result.error ||
        "Unable to update score."
      );

      return;

    }


    await loadScores();

  }


  catch (error) {

    console.error(
      "Edit score error:",
      error
    );


    alert(
      "Unable to update score."
    );

  }

}


// =======================================================
// DELETE SCORE
// =======================================================

async function deleteScore(
  id
) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this score?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        "/api/admin-scores",
        {

          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              id
            })

        }
      );


    const result =
      await response.json();


    if (!result.ok) {

      alert(
        result.error ||
        "Unable to delete score."
      );

      return;

    }


    await loadScores();

  }


  catch (error) {

    console.error(
      "Delete score error:",
      error
    );


    alert(
      "Unable to delete score."
    );

  }

}


// =======================================================
// SHOOTER SEARCH
// =======================================================

function searchShooters() {

  const searchInput =
    document.getElementById(
      "shooter-search-admin"
    );


  if (!searchInput) {
    return;
  }


  renderShooterList(
    currentShooters
  );

}


// =======================================================
// INITIALIZE ADMIN DASHBOARD
// =======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const searchInput =
      document.getElementById(
        "shooter-search-admin"
      );


    if (searchInput) {

      searchInput.addEventListener(
        "input",
        () => {

          const clearButton =
            document.getElementById(
              "shooter-search-clear"
            );


          if (clearButton) {

            clearButton.hidden =
              searchInput.value.length === 0;

          }


          searchShooters();

        }
      );

    }


    const clearButton =
      document.getElementById(
        "shooter-search-clear"
      );


    if (clearButton && searchInput) {

      clearButton.addEventListener(
        "click",
        () => {

          searchInput.value = "";

          clearButton.hidden = true;

          searchInput.focus();

          searchShooters();

        }
      );

    }


    loadShooters();

    loadScores();

  }
);
