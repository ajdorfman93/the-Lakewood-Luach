// active-buttons.js
document.addEventListener('DOMContentLoaded', () => {

  /**
   * A helper function that enforces:
   *  1) Single "active" button among the elements of `selector`.
   *  2) Optional "clearActive" array to remove "active" class
   *     from other groups whenever one of these is clicked.
   *
   * @param {string} selector - The CSS selector for the group 
   *                            we want to enforce a single active
   * @param {string[]} clearActive - An array of CSS selectors
   *                                 whose "active" classes should
   *                                 be removed when this group 
   *                                 receives a click.
   */
  function setSingleActive(selector, clearActive = []) {
    const buttons = document.querySelectorAll(selector);

    buttons.forEach(button => {
      button.addEventListener('click', () => {

        // 1) If there are other groups to clear, remove their "active"
        //    classes before toggling the current group.
        if (clearActive.length > 0) {
          clearActive.forEach(clearSelector => {
            document.querySelectorAll(clearSelector).forEach(el => {
              el.classList.remove('active');
            });
          });
        }

        // 2) Now remove "active" from every button in this group
        buttons.forEach(btn => {
          btn.classList.remove('active');
        });

        // 3) Add "active" to the clicked button
        button.classList.add('active');
      });
    });
  }

  // -- Enforce the logic you requested:

  // (1) When clicking any .category-button,
  //     remove "active" from all other filter classes.
  setSingleActive('.category-button', [
    '.nusach-button',
    '.tefilah-button',
    '.rest-price',
    '.rest-cuisine',
    '.biz-subtype-cat',
    '.biz-primary-cat'
  ]);

  // (2) When clicking a .nusach-button,
  //     remove "active" from all .tefilah-button.
  setSingleActive('.nusach-button', [
    '.tefilah-button'
  ]);

  // Normal single-active behavior for the rest:
  setSingleActive('.tefilah-button');
  setSingleActive('.rest-price');
  setSingleActive('.rest-cuisine');
  setSingleActive('.biz-subtype-cat');
  setSingleActive('.biz-primary-cat');

});
