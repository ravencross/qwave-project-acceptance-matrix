const gates = [
  {
    id: "cashflowGate",
    title: "Cashflow Gate",
    prompt: "Does the business have sustained budget for the work?",
    options: [
      { value: "pass", label: "Pass: cashflowing or prepaid budget secured" },
      { value: "conditional", label: "Conditional: budget must be prepaid or verified" },
      { value: "fail", label: "Fail: no sustained budget" }
    ]
  },
  {
    id: "problemGate",
    title: "Problem Gate",
    prompt: "Is this fundamentally an operational problem?",
    options: [
      { value: "pass", label: "Pass: operational system problem" },
      { value: "conditional", label: "Conditional: marketing request can be reframed operationally" },
      { value: "fail", label: "Fail: primarily marketing execution" }
    ]
  },
  {
    id: "ownershipGate",
    title: "Tech Ownership Gate",
    prompt: "Will QWave avoid running the technology indefinitely?",
    options: [
      { value: "pass", label: "Pass: client owns after handoff" },
      { value: "conditional", label: "Conditional: transition plan required" },
      { value: "fail", label: "Fail: QWave must run it long-term" }
    ]
  },
  {
    id: "techOwnerGate",
    title: "Client Owner Gate",
    prompt: "Is there a client-side technical owner or accountable CEO?",
    options: [
      { value: "pass", label: "Pass: tech owner/team exists" },
      { value: "conditional", label: "Conditional: CEO explicitly owns implementation" },
      { value: "fail", label: "Fail: no accountable owner" }
    ]
  }
];

const criteria = [
  {
    id: "cashflow",
    title: "Cashflow / Budget Quality",
    prompt: "How strong is the actual financial capacity behind the project?",
    anchors: ["Thin", "Adequate", "Strong"],
    weight: 2,
    evidencePrompt: "Revenue proof, budget owner, payment terms",
    defaultValue: 3
  },
  {
    id: "problemType",
    title: "Operational Intensity",
    prompt: "How directly does this improve revenue, cost, speed, quality, or scale?",
    anchors: ["Soft", "Mixed", "Operational"],
    weight: 2,
    evidencePrompt: "Metric improved, workflow affected, cost removed",
    defaultValue: 3
  },
  {
    id: "techOwnership",
    title: "Handoff Clarity",
    prompt: "How clearly can QWave transfer ownership after delivery?",
    anchors: ["Sticky", "Possible", "Clean"],
    weight: 2,
    evidencePrompt: "Owner, training path, support boundary",
    defaultValue: 3
  },
  {
    id: "clientQuality",
    title: "Client Quality",
    prompt: "Is the client clear, responsive, respectful, and decision-capable?",
    anchors: ["Risky", "Unknown", "Strong"],
    weight: 1.5,
    evidencePrompt: "Decision maker, response pattern, clarity",
    defaultValue: 3
  },
  {
    id: "strategicFit",
    title: "Strategic Fit",
    prompt: "Does this move QWave toward the company and reputation it wants?",
    anchors: ["Distracting", "Adjacent", "Direct"],
    weight: 1.5,
    evidencePrompt: "Market, capability, positioning",
    defaultValue: 3
  },
  {
    id: "commercialValue",
    title: "Commercial Value",
    prompt: "Are the economics worth the effort, risk, and opportunity cost?",
    anchors: ["Weak", "Acceptable", "Strong"],
    weight: 1.5,
    evidencePrompt: "Margin, scope, terms, expansion",
    defaultValue: 3
  },
  {
    id: "growthPotential",
    title: "Growth Potential",
    prompt: "Can this business or system grow into a larger opportunity?",
    anchors: ["Low", "Moderate", "High"],
    weight: 1.5,
    evidencePrompt: "Expansion path, market size, usage growth",
    defaultValue: 3
  },
  {
    id: "executionFit",
    title: "Execution Fit",
    prompt: "Can QWave deliver excellent work with current skills, capacity, and timeline?",
    anchors: ["High risk", "Manageable", "Clear"],
    weight: 1.25,
    evidencePrompt: "Team capacity, unknowns, integration risk",
    defaultValue: 3
  },
  {
    id: "clientTech",
    title: "Client Tech Capability",
    prompt: "How capable is the client of owning implementation and maintenance?",
    anchors: ["No owner", "CEO owns", "Tech owner"],
    weight: 1,
    evidencePrompt: "Name of owner, skills, availability",
    defaultValue: 3
  },
  {
    id: "jvWillingness",
    title: "JV / Upside Willingness",
    prompt: "Is the business open to a JV, upside, rev-share, or equity-style structure?",
    anchors: ["No", "Maybe", "Yes"],
    weight: 1,
    evidencePrompt: "Terms discussed, decision maker, upside basis",
    defaultValue: 3
  },
  {
    id: "learningLeverage",
    title: "Learning / Leverage",
    prompt: "Will this create reusable IP, systems, relationships, or case-study value?",
    anchors: ["One-off", "Some", "Durable"],
    weight: 1,
    evidencePrompt: "Reusable asset, playbook, reference value",
    defaultValue: 3
  }
];

