function addMajorCourses(major, grade) {
    let duplicatedCourseNames = [];

    for (let course of getCourse('major', major, grade)) {
        if (course.obligatory_tf == true && course.for_dept == major && course.class == grade) {
            //這樣就可以保證我計算到的必修數量一定是該科系該年級該班級了
            //用來確認這個系有幾堂必修課是同名的
            let title_zh = course.title_parsed['zh_TW'];
            let title_len = title_zh.length;
            course.title_short = isDuplicated(title_zh[title_len - 1]) ? title_zh.substring(0, title_len - 1) : title_zh;
            //A chinese title which doesn't contain the english character at the end.(英文作文(二)a -> 英文作文(二))

            if (duplicatedCourseNames[course.title_short] === undefined) {
                //如果這一列(列的名稱為索引值key)是空的也就是undefined，那就對他進行初始化
                duplicatedCourseNames[course.title_short] = {
                    'code': course.code,
                    'count': 1
                };
            } else {
                duplicatedCourseNames[course.title_short]['count'] += 1;
            }
        }
    }

    for (let name in duplicatedCourseNames) {
        let course = getCourse('code', duplicatedCourseNames[name].code)[0];
        if (duplicatedCourseNames[name].count === 1) {
            //只有必修課會被函式計算數量，所以就不用再判斷是否為必修了，一定是
            if (course.time_parsed == 0) {
                //表示應該為實習課，所以無時間,他沒有正課時間和實習時間，反正就是都沒有時間，神奇的是[]在boolean判斷式中居然會被當作0
                searchbar.addResult($(".optional"), course, language);
            } else {
                window.timetable.addCourse(course);
                //如果這個課名只有出現過一次，就可以自動填入
            }
        } else {
            if (course.obligatory_tf == true) {
                $('.stufinite-searchbar-placeholder').hide();
                window.searchbar.addResult($(".obligatory-post"), course, window.timetable.language)
            }
        }
    }

    $.each(coursesByMajor[major], function(ik, iv) {
        //系上所有的選修課都先填入bulletin
        if (haveMultipleClasses(grade)) {
            $.each(iv, function(_, jv) {
                $.each(coursesByCode[jv], function(_, kv) {
                    if (kv.obligatory_tf == false && kv.for_dept == major && kv.class == grade) {
                        /************************************************************
                        kv.class == grade limits only optional class for that grade will show!!!!
                        ************************************************************/
                        // check_which_bulletin(kv); //由fuction決定該貼到哪個年級的欄位
                        window.searchbar.addResult($(getCourseType(kv)), kv, window.timetable.language)
                    }
                })
            })
        } else {
            var class_EN = grade.split("")[1]; //班級的A或B，就是最後那個代碼
            if (ik.split("")[1] == class_EN) {
                $.each(iv, function(_, jv) {
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

function isDuplicated(input) {
    //input is the last character of short title.
    var code = input.charCodeAt(0);
    if (((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122))) {
        // it is a letter
        return true;
    } else {
        return false;
    }
}

function haveMultipleClasses(grade) {
    //確認此系有沒有分AB班(選修用)
    grade = grade.split("");
    return grade.length === 1 ? true : false;
}
