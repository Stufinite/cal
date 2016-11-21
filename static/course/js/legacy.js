var bulletin_post = function($target, course, language) {
    console.log('bulletin_post');
    searchbar.addResult($target, course, language);
};

/********建立側欄所有課程的資訊(放入title中)********/
var build_bulletin_time = function(course) {
    var EN_CH = {
        "語言中心": "",
        "夜共同科": "",
        "夜外文": "",
        "通識中心": "",
        "夜中文": ""
    };
    var time = []; //time設定為空陣列
    $.each(course.time_parsed, function(ik, iv) {
        time.push("(" + week[iv.day - 1] + ")" + iv.time); //push是把裡面的元素變成陣列的一格
    })
    if (course.intern_time != "" && course.intern_time != undefined) { //不是每一堂課都會有實習時間
        time.push("實習時間:" + course.intern_time);
    }
    // if(course.discipline!=""&&course.discipline!=undefined){//代表他是通識課
    //     time.push(" "+course.discipline);
    // }
    else {}
    time = time.join(' '); //把多個陣列用" "分隔並合併指派給time，此為字串型態，若是將字串split('')，則會回傳一個陣列型態
    return time;
}

/*****建立 選擇課程後跳出toastr的資訊*****/
var build_toastr_time = function(course, language) {
    var EN_CH = {
        "語言中心": "",
        "夜共同科": "",
        "夜外文": "",
        "通識中心": "",
        "夜中文": ""
    };
    var toast_mg = [];
    var toastr1;
    var toastr2;
    if (language == 'zh_TW') {
        toastr1 = "代碼:";
        toastr2 = "剩餘名額:";
        toast_mg.push('課名:' + course.title_parsed[window.language]);
    } else if (language == 'en_US') {
        toastr1 = "Course ID:";
        toastr2 = "Remaining Seat:";
        toast_mg.push('Title:' + course.title_parsed[window.language]);
    }
    toast_mg.push(toastr1 + course.code);
    toast_mg.push(toastr2 + (course.number - course.enrolled_num));

    if (course.discipline != "" && course.discipline != undefined) { //代表他是通識課
        if (language == 'zh_TW') {
            toastr1 = "學群:";
        } else if (language == 'en_US') {
            toastr1 = "Discipline:";
        }
        toast_mg.push(toastr1 + course.discipline);
        var possibility = cal_possibility(course); // a fuction that return the possibility of enrolling that course successfully.
        //toast_mg.push("中籤率:" + possibility + "%");
    }
    if (course.note != "") {
        if (language == 'zh_TW') {
            toastr1 = "備註:";
        } else if (language == 'en_US') {
            toastr1 = "Note:";
        }
        toast_mg.push(toastr1 + course.note);
    }
    if (course.prerequisite != "") {
        //prerequisite means you need to enroll that course before enroll this course
        if (language == 'zh_TW') {
            toastr1 = "先修科目:";
        } else if (language == 'en_US') {
            toastr1 = "Prerequisite:";
        }
        toast_mg.push(toastr1 + course.prerequisite);
    }
    toast_mg = toast_mg.join('<br/>');
    toastr.info(toast_mg);
}


var return_init_user_json = function() {
    return {
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
