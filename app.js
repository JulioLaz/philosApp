/* ===============================
   PhilosoApp · app.js
   =============================== */

// ---------- Estado y utilidades ----------
const state = {
  unit: "I",
  totalScore: 0,
  gamesCompleted: 0,
  achievements: 0,
  portfolio: [], // entradas con: {date, unit, module, data}
  current: { module: null, timer: null, timeLeft: 0 },
};

// Persistencia
const STORAGE_KEY = "philosoapp_state_v1";
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
    updateStats();
  } catch {}
}

// UI helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
function toast(msg){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}
function achievement(text){
  const tray = $("#achievementsTray");
  const div = document.createElement("div");
  div.className = "achievement";
  div.textContent = "🏆 " + text;
  tray.appendChild(div);
  setTimeout(() => div.remove(), 2600);
  state.achievements++;
  updateStats(); save();
}
function addScore(points){
  state.totalScore += points;
  updateStats(); save();
}
function updateStats(){
  $("#totalScore").textContent = state.totalScore;
  $("#gamesCompleted").textContent = state.gamesCompleted;
  $("#achievementsCount").textContent = state.achievements;
}
function showScreen(id){
  $$(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
}

// Timers
function startTimer(seconds, onTick, onEnd){
  stopTimer();
  state.current.timeLeft = seconds;
  const el = $("#moduleTimer");
  const tick = () => {
    const mm = String(Math.floor(state.current.timeLeft/60)).padStart(2,"0");
    const ss = String(state.current.timeLeft%60).padStart(2,"0");
    el.textContent = `${mm}:${ss}`;
    el.classList.toggle("warning", state.current.timeLeft<=10);
    if (onTick) onTick(state.current.timeLeft);
    state.current.timeLeft--;
    if (state.current.timeLeft < 0){
      stopTimer();
      if (onEnd) onEnd();
    }
  };
  tick();
  state.current.timer = setInterval(tick, 1000);
}
function stopTimer(){
  if (state.current.timer){ clearInterval(state.current.timer); state.current.timer = null; }
  $("#moduleTimer").classList.remove("warning");
}

// Export/Import portafolio
$("#exportBtn").addEventListener("click", () => {
  const data = {
    meta: { app:"PhilosoApp", version:"1.0", exportedAt: new Date().toISOString() },
    state: { totalScore: state.totalScore, gamesCompleted: state.gamesCompleted, achievements: state.achievements },
    portfolio: state.portfolio
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "philosoapp_portafolio.json"; a.click();
  URL.revokeObjectURL(url);
});
$("#importInput").addEventListener("change", async (e) => {
  const f = e.target.files?.[0]; if(!f) return;
  try {
    const text = await f.text();
    const json = JSON.parse(text);
    if (Array.isArray(json.portfolio)) state.portfolio = json.portfolio;
    if (json.state){
      state.totalScore = json.state.totalScore ?? state.totalScore;
      state.gamesCompleted = json.state.gamesCompleted ?? state.gamesCompleted;
      state.achievements = json.state.achievements ?? state.achievements;
    }
    updateStats(); save();
    toast("Portafolio importado ✅");
  } catch {
    toast("Archivo inválido ❌");
  } finally {
    e.target.value = "";
  }
});

// ---------- Contenidos (resumenes por punto del plan) ----------
const content = {
  I: {
    objective: "Comprender qué es la filosofía y reconocer su vigencia (arte, medios, IA).",
    readings: [
      { id:"I-1.1", title:"Etimología y origen de 'filosofía'",
        text:"Filosofía proviene de philo (amor) y sophia (sabiduría). Desde Pitágoras, su sentido es buscar con rigor y humildad. No es acumular datos, sino examinar críticamente las creencias.",
        warmups:["¿Qué diferencia hay entre 'saber algo' y 'amar saber'?", "Un ejemplo de hoy donde 'buscar razones' cambie una opinión."],
      },
      { id:"I-1.2", title:"Estética: ¿Qué hace bello algo?",
        text:"La estética estudia el arte y la belleza. ¿Es armonía y proporción (clásicos)? ¿O depende de la cultura y el observador? Las redes amplifican gustos y tendencias.",
        warmups:["Nombrá algo que te parece bello y por qué.", "¿Las redes hacen que veamos la belleza de manera distinta?"],
      },
      { id:"I-1.3", title:"Sócrates y la vida examinada",
        text:"Sócrates ponía preguntas para clarificar ideas. Su 'sólo sé que no sé nada' no es ignorancia, sino inicio del pensamiento: reconocer límites para avanzar.",
        warmups:["¿Qué pregunta socrática harías sobre 'éxito'?", "¿Una creencia tuya que cambiaste tras dialogar?"],
      },
      { id:"I-1.4", title:"Platón: caverna y educación",
        text:"La caverna simboliza confundir sombras con realidad. Educar es girar hacia la luz, incluso si al principio molesta. Hoy, ¿cuáles son nuestras cavernas?",
        warmups:["Ejemplo de 'sombra' informativa actual.", "¿Qué incomoda de 'salir' de esa caverna?"],
      },
      { id:"I-1.5", title:"Aristóteles: eudaimonía y virtud",
        text:"La felicidad (eudaimonía) es vivir bien y obrar bien. La virtud es hábito: punto medio entre extremos (valentía entre temeridad y cobardía).",
        warmups:["¿Qué hábito te acerca a tu mejor versión?", "Un 'justo medio' en tu vida."],
      },
      { id:"I-1.6", title:"Asombro, duda y límites",
        text:"El asombro despierta preguntas; la duda ordena el pensar. Las situaciones límite (enfermedad, injusticia) obligan a reconsiderar lo importante.",
        warmups:["Algo que te asombre hoy.", "¿Cuándo la duda te ayudó?"],
      },
      { id:"I-1.7", title:"Medios y redes: verdad/apariencia",
        text:"Los medios construyen narrativas. Criterios: evidencia, fuentes, contexto. Evitar eco-cámaras y sesgos de confirmación es tarea filosófica diaria.",
        warmups:["Un criterio tuyo para distinguir info confiable.", "¿Qué es una burbuja informativa?"],
      },
      { id:"I-1.8", title:"IA y filosofía",
        text:"La IA plantea preguntas sobre conocimiento, sesgo, responsabilidad y autonomía. El desafío: integrar datos con juicio humano, evitando deshumanizar decisiones.",
        warmups:["¿Qué decisión no delegarías a una IA?", "Un posible sesgo algorítmico y cómo mitigarlo."],
      },
    ],
    socraticTopics: [
      { prompt:"¿Qué es la justicia hoy en redes sociales?",
        counter:"¿La regla de la mayoría siempre es justa? ¿Y si la mayoría desinforma?",
        seedRefs:["Sócrates (diálogo), Aristóteles (justo medio), Platón (ideas/verdad)"]
      },
      { prompt:"¿La belleza es objetiva o cultural?",
        counter:"Si todo es relativo, ¿por qué discutimos sobre arte? ¿Hay criterios compartidos?",
        seedRefs:["Estética clásica, relativismo cultural"]
      }
    ],
    quiz: [
      { q:"'Filosofía' significa…", options:["Amor a la sabiduría","Estudio de datos","Arte de debatir","Fe inquebrantable"], a:0,
        hint:"Etimología griega: philo + sophia.", readId:"I-1.1" },
      { q:"Para Platón, 'la caverna' representa…", options:["El Hades","La democracia", "La confusión entre sombras y realidad","Un mito sobre héroes"], a:2,
        hint:"Educación como giro hacia la luz.", readId:"I-1.4" },
    ],
    stories: [
      {
        id:"I-Caverna2025",
        title:"Salir de la Caverna (2025)",
        nodes:{
          start:{ text:"Ves un video viral con afirmaciones impactantes. Tenés 2 opciones:", choices:[
            {label:"Compartir ya", goto:"share"},
            {label:"Verificar fuentes", goto:"check"}
          ]},
          share:{ text:"Tus amigos lo comparten, pero aparece un desmentido. Consecuencia: perdiste confianza. ¿Ahora qué?",
            choices:[{label:"Rectificar públicamente", goto:"rectify"}, {label:"Ignorar y seguir", goto:"ignore"}]},
          check:{ text:"Encontraste datos inconsistentes. Aprendiste a usar verificadores. ¿Publicar con contexto?",
            choices:[{label:"Publicar con contexto", goto:"context"}, {label:"No publicar", goto:"nopost"}]},
          rectify:{ text:"Ganás credibilidad por reconocer el error (virtud).", end:true },
          ignore:{ text:"Refuerzo de sombras (caverna). Aprendizaje: salir duele, pero vale.", end:true },
          context:{ text:"Aportás luz a tu comunidad. Educar es girar hacia lo real.", end:true },
          nopost:{ text:"Prudencia aristotélica. No todo merece difusión.", end:true }
        }
      }
    ],
    cards: [
      { term:"Asombro", back:"Origen del filosofar: admiración ante el mundo." },
      { term:"Duda", back:"Método para clarificar creencias y evidencias." },
      { term:"Eudaimonía", back:"Felicidad como vida lograda (Aristóteles)." },
      { term:"Caverna", back:"Metáfora de confundir apariencia con verdad (Platón)." },
      { term:"Mayéutica", back:"Arte de parir ideas mediante preguntas (Sócrates)." },
      { term:"Estética", back:"Filosofía del arte y la belleza." }
    ],
    dilemmas: [
      {
        id:"I-IA-Doc",
        scenario:"Una IA corrige exámenes más rápido que docentes, pero muestra sesgos en ciertos grupos.",
        layerA:["Seguir usándola","Desactivarla","Usarla solo como apoyo","Corregir sesgos y auditar"],
        layerB: "Marcos: Utilitarismo (resultado), Kant (dignidad), Ética del cuidado (relación), Pragmatismo (efectos).",
        map:["utilitarismo","deontología","cuidado","pragmatismo"]
      }
    ]
  },

  II: {
    objective: "Explorar concepciones del ser humano: técnica, símbolo, libertad y finitud.",
    readings: [
      { id:"II-2.1", title:"El humano como problema",
        text:"Nos interpretamos a nosotros mismos: no solo somos, sino que nos preguntamos qué somos.",
        warmups:["Definite en 5 palabras.", "¿Qué no cambia en vos cuando todo cambia?"]},
      { id:"II-2.5", title:"Marx: alienación",
        text:"Alienación: quedar separado del sentido de la propia actividad (trabajo como mercancía). Superarla exige praxis transformadora.",
        warmups:["Un ejemplo actual de alienación.", "¿Qué te devuelve sentido?"]},
      { id:"II-2.6", title:"Nietzsche: superhombre",
        text:"Transvaloración: crear valores propios. Crítica a la moral del rebaño.",
        warmups:["¿En qué te gustaría ‘crear’ tus valores?", "Un riesgo de malentender ‘superhombre’."]},
      { id:"II-2.10", title:"Cassirer: animal simbólico",
        text:"Vivimos en redes de símbolos (lenguaje, mito, ciencia). Interpretar símbolos es vivir humanamente.",
        warmups:["Tu símbolo favorito y por qué.", "Redes sociales como ecosistema simbólico."]},
      { id:"II-2.11", title:"Sartre: libertad y responsabilidad",
        text:"Estamos condenados a ser libres: elegir siempre, incluso no elegir. Responsabilidad por nuestros actos.",
        warmups:["Una elección difícil y su porqué.", "¿Qué te hace libre hoy?"]},
      { id:"II-2.8", title:"Maliandi: animal técnico",
        text:"La técnica es ambivalente: potencia y riesgo. Requiere ética y prudencia.",
        warmups:["Un beneficio y un riesgo de una tech actual.", "¿Qué regla pondrías para usarla mejor?"]},
      { id:"II-2.9", title:"Savater: ser mortal",
        text:"Aprender a vivir es aprender a morir: finitud que da urgencia y sentido.",
        warmups:["¿Qué harías distinto si recordaras más tu finitud?", "Una práctica que te humaniza."]},
      { id:"II-2.3", title:"Platón y Aristóteles: cuerpo y alma",
        text:"Platón (dualismo) vs Aristóteles (hilemorfismo: forma-materia).",
        warmups:["¿Somos cuerpo+alma o unidad?", "Un ejemplo de integración cuerpo-mente."]},
      { id:"II-2.7", title:"Descartes: duda existencial",
        text:"Dudo, luego pienso; pienso, luego existo: búsqueda de certeza.",
        warmups:["Algo ‘indudable’ para vos.", "¿Dónde la duda te ayudó a ser más libre?"]},
      { id:"II-2.4", title:"Concepciones tradicionales del hombre",
        text:"De lo clásico a lo contemporáneo: múltiples visiones en diálogo.",
        warmups:["¿Qué visión sentís cercana?", "Una tensión entre visiones."]},
      { id:"II-2.2", title:"Vida, convivencia y muerte",
        text:"La convivencia exige reglas y cuidado; la muerte encuadra el sentido.",
        warmups:["Una regla justa para convivir mejor.", "Un rito que nos humaniza."]},
    ],
    socraticTopics: [
      { prompt:"¿Hay una ‘esencia’ humana o nos vamos haciendo?",
        counter:"Si todo es construcción, ¿cómo defendés derechos ‘humanos’ universales?",
        seedRefs:["Sartre, Cassirer, Marx"]},
      { prompt:"¿La técnica nos libera o nos aliena?",
        counter:"¿De qué depende? ¿Qué criterios éticos aplicás?",
        seedRefs:["Maliandi, Marx"]},
    ],
    quiz: [
      { q:"Para Cassirer, el ser humano es…", options:["Animal técnico","Animal simbólico","Animal racional","Animal político"], a:1,
        hint:"Símbolo: lenguaje, mito, ciencia.", readId:"II-2.10" },
      { q:"Sartre destaca la…", options:["Determinación biológica","Falta de libertad","Libertad y responsabilidad","Fe como certeza"], a:2,
        hint:"Condenados a ser libres.", readId:"II-2.11" },
    ],
    stories: [
      {
        id:"II-TecnicaSentido",
        title:"Tecnología y sentido",
        nodes:{
          start:{ text:"Tu escuela adopta vigilancia por cámaras con IA. ¿Qué hacés?",
            choices:[{label:"Apoyar por seguridad", goto:"pro"},{label:"Cuestionar por privacidad", goto:"contra"}]},
          pro:{ text:"Se reducen conflictos, pero aparecen falsos positivos. ¿Proponés auditoría ética?", choices:[
            {label:"Sí, auditoría y transparencia", goto:"audit"},
            {label:"No, confío en el sistema", goto:"trust"}]},
          contra:{ text:"Lográs abrir debate: derechos vs seguridad. ¿Proponés alternativa?",
            choices:[{label:"Política clara de datos", goto:"policy"},{label:"Rechazo total", goto:"reject"}]},
          audit:{ text:"Criterio técnico + ético (Maliandi).", end:true },
          trust:{ text:"Riesgo de alienación por delegar juicio.", end:true },
          policy:{ text:"Enfoque simbólico y normativo (Cassirer + convivencia).", end:true },
          reject:{ text:"Pierde matices y mejoras posibles.", end:true }
        }
      }
    ],
    cards: [
      { term:"Alienación (Marx)", back:"Separación del sentido del trabajo o producto." },
      { term:"Superhombre (Nietzsche)", back:"Crear valores propios, no rebaño." },
      { term:"Animal simbólico (Cassirer)", back:"Vivimos en redes de símbolos." },
      { term:"Libertad (Sartre)", back:"Elegir siempre implica responsabilidad." },
      { term:"Animal técnico (Maliandi)", back:"Técnica ambivalente: potencia y riesgo." },
      { term:"Hilemorfismo", back:"Unidad forma-materia (Aristóteles)." },
    ],
    dilemmas: [
      {
        id:"II-Genes",
        scenario:"Editar genes para ‘mejorar’ capacidades humanas.",
        layerA:["Sí, si reduce sufrimiento","No, viola dignidad","Depende: casos y límites","Solo terapéutico, no ‘mejora’"],
        layerB:"Marcos: Utilitarismo (reducir sufrimiento), Kant (dignidad), Ética del cuidado (relaciones), Prudencia/virtudes (Aristóteles).",
        map:["utilitarismo","deontología","cuidado","virtudes"]
      }
    ]
  },

  III: {
    objective: "Aplicar marcos éticos (virtudes, utilitarismo, deber, pragmatismo, cuidado) a casos reales e IA.",
    readings: [
      { id:"III-3.1", title:"Problemas éticos",
        text:"Dilemas reales requieren evaluar hechos, principios y consecuencias.",
        warmups:["Un dilema que te importe.", "¿Qué datos faltan antes de decidir?"]},
      { id:"III-3.2", title:"Ética y moral",
        text:"Moral: normas y costumbres. Ética: reflexión crítica sobre ellas.",
        warmups:["Norma que cuestionás y por qué.", "Un criterio ético personal."]},
      { id:"III-3.3", title:"Aristóteles: virtud y felicidad",
        text:"Lo bueno es vivir bien practicando virtudes, hallando el justo medio.",
        warmups:["Una virtud que entrenás.", "Un exceso que evitás."]},
      { id:"III-3.4", title:"Hedonismo",
        text:"Placer como fin: ¿siempre deseable? ¿Todos los placeres valen igual?",
        warmups:["Un placer valioso y uno vacío.", "Criterio para distinguirlos."]},
      { id:"III-3.5", title:"Utilitarismo (Mill)",
        text:"Lo bueno es lo útil: mayor felicidad para el mayor número, con calidad de placeres.",
        warmups:["Un caso donde el total importa.", "Riesgo del cálculo utilitarista."]},
      { id:"III-3.6", title:"Pragmatismo",
        text:"Verdad por efectos prácticos: funciona = verdadero (con límites).",
        warmups:["Algo ‘verdadero’ porque funciona.", "Un límite del ‘funciona’."]},
      { id:"III-3.7", title:"Kant: deber",
        text:"Actuar por deber y universalizar la máxima; dignidad humana, no usar como medio.",
        warmups:["Una regla que universalizarías.", "Un caso donde el fin no justifica medios."]},
      { id:"III-3.8", title:"Antropocentrismo",
        text:"Centrar la ética en el humano: ¿y el ambiente? ¿los animales? ¿la IA?",
        warmups:["Una regla para no-humanos.", "¿Quién cuenta en el ‘cálculo moral’?"]},
      { id:"III-3.9", title:"IA: responsabilidad",
        text:"Explicabilidad, sesgo, accountability: decisiones híbridas humano-máquina.",
        warmups:["Qué exigirías a una IA ‘ética’.", "Un caso donde no usarías IA."]},
    ],
    socraticTopics: [
      { prompt:"¿Los fines justifican los medios en IA educativa?",
        counter:"Si violamos dignidad, ¿vale el ‘beneficio’?",
        seedRefs:["Kant, utilitarismo, cuidado"]},
    ],
    quiz: [
      { q:"Para Kant, lo moralmente bueno es…", options:["Lo que produce placer","Lo que es útil","Lo que se hace por deber","Lo que funciona"], a:2,
        hint:"Deber y universalización de la máxima.", readId:"III-3.7" },
      { q:"Mill propone que lo bueno es…", options:["La felicidad del mayor número","El deber","El justo medio","La fe"], a:0,
        hint:"Utilidad/placer cualitativo.", readId:"III-3.5" },
    ],
    stories: [
      {
        id:"III-IA-Califica",
        title:"¿IA que califica tareas?",
        nodes:{
          start:{ text:"Una IA corrige composiciones. Ahorra tiempo, pero erra con dialectos.",
            choices:[{label:"Usarla con revisión humana", goto:"hybrid"},{label:"Prohibirla", goto:"ban"}]},
          hybrid:{ text:"Responsabilidad compartida (pragmatismo + dignidad).", end:true },
          ban:{ text:"Pierde eficiencia; quizá alternativa mejorable.", end:true }
        }
      }
    ],
    cards: [
      { term:"Virtud", back:"Disposición adquirida a obrar bien (Aristóteles)." },
      { term:"Utilidad", back:"Lo que maximiza felicidad total (Mill)." },
      { term:"Deber", back:"Actuar por respeto a la ley moral (Kant)." },
      { term:"Pragmatismo", back:"Verdad por efectos prácticos (con evaluación)." },
      { term:"Cuidado", back:"Relaciones y contextos importan." },
      { term:"Antropocentrismo", back:"Centrar lo moral en humanos (en debate)." },
    ],
    dilemmas: [
      {
        id:"III-Trolley",
        scenario:"Tren sin frenos: desviar y causar 1 muerte para salvar 5.",
        layerA:["Desviar","No intervenir","Buscar alternativa","Parálisis"],
        layerB:"Marcos: Utilitarismo (total), Deontología (no matar), Cuidado (relación), Virtudes (prudencia).",
        map:["utilitarismo","deontología","cuidado","virtudes"]
      }
    ]
  }
};

// ---------- Navegación básica ----------
$("#unitSelect").addEventListener("change", (e)=>{
  state.unit = e.target.value;
  save();
  toast(`Unidad ${state.unit} seleccionada`);
});

$("#backBtn").addEventListener("click", ()=>{
  stopTimer();
  showScreen("#mainScreen");
  state.current.module = null;
});

// Menú
$$(".game-card").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const mod = btn.getAttribute("data-game");
    launchModule(mod);
  });
});

