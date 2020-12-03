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
