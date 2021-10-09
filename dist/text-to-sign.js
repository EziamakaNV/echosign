var forwardTimeout, backwardTimeout;

function convertTextToSigns() {
    clearTimeout(forwardTimeout);
    forwardTimeout = setTimeout(function () {
        var english = $('#transcript').val();
        var signImages = get_img_tags(remove_all_except_letters_numbers_new_lines_spaces(english));
        $('#flags').html(signImages);
    }, 200);
}



// a function to remove all inputs except letters, numbers, new lines, and spaces
// and convert new lines to spaces
// and convert letters to lower case
function remove_all_except_letters_numbers_new_lines_spaces(input) {
    var regex = /[^a-zA-Z0-9\n\s]/g;
    return input.replace(regex, '').replace(/\n/g, ' ').toLowerCase();
}

// for each character in a string return an img tag
function get_img_tags(string) {
    var img_tags = '';
    for (let i = 0; i < string.length; i++) {
        let sign;
        // if a character is a space
        if (string[i] === ' ') {
            sign = '_space';
        } else {
            sign = string[i];
        }
        img_tags += `<img style="max-width:80px;max-height:80px;margin:1%;" src="https://lingojam.com//img/ASL_signs/${sign}.png" alt="ASL letter for: ${sign}">`;
    }
    return img_tags;
}
