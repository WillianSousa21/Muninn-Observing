//Quando eu fiz essa parte eu, Deus e ia sabiamos o que estavamos fazendo, agora só Deus sabe, e ele não fala comigo. ;-;
/*navegação acessível, validação e operações do mural. */
const STORAGE_KEY = "muninnRelatos";
const ACTIVITY_KEY = "muninnAtividades";
const FONT_KEY = "muninnTamanhoTexto";
const THEME_KEY = "muninnTemaEscuro";
const MAX_ACTIVITIES = 20;
const REPORT_TYPES = ["Alagamento", "Interdição", "Deslizamento", "Incêndio", "Árvore ou objeto na via", "Outro risco"];

// A sessão evita enviar informações pessoais ou publicar dados em um servidor.
let storageLoadFailed = false;
const savedReports = readStorage(STORAGE_KEY, []);
const savedActivities = readStorage(ACTIVITY_KEY, []);
let relatos = savedReports.filter(isValidReport);
let atividades = savedActivities.filter(isValidActivity);
if (relatos.length !== savedReports.length || atividades.length !== savedActivities.length) storageLoadFailed = true;

// Lê e decodifica os dados guardados na sessão.
function readStorage(key, fallback) {
  try {
    const saved = sessionStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) return parsed;
    storageLoadFailed = true;
    return fallback;
  } catch (error) {
    storageLoadFailed = true;
    console.error("Não foi possível ler os dados desta sessão.", error);
    return fallback;
  }
}

// Verifica se o endereço é uma URL HTTP ou HTTPS válida.
function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  } catch (error) {
    return false;
  }
}
// Valida os dados de um relato carregado do armazenamento.
function isValidReport(item) {
  if (!item || typeof item !== "object") return false;
  const textFields = ["id", "tipo", "bairro", "local", "observadoEm", "descricao", "fonteUrl", "criadoEm"];
  if (!textFields.every((field) => typeof item[field] === "string")) return false;
  return REPORT_TYPES.includes(item.tipo) && item.bairro.trim().length >= 2 && item.bairro.length <= 60 &&
    item.local.trim().length >= 5 && item.local.length <= 120 && item.descricao.trim().length >= 15 &&
    item.descricao.length <= 500 && item.fonteUrl.length <= 2048 && (!item.fonteUrl || isHttpUrl(item.fonteUrl)) &&
    !Number.isNaN(new Date(item.observadoEm).getTime()) &&
    !Number.isNaN(new Date(item.criadoEm).getTime()) && 
    new Date(item.observadoEm) <= new Date();
}

// Valida os dados mínimos de uma atividade.
function isValidActivity(item) {
  return Boolean(item && typeof item === "object" && typeof item.id === "string" &&
    typeof item.action === "string" && typeof item.result === "string" &&
    typeof item.quando === "string" && !Number.isNaN(new Date(item.quando).getTime()));
}

// Guarda dados no armazenamento da sessão.
function saveStorage(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Não foi possível guardar os dados desta sessão.", error);
    showMessage("Não foi possível guardar os dados nesta sessão. Tente novamente.", "error");
    return false;
  }
}

// Cria um identificador único para um registro.
function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Formata uma data para exibição na interface.
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

// Adiciona uma ação ao histórico de atividades.
function addActivity(action, result) {
  const nextActivities = [{ id: createId(), quando: new Date().toISOString(), action, result }, ...atividades].slice(0, MAX_ACTIVITIES);
  if (!saveStorage(ACTIVITY_KEY, nextActivities)) return false;
  atividades = nextActivities;
  renderActivities();
  return true;
}

// Renderiza o histórico de atividades na página.
function renderActivities() {
  const list = document.querySelector("#painel-atividades");
  if (!list) return;
  list.replaceChildren();
  atividades.forEach((activity) => {
    const row = document.createElement("div");
    row.className = "activity-row";
    const time = document.createElement("time");
    time.dateTime = activity.quando;
    time.textContent = formatDate(activity.quando);
    const action = document.createElement("strong");
    action.textContent = activity.action;
    const result = document.createElement("span");
    result.textContent = activity.result;
    row.append(time, action, result);
    list.append(row);
  });
  const empty = document.querySelector("#atividades-vazias");
  if (empty) empty.hidden = atividades.length > 0;
  const count = document.querySelector("#total-atividades");
  if (count) count.textContent = `${atividades.length} ${atividades.length === 1 ? "atividade" : "atividades"}`;
}

