function calculateShooter(shooter) {

    const qualifyingEvents = shooter.scores
        .filter(event => event.score > 0)
        .sort((a, b) => b.score - a.score);

    const bestThree =
        qualifyingEvents.slice(0, 3);

    const championshipScore =
        shooter.championship?.score || 0;

    const qualifyingTotal =
        bestThree.reduce(
            (total, event) =>
                total + event.score,
            0
        );

    const totalScore =
        qualifyingTotal +
        championshipScore;

    const qualifyingTwelves =
        bestThree.reduce(
            (total, event) =>
                total + event.twelves,
            0
        );

    const championshipTwelves =
        shooter.championship?.twelves || 0;

    const totalTwelves =
        qualifyingTwelves +
        championshipTwelves;

    return {
        ...shooter,
        totalScore,
        totalTwelves
    };
}


function calculateStandings() {

    return shooters
        .map(calculateShooter)
        .sort((a, b) => {

            if (
                b.totalScore !==
                a.totalScore
            ) {
                return (
                    b.totalScore -
                    a.totalScore
                );
            }

            return (
                b.totalTwelves -
                a.totalTwelves
            );

        });

}


function displayStandings(
    filter = "all"
) {

    const table =
        document.getElementById(
            "standings-body"
        );

    if (!table) {
        return;
    }

    table.innerHTML = "";

    let standings =
        calculateStandings();


    if (filter !== "all") {

        standings =
            standings.filter(
                shooter =>
                    shooter.class
                        .toLowerCase() ===
                    filter.toLowerCase()
            );

    }


    if (standings.length === 0) {

        table.innerHTML = `
            <div class="standing-row">

                <strong>—</strong>

                <span>
                    No shooters found
                </span>

                <span>—</span>

                <strong>—</strong>

                <strong>—</strong>

            </div>
        `;

        return;

    }


    standings.forEach(
        (shooter, index) => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "standing-row";

            row.innerHTML = `

                <strong>
                    ${index + 1}
                </strong>

                <span>
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

            table.appendChild(row);

        }
    );
}


const classFilter =
    document.getElementById(
        "class-filter"
    );


if (classFilter) {

    classFilter.addEventListener(
        "change",
        function () {

            displayStandings(
                this.value
            );

        }
    );

}


displayStandings();
