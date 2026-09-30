const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];


/* ================================
   APP STATE
================================ */

const state = {
    ratio: {
        cement: 1,
        sand: 2,
        granite: 4
    },

    counts: {
        cement: 0,
        sand: 0,
        granite: 0
    },

    actions: [],

    history: JSON.parse(
        localStorage.getItem("sitebatch-history") || "[]"
    )
};


/* ================================
   UNIT CONVERSION DATA
================================ */

const units = {
    length: {
        "Millimetre (mm)": 0.001,
        "Centimetre (cm)": 0.01,
        "Metre (m)": 1,
        "Kilometre (km)": 1000,
        "Inch (in)": 0.0254,
        "Foot (ft)": 0.3048,
        "Yard (yd)": 0.9144
    },

    area: {
        "mm²": 0.000001,
        "cm²": 0.0001,
        "m²": 1,
        "km²": 1000000,
        "ft²": 0.09290304,
        "yd²": 0.83612736
    },

    volume: {
        "cm³": 0.000001,
        "m³": 1,
        "Litre (L)": 0.001,
        "Millilitre (mL)": 0.000001,
        "ft³": 0.028316846592,
        "yd³": 0.764554857984
    },

    mass: {
        "Milligram (mg)": 0.000001,
        "Gram (g)": 0.001,
        "Kilogram (kg)": 1,
        "Tonne (t)": 1000,
        "Pound (lb)": 0.45359237
    },

    force: {
        "Newton (N)": 1,
        "Kilonewton (kN)": 1000,
        "Kilogram-force (kgf)": 9.80665
    },

    pressure: {
        "Pascal (Pa)": 1,
        "Kilopascal (kPa)": 1000,
        "Megapascal (MPa)": 1000000,
        "N/mm²": 1000000,
        "N/m²": 1,
        "Bar": 100000,
        "psi": 6894.757293
    }
};


const categoryDefaults = {
    length: ["Metre (m)", "Centimetre (cm)"],
    area: ["m²", "ft²"],
    volume: ["m³", "ft³"],
    mass: ["Kilogram (kg)", "Tonne (t)"],
    force: ["Kilonewton (kN)", "Newton (N)"],
    pressure: ["Megapascal (MPa)", "Kilopascal (kPa)"]
};


/* ================================
   GENERAL FUNCTIONS
================================ */

function formatNumber(value) {
    if (!Number.isFinite(value)) {
        return "—";
    }

    if (Math.abs(value) >= 100000) {
        return value.toExponential(4);
    }

    return Number(value.toFixed(6)).toLocaleString();
}


function currentTarget(material) {
    return state.ratio[material];
}


function totalTarget() {
    return (
        state.ratio.cement +
        state.ratio. sand+
        state.ratio.granite
    );
}


function totalCount() {
    return (
        state.counts.cement +
        state.counts.sand +
        state.counts.granite
    );
}


/* ================================
   BATCH COUNTER
================================ */

function updateCounter() {
    $("#ratioTitle").textContent =
        `${state.ratio.cement} : ${state.ratio.sand} : ${state.ratio.granite}`;

    const total = totalTarget();
    const count = totalCount();

    const percent = Math.min(
        100,
        Math.round((count / total) * 100)
    );

    $("#totalBuckets").textContent = count;
    $("#batchStatus").textContent = `${count} / ${total} buckets`;

    $("#progressFill").style.width = `${percent}%`;
    $("#completionText").textContent = `${percent}%`;

    ["cement", "sand", "granite"].forEach((material) => {
        const countEl = $(`#${material}Count`);
        const remainEl = $(`#${material}Remain`);
        const row = $(`#${material}Row`);

        const target = currentTarget(material);
        const countNow = state.counts[material];

        const remaining = Math.max(
            0,
            target - countNow
        );

        countEl.textContent = countNow;

        remainEl.textContent =
            remaining === 0
                ? "Complete"
                : `${remaining} ${
                    material === "cement"
                        ? remaining === 1
                            ? "bag"
                            : "bags"
                        : "buckets"
                }`;

        row.classList.toggle(
            "done",
            countNow >= target
        );
    });


    if (count === 0) {
        $("#batchPhase").textContent =
            "Ready to count";
    }

    else if (count < total) {
        $("#batchPhase").textContent =
            "Batch in progress";
    }

    else {
        $("#batchPhase").textContent =
            "Batch complete";
    }
}


/* ================================
   RATIO MANAGEMENT
================================ */

