// toggleDropdown.js
(function () {
  function getDropdownElements() {
    return {
      menu: document.getElementById('dropdownMenu'),
      toggle: document.getElementById('dropdownToggle'),
      selectedOutput: document.getElementById('selectedPricePointOptions'),
    };
  }

  function toggleDropdown() {
    const { menu } = getDropdownElements();
    if (!menu) {
      return;
    }
    const isOpen = menu.style.display === 'block';
    menu.style.display = isOpen ? 'none' : 'block';
  }

  function updateSelectedOptions() {
    const { menu, toggle, selectedOutput } = getDropdownElements();
    if (!menu) {
      return;
    }

    const checkboxes = menu.querySelectorAll('input[type="checkbox"]');
    const selectedValues = Array.from(checkboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    if (toggle) {
      toggle.textContent = selectedValues.length ? selectedValues.join(', ') : 'Select Price Range';
    }

    if (selectedOutput) {
      selectedOutput.textContent = selectedValues.length ? selectedValues.join(', ') : '';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const { menu } = getDropdownElements();
    if (!menu) {
      return;
    }

    window.addEventListener('click', (event) => {
      const dropdown = document.querySelector('.dropdown');
      if (!dropdown || dropdown.contains(event.target)) {
        return;
      }
      menu.style.display = 'none';
    });

    menu.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  });

  window.toggleDropdown = toggleDropdown;
  window.updateSelectedOptions = updateSelectedOptions;
})();

