(function main() {
    addMask();

    $.getJSON("/api/get/user", function(user) {
        window.searchbar = new StufiniteSearchbar()
        window.timetable = new StufiniteTimetable("NCHU", "zh_TW", user)

        document.querySelector(".stufinite-app-searchbar-toggle").addEventListener("click", (e) => {
            if (window.searchbar.isVisible) {
                window.searchbar.hide();
            } else {
                window.searchbar.show();
            }
        });

        // Initialize search-form behavior
        document.querySelector("#search-form").addEventListener("focus", () => {
            searchbar.show();
        });
        document.querySelector("#search-form").addEventListener("change", (e) => {
            let raw_key = $(e.target).val();
            if (raw_key.length < 2) {
                window.searchbar.clear();
                return;
            }
            window.searchbar.clear("搜尋中...")

            let key = '';
            for (let char of raw_key.split(' ')) {
                key += char + '+';
            }
            key = key.slice(0, -1);

            $.getJSON("/search/?keyword=" + key + "&school=NCHU", (c_by_key) => {
                if (c_by_key.length == 0) {
                    window.searchbar.clear("找不到與\"" + key + "\"相關的課程")
                    return;
                }
                for (let i of c_by_key) {
                    window.searchbar.clear()
                    $.getJSON("/api/get/course/code/" + i.DBid, (c_by_id) => {
                        let c_by_code = window.timetable.getCourse('code', c_by_id[0].code)
                        if (c_by_code == undefined) {
                            return;
                        }
                        window.searchbar.addResult($(window.timetable.getCourseType(c_by_code)), c_by_code[0], window.timetable.language)
                    });
                }
            });
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