// Cria um elemento HTML com texto e classe opcional.
function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

// Cria o cartão visual de um relato.
function renderReportCard(relato, compact = false) {
  const card = document.createElement("article");
  card.className = compact ? "recent-card" : "report-card";
  const type = createTextElement("span", "report-type", relato.tipo);
  const title = createTextElement("h3", "", `${relato.bairro} · ${relato.local}`);
  const when = createTextElement("p", "report-meta", `Data informada pela fonte: ${formatDate(relato.observadoEm)}`);
  const description = createTextElement("p", compact ? "" : "report-description", relato.descricao);
  card.append(type, title, when, description);

  if (relato.fonteUrl) {
  const sourceLink = createTextElement("a", "report-source", "Consultar fonte pública");
  sourceLink.href = relato.fonteUrl;
  sourceLink.target = "_blank";
  sourceLink.rel = "noopener noreferrer";
  card.append(sourceLink);
  }

  if (!compact) {
    const buttons = document.createElement("div");
    buttons.className = "report-actions";
    const editButton = createTextElement("button", "", "Editar");
    editButton.type = "button";
    editButton.dataset.edit = relato.id;
    const removeButton = createTextElement("button", "", "Remover");
    removeButton.type = "button";
    removeButton.dataset.remove = relato.id;
    removeButton.setAttribute("aria-label", `Remover relato de ${relato.bairro}, ${relato.local}`);
    buttons.append(editButton, removeButton);
    card.append(buttons);
  }

  return card;
}

// Renderiza os relatos e aplica os filtros selecionados.
function renderReports() {
  const list = document.querySelector("#lista-relatos");
  const homeList = document.querySelector("#ultimos-relatos");
  const ordered = [...relatos].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
  if (list) {
    const neighborhood = document.querySelector("#filtro-bairro").value.trim().toLocaleLowerCase("pt-BR");
    const type = document.querySelector("#filtro-tipo").value;
    const filtered = ordered.filter((item) => {
      const matchesNeighborhood = item.bairro.toLocaleLowerCase("pt-BR").includes(neighborhood);
      return matchesNeighborhood && (!type || item.tipo === type);
    });
    list.replaceChildren(...filtered.map((item) => renderReportCard(item)));
    document.querySelector("#lista-vazia").hidden = filtered.length > 0;
    const count = document.querySelector("#contador-relatos");
    count.textContent = `${relatos.length} ${relatos.length === 1 ? "informação cadastrada" : "informações cadastradas"} nesta sessão.`;
    if (!filtered.length && relatos.length) document.querySelector("#lista-vazia").textContent = "Nenhuma informação corresponde aos filtros selecionados.";
  }
  if (homeList) {
    homeList.replaceChildren(...ordered.slice(0, 3).map((item) => renderReportCard(item, true)));
    document.querySelector("#inicio-vazio").hidden = relatos.length > 0;
    document.querySelector("#total-relatos").textContent = relatos.length;
    document.querySelector("#bairros-relatos").textContent = new Set(relatos.map((item) => item.bairro.toLocaleLowerCase("pt-BR"))).size;
    document.querySelector("#atualizado-em").textContent = ordered.length ? formatDate(ordered[0].criadoEm) : "—";
  }
}

// Exibe uma mensagem no formulário.
function showMessage(text, type) {
  const message = document.querySelector("#mensagem-formulario");
  if (!message) return;
  message.textContent = text;
  message.className = `form-message ${type}`;
}

// Remove validações personalizadas antes de validar o formulário.
function clearValidation(form) {
  form.querySelectorAll(".form-control, .form-select").forEach((field) => field.setCustomValidity(""));
}

