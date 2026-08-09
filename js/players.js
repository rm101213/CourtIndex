// ==========================================================
// WNBA ARCHIVE
// PLAYER SEARCH
// ==========================================================


let allPlayers = [];


// ----------------------------------------------------------
// ELEMENTS
// ----------------------------------------------------------

const searchInput =
    document.getElementById(
        "player-search"
    );

const playerList =
    document.getElementById(
        "player-list"
    );

const playerCount =
    document.getElementById(
        "player-count"
    );


// ----------------------------------------------------------
// LOAD DATA
// ----------------------------------------------------------

async function loadPlayers() {

    try {

        const response =
            await fetch(
                "data/players.json"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load players."
            );

        }


        allPlayers =
            await response.json();


        allPlayers.sort(
            (
                a,
                b
            ) =>
                a.display_name.localeCompare(
                    b.display_name
                )
        );


        renderPlayers(
            allPlayers
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        playerList.innerHTML = `
            <p>
                Player data could not be loaded.
            </p>
        `;

    }

}


// ----------------------------------------------------------
// RENDER PLAYERS
// ----------------------------------------------------------

function renderPlayers(
    players
) {

    playerList.innerHTML = "";


    playerCount.textContent =
        `${players.length} players`;


    const fragment =
        document.createDocumentFragment();


    players.forEach(
        player => {


            const link =
                document.createElement(
                    "a"
                );


            link.className =
                "player-card";


            link.href =
                `player.html?id=${
                    encodeURIComponent(
                        player.player_id
                    )
                }`;


            const firstSeason =
                player.first_season ?? "";


            const lastSeason =
                player.last_season ?? "";


            link.innerHTML = `

                <h2 class="player-name">

                    ${
                        player.display_name
                    }

                </h2>


                <p class="player-career">

                    ${
                        firstSeason
                    }
                    –
                    ${
                        lastSeason
                    }

                </p>

            `;


            fragment.appendChild(
                link
            );

        }
    );


    playerList.appendChild(
        fragment
    );

}


// ----------------------------------------------------------
// SEARCH
// ----------------------------------------------------------

function searchPlayers(
    query
) {

    const cleanedQuery =
        query
        .toLowerCase()
        .trim();


    if (!cleanedQuery) {

        renderPlayers(
            allPlayers
        );

        return;

    }


    const filtered =
        allPlayers.filter(
            player => {


                const displayName =
                    (
                        player.display_name
                        ??
                        ""
                    )
                    .toLowerCase();


                const searchName =
                    (
                        player.search_name
                        ??
                        ""
                    )
                    .toLowerCase();


                const aliases =
                    (
                        player.all_search_names
                        ??
                        ""
                    )
                    .toLowerCase();


                return (

                    displayName.includes(
                        cleanedQuery
                    )

                    ||

                    searchName.includes(
                        cleanedQuery
                    )

                    ||

                    aliases.includes(
                        cleanedQuery
                    )

                );

            }
        );


    renderPlayers(
        filtered
    );

}


// ----------------------------------------------------------
// INPUT
// ----------------------------------------------------------

searchInput.addEventListener(
    "input",
    event => {

        searchPlayers(
            event.target.value
        );

    }
);


// ----------------------------------------------------------
// START
// ----------------------------------------------------------

loadPlayers();
