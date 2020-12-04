/**
 * Slide down the element if show is true otherwise slide up
 * @param {Boolean} show
 * @param {} $element
 * @param {() => void} done
 */
const showElement = (show, $element, done, speed) => {
  show ? $element.slideDown(speed, done) : $element.slideUp(speed, done);
};

/**
 * Reveals the error msg if show is true otherwise hide the error msg
 * @param {Boolean} show toggle show or hidden
 * @param {String} err error message to display
 */
const showErrMsg = (show, speed, err = "") => {
  const $errMsg = $('#err');
  showElement(show, $errMsg, () => {
    $errMsg.find('.errMsg').text(err);
  }, speed);
};

/** creates an error message element. Does not check for XXS as
 * this function is a helper function for devs and will only ever display on
 * a local client's page.
 *
 * @param {String} msg used as the error message
 */
const createError = function(msg) {
  const $err = $(`
    <div class="err">
      <span><i class="fas fa-exclamation-circle"></i></span>
      <span>${msg}</span>
    </div>
  `);
  $err.on('click', () => {
    $err.slideUp(500,function() {
      $err.remove();
    });
  });
  return $err;
};
