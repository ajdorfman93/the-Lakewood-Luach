$(function () {
    $('a.page-scroll').on('click', function (event) {
      event.preventDefault();
      var target = $(this).attr('href');

      $('html, body').animate(
        {
          scrollTop: $(target).offset().top
        },
        800 // Adjust speed (ms) as you like
      );
    });
  });

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});