const dealbreakers = [
  { id: "noBudget", label: "Business is not cashflowing and has no secured budget" },
  { id: "marketingOnly", label: "Project is primarily a marketing problem" },
  { id: "qwaveRunsTech", label: "QWave is expected to run the tech indefinitely" },
  { id: "noTechOwner", label: "No client tech owner and CEO is not explicitly accountable" },
  { id: "vagueScope", label: "Scope is vague and cannot be made concrete" },
  { id: "badTerms", label: "Payment terms create unnecessary cashflow risk" },
  { id: "reputationRisk", label: "Values, ethics, or reputation risk is present" }
];

const maxWeightedScore = criteria.reduce((sum, criterion) => sum + criterion.weight * 5, 0);
const storageKey = "qwave-project-scorecards-v2";
const form = document.querySelector("#scorecardForm");
const gateGrid = document.querySelector("#gateGrid");
const criteriaGrid = document.querySelector("#criteriaGrid");
const dealbreakerGrid = document.querySelector("#dealbreakerGrid");
const gateTemplate = document.querySelector("#gateTemplate");
const criterionTemplate = document.querySelector("#criterionTemplate");
const dealbreakerTemplate = document.querySelector("#dealbreakerTemplate");
const recommendation = document.querySelector("#recommendation");
const scoreTotal = document.querySelector("#scoreTotal");
const scoreMax = document.querySelector("#scoreMax");
const scoreMeter = document.querySelector("#scoreMeter");
const decisionCard = document.querySelector("#decisionCard");
const decisionReason = document.querySelector("#decisionReason");
const savedList = document.querySelector("#savedList");
const clearSavedButton = document.querySelector("#clearSavedButton");
let activeId = null;

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `evaluation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const sampleEvaluation = {
  id: "sample-inventory-automation",
  projectName: "Inventory Automation Platform",
  clientName: "Regional Specialty Distributor",
  description:
    "Build an internal system that automates inventory visibility, purchasing alerts, and reporting across three warehouses.",
  gates: {
    cashflowGate: "pass",
    problemGate: "pass",
    ownershipGate: "pass",
    techOwnerGate: "pass"
  },
  scores: {
    cashflow: 5,
    problemType: 5,
    techOwnership: 5,
    clientQuality: 4,
    strategicFit: 5,
    commercialValue: 4,
    growthPotential: 4,
    executionFit: 4,
    clientTech: 5,
    jvWillingness: 3,
    learningLeverage: 5
  },
  confidence: {
    cashflow: "high",
    problemType: "high",
    techOwnership: "medium",
    clientQuality: "medium",
    strategicFit: "high",
    commercialValue: "medium",
    growthPotential: "medium",
    executionFit: "medium",
    clientTech: "high",
    jvWillingness: "low",
    learningLeverage: "high"
  },
  evidence: {
    cashflow: "Profitable 12-year operating business with budget allocated.",
    problemType: "Reduces stockouts, manual purchasing work, and reporting lag.",
    techOwnership: "Internal systems manager will own the tool after training.",
    growthPotential: "Expansion plan from 3 to 10 warehouses.",
    jvWillingness: "Open to performance upside, not committed yet."
  },
  dealbreakers: {},
  notes:
    "Strong QWave fit. Clarify JV terms, define handoff responsibilities, and include training for the internal systems manager.",
  review: {
    decision: "",
    repeat: "",
    ranTech: "",
    leverage: "",
    notes: ""
  }
};

function renderGates() {
  gateGrid.innerHTML = "";

  gates.forEach((gate) => {
    const node = gateTemplate.content.cloneNode(true);
    const article = node.querySelector(".gate");
    const title = node.querySelector("h4");
    const prompt = node.querySelector("p");
    const select = node.querySelector("select");

    article.dataset.gate = gate.id;
    title.textContent = gate.title;
    prompt.textContent = gate.prompt;
    select.id = gate.id;
    select.name = gate.id;

    gate.options.forEach((option) => {
      const optionNode = document.createElement("option");
      optionNode.value = option.value;
      optionNode.textContent = option.label;
      select.appendChild(optionNode);
    });

    select.addEventListener("change", updateDecision);
    gateGrid.appendChild(node);
  });
}

function renderCriteria() {
  criteriaGrid.innerHTML = "";

  criteria.forEach((criterion) => {
    const node = criterionTemplate.content.cloneNode(true);
    const article = node.querySelector(".criterion");
    const title = node.querySelector("h4");
    const prompt = node.querySelector("p");
    const output = node.querySelector("output");
    const slider = node.querySelector('input[type="range"]');
    const anchors = node.querySelectorAll(".score-anchors span");
    const confidence = node.querySelector(".confidence-select");
    const evidence = node.querySelector(".evidence-input");
    const weight = node.querySelector(".weight-pill");

    article.dataset.criterion = criterion.id;
    title.textContent = criterion.title;
    prompt.textContent = criterion.prompt;
    slider.id = criterion.id;
    slider.name = criterion.id;
    slider.value = criterion.defaultValue;
    confidence.id = `${criterion.id}Confidence`;
    confidence.name = `${criterion.id}Confidence`;
    evidence.id = `${criterion.id}Evidence`;
    evidence.name = `${criterion.id}Evidence`;
    evidence.placeholder = criterion.evidencePrompt;
    output.htmlFor = criterion.id;
    output.value = criterion.defaultValue;
    output.textContent = criterion.defaultValue;
    weight.textContent = `${criterion.weight}x`;

    criterion.anchors.forEach((anchor, index) => {
      anchors[index].textContent = anchor;
    });

    slider.addEventListener("input", () => {
      output.value = slider.value;
      output.textContent = slider.value;
      updateDecision();
    });
    confidence.addEventListener("change", updateDecision);
    evidence.addEventListener("input", updateDecision);

    criteriaGrid.appendChild(node);
  });
}

function renderDealbreakers() {
  dealbreakerGrid.innerHTML = "";

  dealbreakers.forEach((dealbreaker) => {
    const node = dealbreakerTemplate.content.cloneNode(true);
    const label = node.querySelector(".dealbreaker");
    const input = node.querySelector("input");
    const span = node.querySelector("span");

    label.htmlFor = dealbreaker.id;
    input.id = dealbreaker.id;
    input.name = dealbreaker.id;
    span.textContent = dealbreaker.label;
    input.addEventListener("change", updateDecision);

    dealbreakerGrid.appendChild(node);
  });
}

function getSaved() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function setSaved(items) {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

function readEvaluation() {
  const gateValues = {};
  const scores = {};
  const confidence = {};
  const evidence = {};
  const checkedDealbreakers = {};

  gates.forEach((gate) => {
    gateValues[gate.id] = document.querySelector(`#${gate.id}`).value;
  });

  criteria.forEach((criterion) => {
    scores[criterion.id] = Number(document.querySelector(`#${criterion.id}`).value);
    confidence[criterion.id] = document.querySelector(`#${criterion.id}Confidence`).value;
    evidence[criterion.id] = document.querySelector(`#${criterion.id}Evidence`).value.trim();
  });

  dealbreakers.forEach((dealbreaker) => {
    checkedDealbreakers[dealbreaker.id] = document.querySelector(`#${dealbreaker.id}`).checked;
  });

  return {
    id: activeId || createId(),
    projectName: document.querySelector("#projectName").value.trim(),
    clientName: document.querySelector("#clientName").value.trim(),
    description: document.querySelector("#description").value.trim(),
    gates: gateValues,
    scores,
    confidence,
    evidence,
    dealbreakers: checkedDealbreakers,
    notes: document.querySelector("#notes").value.trim(),
    review: {
      decision: document.querySelector("#reviewDecision").value,
      repeat: document.querySelector("#reviewRepeat").value,
      ranTech: document.querySelector("#reviewRanTech").value,
      leverage: document.querySelector("#reviewLeverage").value,
      notes: document.querySelector("#reviewNotes").value.trim()
    },
    updatedAt: new Date().toISOString()
  };
}

