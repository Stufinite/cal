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
