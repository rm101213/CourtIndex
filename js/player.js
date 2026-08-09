// ==========================================================
// COURTINDEX
// PLAYER PROFILE
// Complete replacement player.js
// ==========================================================


// ==========================================================
// PAGE ELEMENTS
// ==========================================================

const playerNameElement =
    document.getElementById(
        "player-name"
    );

const careerSummaryElement =
    document.getElementById(
        "player-career-summary"
    );

const seasonSelect =
    document.getElementById(
        "season-select"
    );

const seasonMeta =
    document.getElementById(
        "season-meta"
    );

const traditionalStats =
    document.getElementById(
        "traditional-stats"
    );

const advancedStats =
    document.getElementById(
        "advanced-stats"
    );

const ratingList =
    document.getElementById(
        "rating-list"
    );

const overallScore =
    document.getElementById(
        "overall-score"
    );

const seasonArchetype =
    document.getElementById(
        "season-archetype"
    );

const dataConfidence =
    document.getElementById(
        "data-confidence"
    );

const dataQualityButton =
    document.getElementById(
        "data-quality-info"
    );

const dataQualityExplanation =
    document.getElementById(
        "data-quality-explanation"
    );


// ==========================================================
// STATE
// ==========================================================

let playerProfiles = [];


// ==========================================================
// GET PLAYER ID FROM URL
//
// Example:
//
// player.html?id=3149391
//
// ==========================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const playerId =
    urlParams.get(
        "id"
    );


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
// STAT CARD
// ==========================================================

function createStatCard(
    label,
    value
) {

    return `

        <article class="stat-card">

            <p class="stat-value">
                ${value}
            </p>

            <p class="stat-label">
                ${label}
            </p>

        </article>

    `;

}


// ==========================================================
// RATING ROW
// ==========================================================

function createRatingRow(
    label,
    value
) {

    const numericValue =
        Number(
            value
        );


    const safeValue =
        Number.isFinite(
            numericValue
        )
        ?
        Math.max(
            0,
            Math.min(
                100,
                numericValue
            )
        )
        :
        0;


    const displayValue =
        Number.isFinite(
            numericValue
        )
        ?
        numericValue.toFixed(
            1
        )
        :
        "—";


    return `

        <div class="rating-row">

            <div class="rating-heading">

                <span>
                    ${label}
                </span>

                <strong>
                    ${displayValue}
                </strong>

            </div>


            <div class="rating-track">

                <div
                    class="rating-fill"
                    style="width: ${safeValue}%"
                >
                </div>

            </div>

        </div>

    `;

}


// ==========================================================
// DISPLAY SELECTED SEASON
// ==========================================================

function displaySeason(
    season
) {

    const profile =
        playerProfiles.find(
            item =>
                String(
                    item.season
                )
                ===
                String(
                    season
                )
        );


    if (!profile) {

        console.error(
            "Season profile not found:",
            season
        );

        return;

    }


    // ------------------------------------------------------
    // Team / games information
    // ------------------------------------------------------

    seasonMeta.innerHTML = `

        <span>
            ${profile.team ?? "Team unavailable"}
        </span>

        <span>
            ${profile.games_played ?? "—"} games
        </span>

    `;


    // ------------------------------------------------------
    // Traditional statistics
    // ------------------------------------------------------

    traditionalStats.innerHTML = [

        createStatCard(
            "Points",
            formatNumber(
                profile.points_per_game
            )
        ),

        createStatCard(
            "Rebounds",
            formatNumber(
                profile.rebounds_per_game
            )
        ),

        createStatCard(
            "Assists",
            formatNumber(
                profile.assists_per_game
            )
        ),

        createStatCard(
            "Steals",
            formatNumber(
                profile.steals_per_game
            )
        ),

        createStatCard(
            "Blocks",
            formatNumber(
                profile.blocks_per_game
            )
        ),

        createStatCard(
            "Minutes",
            formatNumber(
                profile.minutes_per_game
            )
        )

    ].join(
        ""
    );


    // ------------------------------------------------------
    // Advanced statistics
    // ------------------------------------------------------

    advancedStats.innerHTML = [

        createStatCard(
            "True Shooting",
            formatPercent(
                profile.true_shooting_pct
            )
        ),

        createStatCard(
            "Effective FG",
            formatPercent(
                profile.effective_fg_pct
            )
        ),

        createStatCard(
            "Points / 36",
            formatNumber(
                profile.points_per_36
            )
        ),

        createStatCard(
            "Rebounds / 36",
            formatNumber(
                profile.rebounds_per_36
            )
        ),

        createStatCard(
            "Assists / 36",
            formatNumber(
                profile.assists_per_36
            )
        ),

        createStatCard(
            "Production / 36",
            formatNumber(
                profile.production_per_36
            )
        )

    ].join(
        ""
    );


    // ------------------------------------------------------
    // Custom ratings
    // ------------------------------------------------------

    const ratings = [

        [
            "Impact",
            profile.impact
        ],

        [
            "Dominance",
            profile.dominance
        ],

        [
            "Efficiency",
            profile.efficiency
        ],

        [
            "Consistency",
            profile.consistency
        ],

        [
            "Clutch",
            profile.clutch
        ],

        [
            "Availability",
            profile.availability
        ],

        [
            "Momentum",
            profile.momentum
        ]

    ];


    ratingList.innerHTML =
        ratings
        .map(
            rating =>
                createRatingRow(
                    rating[0],
                    rating[1]
                )
        )
        .join(
            ""
        );


    // ------------------------------------------------------
    // Overall
    // ------------------------------------------------------

    overallScore.textContent =
        formatNumber(
            profile.season_overall
        );


    seasonArchetype.textContent =
        profile.season_archetype
        ??
        "Season profile";


    // ------------------------------------------------------
    // Data Quality
    // ------------------------------------------------------

    dataConfidence.textContent =
        profile.data_confidence
        ??
        "Not available";

}