// ---------- Lanzador de módulos ----------
function launchModule(name){
  stopTimer();
  state.current.module = name;
  const unit = content[state.unit];

  const titleMap = {
    reading: "Lectura & Reflexión",
    socratic: "Debate Socrático",
    dilemmas: "Dilemas Éticos",
    stories: "Historias Ramificadas",
    cards: "Cartas de Conceptos",
    quiz: "Quiz con Pistas",
  };

  $("#moduleTitle").textContent = `${titleMap[name]} • Unidad ${state.unit}`;
  $("#moduleObjective").textContent = unit.objective;
  $("#moduleBody").innerHTML = "";
  $("#moduleFooter").innerHTML = "";
  showScreen("#moduleScreen");

  const map = {
    reading: moduleReading,
    socratic: moduleSocratic,
    dilemmas: moduleDilemmas,
    stories: moduleStories,
    cards: moduleCards,
    quiz: moduleQuiz
  };
  map[name](unit);
}

// ---------- Módulos ----------

// 1) Lectura & Reflexión (2–3 min)
function moduleReading(unit){
  const entry = pick(unit.readings);
  const body = $("#moduleBody");
  body.innerHTML = `
    <h3>${entry.title}</h3>
    <div class="progress" aria-hidden="true"><span id="progressBar" style="width:0%"></span></div>
    <p>${entry.text}</p>
    <p class="inline-note"><strong>Antes de responder:</strong> marcá 3 ideas clave y dejá 1 pregunta abierta.</p>
    <div class="controls">
      <input aria-label="Idea 1" class="input" placeholder="Idea clave 1">
      <input aria-label="Idea 2" class="input" placeholder="Idea clave 2">
      <input aria-label="Idea 3" class="input" placeholder="Idea clave 3">
      <textarea aria-label="Pregunta abierta" placeholder="Mi pregunta sobre el texto"></textarea>
    </div>
  `;
  const footer = $("#moduleFooter");
  const btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = "Guardar reflexión";
  btn.addEventListener("click", ()=>{
    addScore(60);
    state.gamesCompleted++;
    achievement("Lectura completada");
    state.portfolio.push({
      date: new Date().toISOString(),
      unit: state.unit,
      module:"reading",
      data:{ id:entry.id, title:entry.title }
    });
    save();
    toast("Reflexión guardada ✅");
  });
  footer.appendChild(btn);

  startTimer(3*60, (t)=>{
    const done = Math.min(100, Math.round(((3*60 - t)/(3*60))*100));
    $("#progressBar").style.width = done + "%";
  }, ()=>{
    toast("Tiempo de lectura finalizado ⏳");
  });
}

