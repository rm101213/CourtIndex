// ==========================================================
// COURTINDEX
// COMPARE SEASONS
// ==========================================================


// ==========================================================
// CONFIG
// ==========================================================

const MAX_PLAYERS = 4;

const MIN_PLAYERS = 2;


const PLAYER_COLOURS = [

    {
        border:
            "rgb(255, 107, 53)",

        background:
            "rgba(255, 107, 53, 0.18)"
    },

    {
        border:
            "rgb(78, 162, 255)",

        background:
            "rgba(78, 162, 255, 0.16)"
    },

    {
        border:
            "rgb(125, 220, 150)",

        background:
            "rgba(125, 220, 150, 0.14)"
    },

    {
        border:
            "rgb(200, 130, 255)",

        background:
            "rgba(200, 130, 255, 0.14)"
    }

];


// ==========================================================
// DOM
// ==========================================================

const selectorsContainer =
    document.getElementById(
        "comparison-selectors"
    );


const addPlayerButton =
    document.getElementById(
        "add-player-button"
    );


const clearButton =
    document.getElementById(
        "clear-comparison-button"
    );


const traditionalGrid =
    document.getElementById(
        "traditional-comparison-grid"
    );


const customRatingsTable =
    document.getElementById(
        "custom-ratings-table"
    );


const overallComparison =
    document.getElementById(
        "overall-comparison"
    );


const modeButtons =
    document.querySelectorAll(
        ".comparison-mode-button"
    );


const traditionalPanel =
    document.getElementById(
        "traditional-comparison"
    );


const customPanel =
    document.getElementById(
        "custom-comparison"
    );


// ==========================================================
// STATE
// ==========================================================

let allProfiles = [];

let playerIndex = [];

let selectors = [];

let radarChart = null;


// ==========================================================
// FORMATTERS
// ==========================================================

function formatNumber(
    value,
    decimals = 1
) {

    if (
        value === null
        ||
        value === undefined
        ||
        value === ""
    ) {

        return "—";

    }


    const number =
        Number(
            value
        );


    if (
        Number.isNaN(
            number
        )
    ) {

        return "—";

    }


    return number.toFixed(
        decimals
    );

}


function formatPercent(
    value,
    decimals = 1
) {

    const number =
        Number(
            value
        );


    if (
        value === null
        ||
        value === undefined
        ||
        Number.isNaN(
            number
        )
    ) {

        return "—";

    }


    return (
        number
        *
        100
    ).toFixed(
        decimals
    )
    +
    "%";

}


// ==========================================================
// BUILD PLAYER INDEX
// ==========================================================

function buildPlayerIndex() {

    const map =
        new Map();


    allProfiles.forEach(
        profile => {

            const id =
                String(
                    profile.player_id
                );


            if (
                !map.has(
                    id
                )
            ) {

                map.set(
                    id,
                    {
                        player_id:
                            profile.player_id,

                        display_name:
                            profile.display_name
                            ??
                            profile.player_name,

                        seasons:
                            []
                    }
                );

            }


            map.get(
                id
            ).seasons.push(
                profile
            );

        }
    );


    playerIndex =
        Array.from(
            map.values()
        );


    playerIndex.sort(
        (
            a,
            b
        ) =>
            a.display_name.localeCompare(
                b.display_name
            )
    );


    playerIndex.forEach(
        player => {

            player.seasons.sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        b.season
                    )
                    -
                    Number(
                        a.season
                    )
            );

        }
    );

}


// ==========================================================
// DEFAULT SELECTORS
// ==========================================================

function createDefaultSelectors() {

    selectors = [];


    if (
        playerIndex.length
        <
        2
    ) {

        return;

    }


    selectors.push(
        {

            player_id:
                playerIndex[0]
                .player_id,

            season:
                playerIndex[0]
                .seasons[0]
                .season

        }
    );


    selectors.push(
        {

            player_id:
                playerIndex[1]
                .player_id,

            season:
                playerIndex[1]
                .seasons[0]
                .season

        }
    );

}


// ==========================================================
// PLAYER OPTIONS
// ==========================================================

function getPlayerOptions(
    selectedPlayerId
) {

    return playerIndex
        .map(
            player => `

                <option
                    value="${player.player_id}"
                    ${
                        String(
                            player.player_id
                        )
                        ===
                        String(
                            selectedPlayerId
                        )
                        ?
                        "selected"
                        :
                        ""
                    }
                >
                    ${player.display_name}
                </option>

            `
        )
        .join(
            ""
        );

}


