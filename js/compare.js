// ==========================================================
// COURTINDEX
// COMPARE SEASONS
// ==========================================================


const MAX_PLAYERS = 4;
const MIN_PLAYERS = 2;


const PLAYER_COLOURS = [

    {
        border: "#ff6b35",
        background: "rgba(255,107,53,0.16)"
    },

    {
        border: "#56a6ff",
        background: "rgba(86,166,255,0.15)"
    },

    {
        border: "#78d89a",
        background: "rgba(120,216,154,0.14)"
    },

    {
        border: "#c47cff",
        background: "rgba(196,124,255,0.14)"
    }

];



let allProfiles = [];
let playerIndex = [];
let selectors = [];

let customRadarChart = null;
let traditionalRadarChart = null;

let modelMetrics = [];



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

const traditionalMetrics =
    document.getElementById(
        "traditional-metrics"
    );

const customMetrics =
    document.getElementById(
        "custom-metrics"
    );

const traditionalSummary =
    document.getElementById(
        "traditional-summary"
    );

const overallComparison =
    document.getElementById(
        "overall-comparison"
    );

const traditionalPanel =
    document.getElementById(
        "traditional-comparison"
    );

const customPanel =
    document.getElementById(
        "custom-comparison"
    );

const modeButtons =
    document.querySelectorAll(
        ".comparison-mode-button"
    );



// ==========================================================
// FORMATTERS
// ==========================================================

function formatNumber(
    value,
    decimals = 1
) {

    const number =
        Number(value);


    if (
        value === null
        ||
        value === undefined
        ||
        value === ""
        ||
        Number.isNaN(number)
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
        Number(value);


    if (
        value === null
        ||
        value === undefined
        ||
        Number.isNaN(number)
    ) {

        return "—";

    }


    return (
        number * 100
    ).toFixed(
        decimals
    ) + "%";

}



// ==========================================================
// PLAYER INDEX
// ==========================================================

function buildPlayerIndex() {

    const playerMap =
        new Map();


    allProfiles.forEach(
        profile => {

            const id =
                String(
                    profile.player_id
                );


            if (!playerMap.has(id)) {

                playerMap.set(
                    id,
                    {
                        player_id:
                            profile.player_id,

                        display_name:
                            profile.display_name
                            ??
                            profile.player_name,

                        search_name:
                            (
                                profile.display_name
                                ??
                                profile.player_name
                                ??
                                ""
                            )
                            .toLowerCase(),

                        seasons:
                            []
                    }
                );

            }


            playerMap
                .get(id)
                .seasons
                .push(profile);

        }
    );


    playerIndex =
        Array.from(
            playerMap.values()
        );


    playerIndex.sort(
        (a, b) =>
            a.display_name.localeCompare(
                b.display_name
            )
    );


    playerIndex.forEach(
        player => {

            player.seasons.sort(
                (a, b) =>
                    Number(b.season)
                    -
                    Number(a.season)
            );

        }
    );

}



// ==========================================================
// DEFAULTS
// ==========================================================

function createDefaultSelectors() {

    selectors = [];


    selectors.push(
        {
            player_id:
                playerIndex[0].player_id,

            season:
                playerIndex[0]
                    .seasons[0]
                    .season
        }
    );


    selectors.push(
        {
            player_id:
                playerIndex[1].player_id,

            season:
                playerIndex[1]
                    .seasons[0]
                    .season
        }
    );

}



// ==========================================================
// PLAYER LOOKUP
// ==========================================================

function findPlayer(
    playerId
) {

    return playerIndex.find(
        player =>
            String(player.player_id)
            ===
            String(playerId)
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
            ) => {

                const player =
                    findPlayer(
                        selector.player_id
                    );


                const seasons =
                    player.seasons
                    .map(
                        profile => `

                            <option
                                value="${profile.season}"
                                ${
                                    String(profile.season)
                                    ===
                                    String(selector.season)
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
                    .join("");


                return `

                    <article
                        class="comparison-selector"
                        data-selector-index="${index}"
                    >

                        <p class="selector-number">
                            Player ${index + 1}
                        </p>


                        ${
                            selectors.length > MIN_PLAYERS
                            ?
                            `

                                <button
                                    class="remove-player-button"
                                    data-remove="${index}"
                                    type="button"
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


                                <input
                                    class="player-search-input"
                                    data-player-index="${index}"
                                    type="search"
                                    value="${player.display_name}"
                                    autocomplete="off"
                                >


                                <div
                                    class="player-suggestions"
                                    data-suggestions-index="${index}"
                                    hidden
                                >
                                </div>

                            </div>


                            <div class="selector-field">

                                <label>
                                    Season
                                </label>


                                <select
                                    class="season-select"
                                    data-season-index="${index}"
                                >
                                    ${seasons}
                                </select>

                            </div>


                        </div>

                    </article>

                `;

            }
        )
        .join("");


    addPlayerButton.disabled =
        selectors.length
        >=
        MAX_PLAYERS;


    attachSelectorEvents();

}



// ==========================================================
// SEARCH SUGGESTIONS
// ==========================================================

function showPlayerSuggestions(
    index,
    query
) {

    const container =
        document.querySelector(
            `[data-suggestions-index="${index}"]`
        );


    const cleaned =
        query
        .trim()
        .toLowerCase();


    if (!cleaned) {

        container.hidden = true;

        return;

    }


    const matches =
        playerIndex
        .filter(
            player =>
                player.search_name
                .includes(cleaned)
        )
        .slice(
            0,
            12
        );


    if (
        matches.length === 0
    ) {

        container.innerHTML = `

            <div class="player-suggestion">
                No players found
            </div>

        `;

        container.hidden = false;

        return;

    }


    container.innerHTML =
        matches
        .map(
            player => `

                <button
                    class="player-suggestion"
                    data-select-player="${player.player_id}"
                    data-select-index="${index}"
                    type="button"
                >

                    ${player.display_name}

                    <small>
                        ${
                            player.seasons[
                                player.seasons.length - 1
                            ].season
                        }
                        –
                        ${
                            player.seasons[0].season
                        }
                    </small>

                </button>

            `
        )
        .join("");


    container.hidden = false;


    container
        .querySelectorAll(
            "[data-select-player]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        selectPlayer(
                            Number(
                                button.dataset.selectIndex
                            ),
                            button.dataset.selectPlayer
                        );

                    }
                );

            }
        );

}



