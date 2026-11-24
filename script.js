/* ==========================================
   IZNA 잊페스 취향표
========================================== */

/* 표(행/열 헤더)에 표시할 멤버 이름 */
const members = [
    "마이",
    "방지민",
    "코코",
    "유사랑",
    "최정은",
    "정세비"
];

/* 멤버별 본인 이니셜(닉네임). 씨피명, 행/열 숨기기 문구에 사용 */
const ownInitials = ["먕", "밤", "콬", "럽", "쩡", "벳"];

/* 멤버별 기본 아바타 색상 (사진 로드 실패 시 대체용) - #87b6e2 계열 */
const memberColors = [
    "#b9d6f1",
    "#a6c9eb",
    "#97bfe7",
    "#87b6e2",
    "#78aadb",
    "#6a9fd3"
];

/* 멤버별 기본 프로필 사진 (members 배열과 순서 동일, 1:1 비율) */
const defaultPhotos = [
    "assets/m1.png",
    "assets/m2.png",
    "assets/m3.png",
    "assets/m4.png",
    "assets/m5.png",
    "assets/m6.png"
];

/*
 * 표에 표시할 씨피명.
 * [행 멤버][열 멤버] 순서. 멤버 순서: 마이, 방지민, 코코, 유사랑, 최정은, 정세비
 * 기본값은 두 멤버의 닉네임을 이어붙인 것(행 닉네임 + 열 닉네임)이에요.
 * 대각선(본인×본인)은 "먕먕"처럼 같은 닉네임을 두 번 붙인 값이에요.
 */
const pairNames = ownInitials.map(row => ownInitials.map(col => row + col));

/* 닉네임 조합과 다르게 부르는 씨피: [행 번호, 열 번호, 표시할 이름]
   (번호는 위 멤버 순서의 0부터 시작하는 번호) 바꾸고 싶으면 여기만 고치면 돼요. */
[
    [0, 4, "톰쩡"],   // 마이 → 최정은
    [4, 0, "쩡톰"],   // 최정은 → 마이
    [1, 3, "밤랏"],   // 방지민 → 유사랑
    [3, 1, "랏밤"],   // 유사랑 → 방지민
    [2, 3, "콬랑"],   // 코코 → 유사랑
    [2, 5, "꼬벳"]    // 코코 → 정세비
].forEach(([r, c, name]) => { pairNames[r][c] = name; });

const options = [
    { name: "OTP",      color: "#f7cde0" },
    { name: "좋아함",   color: "#ffafaf" },
    { name: "호감",     color: "#fcee90" },
    { name: "관심있음", color: "#baebbb" },
    { name: "관심없음", color: "#ffffff" },
    { name: "별로",     color: "#bfeefd" },
    { name: "지뢰",     color: "#999999" }
];

/* 사용자가 직접 고른 커스텀 색상 (name -> hex).
   여기에 값이 있으면 기본 color 대신 이 색을 쓴다.
   options 배열의 기본값 자체는 절대 덮어쓰지 않는다. */
const CUSTOM_COLOR_KEY = "izna-custom-colors";
let customColors = JSON.parse(localStorage.getItem(CUSTOM_COLOR_KEY)) || {};

function getOptionColor(option) {
    return customColors[option.name] || option.color;
}

function setCustomColor(name, hex) {
    customColors[name] = hex;
    localStorage.setItem(CUSTOM_COLOR_KEY, JSON.stringify(customColors));
}

function resetCustomColors() {
    customColors = {};
    localStorage.removeItem(CUSTOM_COLOR_KEY);
}

/* 멤버별 의견 글자 크기 (px) */
const LR_FONT_MIN = 12;
const LR_FONT_MAX = 40;
const LR_FONT_DEFAULT = 17;

/* PC 저장 레이아웃(1820px)에서 의견 입력칸의 실제 가로 폭(px).
   = ((1820 - 좌우 패딩 128 - 열 간격 30x2) / 3) - 아바타 112 - 간격 18
   모바일에서는 이 폭 대비 현재 칸 폭의 비율(k)로 글자/칸 크기를 똑같이 줄여서,
   화면에서 보이는 줄바꿈·잘림이 저장 이미지와 같아지게 한다.
   CSS의 PC 레이아웃 값(캡처 폭, 패딩, 열 간격, 아바타 폭)이 바뀌면 이 값도 같이 바꿔야 한다. */
const LR_PC_TEXT_WIDTH = 414;

const STORAGE_KEY = "izna-izpes-rps";
const LR_STORAGE_KEY = "izna-lr-rps";
const LR_CELL_COUNT = 12;

/* 행/열 개별 숨기기 상태 (멤버 인덱스 기준, rows/cols 따로 관리) */
const HIDDEN_KEY = "izna-hidden-members";
const hiddenSaved = JSON.parse(localStorage.getItem(HIDDEN_KEY)) || { rows: [], cols: [] };
let hiddenRows = new Set(hiddenSaved.rows);
let hiddenCols = new Set(hiddenSaved.cols);

function saveHiddenState() {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify({
        rows: [...hiddenRows],
        cols: [...hiddenCols]
    }));
}

/* 자공자수(본인조합, 대각선 칸) 표시 여부 - 체크박스로 켜고 끔
   기본값은 켜짐(기존 동작과 동일)이라, 꺼본 적 없는 사용자는 "0"이 저장돼 있지 않다. */
const SELF_PAIR_KEY = "izna-include-selfpair";
let includeSelfPair = localStorage.getItem(SELF_PAIR_KEY) !== "0";

/* 대각선(본인×본인) 칸을 표시할지 여부에 따라 실제로 화면/이미지에 그릴 텍스트를 반환한다.
   토글이 꺼져 있으면 "-"를 보여준다. */
function getDisplayPairName(rowIndex, colIndex) {
    if (rowIndex === colIndex && !includeSelfPair) {
        return "-";
    }
    return pairNames[rowIndex][colIndex];
}

