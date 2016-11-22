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
        //初始化 coursesByMajor
        if (coursesByMajor[iv.for_dept] === undefined) {
            coursesByMajor[iv.for_dept] = {};
        }
        if (coursesByMajor[iv.for_dept][iv.class] === undefined) {
            coursesByMajor[iv.for_dept][iv.class] = [];
        }
        coursesByMajor[iv.for_dept][iv.class].push(iv.code);

        //初始化 coursesByCode
        if (coursesByCode[iv.code] === undefined) {
            coursesByCode[iv.code] = [];
        }
        coursesByCode[iv.code].push(iv);

        //初始化 coursesByDay
        $.each(iv.time_parsed, function(_, jv) {
            $.each(jv.time, function(_, mv) {
                if (coursesByDay[jv.day] === undefined) {
                    coursesByDay[jv.day] = {};
                }
                if (coursesByDay[jv.day][mv] === undefined) {
                    coursesByDay[jv.day][mv] = [];
                }
                coursesByDay[jv.day][mv].push(iv);
            })
        })

        //初始化 coursesByTeacher
        if (coursesByTeacher[iv.professor] === undefined) {
            coursesByTeacher[iv.professor] = [];
        }
        coursesByTeacher[iv.professor].push(iv);

        //初始化 coursesByName
        if (coursesByName[iv.title_parsed.zh_TW] === undefined) {
            //中文課名陣列
            coursesByName[iv.title_parsed.zh_TW] = [];
        }
        coursesByName[iv.title_parsed.zh_TW].push(iv);
        if (coursesByName[iv.title_parsed.en_US] === undefined) {
            //英文課名陣列
            coursesByName[iv.title_parsed.en_US] = [];
        }
        coursesByName[iv.title_parsed.en_US].push(iv);
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
    window.coursesByCode = {}; //以課程代碼為 key 的物件
    window.coursesByTeacher = {}; //以老師姓名為 key 的物件
    window.coursesByName = {}; //以課程名稱為 key 的物件
    window.coursesByDay = {}; //以日和小時為 key 的二維物件
    window.coursesByMajor = {}; //以科系和年級為 key 的二維物件

    //1. O.json is suitable for all kind of degree, so it will be loaded in automatically.
    //2. 當文件準備好的時候，讀入department的json檔, 因為這是顯示系所，沒多大就全部都載進來
    $.when($.getJSON("/static/course/json/O.json", buildCourseIndex),
        $.getJSON("/static/course/json/department.json", buildDeptArray)
    )
    $.when($.getJSON("/static/course/json/U.json", buildCourseIndex))
        .then(function() {
            addMajorCourses("資訊科學與工程學系學士班", "2");
        })
}
