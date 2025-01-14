//toggleDropdown.js
  // Toggle dropdown menu visibility
  function toggleDropdown() {
    var menu = document.getElementById('dropdownMenu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  }

  // Update the button text with selected options
  function updateSelection() {
    var checkboxes = document.querySelectorAll('#dropdownMenu input[type="checkbox"]');
    var selectedValues = [];
    
    checkboxes.forEach(function(checkbox) {
      if (checkbox.checked) {
        selectedValues.push(checkbox.value);
      }
    });
    
    var toggleButton = document.getElementById('dropdownToggle');
    toggleButton.textContent = selectedValues.length > 0 ? selectedValues.join(', ') : 'Select Price Range';
  }

  // Close dropdown when clicking outside
  window.addEventListener('click', function(event) {
    var dropdown = document.querySelector('.dropdown');
    if (!dropdown.contains(event.target)) {
      document.getElementById('dropdownMenu').style.display = 'none';
    }
  });

  // Prevent dropdown from closing when interacting inside
  document.getElementById('dropdownMenu').addEventListener('click', function(event) {
    event.stopPropagation();
  });
  function toggleDropdown() {
    var menu = document.getElementById('dropdownMenu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  }

  function updateSelectedOptions() {
    var checkboxes = document.querySelectorAll('#dropdownMenu input[type="checkbox"]');
    var selected = [];
    
    checkboxes.forEach(function(checkbox) {
      if (checkbox.checked) {
        selected.push(checkbox.value);
      }
    });
    
    var selectedOptions = document.getElementById('selectedPricePointOptions');
    selectedOptions.textContent = selected.length > 0 ? selected.join(', ') : '';
  }