const table = document.getElementById("chartTable");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const optionGrid = document.getElementById("optionGrid");
const closeModal = document.getElementById("closeModal");

const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const guideListRps = document.getElementById("guideListRps");
const guideListLr = document.getElementById("guideListLr");
const legendRps = document.getElementById("legendRps");

const dateToggleWrap = document.getElementById("dateToggleWrap");
const dateToggle = document.getElementById("dateToggle");
const dateTextRps = document.getElementById("dateTextRps");
const dateTextLr = document.getElementById("dateTextLr");
const selfPairToggle = document.getElementById("selfPairToggle");

const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");

const saveModal = document.getElementById("saveModal");
const previewImage = document.getElementById("previewImage");
const closeSaveModal = document.getElementById("closeSaveModal");

const tabRps = document.getElementById("tabRps");
const tabLr = document.getElementById("tabLr");
const captureAreaRps = document.getElementById("captureArea");
const captureAreaLr = document.getElementById("captureAreaLr");
const lrGrid = document.getElementById("lrGrid");
const photoInput = document.getElementById("photoInput");
const scaleWrap = document.getElementById("scaleWrap");

/* CSS의 @media (max-width: 768px)과 동일한 기준.
   이 폭 이하에서는 JS로 축소하지 않고, 반응형 레이아웃을 그대로 사용한다. */
const MOBILE_BREAKPOINT = 768;

/* 탭마다 캡처(저장) 기준 폭이 다르다.
   - 잊페스 취향표: 1100px
   - 공수 취향표: 가로가 더 길고 세로는 더 짧게(대략 4:3) 나오도록 1820px로 넓힘
   CSS의 #captureArea / #captureAreaLr width 값과 항상 같아야 한다. */
const CAPTURE_WIDTH = {
    rps: 1100,
    lr: 1820
};

function getCaptureWidth(tab) {
    return CAPTURE_WIDTH[tab] || CAPTURE_WIDTH.rps;
}

let currentTarget = null; // { type: "cell", td } | { type: "row", index } | { type: "col", index }
let currentTab = "rps";
let currentPhotoIndex = null;
let currentBlobUrl = null; // 저장 미리보기/다운로드에 쓰이는 Blob URL (재사용 전 해제)

const HISTORY_LIMIT = 50;
let historyStack = [];
let redoStack = [];

let saveData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

let lrData = JSON.parse(localStorage.getItem(LR_STORAGE_KEY)) || {
    texts: {},
    cells: {},
    photos: {},
    fontSizes: {},
    excluded: {}
};

/* 예전에 저장된 데이터에는 fontSizes가 없으므로 보정 */
lrData.fontSizes = lrData.fontSizes || {};
lrData.excluded = lrData.excluded || {};

const GUIDE_TEXT = {
    rps: [
        "셀을 선택하여 호감도를 표시해주세요.",
        "멤버 이름을 누르면 줄 전체선택/숨기기가 가능해요.",
        "트위터가 아닌 브라우저 열기를 통해 사용해주세요."
    ],
    lr: [
        "L-R 사이 원하는 부분의 칸을 선택하고, 아래 칸에 자유롭게 적어보세요.",
        "각 멤버의 프로필을 누르면 사진 변경이 가능해요.",
        "사진 아래 '제외하기'를 체크하면 그 멤버는 저장 이미지에서 빠져요."
    ]
};

function renderGuide(tab) {
    const target = tab === "rps" ? guideListRps : guideListLr;
    target.innerHTML = "";
    GUIDE_TEXT[tab].forEach(line => {
        const p = document.createElement("p");
        p.textContent = line;
        target.appendChild(p);
    });
}

/* 범례를 options 배열(+커스텀 색상) 기준으로 매번 새로 그린다.
   색이 바뀌어도 범례가 항상 실제 색과 일치하도록. */
function renderLegend() {
    if (!legendRps) return;
    legendRps.innerHTML = "";
    options.forEach(option => {
        const color = getOptionColor(option);
        const isNone = color.toLowerCase() === "#ffffff";
        const item = document.createElement("div");
        item.className = "legend-item";
        item.innerHTML = `
            <span class="color${isNone ? " dashed" : ""}" style="background:${color}"></span>${option.name}
        `;
        legendRps.appendChild(item);
    });
}

/* ==========================================
   날짜 표시 (제목 옆 260810 ver. 형식)
========================================== */