// ==========================================================
// SELECT PLAYER
// ==========================================================

function selectPlayer(
    index,
    playerId
) {

    const player =
        findPlayer(
            playerId
        );


    selectors[index] = {

        player_id:
            player.player_id,

        season:
            player.seasons[0].season

    };


    renderSelectors();

    renderComparison();

}



// ==========================================================
// SELECTOR EVENTS
// ==========================================================

function attachSelectorEvents() {


    document
        .querySelectorAll(
            ".player-search-input"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    event => {

                        const index =
                            Number(
                                event.target.dataset.playerIndex
                            );


                        showPlayerSuggestions(
                            index,
                            event.target.value
                        );

                    }
                );


                input.addEventListener(
                    "focus",
                    event => {

                        const index =
                            Number(
                                event.target.dataset.playerIndex
                            );


                        if (
                            event.target.value
                        ) {

                            showPlayerSuggestions(
                                index,
                                event.target.value
                            );

                        }

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
                                event.target.dataset.seasonIndex
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
                    () => {

                        selectors.splice(
                            Number(
                                button.dataset.remove
                            ),
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

                        String(profile.player_id)
                        ===
                        String(selector.player_id)

                        &&

                        String(profile.season)
                        ===
                        String(selector.season)

                )
        )
        .filter(Boolean);

}



// ==========================================================
// PERCENTILE
// ==========================================================

function percentileRank(
    value,
    values
) {

    const valid =
        values
        .map(Number)
        .filter(Number.isFinite)
        .sort(
            (a, b) =>
                a - b
        );


    const number =
        Number(value);


    if (
        !Number.isFinite(number)
        ||
        valid.length === 0
    ) {

        return 0;

    }


    const below =
        valid.filter(
            item =>
                item < number
        ).length;


    const equal =
        valid.filter(
            item =>
                item === number
        ).length;


    return (
        (
            below
            +
            0.5 * equal
        )
        /
        valid.length
        *
        100
    );

}



// ==========================================================
// TRADITIONAL RADAR
// ==========================================================

const TRADITIONAL_RADAR_METRICS = [

    {
        label: "Scoring",
        key: "points_per_game"
    },

    {
        label: "Rebounding",
        key: "rebounds_per_game"
    },

    {
        label: "Playmaking",
        key: "assists_per_game"
    },

    {
        label: "Steals",
        key: "steals_per_game"
    },

    {
        label: "Blocks",
        key: "blocks_per_game"
    },

    {
        label: "Efficiency",
        key: "true_shooting_pct"
    },

    {
        label: "Production",
        key: "production_per_36"
    }

];


function traditionalPercentile(
    profile,
    metricKey
) {

    const seasonPopulation =
        allProfiles.filter(
            item =>
                String(item.season)
                ===
                String(profile.season)
        );


    return percentileRank(

        profile[metricKey],

        seasonPopulation.map(
            item =>
                item[metricKey]
        )

    );

}



// ==========================================================
// CHART CREATOR
// ==========================================================

function createRadarChart(
    canvasId,
    profiles,
    labels,
    dataGetter,
    existingChart
) {

    const canvas =
        document.getElementById(
            canvasId
        );


    if (existingChart) {

        existingChart.destroy();

    }


    return new Chart(
        canvas,
        {

            type:
                "radar",


            data: {

                labels,

                datasets:
                    profiles.map(
                        (
                            profile,
                            index
                        ) => {

                            const colour =
                                PLAYER_COLOURS[index];


                            return {

                                label:
                                    `${
                                        profile.display_name
                                    } ${
                                        profile.season
                                    }`,

                                data:
                                    dataGetter(
                                        profile
                                    ),

                                borderColor:
                                    colour.border,

                                backgroundColor:
                                    colour.background,

                                pointBackgroundColor:
                                    colour.border,

                                pointBorderColor:
                                    "#fff",

                                borderWidth: 2,

                                pointRadius: 3,

                                fill: true

                            };

                        }
                    )

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                plugins: {

                    legend: {

                        position: "bottom",

                        labels: {

                            color: "#f5f7fb",

                            padding: 16,

                            usePointStyle: true

                        }

                    }

                },


                scales: {

                    r: {

                        min: 0,

                        max: 100,

                        ticks: {

                            display: false,

                            stepSize: 20

                        },

                        grid: {

                            color:
                                "rgba(165,173,189,0.18)"

                        },

                        angleLines: {

                            color:
                                "rgba(165,173,189,0.18)"

                        },

                        pointLabels: {

                            color: "#f5f7fb",

                            font: {

                                size: 12,

                                weight: "600"

                            }

                        }

                    }

                }

            }

        }
    );

}



// ==========================================================
// TRADITIONAL METRICS
// ==========================================================

const TRADITIONAL_METRICS = [

    {
        label: "Points / Game",
        key: "points_per_game",
        format: formatNumber
    },

    {
        label: "Rebounds / Game",
        key: "rebounds_per_game",
        format: formatNumber
    },

    {
        label: "Assists / Game",
        key: "assists_per_game",
        format: formatNumber
    },

    {
        label: "Steals / Game",
        key: "steals_per_game",
        format: formatNumber
    },

    {
        label: "Blocks / Game",
        key: "blocks_per_game",
        format: formatNumber
    },

    {
        label: "True Shooting",
        key: "true_shooting_pct",
        format: formatPercent
    },

    {
        label: "Points / 36",
        key: "points_per_36",
        format: formatNumber
    },

    {
        label: "Production / 36",
        key: "production_per_36",
        format: formatNumber
    }

];



// ==========================================================
// CUSTOM METRICS
// ==========================================================

const CUSTOM_METRICS = [

    {
        label: "Impact",
        key: "impact"
    },

    {
        label: "Dominance",
        key: "dominance"
    },

    {
        label: "Efficiency",
        key: "efficiency"
    },

    {
        label: "Consistency",
        key: "consistency"
    },

    {
        label: "Clutch",
        key: "clutch"
    },

    {
        label: "Availability",
        key: "availability"
    },

    {
        label: "Momentum",
        key: "momentum"
    }

];



// ==========================================================
// METRIC ROWS
// ==========================================================

function renderMetricRows(
    container,
    profiles,
    metrics,
    includeInfo
) {

    container.style.setProperty(
        "--compare-count",
        profiles.length
    );


    container.innerHTML =
        metrics
        .map(
            metric => `

                <article class="metric-row">

                    <div class="metric-info">

                        <p class="metric-name">
                            ${metric.label}
                        </p>


                        ${
                            includeInfo
                            ?
                            `

                                <button
                                    class="learn-more-button"
                                    data-metric-info="${metric.label}"
                                    type="button"
                                >
                                    Find out more
                                </button>

                            `
                            :
                            ""
                        }

                    </div>


                    <div class="metric-values">

                        ${
                            profiles
                            .map(
                                profile => `

                                    <div class="metric-player-value">

                                        <strong>
                                            ${
                                                metric.format
                                                ?
                                                metric.format(
                                                    profile[
                                                        metric.key
                                                    ]
                                                )
                                                :
                                                formatNumber(
                                                    profile[
                                                        metric.key
                                                    ]
                                                )
                                            }
                                        </strong>

                                        <span>
                                            ${profile.display_name}
                                            ${profile.season}
                                        </span>

                                    </div>

                                `
                            )
                            .join("")
                        }

                    </div>

                </article>

            `
        )
        .join("");


    container
        .querySelectorAll(
            "[data-metric-info]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openMetricModal(
                            button.dataset.metricInfo
                        );

                    }
                );

            }
        );

}



