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

function buildCourseIndex(json) {
    $.each(json.course, function(_, iv) {
        //初始化 course_of_majors
        if (typeof(window.course_of_majors[iv.for_dept]) == 'undefined') {
            window.course_of_majors[iv.for_dept] = {};
        }
        if (typeof(window.course_of_majors[iv.for_dept][iv.class]) == 'undefined') {
            window.course_of_majors[iv.for_dept][iv.class] = [];
        }
        window.course_of_majors[iv.for_dept][iv.class].push(iv.code);

        //初始化 courses
        if (typeof(window.courses[iv.code]) == 'undefined') {
            window.courses[iv.code] = [];
        }
        window.courses[iv.code].push(iv);

        //初始化 course_of_day
        $.each(iv.time_parsed, function(_, jv) {
            $.each(jv.time, function(_, mv) {
                if (typeof(window.course_of_day[jv.day]) == 'undefined') {
                    window.course_of_day[jv.day] = {};
                }
                if (typeof(window.course_of_day[jv.day][mv]) == 'undefined') {
                    window.course_of_day[jv.day][mv] = [];
                }
                window.course_of_day[jv.day][mv].push(iv);
            })
        })

        //初始化 teacher_course
        if (typeof(window.teacher_course[iv.professor]) == 'undefined') {
            window.teacher_course[iv.professor] = [];
        }
        window.teacher_course[iv.professor].push(iv);

        //初始化 name_of_course
        if (typeof(window.name_of_course[iv.title_parsed.zh_TW]) == 'undefined') {
            //中文課名陣列
            window.name_of_course[iv.title_parsed.zh_TW] = [];
        }
        window.name_of_course[iv.title_parsed.zh_TW].push(iv);
        if (typeof(window.name_of_course[iv.title_parsed.en_US]) == 'undefined') {
            //英文課名陣列
            window.name_of_course[iv.title_parsed.en_US] = [];
        }
        window.name_of_course[iv.title_parsed.en_US].push(iv);
    });
}

function buildDeptArray(depJson) {
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

    window.department_name = {}; //包含科系完整名稱的物件
    window.courses = {}; //以課程代碼為 key 的物件
    window.teacher_course = {}; //以老師姓名為 key 的物件
    window.name_of_course = {}; //以課程名稱為 key 的物件
    window.course_of_day = {}; //以日和小時為 key 的二維物件
    window.course_of_majors = {}; //以科系和年級為 key 的二維物件

    window.name_of_optional_obligatory = [] //這是用來存系上的必修課，檢查有沒有課名是重複的，若有就讓使用者自行決定要上哪堂

    //1. O.json is suitable for all kind of degree, so it will be loaded in automatically.
    //2. 當文件準備好的時候，讀入department的json檔, 因為這是顯示系所，沒多大就全部都載進來
    $.when($.getJSON("/static/course/json/O.json", buildCourseIndex),
        $.getJSON("/static/course/json/department.json", buildDeptArray)
    )
    $.when($.getJSON("/static/course/json/U.json", buildCourseIndex))
        .then(function() {
            add_major("資訊科學與工程學系學士班", "2");
        })
}
