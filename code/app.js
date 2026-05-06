(function () {
  const config = window.BENCH_SURVEY_CONFIG;

  if (!config) {
    document.getElementById("benchRoot").textContent =
      "缺少 manifest.js，请先运行 python code/config.py。";
    return;
  }

  const methodLabels = {
    shot: "shot",
    objectclear: "objectclear",
    omnieraser: "omnieraser",
    omnipaint: "omnipaint",
    "flux-t400-alpha": "flux-t400-alpha",
    bg: "bg",
  };

  const benchNav = document.getElementById("benchNav");
  const benchRoot = document.getElementById("benchRoot");
  const topLink = document.getElementById("surveyTopLink");
  const bottomLink = document.getElementById("surveyBottomLink");
  const copyButton = document.getElementById("copyOrderButton");

  topLink.href = config.surveyUrl;
  bottomLink.href = config.surveyUrl;

  config.benches.forEach((bench) => {
    const anchor = document.createElement("a");
    anchor.href = `#bench-${bench.name}`;
    anchor.textContent = bench.name;
    benchNav.appendChild(anchor);

    benchRoot.appendChild(renderBench(bench));
  });

  copyButton.addEventListener("click", async () => {
    const lines = config.benches.flatMap((bench) =>
      bench.rows.map(
        (row) =>
          `${bench.name} / ${row.index}: ${row.images
            .map((image) => `${image.method}=${image.filename}`)
            .join(", ")}`,
      ),
    );

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      copyButton.textContent = "已复制";
      window.setTimeout(() => {
        copyButton.textContent = "复制顺序";
      }, 1400);
    } catch {
      copyButton.textContent = "复制失败";
    }
  });

  function renderBench(bench) {
    const section = document.createElement("section");
    section.className = "bench-section";
    section.id = `bench-${bench.name}`;

    const heading = document.createElement("div");
    heading.className = "bench-heading";
    heading.innerHTML = `<h2>${escapeHtml(bench.name)}</h2><span>${bench.rows.length} 个随机样例</span>`;
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
    head.innerHTML =
      '<div class="row-index" role="columnheader">#</div>' +
      config.methodOrder
        .map(
          (method) =>
            `<div class="cell" role="columnheader">${escapeHtml(methodLabels[method] || method)}</div>`,
        )
        .join("");
    table.appendChild(head);

    bench.rows.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "image-row";
      rowEl.setAttribute("role", "row");
      rowEl.innerHTML =
        `<div class="row-index" role="cell">${row.index}</div>` +
        row.images.map((image) => renderImageCell(bench.name, row, image)).join("");
      table.appendChild(rowEl);
    });

    wrap.appendChild(table);
    section.appendChild(wrap);
    return section;
  }

  function renderImageCell(benchName, row, image) {
    const label = `${benchName} ${row.index} ${image.method} ${image.filename}`;
    return `
      <div class="cell image-cell" role="cell">
        <div class="image-frame">
          <img src="${escapeHtml(image.src)}" alt="${escapeHtml(label)}" loading="lazy" />
        </div>
        <div class="caption">
          <code title="${escapeHtml(image.filename)}">${escapeHtml(image.filename)}</code>
          <span>${escapeHtml(row.sourceId)}</span>
        </div>
      </div>
    `;
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