function writeEvaluation(evaluation) {
  activeId = evaluation.id || createId();
  document.querySelector("#projectName").value = evaluation.projectName || "";
  document.querySelector("#clientName").value = evaluation.clientName || "";
  document.querySelector("#description").value = evaluation.description || "";
  document.querySelector("#notes").value = evaluation.notes || "";

  gates.forEach((gate) => {
    document.querySelector(`#${gate.id}`).value = evaluation.gates?.[gate.id] || "pass";
  });

  criteria.forEach((criterion) => {
    const value = evaluation.scores?.[criterion.id] ?? criterion.defaultValue;
    const slider = document.querySelector(`#${criterion.id}`);
    const output = slider.closest(".criterion").querySelector("output");
    slider.value = value;
    output.value = value;
    output.textContent = value;
    document.querySelector(`#${criterion.id}Confidence`).value = evaluation.confidence?.[criterion.id] || "medium";
    document.querySelector(`#${criterion.id}Evidence`).value = evaluation.evidence?.[criterion.id] || "";
  });

  dealbreakers.forEach((dealbreaker) => {
    document.querySelector(`#${dealbreaker.id}`).checked = Boolean(evaluation.dealbreakers?.[dealbreaker.id]);
  });

  document.querySelector("#reviewDecision").value = evaluation.review?.decision || "";
  document.querySelector("#reviewRepeat").value = evaluation.review?.repeat || "";
  document.querySelector("#reviewRanTech").value = evaluation.review?.ranTech || "";
  document.querySelector("#reviewLeverage").value = evaluation.review?.leverage || "";
  document.querySelector("#reviewNotes").value = evaluation.review?.notes || "";

  updateDecision();
}