function getDateVerText() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yy}${mm}${dd} ver.`;
}

function updateDateDisplay() {
    const text = dateToggle.checked ? getDateVerText() : "";
    dateTextRps.textContent = text;
    dateTextLr.textContent = text;
}

dateToggle.addEventListener("change", updateDateDisplay);

/* ==========================================
   자공자수 표시 토글
========================================== */

if (selfPairToggle) {
    selfPairToggle.checked = includeSelfPair;

    selfPairToggle.addEventListener("change", () => {
        includeSelfPair = selfPairToggle.checked;
        localStorage.setItem(SELF_PAIR_KEY, includeSelfPair ? "1" : "0");
        createTable();
    });
}

createTable();
createLrGrid();
updateNavButtons();
renderGuide(currentTab);
renderLegend();
updateDateDisplay();

/* ==========================================
   탭 전환
========================================== */

function switchTab(tab) {
    currentTab = tab;

    if (tab === "rps") {
        captureAreaRps.classList.remove("hidden");
        captureAreaLr.classList.add("hidden");
        tabRps.classList.add("active");
        tabLr.classList.remove("active");
    } else {
        captureAreaLr.classList.remove("hidden");
        captureAreaRps.classList.add("hidden");
        tabLr.classList.add("active");
        tabRps.classList.remove("active");
    }

    renderGuide(tab);
    fitCaptureArea();
}

tabRps.addEventListener("click", () => switchTab("rps"));
tabLr.addEventListener("click", () => switchTab("lr"));

/* ==========================================
   잊페스 취향표 - 표 생성
========================================== */

function createTable() {
    table.innerHTML = "";

    const visibleColIndexes = members.map((_, i) => i).filter(i => !hiddenCols.has(i));
    const visibleRowIndexes = members.map((_, i) => i).filter(i => !hiddenRows.has(i));

    /* 모바일 가로 스크롤/왼쪽 칸 고정용 CSS 변수 (열 개수, 전체 행 수) */
    table.style.setProperty("--cols", visibleColIndexes.length);

    const head = document.createElement("tr");
    const empty = document.createElement("th");
    empty.className = "corner";
    head.appendChild(empty);

    visibleColIndexes.forEach(colIndex => {
        const th = document.createElement("th");
        th.textContent = members[colIndex];
        th.classList.add("clickable-header");

        th.addEventListener("click", () => {
            currentTarget = { type: "col", index: colIndex };
            openModal(members[colIndex]);
        });

        head.appendChild(th);
    });

    table.appendChild(head);

    visibleRowIndexes.forEach(rowIndex => {
        const tr = document.createElement("tr");

        const rowHead = document.createElement("th");
        rowHead.textContent = members[rowIndex];
        rowHead.classList.add("clickable-header");

        rowHead.addEventListener("click", () => {
            currentTarget = { type: "row", index: rowIndex };
            openModal(members[rowIndex]);
        });

        tr.appendChild(rowHead);

        visibleColIndexes.forEach(colIndex => {
            const td = document.createElement("td");
            td.dataset.key = `${rowIndex}-${colIndex}`;

            td.textContent = getDisplayPairName(rowIndex, colIndex);

            if (rowIndex === colIndex) {
                td.classList.add("diagonal");
            }

            if (saveData[td.dataset.key]) {
                td.style.backgroundColor = saveData[td.dataset.key];
            }

            td.addEventListener("click", () => {
                currentTarget = { type: "cell", td };
                openModal(getDisplayPairName(rowIndex, colIndex));
            });

            tr.appendChild(td);
        });

        table.appendChild(tr);
    });
}

/* ==========================================
   잊페스 취향표 - 이전/이후 (실행 취소)
========================================== */

function pushHistory() {
    historyStack.push(JSON.stringify(saveData));
    if (historyStack.length > HISTORY_LIMIT) {
        historyStack.shift();
    }
    redoStack = [];
    updateNavButtons();
}

function updateNavButtons() {
    undoBtn.disabled = historyStack.length === 0;
    redoBtn.disabled = redoStack.length === 0;
}

undoBtn.addEventListener("click", () => {
    if (historyStack.length === 0) return;

    redoStack.push(JSON.stringify(saveData));
    saveData = JSON.parse(historyStack.pop());

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    createTable();
    updateNavButtons();
});

redoBtn.addEventListener("click", () => {
    if (redoStack.length === 0) return;

    historyStack.push(JSON.stringify(saveData));
    saveData = JSON.parse(redoStack.pop());

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    createTable();
    updateNavButtons();
});

/* ==========================================
   색상 선택 모달
========================================== */

function openModal(titleText) {
    modalTitle.textContent = titleText;
    optionGrid.innerHTML = "";

    options.forEach(option => {
        const color = getOptionColor(option);
        const item = document.createElement("div");
        item.className = "option-card";

        const isNone = color.toLowerCase() === "#ffffff";

        item.innerHTML = `
            <span class="option-dot-wrap">
                <span class="option-dot${isNone ? " dashed" : ""}" style="background:${color}"></span>
                <label class="color-edit-btn" title="이 색상 직접 고르기">
                    &#9998;
                    <input type="color" class="color-edit-input" value="${color.length === 7 ? color : "#ffffff"}">
                </label>
            </span>
            <span class="option-label">${option.name}</span>
        `;

        // 카드(동그라미) 클릭 -> 이 색을 셀에 적용
        item.addEventListener("click", () => applySelection(getOptionColor(option)));

        // 연필 아이콘 클릭은 셀 적용과 별개로, 색상 피커만 열기
        const editBtn = item.querySelector(".color-edit-btn");
        const editInput = item.querySelector(".color-edit-input");
        editBtn.addEventListener("click", (e) => e.stopPropagation());
        editInput.addEventListener("click", (e) => e.stopPropagation());
        editInput.addEventListener("input", (e) => {
            const hex = e.target.value;
            item.querySelector(".option-dot").style.background = hex;
        });
        editInput.addEventListener("change", (e) => {
            setCustomColor(option.name, e.target.value);
            renderLegend();
        });

        optionGrid.appendChild(item);
    });

    const clearItem = document.createElement("div");
    clearItem.className = "option-card clear-card";
    clearItem.innerHTML = `
        <span class="option-dot">&#128465;</span>
        <span class="option-label">선택 지우기</span>
    `;
    clearItem.addEventListener("click", () => applySelection(null));
    optionGrid.appendChild(clearItem);

    modal.classList.remove("hidden");

    renderModalExtra(titleText);
}

/* 모달 하단(색상 기본값 되돌리기 + 행/열 숨기기 체크박스) 영역.
   모달을 열 때마다 currentTarget 기준으로 다시 그린다. */
function renderModalExtra(titleText) {
    let modalExtra = document.getElementById("modalExtra");
    if (!modalExtra) {
        modalExtra = document.createElement("div");
        modalExtra.id = "modalExtra";
        modalExtra.className = "modal-extra";
        optionGrid.insertAdjacentElement("afterend", modalExtra);
    }
    modalExtra.innerHTML = "";

    const resetLink = document.createElement("div");
    resetLink.className = "reset-colors-link";
    resetLink.textContent = "색상 기본값으로 되돌리기";
    resetLink.addEventListener("click", () => {
        resetCustomColors();
        renderLegend();
        openModal(titleText);
    });
    modalExtra.appendChild(resetLink);

    if (!currentTarget || (currentTarget.type !== "row" && currentTarget.type !== "col")) {
        return;
    }

    const isRow = currentTarget.type === "row";
    const index = currentTarget.index;
    const hiddenSet = isRow ? hiddenRows : hiddenCols;
    const suffix = isRow ? "왼" : "른";

    const hideLabel = document.createElement("label");
    hideLabel.className = "hide-toggle";

    const hideInput = document.createElement("input");
    hideInput.type = "checkbox";
    hideInput.checked = hiddenSet.has(index);

    hideInput.addEventListener("change", () => {
        if (hideInput.checked) {
            hiddenSet.add(index);
        } else {
            hiddenSet.delete(index);
        }
        saveHiddenState();
        createTable();
        modal.classList.add("hidden");
    });

    hideLabel.appendChild(hideInput);
    hideLabel.appendChild(document.createTextNode(`${ownInitials[index]}${suffix} 없애기`));

    modalExtra.appendChild(hideLabel);
}

function setCellColor(td, key, color) {
    if (color) {
        if (td) td.style.backgroundColor = color;
        saveData[key] = color;
    } else {
        if (td) td.style.backgroundColor = "#ffffff";
        delete saveData[key];
    }
}

function applySelection(color) {
    if (!currentTarget) return;

    pushHistory();

    if (currentTarget.type === "cell") {
        setCellColor(currentTarget.td, currentTarget.td.dataset.key, color);
    } else if (currentTarget.type === "row") {
        const rowIndex = currentTarget.index;
        members.forEach((_, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const td = table.querySelector(`td[data-key="${key}"]`);
            setCellColor(td, key, color);
        });
    } else if (currentTarget.type === "col") {
        const colIndex = currentTarget.index;
        members.forEach((_, rowIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const td = table.querySelector(`td[data-key="${key}"]`);
            setCellColor(td, key, color);
        });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    modal.classList.add("hidden");
}

closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }

    if (e.target === saveModal) {
        saveModal.classList.add("hidden");
    }
});

/* ==========================================
   공수 취향표 - 기본 아바타 생성 (SVG)
========================================== */

function defaultAvatar(name, color) {
    const initial = name.charAt(0);
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
            <rect width="160" height="160" fill="${color}" />
            <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
                font-family="Pretendard, Noto Sans KR, sans-serif"
                font-size="64" font-weight="800" fill="#ffffff">${initial}</text>
        </svg>
    `;
    return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