// 2) Debate Socrático (6–8 min)
function moduleSocratic(unit){
  const topic = pick(unit.socraticTopics);
  const body = $("#moduleBody");
  body.innerHTML = `
    <h3>Pregunta guía</h3>
    <p><strong>${topic.prompt}</strong></p>

    <h4>Hipótesis inicial</h4>
    <textarea id="hypothesis" class="input" placeholder="Escribí tu postura inicial (2-3 frases)"></textarea>

    <h4>Preguntas socráticas</h4>
    <ol>
      <li><em>Clarificar:</em> ¿Qué entendés por los términos clave?</li>
      <li><em>Evidencias:</em> ¿Qué ejemplos o datos sostienen tu idea?</li>
      <li><em>Contraejemplos:</em> ¿Hay casos donde tu postura falle?</li>
      <li><em>Consecuencias:</em> Si esto fuera verdad, ¿qué seguiría?</li>
    </ol>

    <div class="controls" style="margin-top:8px;">
      <textarea id="answers" class="input" placeholder="Respondé brevemente a las 4 preguntas"></textarea>
    </div>

    <h4>Objeción</h4>
    <p class="inline-note">Socrates: ${topic.counter}</p>

    <h4>Revisión de postura</h4>
    <textarea id="revision" class="input" placeholder="¿Cambiás algo? ¿Por qué?"></textarea>

    <p class="inline-note">Citas/semillas: ${topic.seedRefs.join(" · ")}</p>
  `;
  const footer = $("#moduleFooter");
  const btn = document.createElement("button");
  btn.className="btn";
  btn.textContent="Registrar debate";
  btn.addEventListener("click", ()=>{
    const changed = ($("#revision").value.trim().length > 0);
    addScore(changed?120:90);
    if (changed) achievement("Cambio razonado");
    state.gamesCompleted++;
    state.portfolio.push({
      date:new Date().toISOString(), unit: state.unit, module:"socratic",
      data:{ prompt: topic.prompt, changed }
    });
    save(); toast("Debate registrado ✅");
  });
  footer.appendChild(btn);

  startTimer(8*60, null, ()=> toast("Tiempo de debate finalizado ⏳"));
}