function getWeightedTotal(evaluation) {
  return criteria.reduce((sum, criterion) => {
    return sum + Number(evaluation.scores[criterion.id] || 0) * criterion.weight;
  }, 0);
}

function evaluate(evaluation = readEvaluation()) {
  const total = getWeightedTotal(evaluation);
  const percentage = total / maxWeightedScore;
  const failedGates = gates.filter((gate) => evaluation.gates[gate.id] === "fail");
  const conditionalGates = gates.filter((gate) => evaluation.gates[gate.id] === "conditional");
  const activeDealbreakers = dealbreakers.filter((item) => evaluation.dealbreakers[item.id]);
  const lowConfidence = criteria.filter((criterion) => evaluation.confidence[criterion.id] === "low");
  const highScoresWithThinEvidence = criteria.filter((criterion) => {
    return Number(evaluation.scores[criterion.id]) >= 4 && !evaluation.evidence[criterion.id];
  });

  if (activeDealbreakers.length > 0 || failedGates.length > 0) {
    return {
      total,
      percentage,
      status: "Decline",
      className: "status-decline",
      reason: "Decline. A hard gate failed or a dealbreaker is active."
    };
  }

  if (conditionalGates.length > 0) {
    return {
      total,
      percentage,
      status: percentage >= 0.7 ? "Accept with Conditions" : "Reframe",
      className: percentage >= 0.7 ? "status-conditions" : "status-reframe",
      reason: percentage >= 0.7
        ? "Accept only if the conditional gates are resolved in writing."
        : "Reframe the offer. The opportunity may be useful, but the current shape is not strong enough."
    };
  }

  if (percentage >= 0.8 && lowConfidence.length <= 2 && highScoresWithThinEvidence.length <= 2) {
    return {
      total,
      percentage,
      status: "Accept",
      className: "status-accept",
      reason: "Accept candidate. Strong weighted fit, gates pass, and confidence is not overextended."
    };
  }

  if (percentage >= 0.7) {
    return {
      total,
      percentage,
      status: "Accept with Conditions",
      className: "status-conditions",
      reason: "Good candidate, but clarify weak confidence, missing evidence, or commercial conditions first."
    };
  }

  if (percentage >= 0.58) {
    return {
      total,
      percentage,
      status: "Reframe",
      className: "status-reframe",
      reason: "Reframe before accepting. There may be a better operational, ownership, or upside structure."
    };
  }

  return {
    total,
    percentage,
    status: "Decline",
    className: "status-decline",
    reason: "Decline or revisit later. The weighted fit is below QWave's recommended threshold."
  };
}

