class StufiniteTimetable {
    constructor(school, lang) {
        this.language = lang;
        this.target = $("#time-table");
        this.credits = 0;
        this.selected = {}

        this.department_name = {}
        this.coursesByCode = {}; //以課程代碼為 key 的物件
        this.coursesByTeacher = {}; //以老師姓名為 key 的物件
        this.coursesByName = {}; //以課程名稱為 key 的物件
        this.coursesByDay = {}; //以日和小時為 key 的二維物件
        this.coursesByMajor = {}; //以科系和年級為 key 的二維物件

        // Initialize timetable with square plus buttons
        $("#time-table td").html(
            $('<i class="fa fa-plus-square fa-5x"></i>').on("click", this.addCourseListener.bind(this))
        );

        //1. O.json is suitable for all kind of degree, so it will be loaded in automatically.
        //2. 當文件準備好的時候，讀入department的json檔, 因為這是顯示系所，沒多大就全部都載進來
        $.when($.getJSON("/static/course/json/O.json", this.buildCourseIndex.bind(this)),
            $.getJSON("/static/course/json/department.json", this.buildDeptArray.bind(this)))
        $.when($.getJSON("/static/course/json/U.json", this.buildCourseIndex.bind(this)))
            .then((function() {
                this.addMajorCourses("資訊科學與工程學系學士班", "4");
            }).bind(this))
    }

    buildDeptArray(json) {
        for (let iv of json) {
            if (this.department_name[iv.degree] === undefined) {
                this.department_name[iv.degree] = {};
            }

            for (let jv of iv.department) {
                if (this.department_name[iv.degree][jv.zh_TW] === undefined) {
                    this.department_name[iv.degree][jv.zh_TW] = {};
                }

                var option = "";
                option += jv.value + '-' + jv["zh_TW"];
                this.department_name[iv.degree][jv.zh_TW]["zh_TW"] = option;

                var option = "";
                option += jv.value + '-' + jv["en_US"];
                this.department_name[iv.degree][jv.zh_TW]["en_US"] = option;
            }
        }
    }

    buildCourseIndex(json) {
        for (let iv of json.course) {
            //初始化 coursesByMajor
            if (this.coursesByMajor[iv.for_dept] === undefined) {
                this.coursesByMajor[iv.for_dept] = {};
            }
            if (this.coursesByMajor[iv.for_dept][iv.class] === undefined) {
                this.coursesByMajor[iv.for_dept][iv.class] = [];
            }
            this.coursesByMajor[iv.for_dept][iv.class].push(iv.code);

            //初始化 coursesByCode
            if (this.coursesByCode[iv.code] === undefined) {
                this.coursesByCode[iv.code] = [];
            }
            this.coursesByCode[iv.code].push(iv);

            //初始化 coursesByDay
            for (let jv of iv.time_parsed) {
                for (let mv of jv.time) {
                    if (this.coursesByDay[jv.day] === undefined) {
                        this.coursesByDay[jv.day] = {};
                    }
                    if (this.coursesByDay[jv.day][mv] === undefined) {
                        this.coursesByDay[jv.day][mv] = [];
                    }
                    this.coursesByDay[jv.day][mv].push(iv);
                }
            }

            //初始化 coursesByTeacher
            if (this.coursesByTeacher[iv.professor] === undefined) {
                this.coursesByTeacher[iv.professor] = [];
            }
            this.coursesByTeacher[iv.professor].push(iv);

            //初始化 coursesByName
            if (this.coursesByName[iv.title_parsed.zh_TW] === undefined) {
                //中文課名陣列
                this.coursesByName[iv.title_parsed.zh_TW] = [];
            }
            this.coursesByName[iv.title_parsed.zh_TW].push(iv);
            if (this.coursesByName[iv.title_parsed.en_US] === undefined) {
                //英文課名陣列
                this.coursesByName[iv.title_parsed.en_US] = [];
            }
            this.coursesByName[iv.title_parsed.en_US].push(iv);
        }
    }

    setCredit(num) {
        $("#credits").text(parseInt(num, 10));
        return num;
    }