/* ==========================================
   공수 취향표 - 그리드 생성
========================================== */

function createLrGrid() {
    lrGrid.innerHTML = "";

    members.forEach((member, index) => {
        const row = document.createElement("div");
        row.className = "lr-row";

        /* 아바타 */
        const avatar = document.createElement("div");
        avatar.className = "lr-avatar";
        avatar.dataset.index = index;

        const img = document.createElement("img");
        img.src = lrData.photos[index] || defaultPhotos[index];
        img.alt = member;
        img.onerror = () => {
            img.onerror = null;
            img.src = defaultAvatar(member, memberColors[index % memberColors.length]);
        };
        avatar.appendChild(img);

        const editHint = document.createElement("div");
        editHint.className = "avatar-edit";
        editHint.textContent = "사진 변경";
        avatar.appendChild(editHint);

        avatar.addEventListener("click", () => {
            currentPhotoIndex = index;
            photoInput.value = "";
            photoInput.click();
        });

        /* 프로필 사진 + 그 아래 "제외하기" 체크박스 */
        const side = document.createElement("div");
        side.className = "lr-side";
        side.appendChild(avatar);

        const excludeLabel = document.createElement("label");
        excludeLabel.className = "lr-exclude";
        excludeLabel.innerHTML = `<input type="checkbox"><span>${member} 제외하기</span>`;

        const excludeInput = excludeLabel.querySelector("input");
        excludeInput.checked = !!lrData.excluded[index];
        row.classList.toggle("excluded", excludeInput.checked);

        excludeInput.addEventListener("change", () => {
            lrData.excluded[index] = excludeInput.checked;
            row.classList.toggle("excluded", excludeInput.checked);
            saveLrData();
            updateLrOverflow(row);
        });

        side.appendChild(excludeLabel);
        row.appendChild(side);

        /* 오른쪽 내용 (바 + 텍스트) */
        const content = document.createElement("div");
        content.className = "lr-content";

        const barWrap = document.createElement("div");
        barWrap.className = "lr-bar-wrap";

        const labelL = document.createElement("span");
        labelL.className = "lr-label-l";
        labelL.textContent = "L";

        const bar = document.createElement("div");
        bar.className = "lr-bar";
        bar.dataset.index = index;

        const filledCells = lrData.cells[index] || [];

        for (let c = 0; c < LR_CELL_COUNT; c++) {
            const cell = document.createElement("div");
            cell.className = "lr-cell";
            cell.dataset.cell = c;

            if (filledCells[c]) {
                cell.classList.add("filled");
            }

            cell.addEventListener("click", () => {
                toggleLrCell(index, c, cell);
            });

            bar.appendChild(cell);
        }

        const labelR = document.createElement("span");
        labelR.className = "lr-label-r";
        labelR.textContent = "R";

        barWrap.appendChild(labelL);
        barWrap.appendChild(bar);
        barWrap.appendChild(labelR);

        const textWrap = document.createElement("div");
        textWrap.className = "lr-text-wrap";

        const text = document.createElement("textarea");
        text.className = "lr-text";
        text.rows = 5;
        text.maxLength = 150;
        text.placeholder = "자유롭게 적어보세요";
        text.value = lrData.texts[index] || "";
        text.dataset.index = index;

        const charCount = document.createElement("span");
        charCount.className = "lr-char-count";
        charCount.textContent = `${text.value.length}/150`;

        text.addEventListener("input", () => {
            lrData.texts[index] = text.value;
            charCount.textContent = `${text.value.length}/150`;
            saveLrData();
            updateLrOverflow(row);
        });

        textWrap.appendChild(text);
        textWrap.appendChild(charCount);

        /* 글자 크기 조절 */
        const size = lrData.fontSizes[index] || LR_FONT_DEFAULT;
        text.style.setProperty("--fs", size);

        const sizeCtrl = document.createElement("div");
        sizeCtrl.className = "lr-font-ctrl";
        sizeCtrl.innerHTML = `
            <span class="lr-font-s">가</span>
            <input type="range" min="${LR_FONT_MIN}" max="${LR_FONT_MAX}" value="${size}" aria-label="${member} 글자 크기">
            <span class="lr-font-l">가</span>
            <span class="lr-font-val">${size}px</span>
        `;

        const sizeInput = sizeCtrl.querySelector("input");
        const valLabel = sizeCtrl.querySelector(".lr-font-val");

        sizeInput.addEventListener("input", () => {
            const v = Number(sizeInput.value);
            text.style.setProperty("--fs", v);
            valLabel.textContent = `${v}px`;
            lrData.fontSizes[index] = v;
            saveLrData();
            updateLrOverflow(row);
        });

        content.appendChild(barWrap);
        content.appendChild(textWrap);
        content.appendChild(sizeCtrl);

        const warn = document.createElement("div");
        warn.className = "lr-warn";
        warn.textContent = "글이 칸을 넘어서 이미지에서 잘려요. 글자 크기나 글을 줄여주세요.";
        content.appendChild(warn);

        row.appendChild(content);

        lrGrid.appendChild(row);
    });

    updateLrScale();
}

