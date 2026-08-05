/* ===========================================================
   Pixelmon · Lógica de la mascota virtual (Tamagotchi)
   -----------------------------------------------------------
   - Estadísticas que decaen con el tiempo real
   - Acciones: alimentar, jugar, dormir, limpiar, curar
   - Estados de humor, enfermedad, sueño y muerte
   - Persistencia en localStorage (incluye tiempo offline)
   - Sonidos simples con WebAudio (sin archivos externos)
   =========================================================== */

(() => {
  "use strict";

  const SAVE_KEY = "pixelmon_save_v1";

  // Velocidad de decaimiento por segundo (puntos/seg).
  // Ajusta estos valores para hacer la mascota más o menos exigente.
  const DECAY = {
    hunger: 0.9 / 60,   // ~0.9 por minuto
    happy:  0.7 / 60,
    energy: 0.5 / 60,
    clean:  0.4 / 60,
  };

  const TICK_MS = 1000;          // frecuencia del bucle principal
  const MAX = 100;
  const AGE_PER_DAY = 24 * 60 * 60 * 1000; // ms por "día" de vida

  // ---------- Estado ----------
  const defaultState = () => ({
    name: "Momo",
    born: Date.now(),
    last: Date.now(),
    hunger: 80,
    happy: 80,
    energy: 80,
    clean: 90,
    health: 100,
    sleeping: false,
    sick: false,
    dead: false,
    poop: 0,        // nivel de suciedad (0-3)
    muted: false,
  });

  let state = loadState();

  // ---------- Referencias DOM ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    device: $("device"),
    screen: $("screen"),
    stage: $("stage"),
    pet: $("pet"),
    petWrapper: $("petWrapper"),
    mouth: $("mouth"),
    prop: $("prop"),
    emote: $("emote"),
    weather: $("weather"),
    dirt: $("dirtLayer"),
    petName: $("petName"),
    petAge: $("petAge"),
    message: $("message"),
    barHunger: $("barHunger"),
    barHappy: $("barHappy"),
    barEnergy: $("barEnergy"),
    barClean: $("barClean"),
    barHealth: $("barHealth"),
    overlay: $("overlay"),
    overlayEmoji: $("overlayEmoji"),
    overlayTitle: $("overlayTitle"),
    overlaySub: $("overlaySub"),
  };

  const buttons = {
    feed:  $("btnFeed"),
    play:  $("btnPlay"),
    sleep: $("btnSleep"),
    clean: $("btnClean"),
    heal:  $("btnHeal"),
  };

  // ---------- Persistencia ----------
  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultState();
      const s = { ...defaultState(), ...JSON.parse(raw) };
      return s;
    } catch (e) {
      return defaultState();
    }
  }

  function save() {
    state.last = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ---------- Utilidades ----------
  const clamp = (v) => Math.max(0, Math.min(MAX, v));

  function ageInDays() {
    return Math.floor((Date.now() - state.born) / AGE_PER_DAY);
  }

  function lifeStage() {
    const d = ageInDays();
    if (d < 1) return "bebé";
    if (d < 4) return "niño";
    if (d < 10) return "joven";
    return "adulto";
  }

  // ---------- Sonido (WebAudio, sin archivos) ----------
  let audioCtx = null;
  function beep(freq = 440, dur = 0.12, type = "square", vol = 0.06) {
    if (state.muted) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g); g.connect(audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      o.stop(audioCtx.currentTime + dur);
    } catch (e) {}
  }
  const sfx = {
    eat:   () => { beep(520, .08); setTimeout(() => beep(660, .08), 90); },
    play:  () => { beep(660, .08); setTimeout(() => beep(880, .1), 90); },
    sleep: () => { beep(330, .2, "sine"); },
    clean: () => { beep(700, .06, "triangle"); setTimeout(() => beep(900, .06, "triangle"), 70); },
    heal:  () => { beep(600, .1, "sine"); setTimeout(() => beep(800, .12, "sine"), 110); },
    sad:   () => { beep(300, .18, "sawtooth"); },
    die:   () => { beep(400, .2, "sawtooth"); setTimeout(() => beep(200, .4, "sawtooth"), 200); },
  };

  // ---------- Simulación temporal ----------
  function applyElapsed() {
    const now = Date.now();
    let dt = (now - state.last) / 1000; // segundos
    if (dt < 0) dt = 0;
    // Tope: si estuvo mucho tiempo cerrado, simula como máximo 12h de decaimiento
    dt = Math.min(dt, 12 * 3600);
    state.last = now;

    if (state.dead) return;

    // Mientras duerme, recupera energía y el resto decae más lento
    if (state.sleeping) {
      state.energy = clamp(state.energy + (dt * (18 / 60)));
      state.hunger = clamp(state.hunger - DECAY.hunger * dt * 0.4);
      state.happy  = clamp(state.happy  - DECAY.happy  * dt * 0.3);
      state.clean  = clamp(state.clean  - DECAY.clean  * dt * 0.5);
      if (state.energy >= 100) wakeUp(true);
    } else {
      state.hunger = clamp(state.hunger - DECAY.hunger * dt);
      state.happy  = clamp(state.happy  - DECAY.happy  * dt);
      state.energy = clamp(state.energy - DECAY.energy * dt);
      state.clean  = clamp(state.clean  - DECAY.clean  * dt);
    }

    // Genera suciedad con el tiempo
    if (Math.random() < dt / 90 && state.poop < 3) {
      state.poop = Math.min(3, state.poop + 1);
    }

    updateHealth(dt);
  }

  function updateHealth(dt) {
    // La salud baja si hay necesidades críticas
    let danger = 0;
    if (state.hunger < 15) danger += 1.5;
    if (state.happy  < 15) danger += 0.8;
    if (state.energy < 10) danger += 0.6;
    if (state.clean  < 15) danger += 0.8;
    if (state.poop   >= 3) danger += 0.8;

    if (danger > 0) {
      state.health = clamp(state.health - danger * (dt / 60) * 2);
    } else if (state.hunger > 55 && state.happy > 55 && state.clean > 40) {
      // Se recupera lentamente si todo va bien
      state.health = clamp(state.health + (dt / 60) * 1.5);
    }

    // Puede enfermar
    state.sick = state.health < 40 || state.poop >= 3;

    if (state.health <= 0) die();
  }

  // ---------- Acciones ----------
  function guard() {
    return !state.dead;
  }

  function feed() {
    if (!guard() || state.sleeping) return nudgeSleeping();
    if (state.hunger >= 98) { flashMessage("¡Está lleno! 🤢"); showEmote("🤢"); return; }
    state.hunger = clamp(state.hunger + 28);
    state.happy  = clamp(state.happy + 4);
    state.clean  = clamp(state.clean - 3);
    showProp("food", "🍔");
    petClass("eating", 900);
    showEmote("😋");
    flashMessage("¡Ñam ñam! Gracias 🍔");
    sfx.eat();
    save(); render();
  }

  function play() {
    if (!guard() || state.sleeping) return nudgeSleeping();
    if (state.energy < 12) { flashMessage("Está muy cansado para jugar 😴"); showEmote("💤"); return; }
    state.happy  = clamp(state.happy + 26);
    state.energy = clamp(state.energy - 14);
    state.hunger = clamp(state.hunger - 8);
    showProp("ball", "🎾");
    petClass("playing", 1000);
    showEmote("🥳");
    flashMessage("¡Yupi! Me encanta jugar 🎾");
    sfx.play();
    save(); render();
  }

  function toggleSleep() {
    if (!guard()) return;
    if (state.sleeping) { wakeUp(false); return; }
    state.sleeping = true;
    showProp("zzz", "💤");
    showEmote("😴");
    flashMessage("Zzz… buenas noches 🌙");
    sfx.sleep();
    save(); render();
  }

  function wakeUp(auto) {
    state.sleeping = false;
    clearProp();
    if (auto) { flashMessage("¡Buenos días! Descansé genial ☀️"); showEmote("😃"); }
    else { flashMessage("Me despertaste 🥱"); showEmote("🥱"); }
    save(); render();
  }

  function clean() {
    if (!guard() || state.sleeping) return nudgeSleeping();
    if (state.clean >= 98 && state.poop === 0) { flashMessage("¡Ya está limpio! ✨"); showEmote("✨"); return; }
    state.clean = clamp(state.clean + 40);
    state.poop = 0;
    state.happy = clamp(state.happy + 6);
    showProp("bubble", "🫧");
    showEmote("✨");
    flashMessage("¡Qué limpio y fresco! 🧼");
    sfx.clean();
    save(); render();
  }

  function heal() {
    if (!guard()) return;
    if (!state.sick && state.health > 60) { flashMessage("¡Está sano! No necesita medicina 💚"); showEmote("💚"); return; }
    state.health = clamp(state.health + 45);
    state.sick = false;
    state.poop = 0;
    showProp("pill", "💊");
    showEmote("😌");
    flashMessage("La medicina ayudó. ¡Me siento mejor! 💊");
    sfx.heal();
    save(); render();
  }

  function nudgeSleeping() {
    flashMessage("Shhh… está durmiendo 😴 (pulsa 💤 para despertarlo)");
    showEmote("💤");
  }

  function die() {
    if (state.dead) return;
    state.dead = true;
    state.sleeping = false;
    sfx.die();
    save();
    render();
    setTimeout(showDeath, 700);
  }

  function showDeath() {
    el.overlayEmoji.textContent = "👼";
    el.overlayTitle.textContent = `${state.name} nos dejó…`;
    el.overlaySub.textContent = `Vivió ${ageInDays()} día(s) como ${lifeStage()}. Cuídalo mejor esta vez 💔`;
    el.overlay.classList.remove("hidden");
  }

  function restart() {
    const name = promptName();
    state = defaultState();
    state.name = name;
    el.overlay.classList.add("hidden");
    save();
    flashMessage(`¡Hola! Soy ${name} 🥚 Cuídame mucho`);
    render();
  }

  function promptName() {
    let name = "";
    try {
      name = (window.prompt("¿Cómo se llamará tu nueva mascota?", "Momo") || "").trim();
    } catch (e) {}
    if (!name) name = "Momo";
    return name.slice(0, 12);
  }

  function resetGame() {
    if (!window.confirm("¿Seguro que quieres reiniciar a tu mascota? Se perderá su progreso.")) return;
    localStorage.removeItem(SAVE_KEY);
    state = defaultState();
    state.name = promptName();
    el.overlay.classList.add("hidden");
    save();
    render();
    flashMessage(`¡Empezamos de nuevo con ${state.name}! 🐣`);
  }

  // ---------- Efectos visuales ----------
  let propTimer = null;
  function showProp(cls, emoji) {
    clearProp();
    el.prop.className = "prop " + cls;
    el.prop.textContent = emoji;
    if (cls === "zzz") return; // permanece mientras duerme
    propTimer = setTimeout(clearProp, 1100);
  }
  function clearProp() {
    if (propTimer) { clearTimeout(propTimer); propTimer = null; }
    el.prop.className = "prop";
    el.prop.textContent = "";
  }

  let emoteTimer = null;
  function showEmote(emoji) {
    el.emote.textContent = emoji;
    el.emote.classList.remove("show");
    // reflow para reiniciar animación
    void el.emote.offsetWidth;
    el.emote.classList.add("show");
    if (emoteTimer) clearTimeout(emoteTimer);
    emoteTimer = setTimeout(() => el.emote.classList.remove("show"), 1300);
  }

  function petClass(cls, ms) {
    el.pet.classList.add(cls);
    setTimeout(() => el.pet.classList.remove(cls), ms);
  }

  let msgTimer = null;
  function flashMessage(text) {
    el.message.textContent = text;
    if (msgTimer) clearTimeout(msgTimer);
    msgTimer = setTimeout(() => { el.message.textContent = ambientMessage(); }, 3500);
  }

  function ambientMessage() {
    if (state.dead) return "Adopta una nueva mascota 🥚";
    if (state.sleeping) return "Zzz… durmiendo 🌙";
    if (state.sick) return "No me siento bien… ¿me curas? 🤒";
    if (state.hunger < 20) return "Tengo mucha hambre… 🍔";
    if (state.clean < 20 || state.poop >= 2) return "Necesito un baño 🛁";
    if (state.energy < 20) return "Estoy agotado… 😴";
    if (state.happy < 20) return "Me aburro… ¿jugamos? 🎾";
    if (state.health > 80 && state.happy > 70) return "¡Estoy feliz contigo! 💖";
    return "¿Qué hacemos hoy? 😊";
  }

  // ---------- Render ----------
  function setBar(node, val) {
    node.style.width = clamp(val) + "%";
    node.classList.toggle("low", val < 20);
  }

  function moodClass() {
    if (state.dead) return "dead";
    if (state.sleeping) return "sleep";
    if (state.sick) return "sick";
    const avg = (state.hunger + state.happy + state.energy + state.clean) / 4;
    if (avg < 30 || state.happy < 25) return "sad";
    if (state.happy > 65 && state.health > 60) return "happy";
    return "";
  }

  function render() {
    // Barras
    setBar(el.barHunger, state.hunger);
    setBar(el.barHappy, state.happy);
    setBar(el.barEnergy, state.energy);
    setBar(el.barClean, state.clean);
    setBar(el.barHealth, state.health);

    // Info
    el.petName.textContent = state.name;
    el.petAge.textContent = `${ageInDays()}d · ${lifeStage()}`;

    // Humor de la mascota
    const mood = moodClass();
    el.pet.className = "pet" + (mood ? " " + mood : "");

    // Tamaño según etapa de vida
    const stage = lifeStage();
    const scale = stage === "bebé" ? 0.7 : stage === "niño" ? 0.85 : stage === "joven" ? 0.95 : 1;
    el.pet.style.transform = `translateX(-50%) scale(${scale})`;

    // Prop de dormir persistente
    if (state.sleeping && !state.dead) {
      if (!el.prop.classList.contains("zzz")) showProp("zzz", "💤");
    } else if (el.prop.classList.contains("zzz")) {
      clearProp();
    }

    // Suciedad (caca) visible
    renderDirt();

    // Modo noche por hora local
    const hour = new Date().getHours();
    const night = hour >= 20 || hour < 6;
    el.stage.classList.toggle("night", night || state.sleeping);
    renderStars(night || state.sleeping);

    // Botones
    buttons.heal.disabled = state.dead;
    buttons.feed.disabled = state.dead;
    buttons.play.disabled = state.dead;
    buttons.clean.disabled = state.dead;
    buttons.sleep.textContent = state.sleeping ? "☀️" : "💤";
    buttons.sleep.setAttribute("data-tip", state.sleeping ? "Despertar" : "Dormir");

    $("btnMute").textContent = state.muted ? "🔇" : "🔊";
  }

  function renderDirt() {
    if (state.dead || state.poop === 0) { el.dirt.style.opacity = "0"; el.dirt.textContent = ""; return; }
    // Dibuja "caquitas" con emoji posicionadas
    let html = "";
    const spots = [ [20, 82], [60, 88], [78, 80] ];
    for (let i = 0; i < state.poop; i++) {
      const [x, y] = spots[i];
      html += `<span style="position:absolute;left:${x}%;top:${y}%;font-size:14px;">💩</span>`;
    }
    el.dirt.innerHTML = html;
    el.dirt.style.opacity = "1";
  }

  let starsBuilt = false;
  function renderStars(show) {
    if (show && !starsBuilt) {
      let html = "";
      for (let i = 0; i < 14; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 55;
        const d = (Math.random() * 2).toFixed(1);
        html += `<span class="star" style="left:${x}%;top:${y}%;animation-delay:${d}s"></span>`;
      }
      el.weather.innerHTML = html;
      starsBuilt = true;
    } else if (!show && starsBuilt) {
      el.weather.innerHTML = "";
      starsBuilt = false;
    }
  }

  // ---------- Bucle principal ----------
  function tick() {
    applyElapsed();
    render();

    // Reacciones automáticas ocasionales
    if (!state.dead && !state.sleeping && Math.random() < 0.04) {
      if (state.hunger < 20) { showEmote("🍔"); }
      else if (state.happy < 20) { showEmote("😢"); sfx.sad(); }
      else if (state.sick) { showEmote("🤒"); }
      else if (state.happy > 70) { showEmote("💛"); }
    }
  }

  // Guarda al cerrar / cambiar de pestaña
  function handleVisibility() {
    if (document.hidden) save();
    else { applyElapsed(); render(); }
  }

  // ---------- Enlaces de eventos ----------
  buttons.feed.addEventListener("click", feed);
  buttons.play.addEventListener("click", play);
  buttons.sleep.addEventListener("click", toggleSleep);
  buttons.clean.addEventListener("click", clean);
  buttons.heal.addEventListener("click", heal);
  $("btnReset").addEventListener("click", resetGame);
  $("btnRestart").addEventListener("click", restart);
  $("btnMute").addEventListener("click", () => {
    state.muted = !state.muted;
    save(); render();
    if (!state.muted) beep(700, .08);
  });

  // Al tocar a la mascota, mímala
  el.petWrapper.addEventListener("click", () => {
    if (state.dead) return;
    if (state.sleeping) { nudgeSleeping(); return; }
    state.happy = clamp(state.happy + 4);
    showEmote(["💖", "😊", "🥰", "✨"][Math.floor(Math.random() * 4)]);
    petClass("playing", 500);
    beep(880, .05, "sine");
    save();
  });

  // Atajos de teclado
  document.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === "f") feed();
    else if (k === "p") play();
    else if (k === "s") toggleSleep();
    else if (k === "c") clean();
    else if (k === "h") heal();
  });

  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("beforeunload", save);

  // Respeta preferencia de movimiento reducido
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.body.classList.add("reduced-motion");
  }

  // ---------- Inicio ----------
  applyElapsed();
  render();
  if (state.dead) showDeath();
  el.message.textContent = ambientMessage();
  setInterval(tick, TICK_MS);
})();
