var bulletin_post = function($target, course, language) {
    console.log('bulletin_post');
    searchbar.addResult($target, course, language);
};


/*******嘗試函式化選修填入課程的功能！！*******/
var add_major = function(major, level) {
    $.each(course_of_majors[major][level], function(ik, iv) {
        //先這一年級的必修課全部跑過一次，計算重複課名的數量
        $.each(courses[iv], function(jk, jv) {
            if (jv.obligatory_tf == true && jv.for_dept == major && jv.class == level) { //這樣就可以保證我計算到的必修數量一定是該科系該年級該班級了
                check_optional_obligatory(jv);
                return false;
            }
        })
    });
    $.each(course_of_majors[major][level], function(ik, iv) { //知道那些課程會重複之後，再決定那些課程要填入課表
        $.each(courses[iv], function(jk, jv) {
            if (jv.for_dept == major && jv.class == level) {
                var title_short = return_optional_obligatory_course_name(jv);
                if (window.name_of_optional_obligatory[title_short] == 1) { //只有必修課會被函式計算數量，所以就不用再判斷是否為必修了，一定是
                    if (jv.time_parsed == 0) { //表示應該為實習課，所以無時間,他沒有正課時間和實習時間，反正就是都沒有時間，神奇的是[]在boolean判斷式中居然會被當作0
                        bulletin_post($(".optional"), jv, language);
                    } else {
                        window.timetable.addCourse(jv);
                        //如果這個課名只有出現過一次，就可以自動填入
                    }
                } else { //當出現不止一次的時候就丟到bulletin，但是只丟屬於這個班級的
                    if (jv.obligatory_tf == true) {
                        show_optional_obligatory(jv); //若重複出現，則讓使用者自己決定
                    }
                }
            }
        })
    });
    $.each(course_of_majors[major], function(ik, iv) { //系上所有的選修課都先填入bulletin
        if (check_if_two_class(level).length == 1) { //代表只有一個班
            $.each(iv, function(jk, jv) {
                $.each(courses[jv], function(kk, kv) {
                    if (kv.obligatory_tf == false && kv.for_dept == major && kv.class == level) {
                        /************************************************************
                        kv.class == level limits only optional class for that grade will show!!!!
                        ************************************************************/
                        check_which_bulletin(kv); //由fuction決定該貼到哪個年級的欄位
                    }
                })
            })
        } else { //代表有兩個班
            var class_EN = level.split("")[1]; //班級的A或B，就是最後那個代碼
            if (ik.split("")[1] == class_EN) {
                $.each(iv, function(jk, jv) {
                    $.each(courses[jv], function(kk, kv) {
                        if (kv.obligatory_tf == false && kv.for_dept == major && kv.class.split("")[1] == class_EN && kv.class.split("")[0] == ik.split("")[0]) {
                            //console.log(kv);
                            check_which_bulletin(kv); //由fuction決定該貼到哪個年級的欄位
                            return false;
                        }
                    })
                })
            }
        }
    })
};


var get_json_when_change_degree = function(path) {
    $.when($.getJSON(path, function(json) { //getJSON會用function(X)傳回X的物件或陣列
        //console.log(json);
        $.each(json.course, function(ik, iv) {
            if (typeof(window.course_of_majors[iv.for_dept]) == 'undefined') //如果這一列(列的名稱為索引值key)是空的也就是undefined，那就對他進行初始化，{}物件裡面可以放任意的東西，在下面會把很多陣列塞進這個物件裡面
                window.course_of_majors[iv.for_dept] = {};
            if (typeof(window.course_of_majors[iv.for_dept][iv.class]) == 'undefined') {
                window.course_of_majors[iv.for_dept][iv.class] = []; //如果這一行(列的名稱為索引值key)是空的也就是undefined，那就對他進行初始化，[]裡面的是放陣列
            }
            window.course_of_majors[iv.for_dept][iv.class].push(iv.code); //把東西推進這個陣列裡，概念跟stack一樣
            if (typeof(window.courses[iv.code]) == 'undefined') {
                window.courses[iv.code] = [];
            }
            window.courses[iv.code].push(iv); //這邊可以直接把選課號當作索引值key，裡面的值為object
            $.each(iv.time_parsed, function(jk, jv) { //建立日期的陣列
                $.each(jv.time, function(mk, mv) {
                    if (typeof(window.course_of_day[jv.day]) == 'undefined') {
                        window.course_of_day[jv.day] = {};
                    }
                    if (typeof(window.course_of_day[jv.day][mv]) == 'undefined') {
                        window.course_of_day[jv.day][mv] = [];
                    }
                    window.course_of_day[jv.day][mv].push(iv);
                })
            })
            if (typeof(window.teacher_course[iv.professor]) == 'undefined') { //建立老師名稱的陣列
                window.teacher_course[iv.professor] = [];
            }
            window.teacher_course[iv.professor].push(iv);
            if (typeof(window.name_of_course[iv.title_parsed.zh_TW]) == 'undefined') { //中文課名陣列
                window.name_of_course[iv.title_parsed.zh_TW] = [];
            }
            window.name_of_course[iv.title_parsed.zh_TW].push(iv);
            if (typeof(window.name_of_course[iv.title_parsed.en_US]) == 'undefined') { //英文課名陣列
                window.name_of_course[iv.title_parsed.en_US] = [];
            }
            window.name_of_course[iv.title_parsed.en_US].push(iv);
        });
    }))
}
