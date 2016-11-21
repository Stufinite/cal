(function main() {
    legacyInit();

    window.searchbar = new StufiniteSearchbar()
    window.timetable = new StufiniteTimetable("NCHU", "zh_TW")

    $("#search-form").bind("focus", function() {
        searchbar.show();
    });

    $(".stufinite-app-searchbar-toggle").bind("click", function(e) {
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
    window.week = ["一", "二", "三", "四", "五"];

    window.courses = {}; //宣告一個空的物件
    window.course_of_majors = {}; //宣告一個空的物件
    window.course_of_day = {}; //這是宣告日期的陣列
    window.teacher_course = {}; //這是以老師姓名為index的陣列
    window.name_of_course = {}; //這是以課程名稱為index的陣列
    window.name_of_optional_obligatory = [] //這是用來存系上的必修課，檢查有沒有課名是重複的，若有就讓使用者自行決定要上哪堂
    window.url_base = ""; //used to be the url that link to the syllabus of that course.
    window.haveloadin = {
        D: false,
        G: false,
        N: false,
        O: false,
        U: false,
        W: false
    }; //used to checked whether that json of specific degree has been loaded in or not, if it did, the value turn to ture.
    window.lastupdatetime = ""; //show the update time on server.
    window.department_name = {};
    window.already_post = true; //check whether post of not.
    window.content = []

    //1. O.json is suitable for all kind of degree, so it will be loaded in automatically.
    //2. 當文件準備好的時候，讀入department的json檔, 因為這是顯示系所，沒多大就全部都載進來
    var build_department_arr = function(depJson) {
        $.each(depJson, function(_, iv) {
            if (typeof(window.department_name[iv.degree]) == 'undefined') {
                window.department_name[iv.degree] = {};
            }

            $.each(iv.department, function(_, jv) {
                if (typeof(window.department_name[iv.degree][jv.zh_TW]) == 'undefined') {
                    window.department_name[iv.degree][jv.zh_TW] = {};
                }

                var option = "";
                option += jv.value + '-' + jv["zh_TW"];
                window.department_name[iv.degree][jv.zh_TW]["zh_TW"] = option;

                var option = "";
                option += jv.value + '-' + jv["en_US"];
                window.department_name[iv.degree][jv.zh_TW]["en_US"] = option;
            })
        })
    };
    $.when(get_json_when_change_degree("/static/course/json/O.json"),
        $.getJSON("/static/course/json/department.json", build_department_arr),
        get_json_when_change_degree("/static/course/json/U.json")
    ).then(function() {
        add_major("資訊科學與工程學系學士班", 1);
    })
}