// ==========================================================
// SUMMARIES
// ==========================================================

function teamLink(
    profile
) {

    if (!profile.team) {

        return "—";

    }


    return `

        <a
            class="team-link"
            href="./team.html?team=${
                encodeURIComponent(
                    profile.team
                )
            }&season=${
                encodeURIComponent(
                    profile.season
                )
            }"
        >
            ${profile.team}
        </a>

    `;

}


function renderTraditionalSummary(
    profiles
) {

    traditionalSummary.innerHTML =
        `

            <p class="eyebrow">
                Selected Seasons
            </p>

            ${
                profiles
                .map(
                    profile => `

                        <article class="summary-player">

                            <p class="summary-name">
                                ${profile.display_name}
                            </p>

                            <p class="summary-season">
                                ${profile.season}
                                •
                                ${teamLink(profile)}
                            </p>

                            <p class="summary-main-stat">
                                ${
                                    formatNumber(
                                        profile.points_per_game
                                    )
                                }
                                PPG
                            </p>

                        </article>

                    `
                )
                .join("")
            }

        `;

}


function renderOverall(
    profiles
) {

    overallComparison.innerHTML =
        `

            <p class="eyebrow">
                Overall
            </p>

            ${
                profiles
                .map(
                    profile => `

                        <article class="overall-player">

                            <p class="overall-player-name">
                                ${profile.display_name}
                            </p>

                            <p class="overall-player-season">
                                ${profile.season}
                                •
                                ${teamLink(profile)}
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
                .join("")
            }

        `;

}



// ==========================================================
// METRIC INFORMATION
// ==========================================================

const METRIC_DESCRIPTIONS = {

    Impact:
        "Impact represents how strongly a player's production and team-level influence stand out within the season.",

    Dominance:
        "Dominance captures the degree to which a player imposed herself statistically through volume, production and high-end performances.",

    Efficiency:
        "Efficiency measures how effectively a player converted possessions and opportunities into production.",

    Consistency:
        "Consistency measures stability from game to game rather than simply rewarding a player's highest peaks.",

    Clutch:
        "Clutch represents performance in higher-leverage or demanding game situations used by the CourtIndex model.",

    Availability:
        "Availability rewards players who consistently appeared, played meaningful minutes and provided a reliable season-long sample.",

    Momentum:
        "Momentum measures how a player's form changed through the season, including late-season and rolling-form indicators."

};


function openMetricModal(
    metricName
) {

    const modal =
        document.getElementById(
            "metric-modal"
        );


    document.getElementById(
        "metric-modal-title"
    ).textContent =
        metricName;


    document.getElementById(
        "metric-modal-description"
    ).textContent =
        METRIC_DESCRIPTIONS[
            metricName
        ]
        ??
        "";


    const detailsContainer =
        document.getElementById(
            "metric-model-details"
        );


    const matches =
        modelMetrics.filter(
            row =>
                String(
                    row.axis
                    ??
                    ""
                )
                .toLowerCase()
                ===
                metricName.toLowerCase()
        );


    if (
        matches.length === 0
    ) {

        detailsContainer.innerHTML = `

            <p class="modal-description">
                Detailed model components are not yet
                available in the frontend data file.
            </p>

        `;

    } else {

        detailsContainer.innerHTML = `

            <div class="metric-detail-list">

                ${
                    matches
                    .map(
                        row => `

                            <div class="metric-detail-item">

                                <span>
                                    ${
                                        row.metric
                                        ??
                                        "Metric"
                                    }
                                </span>

                                <strong>
                                    ${
                                        row.weight
                                        ??
                                        row.metric_weight
                                        ??
                                        ""
                                    }
                                </strong>

                            </div>

                        `
                    )
                    .join("")
                }

            </div>

        `;

    }


    modal.hidden = false;

}


document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(
        element => {

            element.addEventListener(
                "click",
                () => {

                    document.getElementById(
                        "metric-modal"
                    ).hidden = true;

                }
            );

        }
    );



// ==========================================================
// ARCHETYPES
// ==========================================================

const ARCHETYPE_GUIDE = [

    [
        "Elite Season",
        "A high-level all-around season with strength across several rating categories."
    ],

    [
        "Dominant Force",
        "A season defined by exceptional production and dominance."
    ],

    [
        "Game Changer",
        "A strong impact profile with meaningful influence across multiple dimensions."
    ],

    [
        "Iron Season",
        "A season distinguished by durability, reliability and strong availability."
    ],

    [
        "Clinical",
        "A profile strongly associated with efficient production."
    ],

    [
        "Pressure Performer",
        "A season with a particularly strong clutch profile."
    ],

    [
        "Rising Finish",
        "A season whose momentum indicators show a strong finish."
    ],

    [
        "Metronome",
        "A steadier profile associated with consistent, repeatable production."
    ]

];


const archetypeGuide =
    document.getElementById(
        "archetype-guide"
    );


archetypeGuide.innerHTML =
    ARCHETYPE_GUIDE
    .map(
        item => `

            <div class="archetype-guide-item">

                <strong>
                    ${item[0]}
                </strong>

                <p>
                    ${item[1]}
                </p>

            </div>

        `
    )
    .join("");


document
    .getElementById(
        "archetype-help-button"
    )
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "archetype-modal"
            ).hidden = false;

        }
    );


document
    .querySelectorAll(
        "[data-close-archetype]"
    )
    .forEach(
        element => {

            element.addEventListener(
                "click",
                () => {

                    document.getElementById(
                        "archetype-modal"
                    ).hidden = true;

                }
            );

        }
    );



// ==========================================================
// RENDER
// ==========================================================

function renderComparison() {

    const profiles =
        getSelectedProfiles();


    traditionalRadarChart =
        createRadarChart(

            "traditional-radar-chart",

            profiles,

            TRADITIONAL_RADAR_METRICS.map(
                metric =>
                    metric.label
            ),

            profile =>
                TRADITIONAL_RADAR_METRICS
                .map(
                    metric =>
                        traditionalPercentile(
                            profile,
                            metric.key
                        )
                ),

            traditionalRadarChart

        );


    customRadarChart =
        createRadarChart(

            "ratings-radar-chart",

            profiles,

            CUSTOM_METRICS.map(
                metric =>
                    metric.label
            ),

            profile =>
                CUSTOM_METRICS
                .map(
                    metric =>
                        Number(
                            profile[
                                metric.key
                            ]
                        )
                        ||
                        0
                ),

            customRadarChart

        );


    renderTraditionalSummary(
        profiles
    );


    renderOverall(
        profiles
    );


    renderMetricRows(

        traditionalMetrics,

        profiles,

        TRADITIONAL_METRICS,

        false

    );


    renderMetricRows(

        customMetrics,

        profiles,

        CUSTOM_METRICS,

        true

    );

}



// ==========================================================
// ADD / RESET
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


        const player =
            playerIndex[
                selectors.length
            ];


        selectors.push(
            {
                player_id:
                    player.player_id,

                season:
                    player.seasons[0].season
            }
        );


        renderSelectors();

        renderComparison();

    }
);


clearButton.addEventListener(
    "click",
    () => {

        createDefaultSelectors();

        renderSelectors();

        renderComparison();

    }
);



// ==========================================================
// VIEW MODE
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


                const custom =
                    button.dataset.mode
                    ===
                    "custom";


                traditionalPanel.classList.toggle(
                    "active",
                    !custom
                );


                customPanel.classList.toggle(
                    "active",
                    custom
                );


                if (
                    custom
                    &&
                    customRadarChart
                ) {

                    customRadarChart.resize();

                }


                if (
                    !custom
                    &&
                    traditionalRadarChart
                ) {

                    traditionalRadarChart.resize();

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

        const profileResponse =
            await fetch(
                "./data/player_season_profiles.json"
            );


        allProfiles =
            await profileResponse.json();


        /*
         model_metrics.json is optional for now.
         If it exists, Find Out More will show
         the exact stored metric components.
        */

        try {

            const modelResponse =
                await fetch(
                    "./data/model_metrics.json"
                );


            if (
                modelResponse.ok
            ) {

                modelMetrics =
                    await modelResponse.json();

            }

        } catch (
            error
        ) {

            console.log(
                "Model details not loaded."
            );

        }


        buildPlayerIndex();

        createDefaultSelectors();

        renderSelectors();

        renderComparison();


    } catch (
        error
    ) {

        console.error(
            "COMPARE ERROR:",
            error
        );

    }

}


loadComparisonData();
