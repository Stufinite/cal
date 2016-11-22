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
                        searchbar.addResult($(".optional"), jv, language);
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
                $.each(courses[jv], function(_, kv) {
                    if (kv.obligatory_tf == false && kv.for_dept == major && kv.class == level) {
                        /************************************************************
                        kv.class == level limits only optional class for that grade will show!!!!
                        ************************************************************/
                        // check_which_bulletin(kv); //由fuction決定該貼到哪個年級的欄位
                        window.searchbar.addResult($(getCourseType(kv)), kv, window.timetable.language)
                    }
                })
            })
        } else { //代表有兩個班
            var class_EN = level.split("")[1]; //班級的A或B，就是最後那個代碼
            if (ik.split("")[1] == class_EN) {
                $.each(iv, function(jk, jv) {
                    $.each(courses[jv], function(_, kv) {
                        if (kv.obligatory_tf == false && kv.for_dept == major && kv.class.split("")[1] == class_EN && kv.class.split("")[0] == ik.split("")[0]) {
                            //console.log(kv);
                            // check_which_bulletin(kv); //由fuction決定該貼到哪個年級的欄位
                            console.log(kv)
                            window.searchbar.addResult($(getCourseType(kv)), kv, window.timetable.language)
                            return false;
                        }
                    })
                })
            }
        }
    })
};

var isChar = function(input) {
    //input is the last character of short title.
    var code = input.charCodeAt(0);
    if (((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122))) {
        // it is a letter
        return true;
    } else {
        return false;
    }
}

/****把有abcd班別的必修課做判斷，讓使用這自己選擇**********/
var return_optional_obligatory_course_name = function(course) {
    var len = course.title_parsed["zh_TW"].length;
    if (isChar(course.title_parsed["zh_TW"][len - 1]) == true) {
        //check whether the last char is 'abcd' or not.
        //if so, return the title without char.
        return course.title_parsed["zh_TW"].substring(0, len - 1);
    } else {
        return course.title_parsed["zh_TW"];
    }

}

/*********確認系上必修有無重名*********/
var check_optional_obligatory = function(course) {
    //用來確認這個系有幾堂必修課是同名的
    course.title_short = return_optional_obligatory_course_name(course); //will make a new key called title_short, that contains a chinese title which dont contain a character at the end.(like 英文作文(二)a -> 英文作文(二))
    //title_short是會自動宣告的區域變數，存沒有英文的課名

    if (typeof(window.name_of_optional_obligatory[course.title_short]) == 'undefined') { //如果這一列(列的名稱為索引值key)是空的也就是undefined，那就對他進行初始化，{}物件裡面可以放任意的東西，在下面會把很多陣列塞進這個物件裡面
        window.name_of_optional_obligatory[course.title_short] = 1;
    } else {
        window.name_of_optional_obligatory[course.title_short]++;
    }
    //console.log(course.title_short+' '+window.name_of_optional_obligatory[course.title_short]);
}

/*********處理課名*********/
var show_optional_obligatory = function(course) {
    var trun_title = return_optional_obligatory_course_name(course);
    //cause the character at the end of title is truncate, so named it trun_title
    if (window.name_of_optional_obligatory[trun_title] > 1) {
        // bulletin_post($("#obligatory-post"), course, language);
        $('.stufinite-searchbar-placeholder').hide();
        window.searchbar.addResult($(".obligatory-post"), course, window.timetable.language)
    }
}

/********確認此系有沒有分AB班(選修用)********/
var check_if_two_class = function(level) { //為了讓我確認他是不是有分AB班，這個是用在選修課的填入判斷上
    level = level.split("");
    return (level); //可以從回傳的長度判斷是否有兩個班
}
