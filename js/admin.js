// =======================================================
// MISSISSIPPI ASA
// ADMIN DASHBOARD JAVASCRIPT
// SHOOTER MANAGEMENT + SCORE MANAGEMENT
// =======================================================


// =======================================================
// ADD SHOOTER
// =======================================================

async function addShooter() {

  const name =
    document
      .getElementById("shooter-name")
      .value
      .trim();


  const asa_number =
    document
      .getElementById("asa-number")
      .value
      .trim()
      .toUpperCase();


  const class_name =
    document
      .getElementById("class-name")
      .value;


  const status =
    document.getElementById(
      "shooter-status"
    );


  // ---------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // DISABLE BUTTON WHILE SAVING
  // ---------------------------------------------------

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

    // -------------------------------------------------
    // SEND TO API
    // -------------------------------------------------

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


    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    if (result.ok) {

      status.textContent =
        "Shooter added successfully.";


      document.getElementById(
        "shooter-name"
      ).value = "";


      document.getElementById(
        "asa-number"
      ).value = "";


      document.getElementById(
        "class-name"
      ).value = "";


      await loadShooters();

      return;

    }


    // -------------------------------------------------
    // DUPLICATE ASA NUMBER
    // -------------------------------------------------

    if (
      result.code ===
      "DUPLICATE_ASA_NUMBER"
    ) {

      status.textContent =
        result.error ||
        "That ASA number is already assigned.";

      return;

    }


    // -------------------------------------------------
    // OTHER API ERROR
    // -------------------------------------------------

    status.textContent =
      result.error ||
      "Unable to add shooter.";

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


    // -------------------------------------------------
    // CLEAR DROPDOWN
    // -------------------------------------------------

    dropdown.innerHTML = "";


    // -------------------------------------------------
    // NO SHOOTERS
    // -------------------------------------------------

    if (
      !result.ok ||
      !Array.isArray(
        result.shooters
      ) ||
      result.shooters.length === 0
    ) {

      dropdown.innerHTML =
        `
        <option value="">
          No shooters found
        </option>
        `;


      list.innerHTML =
        `
        <p>
          No shooters found.
        </p>
        `;


      return;

    }


    // -------------------------------------------------
    // SORT SHOOTERS
    // -------------------------------------------------

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


    // -------------------------------------------------
    // POPULATE SCORE DROPDOWN
    // -------------------------------------------------

    dropdown.innerHTML =
      `
      <option value="">
        Select Shooter
      </option>
      `;


    shooters.forEach(
      shooter => {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          shooter.id;


        option.textContent =
          `${shooter.name} — ${shooter.class} — ASA ${shooter.asa_number}`;


        dropdown.appendChild(
          option
        );

      }
    );


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


  if (
    filtered.length === 0
  ) {

    list.innerHTML =
      `
      <p>
        No matching shooters found.
      </p>
      `;

    return;

  }


  list.innerHTML =
    filtered
      .map(
        shooter => {

          const name =
            escapeHtml(
              shooter.name || ""
            );


          const asa =
            escapeHtml(
              shooter.asa_number || ""
            );


          const className =
            escapeHtml(
              shooter.class || ""
            );


          return `

            <div
              class="shooter-row"
              data-shooter-id="${Number(
                shooter.id
              )}"
            >

              <div>

                <strong>
                  ${name}
                </strong>

                <div>
                  ${className}
                </div>

                <div>
                  ASA ${asa}
                </div>

              </div>


              <div
                class="shooter-actions"
              >

                <button
                  type="button"
                  onclick="editShooter(
                    ${Number(shooter.id)},
                    ${JSON.stringify(shooter.name || "")},
                    ${JSON.stringify(shooter.asa_number || "")},
                    ${JSON.stringify(shooter.class || "")}
                  )"
                >
                  Edit
                </button>


                <button
                  type="button"
                  onclick="deactivateShooter(
                    ${Number(shooter.id)},
                    ${JSON.stringify(shooter.name || "")}
                  )"
                >
                  Deactivate
                </button>

              </div>

            </div>

          `;

        }
      )
      .join("");

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


  if (
    filtered.length === 0
  ) {

    list.innerHTML =
      `
      <p>
        No matching shooters found.
      </p>
      `;

    return;

  }


  list.innerHTML =
    filtered
      .map(
        shooter => {

          const name =
            escapeHtml(
              shooter.name || ""
            );


          const asa =
            escapeHtml(
              shooter.asa_number || ""
            );


          const className =
            escapeHtml(
              shooter.class || ""
            );


          return `
            <div class="shooter-row">

              <strong>
                ${name}
              </strong>

              <span>
                ${className}
              </span>

              <span>
                ASA ${asa}
              </span>

            </div>
          `;

        }
      )
      .join("");

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

  const shooter_id =
    Number(
      document
        .getElementById(
          "score-shooter"
        )
        .value
    );


  const event_id =
    Number(
      document
        .getElementById(
          "event"
        )
        .value
    );


  const score =
    Number(
      document
        .getElementById(
          "score"
        )
        .value
    );


  const twelves =
    Number(
      document
        .getElementById(
          "twelves"
        )
        .value
    );


  const status =
    document.getElementById(
      "score-status"
    );


  // ---------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------

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


  if (!Number.isFinite(score)) {

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


    if (result.ok) {

      status.textContent =
        result.message ||
        "Score saved successfully.";


      document.getElementById(
        "score"
      ).value = "";


      document.getElementById(
        "twelves"
      ).value = "";


      await loadScores();

    }

    else {

      status.textContent =
        result.error ||
        "Unable to save score.";

    }

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


  try {

    const response =
      await fetch(
        "/api/admin-scores",
        {
          cache: "no-store"
        }
      );


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


    list.innerHTML =
      result.scores
        .map(
          score => {

            return `
              <div class="score-row">

                <strong>
                  ${escapeHtml(
                    score.shooter
                  )}
                </strong>

                |

                ${escapeHtml(
                  score.event
                )}

                |

                Score:
                ${Number(
                  score.score || 0
                )}

                |

                ${Number(
                  score.twelves || 0
                )}
                12s

                <button
                  type="button"
                  onclick="editScore(
                    ${Number(score.id)},
                    ${Number(score.score || 0)},
                    ${Number(score.twelves || 0)}
                  )"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onclick="deleteScore(
                    ${Number(score.id)}
                  )"
                >
                  Delete
                </button>

              </div>
            `;

          }
        )
        .join("");

  }


  catch (error) {

    console.error(
      "Load scores error:",
      error
    );


    list.innerHTML =
      `
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


  if (
    score === null
  ) {

    return;

  }


  const twelves =
    prompt(
      "Enter new 12 count:",
      currentTwelves
    );


  if (
    twelves === null
  ) {

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
// HTML ESCAPE
// =======================================================

function escapeHtml(
  value
) {

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
// SEARCH SHOOTERS
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
        async () => {

          try {

            const response =
              await fetch(
                "/api/shooters",
                {
                  cache: "no-store"
                }
              );


            const result =
              await response.json();


            if (
              result.ok &&
              Array.isArray(
                result.shooters
              )
            ) {

              renderShooterList(
                result.shooters
              );

            }

          }

          catch (error) {

            console.error(
              "Shooter search error:",
              error
            );

          }

        }
      );

    }


    // -------------------------------------------------
    // INITIAL LOAD
    // -------------------------------------------------

    loadShooters();

    loadScores();

  }
);