/* 이 멤버 칸의 글이 넘치는지(= 저장 이미지에서 잘리는지) 확인해서 경고를 켜고 끈다.
   탭이 숨겨져 있으면 크기를 잴 수 없으므로 건너뛴다. */
function updateLrOverflow(row) {
    /* 저장 이미지에서 빠지는(제외한) 멤버는 잘림 걱정이 없으므로 경고하지 않는다 */
    if (row.classList.contains("excluded")) {
        row.classList.remove("overflow");
        return false;
    }

    const ta = row.querySelector(".lr-text");
    if (!ta || !ta.clientHeight) return false;

    const over = ta.scrollHeight > ta.clientHeight + 1;
    row.classList.toggle("overflow", over);
    return over;
}

/* 모바일에서는 입력칸이 PC 저장 레이아웃보다 좁으므로,
   폭 비율(k)만큼 글자/칸 크기를 똑같이 줄여서 줄바꿈이 저장 이미지와 같게 만든다.
   PC(축소 배율로 보여주는 경우 포함)는 레이아웃 폭이 항상 같아 k = 1. */
function updateLrScale() {
    if (!lrGrid || captureAreaLr.classList.contains("hidden")) return;

    const screenWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
    let k = 1;

    if (screenWidth <= MOBILE_BREAKPOINT) {
        const wrap = lrGrid.querySelector(".lr-text-wrap");
        if (wrap && wrap.clientWidth) {
            k = wrap.clientWidth / LR_PC_TEXT_WIDTH;
        }
    }

    lrGrid.style.setProperty("--k", k.toFixed(4));
    lrGrid.querySelectorAll(".lr-row").forEach(updateLrOverflow);
}

function toggleLrCell(memberIndex, cellIndex, cellEl) {
    if (!lrData.cells[memberIndex]) {
        lrData.cells[memberIndex] = [];
    }

    lrData.cells[memberIndex][cellIndex] = !lrData.cells[memberIndex][cellIndex];
    cellEl.classList.toggle("filled");

    saveLrData();
}

function saveLrData() {
    localStorage.setItem(LR_STORAGE_KEY, JSON.stringify(lrData));
}

/* 사진 업로드 */
photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file || currentPhotoIndex === null) return;

    const reader = new FileReader();

    reader.onload = () => {
        lrData.photos[currentPhotoIndex] = reader.result;
        saveLrData();

        const avatarEl = lrGrid.querySelector(`.lr-avatar[data-index="${currentPhotoIndex}"] img`);
        if (avatarEl) {
            avatarEl.src = reader.result;
        }
    };

    reader.readAsDataURL(file);
});

/* ==========================================
   초기화
========================================== */

resetBtn.addEventListener("click", () => {
    if (!confirm("현재 화면의 모든 선택을 초기화할까요?")) return;

    if (currentTab === "rps") {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HIDDEN_KEY);
        saveData = {};
        hiddenRows = new Set();
        hiddenCols = new Set();
        historyStack = [];
        redoStack = [];
        updateNavButtons();
        createTable();
    } else {
        localStorage.removeItem(LR_STORAGE_KEY);
        lrData = { texts: {}, cells: {}, photos: {}, fontSizes: {}, excluded: {} };
        createLrGrid();
    }
});

/* ==========================================
   이미지 저장
========================================== */

/* ==========================================
   잊페스 저장 이미지 - 셀 개수에 맞춰 표 폭/여백 조정
   멤버를 숨겨서 열이 줄어들면, 표가 이미지 폭에 맞춰 늘어나 셀이 넓어지는 대신
   "원래 셀 크기"를 유지하고 이미지 폭과 여백이 같이 줄어들게 한다.
   (저장할 때 복제된 문서에서만 적용하고, 실제 화면은 건드리지 않는다)
   단, 아래 호감도 범례(OTP~지뢰)와 제목·날짜가 줄바꿈되거나 잘리지 않도록
   이미지 폭이 그 이하로는 줄어들지 않는다.
========================================== */

