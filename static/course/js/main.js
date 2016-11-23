(function main() {
    legacyInit();

    window.searchbar = new StufiniteSearchbar()
    window.timetable = new StufiniteTimetable("NCHU", "zh_TW", "資訊科學與工程學系學士班", "2")

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
})()

function legacyInit() {
    window.user = {
        "user_name": "",
        "user_dept": "",
        "time_table": [],
        "idList": {},
        "returnarr": {
            'degree': '',
            'level': '',
            "major": "",
            'd_major': '',
            'd_level': ''
        },
    }
}
