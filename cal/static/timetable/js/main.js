(function main() {
    $.getJSON("/api/get/user", function(user) {
        window.searchbar = new StufiniteSearchbar()
        window.timetable = new StufiniteTimetable("NCHU", "zh_TW", user)

        document.querySelector("#search-form").addEventListener("focus", () => {
            searchbar.show();
        });

        document.querySelector("#search-form").addEventListener("change", (e) => {
            let key = $(e.target).val();
            console.log(key)
            $.getJSON("http://www.campass.com.tw/search/?keyword=" + key + "&school=NCHU", (data) => {
              for (let i of data) {
                console.log(i)
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