// 3) Dilemas Éticos (capas) ~7 min
function moduleDilemmas(unit){
  const d = pick(unit.dilemmas);
  const body = $("#moduleBody");
  body.innerHTML = `
    <h3>Dilema</h3>
    <p><strong>${d.scenario}</strong></p>
    <div class="progress" aria-hidden="true"><span id="progressBar" style="width:0%"></span></div>

    <h4>Capa A · Decisión inmediata</h4>
    <div id="layerA" class="controls"></div>

    <div id="layerB" style="display:none; margin-top:12px;">
      <h4>Capa B · Relectura guiada</h4>
      <p>${d.layerB}</p>
      <button class="btn-secondary" id="toLayerC">Continuar</button>
    </div>

    <div id="layerC" style="display:none; margin-top:12px;">
      <h4>Capa C · Re-decisión y justificación</h4>
      <p>Volvé a decidir (podés cambiar) y justificá en 2–3 frases.</p>
      <div class="controls">
        <select id="finalChoice"></select>
        <textarea id="finalWhy" class="input" placeholder="Mi justificación…"></textarea>
      </div>
      <p class="inline-note">Mapa de corrientes sugerido: ${d.map.join(" · ")}</p>
    </div>
  `;

  // Capa A
  const a = $("#layerA");
  d.layerA.forEach((opt, i)=>{
    const b = document.createElement("button");
    b.className="btn-secondary";
    b.textContent = opt;
    b.addEventListener("click", ()=>{
      a.querySelectorAll("button").forEach(x=>x.disabled=true);
      a.dataset.choice = i;
      $("#layerB").style.display="block";
      addScore(20);
    });
    a.appendChild(b);
  });

  // Capa B -> C
  $("#toLayerC").addEventListener("click", ()=>{
    const sel = $("#finalChoice");
    sel.innerHTML = "";
    d.layerA.forEach((opt, i)=>{
      const o = document.createElement("option");
      o.value = i; o.textContent = opt; sel.appendChild(o);
    });
    $("#layerC").style.display="block";
    addScore(20);
  });

  // Footer guardar
  const footer = $("#moduleFooter");
  const saveBtn = document.createElement("button");
  saveBtn.className="btn";
  saveBtn.textContent="Guardar dilema";
  saveBtn.addEventListener("click", ()=>{
    const first = Number(a.dataset.choice ?? -1);
    const final = Number($("#finalChoice").value ?? -1);
    const why = $("#finalWhy").value.trim();
    const changed = (first !== final);

    addScore(changed?120:90);
    if (changed) achievement("Apertura crítica");

    state.gamesCompleted++;
    state.portfolio.push({
      date:new Date().toISOString(), unit: state.unit, module:"dilemmas",
      data:{ id:d.id, first, final, changed, why }
    });
    save(); toast("Dilema guardado ✅");
  });
  footer.appendChild(saveBtn);

  startTimer(7*60, (t)=>{
    const done = Math.min(100, Math.round(((7*60 - t)/(7*60))*100));
    $("#progressBar").style.width = done + "%";
  }, ()=> toast("Tiempo del dilema finalizado ⏳"));
}

