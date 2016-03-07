import * as $ from 'jquery';

declare var window: any;
if (window != null)
    window.$ = window.jQuery = $;

import '../node_modules/bootstrap/dist/js/npm';
import '../node_modules/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js';

$(document).ajaxError(function (e, xhr, settings) {
    if (xhr.status == 401) {
        window.open('/auth', '_self', '', false);
    }
});