    addCredit(num) {
        this.credits += parseInt(num, 10);
        this.setCredit(this.credits)
    }

    minusCredit(num) {
        this.credits -= parseInt(num, 10);
        this.setCredit(this.credits)
    }

    isCourseConflict(course) {
        let flag = false;
        let target = this.target
        $.each(course.time_parsed, function(_, iv) {
            $.each(iv.time, function(_, jv) {
                var $td = target.find('tr[data-hour=' + jv + '] td:eq(' + (iv.day - 1) + ')');
                if ($td.text() != "") { //用來判斷td裡面是不已經有放過課程了，但若先在裡面放個按鈕那.text()回傳回來的也是空字串
                    flag = true;
                    toastr.error(this.language == "zh_TW" ? "衝堂喔!請手動刪除衝堂的課程" : "Conflict! please drop some course manually.", {
                        timeOut: 2500
                    });
                    return;
                }
            });
            if (flag == true) {
                return;
            }
        });
        return flag;
    }

    addCourse(course) {
        let target = this.target;
        let language = this.language;
        let conflict = this.isCourseConflict(course);
        if (!conflict) {
            for (let courseByDay of course.time_parsed) {
                for (let courseByTime of courseByDay.time) {
                    let $cell = $(`
                    <div class="course">
                        <i class="remove fa fa-trash" aria-hidden="true"></i>
                        <span class="title"></span>
                        <span class="professor"></span>
                        <span class="location"></span>
                    </div>`)
                    let $td = target.find('tr[data-hour="' + courseByTime + '"] td:eq(' + (courseByDay.day - 1) + ')');

                    $cell
                        .find('.remove')
                        .attr('code', course.code)
                        .bind('click', (function(e) {
                            let code = $(e.target).attr('code');
                            this.delCourse(code);
                        }).bind(this)).end()
                        .find('.title').text(course.title_parsed[language]).end()
                        .find('input').val(course.code).end()
                        .find('.professor').text(course.professor).end()
                        .find('.location').end()
                    $td.html($cell);
                }
            }

            this.addCredit(course.credits);
            this.selected[course.code] = course;

            // window.user['time_table'].push(course); //here means once i add this course in my timetable, i will also record this object in a json format, to save this time_table for users.
            // window.user['idList'][course.code] = courses[course.code][0]['title_parsed']['zh_TW']; //建立一個以課程代號為key課程名稱為值的字典
            this.addCourseMessage(course);
        }
        // window.already_post = false;
        /*
        if it has add at least one course,
        make this boolean val false and it will trigger "beforeunload" event to prevent user accidently close tab.*/
        /*******Don't write below this line********/
    }