// ==========================================================
// SEASON OPTIONS
// ==========================================================

function getSeasonOptions(
    playerId,
    selectedSeason
) {

    const player =
        playerIndex.find(
            item =>
                String(
                    item.player_id
                )
                ===
                String(
                    playerId
                )
        );


    if (!player) {

        return "";

    }


    return player.seasons
        .map(
            profile => `

                <option
                    value="${profile.season}"
                    ${
                        String(
                            profile.season
                        )
                        ===
                        String(
                            selectedSeason
                        )
                        ?
                        "selected"
                        :
                        ""
                    }
                >
                    ${profile.season}
                </option>

            `
        )
        .join(
            ""
        );

}


// ==========================================================
// RENDER SELECTORS
// ==========================================================

function renderSelectors() {

    selectorsContainer.innerHTML =
        selectors
        .map(
            (
                selector,
                index
            ) => `

                <article
                    class="comparison-selector"
                    data-index="${index}"
                >

                    <p class="selector-number">
                        Player ${index + 1}
                    </p>


                    ${
                        selectors.length
                        >
                        MIN_PLAYERS
                        ?
                        `

                            <button
                                class="remove-player-button"
                                data-remove-index="${index}"
                                type="button"
                                aria-label="Remove player"
                            >
                                ×
                            </button>

                        `
                        :
                        ""
                    }


                    <div class="selector-fields">


                        <div class="selector-field">

                            <label>
                                Player
                            </label>


                            <select
                                class="player-select"
                                data-index="${index}"
                            >
                                ${
                                    getPlayerOptions(
                                        selector.player_id
                                    )
                                }
                            </select>

                        </div>


                        <div class="selector-field">

                            <label>
                                Season
                            </label>


                            <select
                                class="season-select"
                                data-index="${index}"
                            >
                                ${
                                    getSeasonOptions(
                                        selector.player_id,
                                        selector.season
                                    )
                                }
                            </select>

                        </div>


                    </div>

                </article>

            `
        )
        .join(
            ""
        );


    addPlayerButton.disabled =
        selectors.length
        >=
        MAX_PLAYERS;


    attachSelectorEvents();

}


// ==========================================================
// SELECTOR EVENTS
// ==========================================================

