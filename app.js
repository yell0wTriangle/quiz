(() => {
  const STORE_KEY = "itques-quiz-v2";
  const THEME_KEY = "itques-theme-v1";
  const questions = window.QUIZ_QUESTIONS;
  const byId = new Map(questions.map((question) => [question.id, question]));
  const $ = (selector) => document.querySelector(selector);
  const elements = {
    filters: $("#topicFilters"), questionNumber: $("#questionNumber"),
    topic: $("#questionTopic"), question: $("#questionText"), options: $("#options"), feedback: $("#answerFeedback"),
    previous: $("#previousButton"), next: $("#nextButton"), progress: $("#progressText"),
    hint: $("#filterHint"), resetDialog: $("#resetDialog"), filterDialog: $("#filterDialog"), themeToggle: $("#themeToggle"), source: $("#sourceSelect")
  };
  const questionGridDialog = $("#questionGridDialog");
  const gridContainers = [$("#questionGrid"), $("#mobileQuestionGrid")];
  const topicsFor = (source) => [...new Set(questions.filter((question) => question.source === source).map((question) => question.topic))].sort();
  const shuffle = (items) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
  };
  const newState = () => ({ source: "pdf", order: shuffle(questions.filter((question) => question.source === "pdf").map((question) => question.id)), topics: topicsFor("pdf"), answers: {}, current: 0 });
  const load = () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY));
      if (saved && ["pdf", "book"].includes(saved.source) && Array.isArray(saved.order)) return saved;
    } catch (_) { /* A new state is safer than a broken one. */ }
    return newState();
  };
  let state = load();
  const save = () => sessionStorage.setItem(STORE_KEY, JSON.stringify(state));
  const setTheme = (theme) => {
    const dark = theme === "dark";
    document.body.classList.toggle("theme-dark", dark);
    elements.themeToggle.setAttribute("aria-pressed", String(dark));
    elements.themeToggle.textContent = dark ? "☀️ Light" : "🌙 Dark";
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) { /* Theme still works for this visit. */ }
  };
  const savedTheme = (() => { try { return localStorage.getItem(THEME_KEY); } catch (_) { return null; } })();
  setTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  const visibleOrder = () => state.order.filter((id) => byId.has(id) && byId.get(id).source === state.source && state.topics.includes(byId.get(id).topic));
  const currentQuestion = () => byId.get(visibleOrder()[state.current]);
  const setCurrent = (index) => { state.current = Math.max(0, Math.min(index, visibleOrder().length - 1)); save(); render(); };

  function renderFilters() {
    const topics = topicsFor(state.source);
    elements.filters.innerHTML = topics.map((topic) => `<label class="topic-check"><input type="checkbox" value="${topic}" ${state.topics.includes(topic) ? "checked" : ""}>${topic}</label>`).join("");
    elements.filters.querySelectorAll("input").forEach((input) => input.addEventListener("change", () => {
      state.topics = [...elements.filters.querySelectorAll("input:checked")].map((item) => item.value);
      state.current = 0; save(); render();
    }));
  }
  function renderQuestion(question, order) {
    if (!question) {
      elements.questionNumber.textContent = "No topics selected"; elements.questionNumber.disabled = true; elements.topic.textContent = "";
      elements.question.textContent = "Select at least one topic to begin."; elements.options.innerHTML = ""; elements.feedback.textContent = "";
      elements.previous.disabled = elements.next.disabled = true; return;
    }
    elements.questionNumber.disabled = false;
    const selected = state.answers[question.id];
    elements.questionNumber.textContent = `Question ${state.current + 1} out of ${order.length}`;
    elements.topic.textContent = question.topic;
    elements.question.textContent = question.question;
    elements.options.innerHTML = question.options.map((option, index) => {
      const letter = String.fromCharCode(65 + index); const correct = question.answer === letter;
      const classes = selected ? (correct ? "is-correct" : selected === letter ? "is-wrong" : "") : "";
      return `<button class="option ${classes}" type="button" data-letter="${letter}" ${selected ? "disabled" : ""}><span class="option-letter">${letter}</span><span>${option}</span></button>`;
    }).join("");
    elements.options.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => answer(question, button.dataset.letter)));
    if (selected) {
      const right = selected === question.answer;
      elements.feedback.textContent = right ? "Correct!" : `Not quite. The correct answer is ${question.answer}.`;
      elements.feedback.className = `answer-feedback ${right ? "correct" : "wrong"}`;
    } else { elements.feedback.textContent = ""; elements.feedback.className = "answer-feedback"; }
    elements.previous.disabled = state.current === 0; elements.next.disabled = state.current === order.length - 1;
  }
  function renderQuestionGrid(order) {
    gridContainers.forEach((container) => {
      container.innerHTML = order.map((id, index) => {
        const question = byId.get(id);
        const selected = state.answers[id];
        const status = !selected ? "unanswered" : selected === question.answer ? "correct" : "wrong";
        return `<button class="question-grid-item ${status} ${index === state.current ? "is-current" : ""}" type="button" data-index="${index}" aria-label="Question ${index + 1}, ${status === "unanswered" ? "unattempted" : status}" aria-current="${index === state.current ? "step" : "false"}">${index + 1}</button>`;
      }).join("");
      container.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
        setCurrent(Number(button.dataset.index));
        if (questionGridDialog.open) questionGridDialog.close();
      }));
    });
  }
  function answer(question, letter) { state.answers[question.id] = letter; save(); render(); }
  function render() {
    if (state.current >= visibleOrder().length) state.current = 0;
    const order = visibleOrder();
    const answered = order.filter((id) => state.answers[id]).length;
    const correct = order.filter((id) => state.answers[id] === byId.get(id).answer).length;
    const wrong = answered - correct;
    renderFilters(); renderQuestion(currentQuestion(), order); renderQuestionGrid(order);
    elements.progress.textContent = `${answered} answered · ${correct} right · ${wrong} wrong`;
    elements.hint.textContent = state.topics.length ? `${order.length} question${order.length === 1 ? "" : "s"} selected. Your progress stays saved in this browser tab after refresh.` : "Choose at least one topic to show questions.";
  }
  elements.previous.addEventListener("click", () => setCurrent(state.current - 1));
  elements.next.addEventListener("click", () => setCurrent(state.current + 1));
  $("#selectAllButton").addEventListener("click", () => { state.topics = topicsFor(state.source); state.current = 0; save(); render(); });
  $("#clearTopicsButton").addEventListener("click", () => { state.topics = []; state.current = 0; save(); render(); });
  $("#resetButton").addEventListener("click", () => elements.resetDialog.showModal());
  $("#openFiltersButton").addEventListener("click", () => elements.filterDialog.showModal());
  elements.questionNumber.addEventListener("click", () => { if (visibleOrder().length) questionGridDialog.showModal(); });
  $("#closeQuestionGridButton").addEventListener("click", () => questionGridDialog.close());
  $("#closeFiltersButton").addEventListener("click", () => elements.filterDialog.close());
  $("#cancelResetButton").addEventListener("click", () => elements.resetDialog.close());
  $("#confirmResetButton").addEventListener("click", () => { state = newState(); save(); elements.resetDialog.close(); render(); });
  elements.themeToggle.addEventListener("click", () => setTheme(document.body.classList.contains("theme-dark") ? "light" : "dark"));
  elements.source.value = state.source;
  elements.source.addEventListener("change", () => {
    state.source = elements.source.value;
    state.order = shuffle(questions.filter((question) => question.source === state.source).map((question) => question.id));
    state.topics = topicsFor(state.source); state.current = 0; save(); render();
  });
  render();
})();