    addCourseMessage(course) {
        var language = this.language
        var toast_mg = [];
        var toastr1;
        var toastr2;
        if (language == 'zh_TW') {
            toastr1 = "代碼:";
            toastr2 = "剩餘名額:";
            toast_mg.push('課名:' + course.title_parsed[language]);
        } else if (language == 'en_US') {
            toastr1 = "Course ID:";
            toastr2 = "Remaining Seat:";
            toast_mg.push('Title:' + course.title_parsed[language]);
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
            var possibility = function(course) {
                var pos = (course.number - course.enrolled_num) / course.number * 100;
                pos = new Number(pos);
                pos = pos.toFixed(2);
                if (pos < 0) {
                    return 0;
                }
                return pos;
            }(course); // a fuction that return the possibility of enrolling that course successfully.
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

    addCourseListener(e) {

        let day = $(e.target).closest("td").attr("data-day");
        let hour = $(e.target).closest("tr").attr("data-hour");

        window.searchbar.clear();
        for (let course of this.coursesByDay[day][hour]) {
            window.searchbar.addResult($(this.getCourseType(course)), course, this.language)
        }
        window.searchbar.show();
    }

    delCourse(code) {
        let target = this.target;
        let major = window.user['returnarr']['major'];

        for (let course of this.getCourse('code', code)) {
            if (course.obligatory_tf == true && course.for_dept == major) {
                toastr.warning(this.language == "zh_TW" ? "此為必修課，若要復原請點擊課表空格" : "This is a required course, if you want to undo, please click the \"plus\" symbol", {
                    timeOut: 2500
                });
            }

            $.each(course.time_parsed, function(_, iv) {
                $.each(iv.time, function(_, jv) {
                    var $td = target.find('tr[data-hour=' + jv + '] td:eq(' + (iv.day - 1) + ')');
                    //td:eq()為搜尋td的陣列索引值，找到課程的時間    iv.day為星期，但因為td為陣列所以iv.day要減一    find()是找class!!
                    $td.html($('<i class="fa fa-plus-square fa-5x"></i>').bind('click', window.timetable.addCourseListener.bind(window.timetable)));
                })
            })
            this.minusCredit(course.credits);
        }
    }

    addMajorCourses(major, grade) {
        let duplicatedCourseNames = [];

        for (let course of this.getCourse('major', major, grade)) {
            if (course.obligatory_tf == true && course.for_dept == major && course.class == grade) {
                //這樣就可以保證我計算到的必修數量一定是該科系該年級該班級了
                //用來確認這個系有幾堂必修課是同名的
                let title_zh = course.title_parsed['zh_TW'];
                let title_len = title_zh.length;
                course.title_short = this.isDuplicated(title_zh[title_len - 1]) ? title_zh.substring(0, title_len - 1) : title_zh;
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
            let course = this.getCourse('code', duplicatedCourseNames[name].code)[0];
            if (duplicatedCourseNames[name].count === 1) {
                //只有必修課會被函式計算數量，所以就不用再判斷是否為必修了，一定是
                if (course.time_parsed == 0) {
                    //表示應該為實習課，所以無時間,他沒有正課時間和實習時間，反正就是都沒有時間，神奇的是[]在boolean判斷式中居然會被當作0
                    searchbar.addResult($(".optional"), course, language);
                } else {
                    this.addCourse(course);
                    //如果這個課名只有出現過一次，就可以自動填入
                }
            } else {
                if (course.obligatory_tf == true) {
                    $('.stufinite-searchbar-placeholder').hide();
                    window.searchbar.addResult($(".obligatory-post"), course, this.language)
                }
            }
        }

        for (let ik in this.coursesByMajor[major]) {
            let iv = this.coursesByMajor[major][ik];
            //系上所有的選修課都先填入bulletin
            if (this.haveMultipleClasses(grade)) {
                for (let jv of iv) {
                    for (let kv of this.getCourse('code', jv)) {
                        if (kv.obligatory_tf == false && kv.for_dept == major && kv.class == grade) {
                            // kv.class == grade limits only optional class for that grade will show!!!!
                            window.searchbar.addResult($(this.getCourseType(kv)), kv, this.language)
                        }
                    }
                }
            } else {
                var class_EN = grade.split("")[1]; //班級的A或B，就是最後那個代碼
                if (ik.split("")[1] == class_EN) {
                    for (let jv of iv) {
                        for (let kv of courses[jv]) {
                            if (kv.obligatory_tf == false && kv.for_dept == major && kv.class.split("")[1] == class_EN && kv.class.split("")[0] == ik.split("")[0]) {
                                window.searchbar.addResult($(getCourseType(kv)), kv, this.language)
                                return false;
                            }
                        }
                    }
                }
            }
        }
    }

    isDuplicated(input) {
        //input is the last character of short title.
        var code = input.charCodeAt(0);
        if (((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122))) {
            // it is a letter
            return true;
        } else {
            return false;
        }
    }

    haveMultipleClasses(grade) {
        //確認此系有沒有分AB班(選修用)
        grade = grade.split("");
        return grade.length === 1 ? true : false;
    }

    getCourse(mode, key, grade) {
        if (key === undefined || key === "") {
            return [];
        }

        if (mode === "code") {
            return this.getCourseByCode(key);
        } else if (mode === "title") {
            return this.getCourseByTitle(key);
        } else if (mode === "teacher") {
            return this.getCourseByTeacher(key);
        } else if (mode === "major") {
            if (grade === null || grade === undefined) {
                grade = 0;
            }
            return this.getCourseByMajor(key, parseInt(grade, 10));
        } else {
            return [];
        }
    }

    getCourseByCode(key) {
        return this.coursesByCode[key];
    }

    getCourseByTitle(class_title) {
        var posted_code = [];
        $.each(this.coursesByName, function(ik, iv) {
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
            result.push(this.getCourseByCode(code)[0]);
        }

        return result;
    }

    getCourseByTeacher(key) {
        return this.coursesByTeacher[key]
    }

    getCourseByMajor(major, grade) {
        var result = [];
        if (grade == 0) {
            for (let g in this.coursesByMajor[major]) {
                for (let code of this.coursesByMajor[major][g]) {
                    for (let course of this.getCourseByCode(code)) {
                        result.push(course);
                    }
                }
            }
        } else {
            for (let code of this.coursesByMajor[major][grade]) {
                for (let course of this.getCourseByCode(code)) {
                    result.push(course);
                }
            }
        }
        return result;
    }

    getCourseLocation(course) {
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

    getCourseTime(course) {
        var week = ["一", "二", "三", "四", "五"];
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

    getCourseType(course) {
        var major = window.user['returnarr']['major'];
        var level = window.user['returnarr']['level'];
        var d_major = window.user['returnarr']['d_major'];
        var d_level = window.user['returnarr']['d_level'];

        if (course.for_dept == major || ((course.for_dept == d_major) && (course.class == d_level)) || course.for_dept == "全校共同" || course.for_dept == "共同學科(進修學士班)") {
            //判斷如果是主系的課就不分年級全部都會顯示出來，如果是輔系的就只顯示該年級的課；如果for_dept==undefined就代表是通識課
            //如果為全校共同或共同學科(進修學士班)就會是體育、國防、服務學習、全校英外語 or general education, chinese and english.
            if (course.obligatory_tf == false && course.for_dept != major && course.for_dept != d_major) {
                //代表是教務處綜合課程查詢裡面的所有課、國防、師培、全校選修、全校英外語  (obligatory of 師培 can be true or false!!!)
                return this.getCommonSubjectType(course);
            } else if (course.obligatory_tf == true) {
                //判斷為國英文或是必修課和通識課!!!，包含體育 (obligatory of 師培 can be true or false!!!)
                return this.getSubjectType(course);
            } else if (course.obligatory_tf == false) {
                //決定選修課該貼到哪個年級的欄位
                // check_which_bulletin(course);
                return '.optional';
            }
        }
    }

    getCommonSubjectType(course) {
        let types = {
            '師資培育中心': '.teacher-post',
            '教官室': '.military-post',
            '語言中心': '.foreign-post'
        };

        return course.department in types ? types[course.department] : '#non-graded-optional-post';
    }

    getSubjectType(course) {
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
}

//
// StufiniteTimetable.prototype.downloadJson = function() {
//     window.user['user_name'] = $('#user_name').val();
//     window.user['user_dept'] = $('#user_dept').val();
//     var filename = $('#user_name').val();
//     var json_string = JSON.stringify(window.user);
//     var blob = new Blob([json_string], {
//         type: "application/json"
//     }); //這是存檔的物件
//     saveAs(blob, filename + ".json");
// }
//
// StufiniteTimetable.prototype.save = function() {
//     var postdata = $.extend({}, window.user);
//     postdata['csrfmiddlewaretoken'] = getCookie('csrftoken');
//     postdata['time_table'] = JSON.stringify(window.user['time_table']);
//     postdata['idList'] = JSON.stringify(window.user['idList']);
//     postdata['returnarr'] = JSON.stringify(window.user['returnarr']);
//     //post Method一定要驗證csrf token, or post會被禁止forbidden
//     $.post(".", postdata)
//         .done(function() {
//             toastr.success('恭喜您成功上傳課表囉~');
//             window.already_post = true;
//             redirect_loc = "/course/course_zh_TW/?name=" + postdata['user_name'];
//             document.location.href = redirect_loc; //重導向頁面到get的網址，這樣django template才能把使用者的書單丟進{% for %}
//         })
//         .fail(function() {
//             toastr.error('抱歉，上傳錯誤，請重新再試');
//         })
//         .always(function() {
//             console.log("finished");
//         });
// }
