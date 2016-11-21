function getCourse(mode, key, grade) {
    if (key === undefined || key === "") {
        return [];
    }

    if (mode === "code") {
        return getCourseByCode(key);
    } else if (mode === "title") {
        return getCourseByTitle(key);
    } else if (mode === "teacher") {
        return getCourseByTeacher(key);
    } else if (mode === "major") {
        return getCourseByMajor(key, parseInt(grade, 10));
    } else {
        return [];
    }
}

function getCourseByCode(key) {
    return courses[key];
}

function getCourseByTitle(class_title) {
    var posted_code = [];
    $.each(name_of_course, function(ik, iv) {
        if (ik.search(class_title) != -1) {
            $.each(iv, function(_, jv) {
                if (posted_code.indexOf(jv.code) == -1) {
                    posted_code.push(jv.code);
                }
            });
        }
    })

    var result = [];
    for (code of posted_code) {
        result.push(courses[code][0]);
    }

    return result;
}

function getCourseByTeacher(key) {
    return teacher_course[key]
}


function getCourseByMajor(major, grade) {
    var result = [];
    for (let iv of course_of_majors[major][grade]) {
        for (let course of getCourseByCode(iv)) {
            if (course.for_dept == major && course.class == grade) {
                //這個判斷是為了像景觀學程那種專門上別的科系的課的系而設計的
                result.push(course);
            }
        }
    }
    return result;
}

function getCourseLocation(course) {
    var location = "";
    if (course.location != [""] && course.location != undefined) {
        //要確保真的有location這個key才可以進if，不然undefined進到each迴圈
        // 就會跳 [Uncaught TypeError: Cannot read property 'length' of undefined]這個error
        $.each(course.location, function(_, iv) {
            location = location + " " + iv;
        })
    }
    if (course.intern_location != [""] && course.intern_location != undefined) {
        $.each(course.intern_location, function(_, iv) {
            location = location + " " + iv;
        })
    }
    return location;
}

function getCourseTime(course) {
    var time = [];
    $.each(course.time_parsed, function(_, iv) {
        //push是把裡面的元素變成陣列的一格
        time.push("(" + week[iv.day - 1] + ")" + iv.time);
    })
    if (course.intern_time != "" && course.intern_time != undefined) {
        //不是每一堂課都會有實習時間
        time.push("實習時間:" + course.intern_time);
    } else {}
    time = time.join(' '); //把多個陣列用" "分隔並合併指派給time，此為字串型態，若是將字串split('')，則會回傳一個陣列型態
    return time;
}

function getCourseType(course) {
    var major = window.user['returnarr']['major'];
    var level = window.user['returnarr']['level'];
    var d_major = window.user['returnarr']['d_major'];
    var d_level = window.user['returnarr']['d_level'];

    if (course.for_dept == major || ((course.for_dept == d_major) && (course.class == d_level)) || course.for_dept == "全校共同" || course.for_dept == "共同學科(進修學士班)") {
        //判斷如果是主系的課就不分年級全部都會顯示出來，如果是輔系的就只顯示該年級的課；如果for_dept==undefined就代表是通識課
        //如果為全校共同或共同學科(進修學士班)就會是體育、國防、服務學習、全校英外語 or general education, chinese and english.
        if (course.obligatory_tf == false && course.for_dept != major && course.for_dept != d_major) {
            //代表是教務處綜合課程查詢裡面的所有課、國防、師培、全校選修、全校英外語  (obligatory of 師培 can be true or false!!!)
            return check_which_common_subject(course);
        } else if (course.obligatory_tf == true) {
            //判斷為國英文或是必修課和通識課!!!，包含體育 (obligatory of 師培 can be true or false!!!)
            return check_which_bulletin_required(course);
        } else if (course.obligatory_tf == false) {
            //決定選修課該貼到哪個年級的欄位
            // check_which_bulletin(course);
            return '.optional';
        }
    }
}

function check_which_common_subject(course) {
    let types = {
        '師資培育中心': '.teacher-post',
        '教官室': '.military-post',
        '語言中心': '.foreign-post'
    };

    return course.department in types ? types[course.department] : '#non-graded-optional-post';
}

function check_which_bulletin_required(course) {
    if (course.discipline != undefined && course.discipline != "") {
        //通識課有細分不同領域
        let types = {
            "文學學群": ".human",
            "歷史學群": ".human",
            "哲學學群": ".human",
            "藝術學群": ".human",
            "文化學群": ".human",
            "公民與社會學群": ".society",
            "法律與政治學群": ".society",
            "商業與管理學群": ".society",
            "心理與教育學群": ".society",
            "資訊與傳播學群": ".society",
            "生命科學學群": ".nature",
            "環境科學學群": ".nature",
            "物質科學學群": ".nature",
            "數學統計學群": ".nature",
            "工程科技學群": ".nature"
        };
        return course.discipline in types ? types[course.discipline] : '';
    } else {
        let types = {
            "語言中心": ".english",
            "夜共同科": ".english",
            "夜外文": ".english",
            "通識教育中心": ".chinese",
            "夜中文": ".chinese",
            "體育室": ".PE",
            "師資培育中心": ".teacher-post"
        };
        return course.department in types ? types[course.department] : "#obligatory-post";
    }
}