function setRatio(cement, sand, granite) {
    state.ratio = {
        cement,
        sand,
        granite
    };

    state.counts = {
        cement: 0,
        sand: 0,
        granite: 0
    };

    state.actions = [];


    $("#cementRatio").value = cement;
    $("#sandRatio").value = sand;
    $("#graniteRatio").value = granite;


    $$(".ratio-option").forEach((btn) => {
        btn.classList.toggle(
            "active",

            Number(btn.dataset.cement) === cement &&
            Number(btn.dataset.sand) === sand &&
            Number(btn.dataset.granite) === granite
        );
    });


    $("#lastAction").textContent =
        "No material counted yet.";

    updateCounter();
}


/* ================================
   MATERIAL COUNTING
================================ */

function addMaterial(material) {
    const target = currentTarget(material);

    if (state.counts[material] >= target) {
        showToast(
            `${materialNames(material)} target already reached.`
        );

        return;
    }


    state.counts[material]++;

    const action = {
        material,

        time: new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        )
    };


    state.actions.push(action);


    $("#lastAction").textContent =
        `${materialNames(material)} counted at ${action.time}.`;


    updateCounter();


    const completed =
        totalCount() === totalTarget();


    if (completed) {
        action.completedAt = Date.now();

        showToast(
            "Batch complete. Saving to history..."
        );

        setTimeout(
            saveCompletedBatch,
            250
        );
    }
}


function materialNames(material) {
    return (
        material.charAt(0).toUpperCase() +
        material.slice(1)
    );
}


/* ================================
   RESET / UNDO
================================ */

function resetBatch() {
    state.counts = {
        cement: 0,
        sand: 0,
        granite: 0
    };

    state.actions = [];

    $("#lastAction").textContent =
        "No material counted yet.";

    updateCounter();
}


function undo() {
    const last = state.actions.pop();

    if (!last) {
        showToast("Nothing to undo.");
        return;
    }


    state.counts[last.material] =
        Math.max(
            0,
            state.counts[last.material] - 1
        );


    $("#lastAction").textContent =
        `Undid ${materialNames(last.material)}.`;

    updateCounter();
}


/* ================================
   BATCH HISTORY
================================ */

function saveCompletedBatch() {
    if (totalCount() !== totalTarget()) {
        return;
    }


    const key = JSON.stringify({
        ratio: state.ratio,
        counts: state.counts
    });


    const alreadySaved =
        state.history.some(
            (item) =>
                item.key === key &&
                Date.now() - item.timestamp < 3000
        );


    if (alreadySaved) {
        return;
    }


    const name =
        $("#batchName").value.trim() ||
        `Batch ${state.history.length + 1}`;


    state.history.unshift({
        key,

        name,

        ratio:
            `${state.ratio.cement} : ` +
            `${state.ratio.sand} : ` +
            `${state.ratio.granite}`,

        count: totalCount(),

        timestamp: Date.now()
    });


    state.history =
        state.history.slice(0, 20);


    localStorage.setItem(
        "sitebatch-history",
        JSON.stringify(state.history)
    );


    renderHistory();

    showToast(
        "Completed batch saved to history."
    );
}


function renderHistory() {
    const list = $("#historyList");


    if (!state.history.length) {
        list.innerHTML =
            `<div class="empty-history">
                Completed batches will appear here.
            </div>`;

        return;
    }


    list.innerHTML = state.history
        .map(
            (item) => `
                <div class="history-row">

                    <strong>
                        ${escapeHtml(item.name)}
                    </strong>

                    <span>
                        ${escapeHtml(item.ratio)}
                    </span>

                    <span>
                        ${item.count} buckets
                    </span>

                    <span>
                        ${new Date(
                            item.timestamp
                        ).toLocaleString(
                            [],
                            {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        )}
                    </span>

                </div>
            `
        )
        .join("");
}


function escapeHtml(value) {
    return value.replace(
        /[&<>"']/g,

        (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character])
    );
}


/* ================================
   TOAST MESSAGE
================================ */

