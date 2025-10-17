// search-autocomplete.js
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) {
    return;
  }

  const savedValue = localStorage.getItem("searchText");
  if (savedValue) {
    searchInput.value = savedValue;
  }

  searchInput.addEventListener("input", () => {
    localStorage.setItem("searchText", searchInput.value);
  });
});
