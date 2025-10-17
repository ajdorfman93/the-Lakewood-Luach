$(function () {
  $('a.page-scroll').on('click', function (event) {
    event.preventDefault();
    const target = $(this).attr('href');
    const $targetEl = $(target);

    if ($targetEl.length) {
      $('html, body').animate(
        {
          scrollTop: $targetEl.offset().top,
        },
        800
      );
    }
  });

  // Highlight active nav link while scrolling.
  if (typeof $.fn.scrollspy === 'function') {
    $('body').scrollspy({
      target: '.navbar-fixed-top',
    });
  } else {
    const navLinks = document.querySelectorAll('.nav-links a.page-scroll');
    const sections = Array.from(navLinks)
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (!link) return;
            if (entry.isIntersecting) {
              navLinks.forEach((item) => item.classList.remove('active'));
              link.classList.add('active');
            }
          });
        },
        {
          rootMargin: '-50% 0px -50% 0px',
          threshold: 0,
        }
      );

      sections.forEach((section) => observer.observe(section));
    }
  }

  // Close the responsive menu on menu item click (hamburger style navs)
  $('.navbar-collapse ul li a').on('click', function () {
    $('.navbar-toggle:visible').trigger('click');
  });
});