function showToast(message) {
    const toast = $("#toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer =
        setTimeout(
            () => toast.classList.remove("show"),
            2200
        );
}


/* ================================
   RATIO PRESETS
================================ */

$$(".ratio-option").forEach((btn) => {
    btn.addEventListener(
        "click",
        () => {
            setRatio(
                Number(btn.dataset.cement),
                Number(btn.dataset.sand),
                Number(btn.dataset.granite)
            );
        }
    );
});


/* ================================
   CUSTOM RATIO
================================ */

$("#applyRatioBtn").addEventListener(
    "click",
    () => {
        const cement =
            Number($("#cementRatio").value);

        const sand =
            Number($("#sandRatio").value);

        const granite =
            Number($("#graniteRatio").value);


        if (
            ![
                cement,
                sand,
                granite
            ].every(
                (number) =>
                    Number.isInteger(number) &&
                    number > 0
            )
        ) {
            showToast(
                "Enter whole numbers greater than zero."
            );

            return;
        }


        setRatio(
            cement,
            sand,
            granite
        );

        showToast(
            "Custom ratio applied."
        );
    }
);


/* ================================
   MATERIAL BUTTONS
================================ */

$$(".material-btn").forEach((btn) => {
    btn.addEventListener(
        "click",
        () => {
            addMaterial(
                btn.dataset.material
            );
        }
    );
});


/* ================================
   UNDO / RESET
================================ */

$("#undoBtn").addEventListener(
    "click",
    undo
);


$("#resetBtn").addEventListener(
    "click",
    () => {
        resetBatch();

        showToast(
            "Batch counter reset."
        );
    }
);


/* ================================
   CLEAR HISTORY
================================ */

$("#clearHistoryBtn").addEventListener(
    "click",
    () => {
        state.history = [];

        localStorage.removeItem(
            "sitebatch-history"
        );

        renderHistory();

        showToast(
            "History cleared."
        );
    }
);


/* ================================
   KEYBOARD SHORTCUTS
================================ */

document.addEventListener(
    "keydown",
    (event) => {
        const tag =
            document.activeElement.tagName;


        if (
            [
                "INPUT",
                "SELECT",
                "TEXTAREA"
            ].includes(tag)
        ) {
            return;
        }


        if (event.key === "1") {
            addMaterial("cement");
        }

        if (event.key === "2") {
            addMaterial("sand");
        }

        if (event.key === "3") {
            addMaterial("granite");
        }

        if (event.key.toLowerCase() === "z") {
            undo();
        }

        if (event.key.toLowerCase() === "r") {
            resetBatch();
        }
    }
);


/* ================================
   THEME TOGGLE
================================ */

const savedTheme =
    localStorage.getItem(
        "sitebatch-theme"
    );


if (savedTheme) {
    document.documentElement.dataset.theme =
        savedTheme;
}


$("#themeBtn").addEventListener(
    "click",
    () => {
        const next =
            document.documentElement.dataset.theme === "dark"
                ? "light"
                : "dark";


        if (next === "light") {
            delete document.documentElement.dataset.theme;
        }

        else {
            document.documentElement.dataset.theme =
                next;
        }


        localStorage.setItem(
            "sitebatch-theme",
            next
        );
    }
);


/* ================================
   UNIT CONVERTER
================================ */

let activeCategory = "length";


function populateUnits() {
    const [
        fromDefault,
        toDefault
    ] = categoryDefaults[
        activeCategory
    ];


    const unitOptions =
        Object.keys(
            units[activeCategory]
        )
        .map(
            (unit) =>
                `<option>${unit}</option>`
        )
        .join("");


    $("#fromUnit").innerHTML =
        unitOptions;

    $("#toUnit").innerHTML =
        unitOptions;


    $("#fromUnit").value =
        fromDefault;

    $("#toUnit").value =
        toDefault;


    convert();
}


function convert() {
    const value =
        Number(
            $("#fromValue").value
        );

    const from =
        $("#fromUnit").value;

    const to =
        $("#toUnit").value;


    if (!Number.isFinite(value)) {
        $("#convertResult").textContent =
            "—";

        return;
    }


    const base =
        value *
        units[activeCategory][from];


    const result =
        base /
        units[activeCategory][to];


    $("#convertResult").textContent =
        `${formatNumber(result)} ${to}`;
}


/* ================================
   CONVERTER TABS
================================ */

$$(".converter-tab").forEach((tab) => {
    tab.addEventListener(
        "click",
        () => {
            activeCategory =
                tab.dataset.category;


            $$(".converter-tab")
                .forEach((item) => {
                    item.classList.toggle(
                        "active",
                        item === tab
                    );
                });


            populateUnits();
        }
    );
});


/* ================================
   CONVERTER INPUTS
================================ */

[
    "fromValue",
    "fromUnit",
    "toUnit"
].forEach((id) => {
    $(`#${id}`).addEventListener(
        "input",
        convert
    );
});


/* ================================
   SWAP UNITS
================================ */

$("#swapBtn").addEventListener(
    "click",
    () => {
        const oldFrom =
            $("#fromUnit").value;


        $("#fromUnit").value =
            $("#toUnit").value;

        $("#toUnit").value =
            oldFrom;


        convert();
    }
);


/* ================================
   COPY CONVERSION RESULT
================================ */

$("#copyResult").addEventListener(
    "click",
    async () => {
        try {
            await navigator.clipboard.writeText(
                $("#convertResult").textContent
            );

            showToast(
                "Result copied."
            );
        }

        catch {
            showToast(
                "Copy is not available in this browser."
            );
        }
    }
);


/* ================================
   INITIAL RENDER
================================ */

updateCounter();
renderHistory();
populateUnits();