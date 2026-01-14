// Shared Game Logic for City Quiz (Multi-Instance Support)

// Liste norddeutscher Städte für Fuzzy-Suche
const northGermanCities = [
  "Bremen",
  "Hamburg",
  "Hannover",
  "Kiel",
  "Lübeck",
  "Rostock",
  "Schwerin",
  "Oldenburg",
  "Osnabrück",
  "Braunschweig",
  "Wolfsburg",
  "Flensburg",
  "Bremerhaven",
  "Neumünster",
  "Norderstedt",
  "Wismar",
  "Stralsund",
  "Greifswald",
  "Neubrandenburg",
  "Emden",
  "Lüneburg",
  "Celle",
  "Hildesheim",
  "Salzgitter",
  "Wilhelmshaven",
  "Delmenhorst",
  "Göttingen",
  "Aurich",
  "Stade",
  "Cuxhaven",
];

// Levenshtein Distanz Funktion
function levenshtein(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function findClosestCity(input) {
  input = input.toLowerCase();
  let closest = null;
  let minDist = Infinity;

  for (const city of northGermanCities) {
    const dist = levenshtein(input, city.toLowerCase());
    if (dist < minDist) {
      minDist = dist;
      closest = city;
    }
  }
  return { city: closest, dist: minDist };
}

function getSuggestions(input) {
  if (!input) return [];
  input = input.toLowerCase();

  return northGermanCities
    .map((city) => {
      const lowerCity = city.toLowerCase();
      let score = 0;
      if (lowerCity === input) score = 100;
      else if (lowerCity.startsWith(input)) score = 80;
      else if (lowerCity.includes(input)) score = 60;
      else {
        const dist = levenshtein(input, lowerCity);
        if (dist <= 3) score = 40 - dist;
        else score = 0;
      }
      return { city, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.city)
    .slice(0, 5);
}

class CityQuiz {
  constructor(containerId, solution, images) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.solution = solution;
    this.images = images;
    this.currentHintIndex = 0;
    this.solved = false;
    this.currentFocus = -1;

    // Create DOM structure
    this.render();

    // Bind elements
    this.imgElement = this.container.querySelector(".city-image");
    this.prevHintBtn = this.container.querySelector(".prev-hint-btn");
    this.nextHintBtn = this.container.querySelector(".next-hint-btn");
    this.hintStatusSpan = this.container.querySelector(".hint-status");
    this.feedbackElement = this.container.querySelector(".feedback");
    this.inputElement = this.container.querySelector(".guess-input");
    this.suggestionsList = this.container.querySelector(".suggestions-list");
    this.guessBtn = this.container.querySelector(".guess-btn");

    // Initialize state
    this.updateImage();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
            <div class="quiz-inner">
                <div class="image-container">
                    <img class="city-image" src="" alt="Stadt Nachtansicht Tipp" />
                    
                    <button class="nav-arrow prev-hint-btn" title="Vorheriger Tipp">
                        ❮
                    </button>
                    <button class="nav-arrow next-hint-btn" title="Nächster Tipp">
                        ❯
                    </button>
                </div>

                <div class="quiz-controls-container">
                    <div class="hint-counter">
                        <span class="hint-status"></span>
                    </div>

                    <div class="controls">
                        <div class="input-group">
                            <div class="input-wrapper">
                                <input
                                    type="text"
                                    class="guess-input"
                                    placeholder="Name der Stadt..."
                                    autocomplete="off"
                                />
                                <ul class="suggestions-list" style="display: none"></ul>
                            </div>
                            <button class="primary guess-btn">Raten</button>
                        </div>
                    </div>

                    <div class="feedback"></div>
                </div>
            </div>
        `;
  }

  attachEventListeners() {
    // Navigation Buttons
    this.prevHintBtn.addEventListener("click", () => this.showPrevHint());
    this.nextHintBtn.addEventListener("click", () => this.showNextHint());

    // Guess Button
    this.guessBtn.addEventListener("click", () => this.checkGuess());

    // Input Suggestions
    this.inputElement.addEventListener("input", () => this.showSuggestions());

    // Keyboard Navigation
    this.inputElement.addEventListener("keydown", (e) => this.handleKeydown(e));

    // Click Outside to Close Suggestions
    document.addEventListener("click", (e) => {
      if (
        !this.inputElement.contains(e.target) &&
        !this.suggestionsList.contains(e.target)
      ) {
        this.suggestionsList.style.display = "none";
      }
    });
  }

  updateImage() {
    this.imgElement.src = this.images[this.currentHintIndex];

    // Update hint status text
    if (this.currentHintIndex === 0) {
      this.hintStatusSpan.textContent = "Satellitenbild";
    } else {
      this.hintStatusSpan.textContent = `Tipp ${this.currentHintIndex} von ${
        this.images.length - 1
      }`;
    }

    // Update button states
    this.prevHintBtn.disabled = this.currentHintIndex === 0;
    this.nextHintBtn.disabled =
      this.currentHintIndex === this.images.length - 1;

    // Visual feedback for disabled state
    this.prevHintBtn.style.opacity = this.currentHintIndex === 0 ? "0.3" : "1";
    this.prevHintBtn.style.cursor =
      this.currentHintIndex === 0 ? "default" : "pointer";

    this.nextHintBtn.style.opacity =
      this.currentHintIndex === this.images.length - 1 ? "0.3" : "1";
    this.nextHintBtn.style.cursor =
      this.currentHintIndex === this.images.length - 1 ? "default" : "pointer";
  }

  showPrevHint() {
    if (this.currentHintIndex > 0) {
      this.currentHintIndex--;
      this.updateImage();
    }
  }

  showNextHint() {
    if (this.currentHintIndex < this.images.length - 1) {
      this.currentHintIndex++;
      this.updateImage();
    }
  }

  showSuggestions() {
    if (this.solved) return;
    const input = this.inputElement.value.trim();
    const suggestions = getSuggestions(input);

    this.suggestionsList.innerHTML = "";
    this.currentFocus = -1;

    if (suggestions.length > 0 && input.length > 0) {
      suggestions.forEach((city) => {
        const li = document.createElement("li");
        li.className = "suggestion-item";
        li.textContent = city;
        li.onclick = () => {
          this.inputElement.value = city;
          this.suggestionsList.style.display = "none";
          this.inputElement.focus();
        };
        this.suggestionsList.appendChild(li);
      });
      this.suggestionsList.style.display = "block";
    } else {
      this.suggestionsList.style.display = "none";
    }
  }

  handleKeydown(e) {
    let items = this.suggestionsList.getElementsByTagName("li");

    if (e.key === "ArrowDown") {
      this.currentFocus++;
      this.addActive(items);
    } else if (e.key === "ArrowUp") {
      this.currentFocus--;
      this.addActive(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        this.currentFocus > -1 &&
        items &&
        items[this.currentFocus] &&
        items[this.currentFocus].classList.contains("suggestion-active")
      ) {
        items[this.currentFocus].click();
      } else {
        this.checkGuess();
      }
    }
  }

  addActive(items) {
    if (!items) return false;
    this.removeActive(items);
    if (this.currentFocus >= items.length) this.currentFocus = 0;
    if (this.currentFocus < 0) this.currentFocus = items.length - 1;
    items[this.currentFocus].classList.add("suggestion-active");
    items[this.currentFocus].scrollIntoView({ block: "nearest" });
  }

  removeActive(items) {
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove("suggestion-active");
    }
  }

  checkGuess() {
    if (this.solved) return;
    this.suggestionsList.style.display = "none";

    const userInput = this.inputElement.value.trim();
    if (!userInput) return;

    const { city: bestMatch, dist } = findClosestCity(userInput);

    const tolerance = bestMatch.length <= 4 ? 1 : 3;

    if (dist <= tolerance) {
      if (bestMatch.toLowerCase() === this.solution.toLowerCase()) {
        this.solved = true;
        let msg = "🎉 Richtig! Es ist " + this.solution + "!";
        if (dist > 0) {
          msg += ` (Du meintest sicher ${bestMatch})`;
        }
        this.feedbackElement.textContent = msg;
        this.feedbackElement.className = "feedback success";

        // Disable controls
        this.inputElement.disabled = true;
        this.guessBtn.disabled = true;

        // Show clearest image
        this.currentHintIndex = this.images.length - 1;
        this.updateImage();
      } else {
        this.feedbackElement.textContent = `❌ ${bestMatch} ist leider falsch.`;
        this.feedbackElement.className = "feedback error";
      }
    } else {
      this.feedbackElement.textContent =
        "❌ Diese Stadt kenne ich nicht oder zu viele Tippfehler.";
      this.feedbackElement.className = "feedback error";
    }
  }
}
