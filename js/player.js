// ==========================================================
// COURTINDEX
// PLAYER PROFILE
// ==========================================================


const playerNameElement =
    document.getElementById(
        "player-name"
    );

const careerLabelElement =
    document.getElementById(
        "player-career-label"
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


let playerProfiles = [];


// ----------------------------------------------------------
// GET PLAYER ID FROM URL
// ----------------------------------------------------------

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const playerId =
    urlParams.get(
        "id"
    );


// ----------------------------------------------------------
// FORMATTERS
// ----------------------------------------------------------

function formatNumber(
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


// ----------------------------------------------------------
// STAT CARD
// ----------------------------------------------------------

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


// ----------------------------------------------------------
// RATING ROW
// ----------------------------------------------------------

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


    return `

        <div class="rating-row">

            <div class="rating-heading">

                <span>
                    ${label}
                </span>

                <strong>
                    ${
                        formatNumber(
                            value,
                            1
                        )
                    }
                </strong>

            </div>


            <div class="rating-track">

                <div
                    class="rating-fill"
                    style="
                        width:
                        ${safeValue}%;
                    "
                >
                </div>

            </div>

        </div>

    `;

}


// ----------------------------------------------------------
// DISPLAY SEASON
// ----------------------------------------------------------

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

        return;

    }


    seasonMeta.innerHTML = `

        <span>
            ${profile.team ?? "—"}
        </span>

        <span>
            ${profile.games_played ?? "—"} games
        </span>

    `;


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


    overallScore.textContent =
        formatNumber(
            profile.season_overall
        );


    seasonArchetype.textContent =
        profile.season_archetype
        ??
        "";

dataConfidence.textContent =
    profile.data_confidence
    ??
    "Not available";


// ----------------------------------------------------------
// LOAD PLAYER
// ----------------------------------------------------------

async function loadPlayer() {

    if (!playerId) {

        playerNameElement.textContent =
            "Player not found";

        return;

    }


    try {

        const response =
            await fetch(
                "data/player_season_profiles.json"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load player data."
            );

        }


        const allProfiles =
            await response.json();


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


        if (
            playerProfiles.length
            ===
            0
        ) {

            playerNameElement.textContent =
                "Player not found";

            return;

        }


        const latestProfile =
            playerProfiles[0];


        playerNameElement.textContent =
            latestProfile.display_name;


        const seasons =
            playerProfiles.map(
                profile =>
                    Number(
                        profile.season
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


        careerLabelElement.textContent =
            "Player Profile";


        careerSummaryElement.textContent =
            `Career seasons in archive: ${
                firstSeason
            }–${
                lastSeason
            }`;


        seasonSelect.innerHTML =
            playerProfiles
            .map(
                profile => `

                    <option
                        value="${
                            profile.season
                        }"
                    >

                        ${
                            profile.season
                        }

                    </option>

                `
            )
            .join(
                ""
            );


        displaySeason(
            latestProfile.season
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        playerNameElement.textContent =
            "Unable to load player";

    }

}


// ----------------------------------------------------------
// SEASON CHANGE
// ----------------------------------------------------------

seasonSelect.addEventListener(
    "change",
    event => {

        displaySeason(
            event.target.value
        );

    }
);


// ----------------------------------------------------------
// START
// ----------------------------------------------------------

loadPlayer();

// ----------------------------------------------------------
// DATA QUALITY EXPLANATION
// ----------------------------------------------------------

const dataQualityButton =
    document.getElementById(
        "data-quality-info"
    );

const dataQualityExplanation =
    document.getElementById(
        "data-quality-explanation"
    );


if (
    dataQualityButton
    &&
    dataQualityExplanation
) {

    dataQualityButton.addEventListener(
        "click",
        () => {

            const isHidden =
                dataQualityExplanation.hidden;


            dataQualityExplanation.hidden =
                !isHidden;


            dataQualityButton.setAttribute(
                "aria-expanded",
                String(
                    isHidden
                )
            );


            dataQualityButton.textContent =
                isHidden
                ?
                "Hide explanation"
                :
                "What does this mean?";

        }
    );

}
// ----------------------------------------------------------
// STAT TABS
// ----------------------------------------------------------

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

                statTabs.forEach(
                    tab =>
                        tab.classList.remove(
                            "active"
                        )
                );


                Object.values(
                    statPanels
                ).forEach(
                    panel =>
                        panel.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                const selectedTab =
                    button.dataset.tab;


                statPanels[
                    selectedTab
                ].classList.add(
                    "active"
                );

            }
        );

    }
);