function updateDecision() {
  const result = evaluate();
  recommendation.textContent = result.status;
  scoreTotal.textContent = result.total.toFixed(result.total % 1 === 0 ? 0 : 1);
  scoreMax.textContent = `/${maxWeightedScore}`;
  scoreMeter.style.width = `${Math.round(result.percentage * 100)}%`;
  decisionReason.textContent = result.reason;
  decisionCard.classList.remove("status-accept", "status-conditions", "status-reframe", "status-decline");
  document.body.classList.remove("status-accept", "status-conditions", "status-reframe", "status-decline");
  decisionCard.classList.add(result.className);
  document.body.classList.add(result.className);
}

function renderSaved() {
  const saved = getSaved();
  savedList.innerHTML = "";
  clearSavedButton.disabled = saved.length === 0;

  if (saved.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No saved evaluations yet.";
    savedList.appendChild(empty);
    return;
  }

  saved
    .slice()
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .forEach((evaluation) => {
      const result = evaluate(evaluation);
      const button = document.createElement("button");
      const details = document.createElement("span");
      const title = document.createElement("strong");
      const client = document.createElement("span");
      const score = document.createElement("span");
      const scoreValue = result.total.toFixed(result.total % 1 === 0 ? 0 : 1);

      button.type = "button";
      button.className = "saved-item";
      details.className = "saved-item-details";
      title.textContent = evaluation.projectName || "Untitled project";
      client.textContent = evaluation.clientName || "No client";
      score.className = "saved-item-score";
      score.textContent = `${result.status} ${scoreValue}/${maxWeightedScore}`;
      details.append(title, client);
      button.append(details, score);
      button.addEventListener("click", () => writeEvaluation(evaluation));
      savedList.appendChild(button);
    });
}

function clearSaved() {
  setSaved([]);
  renderSaved();
}

function saveCurrent() {
  const evaluation = readEvaluation();
  activeId = evaluation.id;
  const saved = getSaved();
  const existingIndex = saved.findIndex((item) => item.id === evaluation.id);

  if (existingIndex >= 0) {
    saved[existingIndex] = evaluation;
  } else {
    saved.push(evaluation);
  }

  setSaved(saved);
  renderSaved();
}

function newEvaluation() {
  activeId = createId();
  writeEvaluation({
    id: activeId,
    projectName: "",
    clientName: "",
    description: "",
    gates: Object.fromEntries(gates.map((gate) => [gate.id, "pass"])),
    scores: Object.fromEntries(criteria.map((criterion) => [criterion.id, criterion.defaultValue])),
    confidence: Object.fromEntries(criteria.map((criterion) => [criterion.id, "medium"])),
    evidence: {},
    dealbreakers: {},
    notes: "",
    review: {}
  });
}

function exportJson() {
  const evaluation = readEvaluation();
  const result = evaluate(evaluation);
  const payload = {
    ...evaluation,
    recommendation: result.status,
    weightedScore: result.total,
    maxWeightedScore,
    scorePercentage: Number((result.percentage * 100).toFixed(1)),
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = (evaluation.projectName || "qwave-scorecard").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  link.href = url;
  link.download = `${safeName}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function shareApp() {
  const shareUrl = window.location.origin.includes("localhost")
    ? "https://qwave-scorecard-vercel.vercel.app"
    : window.location.href;
  const shareData = {
    title: "QWave Project Acceptance Matrix",
    text: "Use this scorecard to evaluate QWave project fit.",
    url: shareUrl
  };
  const button = document.querySelector("#shareButton");

  if (navigator.share) {
    await navigator.share(shareData);
    return;
  }

  await navigator.clipboard.writeText(shareUrl);
  button.textContent = "Copied";
  window.setTimeout(() => {
    button.textContent = "Share";
  }, 1500);
}

renderGates();
renderCriteria();
renderDealbreakers();
newEvaluation();
renderSaved();

form.addEventListener("input", updateDecision);
form.addEventListener("change", updateDecision);
document.querySelector("#saveButton").addEventListener("click", saveCurrent);
document.querySelector("#newProjectButton").addEventListener("click", newEvaluation);
clearSavedButton.addEventListener("click", clearSaved);
document.querySelector("#sampleButton").addEventListener("click", () => writeEvaluation(sampleEvaluation));
document.querySelector("#exportButton").addEventListener("click", exportJson);
document.querySelector("#shareButton").addEventListener("click", () => {
  shareApp().catch(() => {});
});