// Valida os campos e obtém os dados do formulário.
function validateForm(form) {
  clearValidation(form);
  const fields = {
    tipo: document.querySelector("#tipo"),
    bairro: document.querySelector("#bairro"),
    local: document.querySelector("#local"),
    observadoEm: document.querySelector("#observado-em"),
    descricao: document.querySelector("#descricao"),
    fonteUrl: document.querySelector("#fonte-url")
  };
  [fields.bairro, fields.local, fields.descricao].forEach((field) => {
    if (!field.value.trim()) field.setCustomValidity("Este campo precisa ter conteúdo além de espaços.");
  });
  if (fields.observadoEm.value && new Date(fields.observadoEm.value) > new Date()) {
    fields.observadoEm.setCustomValidity("A data e o horário não podem estar no futuro.");
  }
  if (fields.fonteUrl.value && !isHttpUrl(fields.fonteUrl.value.trim())) {
    fields.fonteUrl.setCustomValidity("Use um endereço iniciado por http:// ou https://.");
  }
  form.classList.add("was-validated");
  if (!form.checkValidity()) {
    form.reportValidity();
    showMessage("Revise os campos destacados antes de publicar.", "error");
    return null;
  }
  return {
    tipo: fields.tipo.value,
    bairro: fields.bairro.value.trim(),
    local: fields.local.value.trim(),
    observadoEm: fields.observadoEm.value,
    descricao: fields.descricao.value.trim(),
    fonteUrl: fields.fonteUrl.value.trim()
  };
}

// Limpa o formulário e retorna ao modo de cadastro.
function resetForm() {
  const form = document.querySelector("#form-relato");
  if (!form) return;
  form.reset();
  form.classList.remove("was-validated");
  document.querySelector("#relato-id").value = "";
  document.querySelector("#btn-salvar").textContent = "Publicar informação pública";
  document.querySelector("#btn-cancelar").classList.add("d-none");
  document.querySelector("#form-titulo").textContent = "Registrar informação pública";
  document.querySelector("#contador-descricao").textContent = "0";
}

// Processa o envio para cadastrar ou editar um relato.
function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = validateForm(form);
  if (!values) return;
  const editingId = document.querySelector("#relato-id").value;
  let activitySaved;
  let successMessage;
  if (editingId) {
    const nextReports = relatos.map((item) => item.id === editingId ? { ...item, ...values, atualizadoEm: new Date().toISOString() } : item);
    if (!saveStorage(STORAGE_KEY, nextReports)) return;
    relatos = nextReports;
    activitySaved = addActivity("Informação editada", `${values.tipo} · ${values.bairro}`);
    successMessage = "As alterações foram salvas nesta sessão.";
  } else {
    const report = { id: createId(), ...values, criadoEm: new Date().toISOString() };
    const nextReports = [report, ...relatos];
    if (!saveStorage(STORAGE_KEY, nextReports)) return;
    relatos = nextReports;
    activitySaved = addActivity("Informação cadastrada", `${values.tipo} · ${values.bairro}`);
    successMessage = "Informação pública cadastrada nesta sessão.";
  }
  renderReports();
  resetForm();
  showMessage(activitySaved ? successMessage : `${successMessage} O histórico não pôde ser atualizado.`, activitySaved ? "success" : "error");
}

// Preenche o formulário para editar um relato existente.
function startEdit(id) {
  const report = relatos.find((item) => item.id === id);
  if (!report) return;
  document.querySelector("#relato-id").value = report.id;
  document.querySelector("#tipo").value = report.tipo;
  document.querySelector("#bairro").value = report.bairro;
  document.querySelector("#local").value = report.local;
  document.querySelector("#observado-em").value = report.observadoEm;
  document.querySelector("#descricao").value = report.descricao;
  document.querySelector("#fonte-url").value = report.fonteUrl;
  document.querySelector("#contador-descricao").textContent = report.descricao.length;
  document.querySelector("#btn-salvar").textContent = "Salvar alterações";
  document.querySelector("#btn-cancelar").classList.remove("d-none");
  document.querySelector("#form-titulo").textContent = "Editar informação";
  document.querySelector("#mensagem-formulario").textContent = "Atualize os campos e salve as alterações.";
  document.querySelector("#mensagem-formulario").className = "form-message";
  document.querySelector("#formulario-relato").scrollIntoView({ behavior: "smooth" });
  document.querySelector("#tipo").focus({ preventScroll: true });
}