// 4) Historias Ramificadas (8–10 min)
function moduleStories(unit){
  const story = pick(unit.stories);
  const body = $("#moduleBody");
  let current = "start";
  const render = ()=>{
    const node = story.nodes[current];
    const html = `
      <h3>${story.title}</h3>
      <p>${node.text}</p>
      <div class="controls" id="choices"></div>
    `;
    body.innerHTML = html;
    const c = $("#choices");
    if (node.end){
      const done = document.createElement("button");
      done.className="btn";
      done.textContent="Registrar historia";
      done.addEventListener("click", ()=>{
        addScore(100);
        state.gamesCompleted++;
        achievement("Historia completada");
        state.portfolio.push({
          date:new Date().toISOString(), unit: state.unit, module:"stories",
          data:{ id: story.id, end: current }
        });
        save(); toast("Ruta registrada ✅");
      });
      c.appendChild(done);
      return;
    }
    node.choices.forEach(ch=>{
      const b = document.createElement("button");
      b.className="btn-secondary";
      b.textContent = ch.label;
      b.addEventListener("click", ()=>{ current = ch.goto; render(); addScore(15); });
      c.appendChild(b);
    });
  };
  render();
  startTimer(10*60, null, ()=> toast("Tiempo de historia finalizado ⏳"));
}

