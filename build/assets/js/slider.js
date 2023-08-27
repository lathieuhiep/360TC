(function ($) {
  "use strict";

  $(document).ready( () => {
    new Swiper(".slider-main", {
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });
  } )

})(jQuery)