// ==========================================================
// LOAD PLAYER DATA
// ==========================================================

async function loadPlayer() {

    // ------------------------------------------------------
    // No player ID
    // ------------------------------------------------------

    if (!playerId) {

        playerNameElement.textContent =
            "Player not found";


        careerSummaryElement.textContent =
            "No player ID was provided.";

        return;

    }


    try {

        // --------------------------------------------------
        // Load JSON
        // --------------------------------------------------

        const response =
            await fetch(
                "./data/player_season_profiles.json"
            );


        if (!response.ok) {

            throw new Error(
                `Could not load player data. HTTP ${response.status}`
            );

        }


        const allProfiles =
            await response.json();


        console.log(
            "Profiles loaded:",
            allProfiles.length
        );


        // --------------------------------------------------
        // Find this player's seasons
        // --------------------------------------------------

        playerProfiles =
            allProfiles
            .filter(
                profile =>
                    String(
                        profile.player_id
                    )
                    ===
                    String(
                        playerId
                    )
            )
            .sort(
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


        console.log(
            "Player ID:",
            playerId
        );


        console.log(
            "Player seasons:",
            playerProfiles.length
        );


        // --------------------------------------------------
        // Player missing from JSON
        // --------------------------------------------------

        if (
            playerProfiles.length
            ===
            0
        ) {

            playerNameElement.textContent =
                "Player not found";


            careerSummaryElement.textContent =
                "No season data was found for this player.";

            return;

        }


        // --------------------------------------------------
        // Latest profile
        // --------------------------------------------------

        const latestProfile =
            playerProfiles[0];


        playerNameElement.textContent =
            latestProfile.display_name
            ??
            latestProfile.player_name
            ??
            "Player";


        // --------------------------------------------------
        // Career range
        // --------------------------------------------------

        const seasons =
            playerProfiles
            .map(
                profile =>
                    Number(
                        profile.season
                    )
            )
            .filter(
                season =>
                    Number.isFinite(
                        season
                    )
            );


        const firstSeason =
            Math.min(
                ...seasons
            );


        const lastSeason =
            Math.max(
                ...seasons
            );


        careerSummaryElement.textContent =
            `Career seasons in archive: ${
                firstSeason
            }–${
                lastSeason
            }`;


        // --------------------------------------------------
        // Season dropdown
        // --------------------------------------------------

        seasonSelect.innerHTML =
            playerProfiles
            .map(
                profile => `

                    <option
                        value="${profile.season}"
                    >
                        ${profile.season}
                    </option>

                `
            )
            .join(
                ""
            );


        // --------------------------------------------------
        // Display newest season initially
        // --------------------------------------------------

        seasonSelect.value =
            latestProfile.season;


        displaySeason(
            latestProfile.season
        );


    } catch (
        error
    ) {

        console.error(
            "PLAYER PAGE ERROR:",
            error
        );


        playerNameElement.textContent =
            "Unable to load player";


        careerSummaryElement.textContent =
            "The player data could not be loaded. Please try again.";

    }

}


// ==========================================================
// SEASON DROPDOWN
// ==========================================================

seasonSelect.addEventListener(
    "change",
    event => {

        displaySeason(
            event.target.value
        );

    }
);


// ==========================================================
// TRADITIONAL / ADVANCED TABS
// ==========================================================

const statTabs =
    document.querySelectorAll(
        ".stat-tab"
    );


const statPanels = {

    traditional:
        document.getElementById(
            "traditional-stats"
        ),

    advanced:
        document.getElementById(
            "advanced-stats"
        )

};


statTabs.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                // Remove active state from buttons
                statTabs.forEach(
                    tab => {

                        tab.classList.remove(
                            "active"
                        );

                    }
                );


                // Hide panels
                Object.values(
                    statPanels
                ).forEach(
                    panel => {

                        if (panel) {

                            panel.classList.remove(
                                "active"
                            );

                        }

                    }
                );


                // Selected button
                button.classList.add(
                    "active"
                );


                // Selected panel
                const selectedTab =
                    button.dataset.tab;


                if (
                    statPanels[
                        selectedTab
                    ]
                ) {

                    statPanels[
                        selectedTab
                    ].classList.add(
                        "active"
                    );

                }

            }
        );

    }
);


// ==========================================================
// DATA QUALITY EXPLANATION
// ==========================================================

if (
    dataQualityButton
    &&
    dataQualityExplanation
) {

    dataQualityButton.addEventListener(
        "click",
        () => {

            const currentlyHidden =
                dataQualityExplanation.hidden;


            dataQualityExplanation.hidden =
                !currentlyHidden;


            dataQualityButton.setAttribute(
                "aria-expanded",
                String(
                    currentlyHidden
                )
            );


            if (
                currentlyHidden
            ) {

                dataQualityButton.textContent =
                    "Hide explanation";

            } else {

                dataQualityButton.textContent =
                    "What does this mean?";

            }

        }
    );

}


// ==========================================================
// START PAGE
// ==========================================================

loadPlayer();
