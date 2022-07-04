const moment = require("moment");
const showdown = require("showdown");

const equals = function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
}

const dateFormat = function (date, option) {
    return moment(date).format(option);
}

const mdToHtml = function (string) {
    var converter = new showdown.Converter();
    return converter.makeHtml(string);
}

const truncate = function (string, maxlen) {
    maxlen = parseInt(maxlen);
    if (string.length > maxlen) {
        string = string.substr(0, maxlen) + "...";
    }
    return string;
}

const multiply = function (a, b) {
    if (typeof a === 'number' && typeof b === 'number') {
      return a * b
    }
}

module.exports = {
    equals,
    dateFormat,
    mdToHtml,
    truncate,
    multiply
}
