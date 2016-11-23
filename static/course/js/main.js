(function main() {
    legacyInit();

    window.searchbar = new StufiniteSearchbar()
    window.timetable = new StufiniteTimetable("NCHU", "zh_TW")

    document.querySelector("#search-form").addEventListener("focus", function() {
        searchbar.show();
    });

    document.querySelector(".stufinite-app-searchbar-toggle").addEventListener("click", function(e) {
        if (searchbar.isVisible) {
            searchbar.hide();
        } else {
            searchbar.show();
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

    // window.department_name = {}; //包含科系完整名稱的物件
    // window.coursesByCode = {}; //以課程代碼為 key 的物件
    // window.coursesByTeacher = {}; //以老師姓名為 key 的物件
    // window.coursesByName = {}; //以課程名稱為 key 的物件
    // window.coursesByDay = {}; //以日和小時為 key 的二維物件
    // window.coursesByMajor = {}; //以科系和年級為 key 的二維物件
}