const RPS_FULL_TABLE_WIDTH = 980;    // 멤버 전원 표시 시 표 폭 (style.css .table-clip max-width)
const RPS_HEADER_COL_WIDTH = 140;    // PC 왼쪽 이름 칸 폭 (style.css --header-col-width)
const RPS_FULL_SIDE_MARGIN = 60;     // 전원 표시 시 좌우 여백
const RPS_FULL_PAD_BOTTOM = 40;      // 전원 표시 시 아래 여백
const RPS_MIN_MARGIN_SCALE = 0.6;    // 열이 아주 적어도 여백은 이 비율 밑으로는 안 줄인다
const RPS_DATE_GAP = 16;             // 제목~날짜 간격 (style.css .chart-date margin-left)

function fitRpsCaptureToCells(doc, area) {
    const table = doc.getElementById("chartTable");
    const firstRow = table && table.rows[0];
    if (!firstRow) return;

    const cols = firstRow.cells.length - 1; // 맨 왼쪽 빈 칸 제외
    if (cols < 1) return;

    /* 셀 하나의 원래 폭 = 전원 표시 때의 셀 폭 */
    const cellW = (RPS_FULL_TABLE_WIDTH - RPS_HEADER_COL_WIDTH) / members.length;
    const tableW = RPS_HEADER_COL_WIDTH + cols * cellW;

    /* 열이 적을수록 여백도 비례해서 줄인다 */
    const s = Math.min(1, Math.max(RPS_MIN_MARGIN_SCALE, tableW / RPS_FULL_TABLE_WIDTH));
    const side = RPS_FULL_SIDE_MARGIN * s;

    /* 범례가 한 줄로 다 들어가야 하는 최소 폭 */
    let legendW = 0;
    const legend = doc.getElementById("legendRps");
    if (legend) {
        const items = [...legend.children];
        legendW = items.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0)
            + 24 * Math.max(0, items.length - 1) + 8;
    }

    /* 제목은 가운데, 날짜는 제목 오른쪽 옆이므로 양쪽에 날짜 폭만큼 여유가 있어야 잘리지 않는다 */
    let titleNeed = 0;
    const h1 = area.querySelector("h1");
    const dateEl = area.querySelector(".chart-date");
    if (h1) {
        const dateW = dateEl && dateEl.textContent.trim()
            ? dateEl.getBoundingClientRect().width + RPS_DATE_GAP
            : 0;
        titleNeed = h1.getBoundingClientRect().width + 2 * dateW;
    }

    const contentW = Math.max(tableW, legendW, titleNeed);

    area.style.width = `${Math.round(contentW + 2 * side)}px`;
    area.style.paddingLeft = `${side}px`;
    area.style.paddingRight = `${side}px`;
    area.style.paddingBottom = `${RPS_FULL_PAD_BOTTOM * s}px`;

    const clip = table.closest(".table-clip");
    if (clip) {
        clip.style.width = `${tableW}px`;
        clip.style.maxWidth = "none";
        clip.style.margin = "0 auto";
    }
}

/* ==========================================
   공수 저장 이미지 - 제외한 멤버를 빼고, 남은 인원에 맞게 배치/폭 조정
   - 남은 인원 수에 따라 "몇 열로 놓을지"를 이미지 비율이 4:3에 가깝도록 고른다.
   - 열마다 인원이 고르게 나뉘도록(예: 10명 -> 4-3-3) 위에서 아래, 왼쪽에서 오른쪽 순서로 채운다.
   - 칸 크기는 그대로 두고 이미지 폭이 열 수에 맞게 줄어서, 빈 여백이 생기지 않는다.
   - 제목과 날짜가 들어갈 최소 폭은 항상 확보한다.
   (저장할 때 복제된 문서에서만 적용하고, 실제 화면은 건드리지 않는다)
========================================== */

const LR_COL_WIDTH = 544;       // 한 열의 폭 = (1820 - 좌우 여백 128 - 열 간격 30x2) / 3
const LR_COL_GAP = 30;          // style.css .lr-grid 열 간격
const LR_SIDE_PADDING = 64;     // style.css 공수 좌우 여백
const LR_EST_ROW_HEIGHT = 244;  // 멤버 한 줄 높이(바 38 + 간격 14 + 입력칸 190 + 여유)
const LR_EST_ROW_GAP = 34;      // style.css .lr-grid 행 간격
const LR_EST_FIXED_HEIGHT = 400; // 위 여백 56 + 로고 약 125 + 제목 약 53 + 제목 아래 34 + 아이디 43 + 아래 여백 40 + 여유
const LR_TARGET_ASPECT = 4 / 3;
const LR_MAX_COLS = 4;
const LR_DATE_GAP = 18;         // 제목~날짜 간격

function chooseLrColumns(n) {
    let best = 1;
    let bestScore = Infinity;

    for (let c = 1; c <= Math.min(n, LR_MAX_COLS); c++) {
        const r = Math.ceil(n / c);
        const w = 2 * LR_SIDE_PADDING + c * LR_COL_WIDTH + (c - 1) * LR_COL_GAP;
        const h = LR_EST_FIXED_HEIGHT + r * LR_EST_ROW_HEIGHT + (r - 1) * LR_EST_ROW_GAP;
        const score = Math.abs(Math.log((w / h) / LR_TARGET_ASPECT));

        if (score < bestScore - 1e-9) {
            best = c;
            bestScore = score;
        }
    }

    return best;
}

