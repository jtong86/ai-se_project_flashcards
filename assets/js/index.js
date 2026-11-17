
import { decks, getDeckByID } from "./decks.js";
import { hexToString } from "./colors.js";
import { renderCarouselView } from "./carousel.js";
import { renderDeckView } from "./deck-view.js";

// =====================================
// DOM ELEMENTS
// =====================================

const deckTemplateEl = document.querySelector("#deck-template");

const homeSectionEl = document.querySelector("#home");
const deckViewSectionEl = document.querySelector("#deck-view");
const carouselSectionEl = document.querySelector("#carousel");
const aboutSectionEl = document.querySelector("#about");
const notFoundSectionEl = document.querySelector("#not-found");

const homeListEl = homeSectionEl.querySelector(".gallery__list");

const mainContentEl = document.querySelector(".page__main-content");

const newDeckBtn = document.querySelector("#new-deck-btn");
const newCardBtn = document.querySelector("#new-card-btn");

// =====================================
// DELETED DECKS AND CARDS
// =====================================

// Track deleted decks during the current session.
const deletedDeckIds = new Set();

// Track deleted cards for each deck.
const deletedCardIds = new Map();

// =====================================
// GET ACTIVE CARDS
// =====================================

function getActiveCards(deck) {
  const deleted = deletedCardIds.get(deck.id) || new Set();

  return deck.cards.filter((card) => !deleted.has(card.id));
}

// =====================================
// CREATE DECK ELEMENT
// =====================================

function createDeckEl(deck) {
  const cloneEl = deckTemplateEl.content
    .querySelector("li")
    .cloneNode(true);

  const cardEl = cloneEl.querySelector(".card");
  const titleEl = cloneEl.querySelector(".card__title");
  const countEl = cloneEl.querySelector(".card__card-count");
  const linkEl = cloneEl.querySelector(".card__link");

  const deleteBtn = cloneEl.querySelector(
    ".card__btn_type_delete"
  );

  // Apply the deck color.
  const colorName = hexToString(deck.color) || "green";

  cardEl.classList.add(`card_color_${colorName}`);

  // Set the deck title.
  titleEl.textContent = deck.name;

  // Display the number of active cards.
  countEl.textContent = `${getActiveCards(deck).length} Cards`;

  // Navigate to the selected deck.
  linkEl.href = `#deck/${deck.id}`;

  linkEl.setAttribute(
    "aria-label",
    `Open ${deck.name} deck`
  );

  // Delete the selected deck.
  deleteBtn.setAttribute(
    "aria-label",
    `Delete ${deck.name} deck`
  );

  deleteBtn.addEventListener("click", () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${deck.name}?`
    );

    if (confirmed) {
      deletedDeckIds.add(deck.id);

      renderHomeView();
    }
  });

  return cloneEl;
}

// =====================================
// RENDER HOME VIEW
// =====================================

function renderHomeView() {
  // Clear existing deck elements.
  homeListEl.replaceChildren();

  // Filter deleted decks.
  const activeDecks = decks.filter(
    (deck) => !deletedDeckIds.has(deck.id)
  );

  // Render the remaining decks.
  activeDecks.forEach((deck) => {
    const deckEl = createDeckEl(deck);

    homeListEl.append(deckEl);
  });
}

// =====================================
// HIDE ALL SECTIONS
// =====================================

function hideAllSections() {
  homeSectionEl.style.display = "none";
  deckViewSectionEl.style.display = "none";
  carouselSectionEl.style.display = "none";
  aboutSectionEl.style.display = "none";
  notFoundSectionEl.style.display = "none";
}

// =====================================
// HANDLE CARD DELETION
// =====================================

function handleCardDelete(deck, cardId) {
  // Create a deleted-card set if needed.
  if (!deletedCardIds.has(deck.id)) {
    deletedCardIds.set(deck.id, new Set());
  }

  // Add the deleted card ID.
  deletedCardIds.get(deck.id).add(cardId);

  // Refresh the deck view.
  renderDeckView(
    {
      ...deck,
      cards: getActiveCards(deck),
    },
    (nextCardId) => {
      handleCardDelete(deck, nextCardId);
    }
  );
}

// =====================================
// RENDER INDIVIDUAL DECK
// =====================================

function showDeckView(deck) {
  const activeDeck = {
    ...deck,
    cards: getActiveCards(deck),
  };

  renderDeckView(activeDeck, (cardId) => {
    handleCardDelete(deck, cardId);
  });

  deckViewSectionEl.style.display = "flex";
}

// =====================================
// RENDER CAROUSEL
// =====================================

function showCarouselView(deck) {
  const activeDeck = {
    ...deck,
    cards: getActiveCards(deck),
  };

  // Do not start practice mode with no cards.
  if (activeDeck.cards.length === 0) {
    window.location.hash = `deck/${deck.id}`;
    return;
  }

  carouselSectionEl.style.display = "flex";

  mainContentEl.classList.add(
    "page__main-content_location_carousel"
  );

  renderCarouselView(activeDeck);
}

// =====================================
// ROUTER
// =====================================

function router() {
  // Read the current URL hash.
  const hash = decodeURIComponent(
    window.location.hash.slice(1)
  );

  // Hide all sections before showing the active view.
  hideAllSections();

  // Reset carousel-specific page styling.
  mainContentEl.classList.remove(
    "page__main-content_location_carousel"
  );

  // -----------------------------------
  // HOME / MY DECKS
  // -----------------------------------

  if (hash === "" || hash === "home") {
    renderHomeView();

    homeSectionEl.style.display = "flex";

    return;
  }

  // -----------------------------------
  // ABOUT
  // -----------------------------------

  if (hash === "about") {
    aboutSectionEl.style.display = "block";

    return;
  }

  // -----------------------------------
  // DECK AND CAROUSEL ROUTES
  // -----------------------------------

  const [view, deckId, extra] = hash.split("/");

  if (
    (view === "deck" || view === "carousel") &&
    deckId &&
    extra === undefined
  ) {
    // Find the selected deck.
    const deck = getDeckByID(deckId);

    // Handle missing or deleted decks.
    if (!deck || deletedDeckIds.has(deckId)) {
      notFoundSectionEl.style.display = "block";

      return;
    }

    // Show individual deck.
    if (view === "deck") {
      showDeckView(deck);

      return;
    }

    // Show practice carousel.
    if (view === "carousel") {
      showCarouselView(deck);

      return;
    }
  }

  // -----------------------------------
  // NOT FOUND
  // -----------------------------------

  notFoundSectionEl.style.display = "block";
}

// =====================================
// NEW DECK BUTTON
// =====================================

newDeckBtn.addEventListener("click", () => {
  window.alert(
    "New deck creation is not implemented yet."
  );
});

// =====================================
// NEW CARD BUTTON
// =====================================

newCardBtn.addEventListener("click", () => {
  window.alert(
    "New card creation is not implemented yet."
  );
});

// =====================================
// EVENT LISTENERS
// =====================================

// Update the view when the URL hash changes.
window.addEventListener("hashchange", router);

// Render the initial page.
router();

// =====================================
// EXPORTS
// =====================================

export { getActiveCards };

