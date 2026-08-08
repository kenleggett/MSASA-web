// -----------------------------------------------------
// DISPLAY SHOOTER ROWS
// -----------------------------------------------------

standings.forEach(
    (shooter, index) => {

        const row =
            document.createElement("div");

        row.className =
            "standing-row shooter-row";

        row.dataset.shooter =
            shooter.name;

        row.innerHTML = `

            <strong>
                ${index + 1}
            </strong>

            <span class="shooter-name">
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


        // -------------------------------------------------
        // DETAIL ROW
        // -------------------------------------------------

        const detail =
            document.createElement("div");

        detail.className =
            "shooter-details";

        detail.style.display =
            "none";


        // Counting events
        const countingEvents =
            shooter.countingEvents || [];


        // All qualifying events
        const allEvents =
            shooter.events || [];


        // Find non-counting events
        const nonCountingEvents =
            allEvents.filter(
                event =>
                    !countingEvents.includes(event)
            );


        let countingHTML = "";


        countingEvents.forEach(
            event => {

                countingHTML += `

                    <div class="score-line counting">

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


        let droppedHTML = "";


        nonCountingEvents.forEach(
            event => {

                droppedHTML += `

                    <div class="score-line dropped">

                        <span>
                            ${event.event}
                        </span>

                        <span>
                            ${event.score || "—"}
                        </span>

                        <span>
                            ${event.twelves || 0}
                        </span>

                        <span>
                            —
                        </span>

                    </div>

                `;

            }
        );


        // Championship
        const championship =
            shooter.championship || {};


        detail.innerHTML = `

            <div class="scorecard">

                <h3>
                    ${shooter.name}
                </h3>

                <p class="scorecard-class">
                    ${shooter.class}
                </p>


                <h4>
                    Counting Scores
                </h4>

                <div class="score-header">

                    <span>EVENT</span>
                    <span>SCORE</span>
                    <span>12s</span>
                    <span></span>

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
                        ${shooter.totalTwelves} 12s
                    </strong>

                </div>

            </div>

        `;


        // -------------------------------------------------
        // CLICK TO EXPAND
        // -------------------------------------------------

        row.addEventListener(
            "click",
            function () {

                const isOpen =
                    detail.style.display !==
                    "none";


                detail.style.display =
                    isOpen
                        ? "none"
                        : "block";


                row.classList.toggle(
                    "expanded",
                    !isOpen
                );

            }
        );


        table.appendChild(row);

        table.appendChild(detail);

    }
);
