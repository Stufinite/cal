(function main() {
    $.getJSON("/api/get/user", function(user) {
        window.searchbar = new StufiniteSearchbar()
        window.timetable = new StufiniteTimetable("NCHU", "zh_TW", user)

        document.querySelector("#search-form").addEventListener("focus", function() {
            searchbar.show();
        });

        document.querySelector(".stufinite-app-searchbar-toggle").addEventListener("click", function(e) {
            if (window.searchbar.isVisible) {
                window.searchbar.hide();
            } else {
                window.searchbar.show();
            }
        });
    });
})()