// 5) Cartas de Conceptos (3–5 min)
function moduleCards(unit){
  const sample = unit.cards.slice(0,6);
  const body = $("#moduleBody");
  const grid = document.createElement("div");
  grid.className="card-grid";

  sample.forEach(card=>{
    const wrap = document.createElement("div");
    wrap.className="flip-card"; wrap.tabIndex=0; wrap.setAttribute("role","button");
    wrap.setAttribute("aria-label", `Carta ${card.term}. Activar para ver explicación.`);
    wrap.addEventListener("click", ()=> wrap.classList.toggle("flipped"));
    wrap.addEventListener("keypress", (e)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); wrap.click(); }});
    wrap.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-face">
          <h4>${card.term}</h4>
          <p class="inline-note">Decí con tus palabras qué significa.</p>
        </div>
        <div class="flip-face flip-back">
          <strong>${card.term}</strong>
          <p>${card.back}</p>
        </div>
      </div>
    `;
    grid.appendChild(wrap);
  });

  body.innerHTML = `<h3>Cartas de conceptos</h3>
    <p class="inline-note">Consejo: explicá en voz alta antes de voltear.</p>`;
  body.appendChild(grid);

  const footer = $("#moduleFooter");
  const btn = document.createElement("button");
  btn.className="btn";
  btn.textContent="Registrar práctica";
  btn.addEventListener("click", ()=>{
    addScore(70); state.gamesCompleted++;
    state.portfolio.push({ date:new Date().toISOString(), unit: state.unit, module:"cards", data:{count: sample.length}});
    save(); toast("Práctica registrada ✅");
  });
  footer.appendChild(btn);

  startTimer(5*60, null, ()=> toast("Tiempo de cartas finalizado ⏳"));
}

// 6) Quiz con Pistas (6–8 min total; 90s por ítem)
function moduleQuiz(unit){
  const qs = unit.quiz.slice(); // copia
  let idx = 0, usedHint = false;
  const body = $("#moduleBody");
  const footer = $("#moduleFooter");

  function render(){
    if (idx >= qs.length){
      achievement("Quiz completado");
      state.gamesCompleted++; save();
      body.innerHTML = `<h3>¡Listo!</h3><p>Completaste el quiz de la Unidad ${state.unit}.</p>`;
      footer.innerHTML = "";
      return;
    }
    usedHint = false;
    const q = qs[idx];
    const reading = findReadingById(unit, q.readId);
    body.innerHTML = `
      <div class="progress" aria-hidden="true"><span id="progressBar" style="width:${Math.round((idx/qs.length)*100)}%"></span></div>
      <h3>Pregunta ${idx+1} de ${qs.length}</h3>
      <p><strong>${q.q}</strong></p>
      <div id="options" class="controls"></div>
      <button id="hintBtn" class="btn-secondary">Ver pista / leer antes</button>
      <div id="hintBox" class="module-body" style="display:none; margin-top:10px;">
        <h4>Pista</h4>
        <p>${q.hint}</p>
        ${reading ? `<h5>Lectura relacionada: ${reading.title}</h5><p>${reading.text}</p>` : ""}
      </div>
    `;
    const opts = $("#options");
    q.options.forEach((opt,i)=>{
      const b = document.createElement("button");
      b.className="btn-secondary";
      b.textContent = opt;
      b.addEventListener("click", ()=> answer(i));
      opts.appendChild(b);
    });
    $("#hintBtn").onclick = ()=>{
      $("#hintBox").style.display="block";
      usedHint = true;
    };

    // timer por pregunta
    startTimer(90, (t)=>{
      const done = Math.min(100, Math.round(((90 - t)/90)*100));
      $("#progressBar").style.width = done + "%";
    }, ()=> { answer(-1); });
  }

  function answer(i){
    stopTimer();
    const q = qs[idx];
    const ok = (i === q.a);
    addScore(ok ? (usedHint?40:70) : 10);
    if(ok && !usedHint) achievement("Respuesta precisa sin pista");
    toast(ok ? "¡Correcto!" : "Para revisar 🔁");

    idx++; render();
  }

  render();
}

// helpers
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)] }
function findReadingById(unit, id){ return unit.readings.find(r=>r.id===id); }

// ---------- Inicio ----------
document.addEventListener("DOMContentLoaded", ()=>{
  load();
  showScreen("#mainScreen");
  // Mensaje de bienvenida (una vez)
  if ((state.totalScore ?? 0) === 0){
    setTimeout(()=> toast("Bienvenido a PhilosoApp ✨"), 600);
  }
});
