module.exports = (function () {

  /* Generate 8 symbols password */
  let generatePassword = function (size=8) {
    return Math.random().toString(36).slice(-size);
  };

  return {
    generatePassword: generatePassword
  };
})();