function fitLrCaptureToMembers(doc, area) {
    const grid = doc.getElementById("lrGrid");
    if (!grid) return;

    const rows = [...grid.querySelectorAll(".lr-row")];
    const kept = rows.filter((r) => !r.classList.contains("excluded"));
    rows.filter((r) => r.classList.contains("excluded")).forEach((r) => r.remove());

    const n = kept.length;
    if (!n) return;

    const cols = chooseLrColumns(n);
    const base = Math.floor(n / cols);
    const extra = n % cols;

    let idx = 0;
    let maxRows = 0;

    for (let c = 0; c < cols; c++) {
        const count = base + (c < extra ? 1 : 0);
        maxRows = Math.max(maxRows, count);

        for (let r = 0; r < count; r++) {
            const row = kept[idx++];
            row.style.gridColumn = String(c + 1);
            row.style.gridRow = String(r + 1);
        }
    }

    grid.style.gridTemplateColumns = `repeat(${cols}, ${LR_COL_WIDTH}px)`;
    grid.style.gridTemplateRows = `repeat(${maxRows}, auto)`;
    grid.style.justifyContent = "center";

    const gridW = cols * LR_COL_WIDTH + (cols - 1) * LR_COL_GAP;

    /* 제목은 가운데, 날짜는 제목 오른쪽 옆이므로 양쪽에 날짜 폭만큼 여유가 있어야 잘리지 않는다 */
    let titleNeed = 0;
    const h1 = area.querySelector("h1");
    const dateEl = area.querySelector(".chart-date");

    if (h1) {
        const titleW = h1.getBoundingClientRect().width;
        const dateW = dateEl && dateEl.textContent.trim()
            ? dateEl.getBoundingClientRect().width + LR_DATE_GAP
            : 0;
        titleNeed = titleW + 2 * dateW;
    }

    area.style.width = `${Math.round(Math.max(gridW, titleNeed) + 2 * LR_SIDE_PADDING)}px`;
}

