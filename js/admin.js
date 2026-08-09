async function addShooter() {

  const name =
    document.getElementById("shooter-name").value.trim();

  const asa_number =
    document.getElementById("asa-number").value.trim();

  const class_name =
    document.getElementById("class-name").value;


  if (!name) {

    alert("Please enter the shooter's name.");

    return;

  }


  const response = await fetch(
    "/api/add-shooter",
    {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name,
        asa_number,
        class_name
      })

    }
  );


  const result =
    await response.json();


  const status =
    document.getElementById("shooter-status");


  if (result.ok) {

    status.textContent =
      "Shooter added successfully.";

    document.getElementById(
      "shooter-name"
    ).value = "";

    document.getElementById(
      "asa-number"
    ).value = "";

    await loadShooters();

  }

  else {

    status.textContent =
      result.error || "Unable to add shooter.";

  }

}



async function loadShooters() {

  const response =
    await fetch("/api/shooters");


  const result =
    await response.json();


  const dropdown =
    document.getElementById("score-shooter");


  const list =
    document.getElementById("shooter-list");


  dropdown.innerHTML = "";


  if (!result.ok ||
      !result.shooters ||
      result.shooters.length === 0) {

    dropdown.innerHTML =
      "<option value=''>No shooters found</option>";

    list.innerHTML =
      "<p>No shooters found.</p>";

    return;

  }


  result.shooters.forEach(
    shooter => {

      const option =
        document.createElement("option");

      option.value =
        shooter.id;

      option.textContent =
        shooter.name +
        " - " +
        shooter.class;

      dropdown.appendChild(option);

    }
  );


  list.innerHTML =
    result.shooters.map(
      shooter =>

        `<p>
          <strong>${shooter.name}</strong>
          —
          ${shooter.class}
          —
          ASA ${shooter.asa_number}
        </p>`

    ).join("");

}



async function saveScore() {

  const shooter_id =
    Number(
      document.getElementById(
        "score-shooter"
      ).value
    );


  const event_id =
    Number(
      document.getElementById(
        "event"
      ).value
    );


  const score =
    Number(
      document.getElementById(
        "score"
      ).value
    );


  const twelves =
    Number(
      document.getElementById(
        "twelves"
      ).value
    );


  if (!shooter_id) {

    alert("Please select a shooter.");

    return;

  }


  if (!score) {

    alert("Please enter a score.");

    return;

  }


  const response =
    await fetch(
      "/api/add-score",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          shooter_id,
          event_id,
          score,
          twelves

        })

      }
    );


  const result =
    await response.json();


  const status =
    document.getElementById(
      "score-status"
    );


  if (result.ok) {

    status.textContent =
      "Score saved successfully.";

    document.getElementById(
      "score"
    ).value = "";

    document.getElementById(
      "twelves"
    ).value = "";

  }

  else {

    status.textContent =
      result.error ||
      "Unable to save score.";

  }

}



document.addEventListener(
  async function loadScores() {

  const response =
    await fetch("/api/admin-scores");

  const result =
    await response.json();


  const table =
    document.getElementById("score-list");


  if (!result.ok || !result.scores) {

    table.innerHTML =
      "<p>No scores found.</p>";

    return;

  }


  table.innerHTML = result.scores.map(score =>

    `
    <div class="score-row">

      <strong>${score.shooter}</strong>
      |
      ${score.event}
      |
      ${score.score}
      |
      ${score.twelves} 12s

      <button onclick="editScore(
        ${score.id},
        ${score.score},
        ${score.twelves}
      )">
        Edit
      </button>


      <button onclick="deleteScore(${score.id})">
        Delete
      </button>

    </div>
    `

  ).join("");

}
  "DOMContentLoaded",
  () => {

    loadShooters();

  }
);
