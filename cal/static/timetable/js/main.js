(function main() {
    addMask();

    $.getJSON("/api/get/user", function(user) {
        window.searchbar = new StufiniteSearchbar()
        window.timetable = new StufiniteTimetable("NCHU", "zh_TW", user)

        document.querySelector("#search-form").addEventListener("focus", () => {
            searchbar.show();
        });

        // Initialize search-form behavior
        document.querySelector("#search-form").addEventListener("input", (e) => {
            let key = $(e.target).val();
            $.getJSON("/search/?keyword=" + key + "&school=NCHU", (c_by_key) => {
                for (let i of c_by_key) {
                    $.getJSON("/api/get/course/" + i.DBid, (c_by_id) => {
                        for (let c_by_code of window.timetable.getCourse('code', c_by_id[0].code)) {
                            console.log(c_by_code);
                            window.searchbar.addResult($(window.timetable.getCourseType(c_by_code)), c_by_code, window.timetable.language)
                        }
                    });
                }
            });
        });

        document.querySelector(".stufinite-app-searchbar-toggle").addEventListener("click", (e) => {
            if (window.searchbar.isVisible) {
                window.searchbar.hide();
            } else {
                window.searchbar.show();
            }
        });
    });
})()

function addMask() {
    $("body").append($("<div id='page-mask'>"));
}

function delMask() {
    $("body").find("#page-mask").remove();
}

function getCookie(name) {
    //name should be 'csrftoken', as an argument to be sent into getCookie()
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
