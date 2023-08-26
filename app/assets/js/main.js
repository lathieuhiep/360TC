(function ($) {
  "use strict";

  $(document).ready( () => {

    // handle scroll top pae
    $('#scroll-top-page').on( 'click', function () {
      $('html').scrollTop(0);
    } );

  } )
})(jQuery)