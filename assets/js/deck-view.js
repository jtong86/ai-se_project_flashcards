
import { hexToString } from "./colors.js";

const deckViewEl = document.querySelector("#deck-view");
const cardTemplateEl = document.querySelector("#card-template");

const titleEl = deckViewEl.querySelector(".gallery__title");
const listEl = deckViewEl.querySelector(".gallery__list");
const practiceBtn = deckViewEl.querySelector(
  ".gallery__practice-btn"
);

function createCardEl(card, deck, onDelete) {
  const cloneEl = cardTemplateEl.content
    .querySelector("li")
    .cloneNode(true);

  const cardEl = cloneEl.querySelector(".card");
  const textEl = cloneEl.querySelector(".card__title");
  const flipBtn = cloneEl.querySelector(
    ".card__btn_type_flip"
  );
  const deleteBtn = cloneEl.querySelector(
    ".card__btn_type_delete"
  );

  const colorName = hexToString(deck.color) || "green";

  cardEl.classList.add(`card_color_${colorName}`);

  let showingQuestion = true;

  function updateCard() {
    textEl.textContent = showingQuestion
      ? card.question
      : card.answer;

    cardEl.classList.toggle(
      "card_color_white",
      !showingQuestion
    );

    flipBtn.setAttribute(
      "aria-label",
      showingQuestion ? "Show answer" : "Show question"
    );
  }

  flipBtn.addEventListener("click", () => {
    showingQuestion = !showingQuestion;
    updateCard();
  });

  deleteBtn.addEventListener("click", () => {
    if (window.confirm("Delete this flashcard?")) {
      onDelete(card.id);
    }
  });

  updateCard();

  return cloneEl;
}

function renderDeckView(deck, onDelete = () => {}) {
  titleEl.textContent = deck.name;

  listEl.replaceChildren();

  deck.cards.forEach((card) => {
    const cardEl = createCardEl(card, deck, onDelete);
    listEl.append(cardEl);
  });

  practiceBtn.disabled = deck.cards.length === 0;

  practiceBtn.onclick = () => {
    window.location.hash = `carousel/${deck.id}`;
  };
}

export { renderDeckView };
