const params =
    new URLSearchParams(
        window.location.search
    );


const requestedTeam =
    params.get(
        "team"
    );


const requestedSeason =
    params.get(
        "season"
    );


const teamName =
    document.getElementById(
        "team-name"
    );


const seasonSelect =
    document.getElementById(
        "team-season-select"
    );


const summary =
    document.getElementById(
        "team-summary"
    );


const roster =
    document.getElementById(
        "team-roster"
    );


let allProfiles = [];
let teamProfiles = [];



function format(
    value,
    decimals = 1
) {

    const number =
        Number(value);


    return Number.isFinite(number)
        ?
        number.toFixed(decimals)
        :
        "—";

}



function renderSeason(
    season
) {

    const players =
        teamProfiles.filter(
            profile =>
                String(profile.season)
                ===
                String(season)
        );


    players.sort(
        (
            a,
            b
        ) =>
            Number(
                b.minutes_per_game
            )
            -
            Number(
                a.minutes_per_game
            )
    );


    const averagePoints =
        players.length
        ?
        players.reduce(
            (
                total,
                player
            ) =>
                total
                +
                Number(
                    player.points_per_game
                    ||
                    0
                ),
            0
        )
        :
        0;


    const topScorer =
        [...players]
        .sort(
            (
                a,
                b
            ) =>
                Number(
                    b.points_per_game
                )
                -
                Number(
                    a.points_per_game
                )
        )[0];


    const topOverall =
        [...players]
        .sort(
            (
                a,
                b
            ) =>
                Number(
                    b.season_overall
                )
                -
                Number(
                    a.season_overall
                )
        )[0];


    summary.innerHTML = `

        <div class="team-summary-card">

            <strong>
                ${players.length}
            </strong>

            <span>
                Players
            </span>

        </div>


        <div class="team-summary-card">

            <strong>
                ${
                    topScorer
                    ?
                    format(
                        topScorer.points_per_game
                    )
                    :
                    "—"
                }
            </strong>

            <span>
                Leading PPG
            </span>

        </div>


        <div class="team-summary-card">

            <strong>
                ${
                    topOverall
                    ?
                    format(
                        topOverall.season_overall
                    )
                    :
                    "—"
                }
            </strong>

            <span>
                Best Overall
            </span>

        </div>


        <div class="team-summary-card">

            <strong>
                ${format(averagePoints)}
            </strong>

            <span>
                Combined Player PPG
            </span>

        </div>

    `;


    roster.innerHTML =
        players
        .map(
            player => `

                <a
                    class="team-player-card"
                    href="./player.html?id=${
                        encodeURIComponent(
                            player.player_id
                        )
                    }"
                >

                    <h3>
                        ${player.display_name}
                    </h3>


                    <div class="team-player-stats">

                        <span>
                            ${
                                format(
                                    player.points_per_game
                                )
                            }
                            PPG
                        </span>

                        <span>
                            ${
                                format(
                                    player.rebounds_per_game
                                )
                            }
                            RPG
                        </span>

                        <span>
                            ${
                                format(
                                    player.assists_per_game
                                )
                            }
                            APG
                        </span>

                    </div>

                </a>

            `
        )
        .join("");

}



async function loadTeam() {

    const response =
        await fetch(
            "./data/player_season_profiles.json"
        );


    allProfiles =
        await response.json();


    teamProfiles =
        allProfiles.filter(
            profile =>
                String(
                    profile.team
                )
                ===
                String(
                    requestedTeam
                )
        );


    if (
        teamProfiles.length === 0
    ) {

        teamName.textContent =
            "Team not found";

        return;

    }


    teamName.textContent =
        requestedTeam;


    const seasons =
        [
            ...new Set(
                teamProfiles.map(
                    profile =>
                        profile.season
                )
            )
        ]
        .sort(
            (
                a,
                b
            ) =>
                Number(b)
                -
                Number(a)
        );


    seasonSelect.innerHTML =
        seasons
        .map(
            season => `

                <option
                    value="${season}"
                    ${
                        String(season)
                        ===
                        String(requestedSeason)
                        ?
                        "selected"
                        :
                        ""
                    }
                >
                    ${season}
                </option>

            `
        )
        .join("");


    const initialSeason =
        seasons.includes(
            Number(
                requestedSeason
            )
        )
        ?
        requestedSeason
        :
        seasons[0];


    seasonSelect.value =
        initialSeason;


    renderSeason(
        initialSeason
    );

}


seasonSelect.addEventListener(
    "change",
    event => {

        renderSeason(
            event.target.value
        );

    }
);


loadTeam();
