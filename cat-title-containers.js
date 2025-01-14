document.addEventListener("DOMContentLoaded", () => {
    // Select all the category buttons
    const categoryButtons = document.querySelectorAll(".category-button");
    
    // Select all the category containers, including the default container
    const allContainers = document.querySelectorAll(".category-container");
    
    // Function to hide all containers
    const hideAllContainers = () => {
      allContainers.forEach(container => {
        container.style.display = "none";
      });
    };
  
    // Show the default container initially (this is already done in CSS),
    // but if you want to ensure it’s visible, you can uncomment:
    // document.getElementById("default-container").style.display = "block";
  
    // Add a click event listener to each category button
    categoryButtons.forEach(button => {
      button.addEventListener("click", () => {
  
        // 1. Remove "active" class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove("active"));
  
        // 2. Add "active" class to the clicked button
        button.classList.add("active");
  
        // 3. Hide all containers
        hideAllContainers();
  
        // 4. Show only the corresponding container for the clicked button
        const category = button.dataset.category;
        const targetContainer = document.getElementById(`${category}-container`);
        if (targetContainer) {
          targetContainer.style.display = "block";
        }
      });
    });
  });
  