// Remove um relato após confirmar a ação.
function removeReport(id) {
  const report = relatos.find((item) => item.id === id);
  if (!report || !window.confirm(`Remover o relato de ${report.bairro}, ${report.local}?`)) return;
  const nextReports = relatos.filter((item) => item.id !== id);
  if (!saveStorage(STORAGE_KEY, nextReports)) return;
  relatos = nextReports;
  const activitySaved = addActivity("Informação removida", `${report.tipo} · ${report.bairro}`);
  renderReports();
  showMessage(activitySaved ? "A informação foi removida desta sessão." : "A informação foi removida, mas o histórico não pôde ser atualizado.", activitySaved ? "success" : "error");
}

// Configura os botões de tamanho do texto.
function setupFontControls() {
  let scale = 1;
  try { scale = Number(sessionStorage.getItem(FONT_KEY)) || 1; } catch (error) {
    storageLoadFailed = true;
    console.error("Preferência de texto não pôde ser lida.", error);
  }
  // Aplica e salva o tamanho atual do texto.
  function applyScale() {
    scale = Math.min(1.25, Math.max(.9, scale));
    document.documentElement.style.setProperty("--scale", scale);
    try { sessionStorage.setItem(FONT_KEY, String(scale)); } catch (error) {
      storageLoadFailed = true;
      console.error("Preferência de texto não pôde ser guardada.", error);
    }
  }
  document.querySelectorAll("[data-font]").forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.font === "up") scale += .1;
    if (button.dataset.font === "down") scale -= .1;
    if (button.dataset.font === "reset") scale = 1;
    applyScale();
  }));
  applyScale();
}

// Configura o tema claro ou escuro.
function setupTheme() {
  const button = document.querySelector("#btn-tema");
  if (!button) return;
  let dark = false;
  try { dark = sessionStorage.getItem(THEME_KEY) === "true"; } catch (error) {
    storageLoadFailed = true;
    console.error("Preferência de tema não pôde ser lida.", error);
  }
  // Aplica o tema atual e atualiza o botão.
  function applyTheme() {
    document.body.classList.toggle("dark-theme", dark);
    button.setAttribute("aria-pressed", String(dark));
    button.querySelector("span").textContent = dark ? "Ativar tema claro" : "Ativar tema escuro";
  }
  button.addEventListener("click", () => {
    dark = !dark;
    try { sessionStorage.setItem(THEME_KEY, String(dark)); } catch (error) {
      storageLoadFailed = true;
      console.error("Preferência de tema não pôde ser guardada.", error);
    }
    applyTheme();
  });
  applyTheme();
}

// Inicializa a página e seus eventos.
function setupPage() {
  renderReports();
  renderActivities();
  setupFontControls();
  setupTheme();
  if (storageLoadFailed) {
    const message = document.createElement("p");
    message.className = "storage-error container";
    message.setAttribute("role", "alert");
    message.textContent = "Não foi possível carregar os dados. Tente novamente.";
    document.querySelector("main")?.prepend(message);
  }
  const form = document.querySelector("#form-relato");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
    form.querySelectorAll("input, select, textarea").forEach((field) => field.addEventListener("input", () => field.setCustomValidity("")));
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.querySelector("#observado-em").max = now.toISOString().slice(0, 16);
    document.querySelector("#descricao").addEventListener("input", (event) => {
      document.querySelector("#contador-descricao").textContent = event.currentTarget.value.length;
    });
    document.querySelector("#btn-cancelar").addEventListener("click", () => {
      resetForm();
      showMessage("Edição cancelada.", "");
    });
    document.querySelector("#lista-relatos").addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-edit]");
      const removeButton = event.target.closest("[data-remove]");
      if (editButton) startEdit(editButton.dataset.edit);
      if (removeButton) removeReport(removeButton.dataset.remove);
    });
    document.querySelector("#filtro-bairro").addEventListener("input", renderReports);
    document.querySelector("#filtro-tipo").addEventListener("change", renderReports);
  }
}

document.addEventListener("DOMContentLoaded", setupPage);
