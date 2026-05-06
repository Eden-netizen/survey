(function () {
  const config = window.BENCH_SURVEY_CONFIG;

  if (!config) {
    document.getElementById("benchRoot").textContent =
      "缺少 manifest.js，请先运行 python code/config.py。";
    return;
  }

  const modelOptions = [
    { key: "objectclear", label: "A", name: "objectclear" },
    { key: "omnieraser", label: "B", name: "omnieraser" },
    { key: "omnipaint", label: "C", name: "omnipaint" },
    { key: "flux-t400-alpha", label: "D", name: "flux-t400-alpha" },
  ];

  const displayOrder = ["shot", ...modelOptions.map((option) => option.key), "bg"];
  const columnLabels = {
    shot: "Input",
    bg: "Background",
    objectclear: "A objectclear",
    omnieraser: "B omnieraser",
    omnipaint: "C omnipaint",
    "flux-t400-alpha": "D flux-t400-alpha",
  };

  const state = new Map();
  const totalRows = config.benches.reduce((sum, bench) => sum + bench.rows.length, 0);

  const benchNav = document.getElementById("benchNav");
  const benchRoot = document.getElementById("benchRoot");
  const topLink = document.getElementById("surveyTopLink");
  const bottomLink = document.getElementById("surveyBottomLink");
  const copyTopButton = document.getElementById("copyTopButton");
  const copyBottomButton = document.getElementById("copyBottomButton");
  const progressText = document.getElementById("progressText");
  const footerProgressText = document.getElementById("footerProgressText");
  const answerText = document.getElementById("answerText");

  topLink.href = buildSurveyUrl();
  bottomLink.href = buildSurveyUrl();

  config.benches.forEach((bench) => {
    const anchor = document.createElement("a");
    anchor.href = `#bench-${bench.name}`;
    anchor.textContent = bench.name;
    benchNav.appendChild(anchor);
    benchRoot.appendChild(renderBench(bench));
  });

  copyTopButton.addEventListener("click", copyAnswers);
  copyBottomButton.addEventListener("click", copyAnswers);

  updateSummary();

  function renderBench(bench) {
    const section = document.createElement("section");
    section.className = "bench-section";
    section.id = `bench-${bench.name}`;

    const heading = document.createElement("div");
    heading.className = "bench-heading";
    heading.innerHTML = `<h2>${escapeHtml(bench.name)}</h2><span>${bench.rows.length} 个样例</span>`;
    section.appendChild(heading);

    const wrap = document.createElement("div");
    wrap.className = "table-wrap";

    const table = document.createElement("div");
    table.className = "image-table";
    table.setAttribute("role", "table");
    table.setAttribute("aria-label", `${bench.name} image comparison`);

    const head = document.createElement("div");
    head.className = "table-head";
    head.setAttribute("role", "row");
    head.innerHTML = displayOrder
      .map(
        (method) =>
          `<div class="cell" role="columnheader">${escapeHtml(columnLabels[method])}</div>`,
      )
      .join("");
    table.appendChild(head);

    bench.rows.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "image-row";
      rowEl.setAttribute("role", "row");
      rowEl.dataset.rowKey = rowKey(bench.name, row.index);
      rowEl.innerHTML = displayOrder
        .map((method) => {
          const image = row.images.find((item) => item.method === method);
          return renderImageCell(bench.name, row, image);
        })
        .join("");
      table.appendChild(rowEl);
    });

    wrap.appendChild(table);
    section.appendChild(wrap);
    return section;
  }

  function renderImageCell(benchName, row, image) {
    const option = modelOptions.find((item) => item.key === image.method);
    const label = `${benchName} ${image.method}`;
    const button = option
      ? `<button class="choice-button" type="button" data-bench="${escapeHtml(
          benchName,
        )}" data-row="${row.index}" data-choice="${option.label}" data-method="${escapeHtml(
          option.key,
        )}">选择 ${option.label}</button>`
      : "";

    return `
      <div class="cell image-cell ${option ? "model-cell" : "reference-cell"}" role="cell">
        <div class="image-frame">
          ${option ? `<div class="choice-badge">${option.label}</div>` : ""}
          <img src="${escapeHtml(image.src)}" alt="${escapeHtml(label)}" loading="lazy" />
        </div>
        ${button}
      </div>
    `;
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".choice-button");
    if (!button) {
      return;
    }

    const key = rowKey(button.dataset.bench, button.dataset.row);
    state.set(key, {
      bench: button.dataset.bench,
      row: Number(button.dataset.row),
      choice: button.dataset.choice,
      method: button.dataset.method,
    });

    document
      .querySelectorAll(`.image-row[data-row-key="${cssEscape(key)}"] .choice-button`)
      .forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    updateSummary();
  });

  async function copyAnswers() {
    const text = buildAnswerText();
    answerText.value = text;

    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel("已复制");
    } catch {
      answerText.focus();
      answerText.select();
      setCopyLabel("手动复制");
    }
  }

  function updateSummary() {
    const selected = state.size;
    const label = `已选择 ${selected} / ${totalRows}`;
    progressText.textContent = label;
    footerProgressText.textContent = label;
    answerText.value = buildAnswerText();

    const surveyUrl = buildSurveyUrl(answerText.value);
    topLink.href = surveyUrl;
    bottomLink.href = surveyUrl;
  }

  function buildAnswerText() {
    const lines = [];
    config.benches.forEach((bench) => {
      bench.rows.forEach((row) => {
        const selected = state.get(rowKey(bench.name, row.index));
        lines.push(
          `${bench.name}-${row.index}: ${
            selected ? `${selected.choice} (${selected.method})` : "未选择"
          }`,
        );
      });
    });
    return lines.join("\n");
  }

  function buildSurveyUrl(answerValue) {
    if (!config.surveyTextParam || !answerValue) {
      return config.surveyUrl;
    }

    const url = new URL(config.surveyUrl, window.location.href);
    url.searchParams.set(config.surveyTextParam, answerValue);
    return url.toString();
  }

  function setCopyLabel(label) {
    copyTopButton.textContent = label;
    copyBottomButton.textContent = label;
    window.setTimeout(() => {
      copyTopButton.textContent = "复制所选";
      copyBottomButton.textContent = "复制所选选项";
    }, 1400);
  }

  function rowKey(benchName, rowIndex) {
    return `${benchName}:${rowIndex}`;
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) {
      return CSS.escape(value);
    }
    return String(value).replace(/"/g, '\\"');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return map[char];
    });
  }
})();