saveBtn.addEventListener("click", async () => {
    /* 공수 취향표: 글이 넘쳐서 잘리는 멤버가 있으면 저장 전에 알려준다. */
    if (currentTab === "lr") {
        if (members.every((_, i) => lrData.excluded[i])) {
            alert("저장할 멤버가 없어요. '제외하기' 체크를 하나 이상 풀어주세요.");
            return;
        }

        updateLrScale();
        const overflowed = [...lrGrid.querySelectorAll(".lr-row")]
            .map((r, i) => (r.classList.contains("overflow") ? members[i] : null))
            .filter(Boolean);

        if (overflowed.length &&
            !confirm(`${overflowed.join(", ")} 칸의 글이 넘쳐서 이미지에서 일부 잘려요.\n그래도 저장할까요?`)) {
            return;
        }
    }

    const buttonWrap = document.querySelector(".button-wrap");
    const tabWrap = document.querySelector(".tab-wrap");
    const area = currentTab === "rps" ? captureAreaRps : captureAreaLr;

    buttonWrap.style.display = "none";
    tabWrap.style.display = "none";
    dateToggleWrap.style.display = "none";

    /* 안내 문구, 이전/이후 버튼은 이미지에는 나오지 않도록 캡처 중에만 숨김 */
    area.classList.add("capturing");

    /* 화면(특히 모바일)에 적용돼 있던 축소/반응형 스타일을 잠시 걷어내고,
       항상 PC 버전과 동일한 1100px 레이아웃으로 저장되도록 한다. */
    const prevTransform = area.style.transform;
    area.style.transform = "none";

    try {
        const canvas = await html2canvas(area, {
            backgroundColor: "#ffffff",
            scale: 4,
            useCORS: true,
            logging: false,
            windowWidth: getCaptureWidth(currentTab),
            windowHeight: Math.max(area.scrollHeight, 1600),
            /*
             * html2canvas는 textarea 안의 줄바꿈/자동 줄바꿈을 제대로
             * 그리지 못해서(한 줄로만 렌더링되며 잘려 보임), 캡처용으로
             * 복제된 문서 안에서만 textarea를 똑같이 생긴 div로 바꿔치기한다.
             * 실제 화면의 textarea(입력 가능 상태)는 건드리지 않는다.
             */
            onclone: (clonedDoc) => {
                /* 공수: 제외한 멤버를 빼고 남은 인원에 맞게 배치/폭 조정 */
                if (currentTab === "lr") {
                    const clonedLr = clonedDoc.getElementById("captureAreaLr");
                    if (clonedLr) fitLrCaptureToMembers(clonedDoc, clonedLr);
                }

                /* 잊페스: 셀 개수에 맞춰 이미지 폭/여백을 조정 (셀 크기는 원래대로 유지) */
                if (currentTab === "rps") {
                    const clonedRps = clonedDoc.getElementById("captureArea");
                    if (clonedRps) fitRpsCaptureToCells(clonedDoc, clonedRps);
                }

                /* 저장 이미지는 항상 PC 레이아웃 기준: 모바일용 보정(k)과 경고 표시는 걷어낸다. */
                const clonedGrid = clonedDoc.getElementById("lrGrid");
                if (clonedGrid) clonedGrid.style.setProperty("--k", "1");
                clonedDoc.querySelectorAll(".lr-row.overflow").forEach((r) => r.classList.remove("overflow"));

                clonedDoc.querySelectorAll(".lr-text").forEach((ta) => {
                    const div = clonedDoc.createElement("div");
                    div.className = "lr-text";
                    div.style.whiteSpace = "pre-wrap";
                    div.style.wordBreak = "break-word";
                    div.style.overflow = "hidden";
                    div.style.setProperty("--fs", ta.style.getPropertyValue("--fs"));
                    div.textContent = ta.value;
                    ta.replaceWith(div);
                });
            }
        });

        /*
         * data: URL 대신 Blob URL을 사용한다.
         * 표가 커지고 고화질(scale 4)로 캡처하면서 이미지 용량이 커졌는데,
         * 아이폰 사파리는 큰 data: URL을 <a download>로 다운로드할 때
         * "다운로드하시겠습니까?" 확인창까지만 뜨고 실제 저장은 안 되는
         * 경우가 있다. Blob URL은 이런 용량 제한 없이 정상적인
         * 다운로드(하단 진행 표시 → 다운로드 항목 저장)로 이어진다.
         */
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

        if (!blob) {
            throw new Error("이미지 변환에 실패했습니다.");
        }

        if (currentBlobUrl) {
            URL.revokeObjectURL(currentBlobUrl);
        }
        currentBlobUrl = URL.createObjectURL(blob);

        previewImage.src = currentBlobUrl;
        saveModal.classList.remove("hidden");

        const fileLabel = currentTab === "rps" ? "잊페스_취향표" : "공수_취향표";

        const link = document.createElement("a");
        link.href = currentBlobUrl;
        link.download = `IZNA_${fileLabel}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error(error);
        alert("이미지 저장 중 문제가 발생했습니다.");
    } finally {
        area.classList.remove("capturing");
        area.style.transform = prevTransform;
        buttonWrap.style.display = "flex";
        tabWrap.style.display = "flex";
        dateToggleWrap.style.display = "flex";
    }
});

closeSaveModal.addEventListener("click", () => {
    saveModal.classList.add("hidden");
});

/* ==========================================
   ESC
========================================== */

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        modal.classList.add("hidden");
        saveModal.classList.add("hidden");
    }
});

/* ==========================================
   모바일 자동 축소
========================================== */

function fitCaptureArea() {
    fitCaptureAreaLayout();
    updateLrScale();
}

function fitCaptureAreaLayout() {
    const area = currentTab === "rps" ? captureAreaRps : captureAreaLr;
    const wrap = scaleWrap;

    if (!area || !wrap) return;

    const screenWidth = Math.min(
        window.innerWidth,
        document.documentElement.clientWidth
    );

    if (screenWidth <= MOBILE_BREAKPOINT) {
        /* 모바일: 축소 대신 CSS 반응형 레이아웃을 그대로 사용하고,
           세로로 길어진 내용은 화면을 드래그해서 내려보는 방식으로 확인한다. */
        area.style.transform = "none";
        area.style.transformOrigin = "";
        area.style.removeProperty("--s");
        wrap.style.width = "";
        wrap.style.height = "";
        return;
    }

    const captureWidth = getCaptureWidth(currentTab);
    const scale = Math.min(1, screenWidth / captureWidth);

    /* 화면에 보이는 축소 배율. CSS가 이 값으로 로고/제목/안내 글자 크기를 탭과 상관없이 같게 맞춘다. */
    area.style.setProperty("--s", scale.toFixed(4));
    area.style.transformOrigin = "top left";
    area.style.transform = `scale(${scale})`;

    wrap.style.width = `${captureWidth * scale}px`;
    wrap.style.height = `${area.scrollHeight * scale}px`;
}

fitCaptureArea();

/* 멤버 숨기기/날짜 켜기 등으로 내용 높이가 바뀌어도 화면 영역이 잘리거나 남지 않게 다시 맞춘다.
   (이미지 저장 중에는 건드리지 않는다) */
if (window.ResizeObserver) {
    const fitObserver = new ResizeObserver(() => {
        const area = currentTab === "rps" ? captureAreaRps : captureAreaLr;
        if (area.classList.contains("capturing")) return;
        fitCaptureAreaLayout();
    });
    fitObserver.observe(captureAreaRps);
    fitObserver.observe(captureAreaLr);
}

window.addEventListener("load", fitCaptureArea);
window.addEventListener("resize", fitCaptureArea);

window.addEventListener("orientationchange", () => {
    setTimeout(fitCaptureArea, 200);
});


/* ==========================================
   잊페스 취향표 - 표 아래 둥근 스크롤바
   (기본 스크롤바는 표에 붙어 보여서 숨기고, 표와 간격을 둔 별도 막대로 대신한다)
========================================== */

(function setupTableScrollbar() {
    const scroller = document.getElementById("tableScroll");
    const bar = document.getElementById("tableScrollbar");
    const thumb = document.getElementById("tableScrollbarThumb");

    if (!scroller || !bar || !thumb) return;

    function maxScroll() {
        return scroller.scrollWidth - scroller.clientWidth;
    }

    function update() {
        const max = maxScroll();

        if (max <= 1) {
            bar.classList.remove("active");
            return;
        }

        bar.classList.add("active");

        const barWidth = bar.clientWidth;
        const thumbWidth = Math.max(40, barWidth * (scroller.clientWidth / scroller.scrollWidth));
        const x = (scroller.scrollLeft / max) * (barWidth - thumbWidth);

        thumb.style.width = `${thumbWidth}px`;
        thumb.style.transform = `translateX(${x}px)`;
    }

    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("load", update);

    if (window.ResizeObserver) {
        const ro = new ResizeObserver(update);
        ro.observe(scroller);
        ro.observe(table);
    }

    /* 막대 드래그 */
    let dragging = false;
    let startX = 0;
    let startLeft = 0;

    thumb.addEventListener("pointerdown", (e) => {
        dragging = true;
        startX = e.clientX;
        startLeft = scroller.scrollLeft;
        thumb.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    thumb.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const track = bar.clientWidth - thumb.offsetWidth;
        if (track <= 0) return;
        scroller.scrollLeft = startLeft + (e.clientX - startX) * (maxScroll() / track);
    });

    const stopDrag = () => { dragging = false; };
    thumb.addEventListener("pointerup", stopDrag);
    thumb.addEventListener("pointercancel", stopDrag);

    /* 막대의 빈 곳을 누르면 그 위치로 이동 */
    bar.addEventListener("pointerdown", (e) => {
        if (e.target === thumb) return;
        const rect = bar.getBoundingClientRect();
        const track = rect.width - thumb.offsetWidth;
        if (track <= 0) return;
        const ratio = (e.clientX - rect.left - thumb.offsetWidth / 2) / track;
        scroller.scrollLeft = Math.min(1, Math.max(0, ratio)) * maxScroll();
    });

    update();
})();