function attachSelectorEvents() {

    document
        .querySelectorAll(
            ".player-select"
        )
        .forEach(
            select => {

                select.addEventListener(
                    "change",
                    event => {

                        const index =
                            Number(
                                event.target.dataset.index
                            );


                        const playerId =
                            event.target.value;


                        const player =
                            playerIndex.find(
                                item =>
                                    String(
                                        item.player_id
                                    )
                                    ===
                                    String(
                                        playerId
                                    )
                            );


                        selectors[index]
                            .player_id =
                            playerId;


                        selectors[index]
                            .season =
                            player.seasons[0]
                            .season;


                        renderSelectors();

                        renderComparison();

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".season-select"
        )
        .forEach(
            select => {

                select.addEventListener(
                    "change",
                    event => {

                        const index =
                            Number(
                                event.target.dataset.index
                            );


                        selectors[index]
                            .season =
                            event.target.value;


                        renderComparison();

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".remove-player-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        const index =
                            Number(
                                event.target.dataset.removeIndex
                            );


                        selectors.splice(
                            index,
                            1
                        );


                        renderSelectors();

                        renderComparison();

                    }
                );

            }
        );

}


// ==========================================================
// GET SELECTED PROFILES
// ==========================================================

function getSelectedProfiles() {

    return selectors
        .map(
            selector =>
                allProfiles.find(
                    profile =>

                        String(
                            profile.player_id
                        )
                        ===
                        String(
                            selector.player_id
                        )

                        &&

                        String(
                            profile.season
                        )
                        ===
                        String(
                            selector.season
                        )

                )
        )
        .filter(
            Boolean
        );

}


// ==========================================================
// TABLE
// ==========================================================

function buildComparisonTable(
    profiles,
    metrics
) {

    if (
        profiles.length
        ===
        0
    ) {

        return `

            <div class="comparison-empty">
                Select players to begin comparing seasons.
            </div>

        `;

    }


    const header =
        profiles
        .map(
            profile => `

                <th>
                    ${
                        profile.display_name
                        ??
                        profile.player_name
                    }
                    <br>
                    <span>
                        ${profile.season}
                    </span>
                </th>

            `
        )
        .join(
            ""
        );


    const rows =
        metrics
        .map(
            metric => {

                const cells =
                    profiles
                    .map(
                        profile => `

                            <td>
                                ${
                                    metric.format(
                                        profile[
                                            metric.key
                                        ]
                                    )
                                }
                            </td>

                        `
                    )
                    .join(
                        ""
                    );


                return `

                    <tr>

                        <td>
                            ${metric.label}
                        </td>

                        ${cells}

                    </tr>

                `;

            }
        )
        .join(
            ""
        );


    return `

        <table class="comparison-table">

            <thead>

                <tr>

                    <th>
                        Metric
                    </th>

                    ${header}

                </tr>

            </thead>


            <tbody>

                ${rows}

            </tbody>

        </table>

    `;

}


// ==========================================================
// TRADITIONAL
// ==========================================================

function renderTraditional(
    profiles
) {

    const metrics = [

        {
            label:
                "Games",

            key:
                "games_played",

            format:
                value =>
                    formatNumber(
                        value,
                        0
                    )
        },

        {
            label:
                "Minutes / Game",

            key:
                "minutes_per_game",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Points / Game",

            key:
                "points_per_game",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Rebounds / Game",

            key:
                "rebounds_per_game",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Assists / Game",

            key:
                "assists_per_game",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Steals / Game",

            key:
                "steals_per_game",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Blocks / Game",

            key:
                "blocks_per_game",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "True Shooting",

            key:
                "true_shooting_pct",

            format:
                value =>
                    formatPercent(
                        value
                    )
        },

        {
            label:
                "Effective FG",

            key:
                "effective_fg_pct",

            format:
                value =>
                    formatPercent(
                        value
                    )
        },

        {
            label:
                "Points / 36",

            key:
                "points_per_36",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Rebounds / 36",

            key:
                "rebounds_per_36",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Assists / 36",

            key:
                "assists_per_36",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Production / 36",

            key:
                "production_per_36",

            format:
                value =>
                    formatNumber(
                        value
                    )
        }

    ];


    traditionalGrid.innerHTML =
        buildComparisonTable(
            profiles,
            metrics
        );

}


// ==========================================================
// CUSTOM RATINGS TABLE
// ==========================================================

function renderCustomTable(
    profiles
) {

    const metrics = [

        {
            label:
                "Impact",

            key:
                "impact",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Dominance",

            key:
                "dominance",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Efficiency",

            key:
                "efficiency",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Consistency",

            key:
                "consistency",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Clutch",

            key:
                "clutch",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Availability",

            key:
                "availability",

            format:
                value =>
                    formatNumber(
                        value
                    )
        },

        {
            label:
                "Momentum",

            key:
                "momentum",

            format:
                value =>
                    formatNumber(
                        value
                    )
        }

    ];


    customRatingsTable.innerHTML =
        buildComparisonTable(
            profiles,
            metrics
        );

}


// ==========================================================
// OVERALL CARDS
// ==========================================================

function renderOverall(
    profiles
) {

    overallComparison.innerHTML =
        profiles
        .map(
            profile => `

                <article class="overall-player">

                    <p class="overall-player-name">
                        ${
                            profile.display_name
                            ??
                            profile.player_name
                        }
                    </p>


                    <p class="overall-player-season">
                        ${profile.season}
                        •
                        ${profile.team ?? "—"}
                    </p>


                    <p class="overall-player-score">
                        ${
                            formatNumber(
                                profile.season_overall
                            )
                        }
                    </p>


                    <p class="overall-player-archetype">
                        ${
                            profile.season_archetype
                            ??
                            ""
                        }
                    </p>

                </article>

            `
        )
        .join(
            ""
        );

}


// ==========================================================
// RADAR CHART
// ==========================================================

function renderRadarChart(
    profiles
) {

    const canvas =
        document.getElementById(
            "ratings-radar-chart"
        );


    if (!canvas) {

        return;

    }


    const labels = [

        "Impact",
        "Dominance",
        "Efficiency",
        "Consistency",
        "Clutch",
        "Availability",
        "Momentum"

    ];


    const ratingKeys = [

        "impact",
        "dominance",
        "efficiency",
        "consistency",
        "clutch",
        "availability",
        "momentum"

    ];


    const datasets =
        profiles
        .map(
            (
                profile,
                index
            ) => {

                const colour =
                    PLAYER_COLOURS[
                        index
                    ];


                return {

                    label:
                        `${
                            profile.display_name
                            ??
                            profile.player_name
                        } ${
                            profile.season
                        }`,

                    data:
                        ratingKeys
                        .map(
                            key =>
                                Number(
                                    profile[
                                        key
                                    ]
                                )
                                ||
                                0
                        ),

                    borderColor:
                        colour.border,

                    backgroundColor:
                        colour.background,

                    pointBackgroundColor:
                        colour.border,

                    pointBorderColor:
                        "#ffffff",

                    pointHoverBackgroundColor:
                        "#ffffff",

                    pointHoverBorderColor:
                        colour.border,

                    borderWidth:
                        2,

                    pointRadius:
                        3,

                    pointHoverRadius:
                        5,

                    fill:
                        true

                };

            }
        );


    if (radarChart) {

        radarChart.destroy();

    }


    radarChart =
        new Chart(
            canvas,
            {

                type:
                    "radar",


                data: {

                    labels:
                        labels,

                    datasets:
                        datasets

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    interaction: {

                        mode:
                            "nearest",

                        intersect:
                            false

                    },


                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                color:
                                    "#f5f7fb",

                                padding:
                                    18,

                                usePointStyle:
                                    true

                            }

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    context => {

                                        return (
                                            `${context.dataset.label}: `
                                            +
                                            `${context.formattedValue}`
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        r: {

                            min:
                                0,

                            max:
                                100,


                            ticks: {

                                display:
                                    false,

                                stepSize:
                                    20

                            },


                            grid: {

                                color:
                                    "rgba(165, 173, 189, 0.18)"

                            },


                            angleLines: {

                                color:
                                    "rgba(165, 173, 189, 0.18)"

                            },


                            pointLabels: {

                                color:
                                    "#f5f7fb",

                                font: {

                                    size:
                                        13,

                                    weight:
                                        "600"

                                }

                            }

                        }

                    }

                }

            }
        );

}


// ==========================================================
// RENDER ALL
// ==========================================================

function renderComparison() {

    const profiles =
        getSelectedProfiles();


    renderTraditional(
        profiles
    );


    renderCustomTable(
        profiles
    );


    renderOverall(
        profiles
    );


    renderRadarChart(
        profiles
    );

}


// ==========================================================
// ADD PLAYER
// ==========================================================

addPlayerButton.addEventListener(
    "click",
    () => {

        if (
            selectors.length
            >=
            MAX_PLAYERS
        ) {

            return;

        }


        const defaultPlayer =
            playerIndex[
                selectors.length
                %
                playerIndex.length
            ];


        selectors.push(
            {

                player_id:
                    defaultPlayer
                    .player_id,

                season:
                    defaultPlayer
                    .seasons[0]
                    .season

            }
        );


        renderSelectors();

        renderComparison();

    }
);


// ==========================================================
// CLEAR
// ==========================================================

clearButton.addEventListener(
    "click",
    () => {

        createDefaultSelectors();

        renderSelectors();

        renderComparison();

    }
);


// ==========================================================
// MODE BUTTONS
// ==========================================================

modeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                modeButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                const mode =
                    button.dataset.mode;


                traditionalPanel.classList.toggle(
                    "active",
                    mode
                    ===
                    "traditional"
                );


                customPanel.classList.toggle(
                    "active",
                    mode
                    ===
                    "custom"
                );


                if (
                    mode
                    ===
                    "custom"
                    &&
                    radarChart
                ) {

                    radarChart.resize();

                }

            }
        );

    }
);


// ==========================================================
// LOAD DATA
// ==========================================================

async function loadComparisonData() {

    try {

        const response =
            await fetch(
                "./data/player_season_profiles.json"
            );


        if (!response.ok) {

            throw new Error(
                `Unable to load profile data: ${response.status}`
            );

        }


        allProfiles =
            await response.json();


        buildPlayerIndex();


        createDefaultSelectors();


        renderSelectors();


        renderComparison();


    } catch (
        error
    ) {

        console.error(
            "COMPARE PAGE ERROR:",
            error
        );


        selectorsContainer.innerHTML = `

            <div class="comparison-empty">

                Comparison data could not be loaded.

            </div>

        `;

    }

}


// ==========================================================
// START
// ==========================================================

loadComparisonData();
