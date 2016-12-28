class StufiniteTimetable {
    constructor(school, lang, user) {
        this.target = $("#time-table");
        this.language = lang;
        this.credits = 0;
        this.selected = [];

        this.user = user;

        this.department_name = {}; //包含科系完整名稱的物件

        // Initialize timetable with square plus buttons
        $("#time-table td").html(
            $('<i class="fa fa-plus-square fa-5x"></i>').on("click", this.addCourseListener.bind(this))
        );


        // 讀入系所名稱及代碼
        $.when($.getJSON("/api/get/dept", this.buildDeptArray.bind(this)))
            .then(() => {
                $.getJSON("/api/get/selected", (data) => {
                    if (data.length == 0) {
                        this.getCourse(this.addMajorCourses.bind(this), 'major', this.user.major, this.user.grade)
                        this.getCourse(this.addMajorOptionalCourses.bind(this), 'major', this.user.major, this.user.grade)
                    } else {
                        for (let i in data) {
                            this.getCourse(this.addCourse.bind(this), 'code', data[i])
                        }
                        this.getCourse(this.addMajorOptionalCourses.bind(this), 'major', this.user.major, this.user.grade)
                    }

                    delMask();
                });
            })
    }

    buildDeptArray(json) {
        for (let dept of json[this.user.career]) {
            this.department_name[dept["title_zh"]] = dept["code"]
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

    getCourse(method, mode, key, grade) {
        if (key === undefined || key === "") {
            return [];
        }

        if (mode === "code") {
            this.getCourseByCode(key, method);
        } else if (mode === "major") {
            if (grade === null || grade === undefined) {
                grade = 0;
            }
            return this.getCourseByMajor(method, key, parseInt(grade, 10));
        } else {
            return [];
        }
    }

    getCourseByCode(key, method) {
        $.getJSON('/api/get/course/code/' + key, (course) => {
            method(course[0]);
        });
    }

    getCourseByMajor(method, major, grade) {
        let dept = this.department_name[this.user.major];
        $.getJSON('/course/CourseOfDept/?dept=' + dept + '&school=NCHU', method);
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

        $.each(course.time, function(_, iv) {
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

    parseCourseTime(time) {
        let timesOfCourse = time.split(',')

        let result = []
        for (let timesByDay of timesOfCourse) {
            let formattedTime = {
                'time': []
            }
            let t = timesByDay.split('')
            formattedTime['day'] = t.shift()
            while (t.length != 0) {
                formattedTime['time'].push(t.shift())
            }
            result.push(formattedTime)
        }

        return result
    }

    getCourseType(course) {
        var major = this.user['major'].split(" ")[0];
        var level = this.user['major'].split(" ")[1] == undefined ? this.user['grade'] : this.user['grade'].toString() + this.user['major'].split(" ")[1];
        var d_major = this.user['second_major'];
        var d_level = this.user['grade'];

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
                return '.optional';
            }
        } else {
            return '.others';
        }
    }

    getCommonSubjectType(course) {
        let types = {
            '師資培育中心': '.teacher-post',
            '教官室': '.military-post',
            '語言中心': '.foreign-post'
        };

        return course.department in types ? types[course.department] : '.non-graded-optional-post';
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
            return course.department in types ? types[course.department] : ".obligatory-post";
        }
    }

    delSelected(code) {
        $.ajax({
            url: "/api/del/selected",
            method: "POST",
            data: {
                code: code,
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            dataType: "text"
        });
    }

    saveSelected() {
        let uploadData = '';
        for (let i of this.selected) {
            uploadData += uploadData === '' ? i : ',' + i;
        }

        $.ajax({
            url: "/api/put/selected",
            method: "POST",
            data: {
                text: uploadData,
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            dataType: "text"
        });
    }

    isCourseConflict(course) {
        let flag = false;
        let target = this.target
        let language = this.language
        $.each(this.parseCourseTime(course.time), function(_, iv) {
            $.each(iv.time, function(_, jv) {
                var $td = target.find('tr[data-hour=' + jv + '] td:eq(' + (iv.day - 1) + ')');
                if ($td.text() != "") { //用來判斷td裡面是不已經有放過課程了，但若先在裡面放個按鈕那.text()回傳回來的也是空字串
                    flag = true;
                    toastr.error(language == "zh_TW" ? "衝堂喔!請手動刪除衝堂的課程" : "Conflict! please drop some course manually.", {
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

        if (typeof(grade) === "number") {
            return false;
        }
        grade = grade.split("");
        return grade.length === 1 ? true : false;
    }

    clearDetail(code) {
        if ($(".detail-code").text() != new String(code)) {
            return;
        }
        $("#time-table").find("td").css("background-color", "white").css("color", "#403F3F")
        $("#course-detail").children().remove().end().html("<li>雙擊課程顯示資訊</li>")
    }

    addDetail(course) {
        if ($(".detail-code").text() == new String(course.code)) {
            this.clearDetail(course.code)
            return;
        }

        $("#time-table").find("td").css("background-color", "white").css("color", "#403F3F")
        $("#time-table").find("i[code=" + course.code + "]").parent().parent()
            .css("background-color", "#DEDEDE").css("color", "white")

        $("#course-detail").children().remove()
        let $detail = $(`
          <li>指導教授： <span class='detail-professor'></span></li>
          <li>課程代碼： <span class='detail-code'></span></li>
          <li>選修學分： <span class='detail-credits'></span></li>
          <li>上課地點： <a href='#' title='點擊開啟地圖'><span class='detail-location'></span></a></li>
          <li>先修科目： <span class='detail-prerequisite'></span></li>
          <li>課程備註： <span class='detail-note'></span></li>
          `)
            .find(".detail-professor").text(course.professor).end()
            .find(".detail-code").text(course.code).end()
            .find(".detail-credits").text(course.credits).end()
            .find(".detail-location").text(course.location).end()
            .find(".detail-prerequisite").text(course.prerequisite == undefined || course.prerequisite == "" ? "無" : course.prerequisite).end()
            .find(".detail-note").text(course.note == undefined || course.note == "" ? "無" : course.note).end()
        $("#course-detail").append($detail)
    }


    addCourse(course) {
        if (this.isCourseConflict(course)) {
            return;
        }

        let target = this.target;
        let language = this.language;

        for (let courseByDay of this.parseCourseTime(course.time)) {
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
                        this.getCourse(this.delCourse.bind(this), 'code', code)
                        this.clearDetail(code);
                    }).bind(this)).end()
                    .find('.title').text(course.title[language]).end()
                    .find('input').val(course.code).end()
                    .find('.professor').text(course.professor).end()
                    .find('.location').end()
                $td.html($cell);

                $cell.parent().bind("dblclick", (e) => {
                    this.addDetail(course);
                });
            }
        }

        // this.addCourseMessage(course);
        this.addCredit(course.credits);
        this.selected.push(course.code);
        this.saveSelected();
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

        if (course.discipline != "" && course.discipline != undefined) {
            //代表他是通識課
            if (language == 'zh_TW') {
                toastr1 = "學群:";
            } else if (language == 'en_US') {
                toastr1 = "Discipline:";
            }
            toast_mg.push(toastr1 + course.discipline);
            var possibility = function(course) {
                // a fuction that return the possibility of enrolling that course successfully.
                var pos = (course.number - course.enrolled_num) / course.number * 100;
                pos = new Number(pos);
                pos = pos.toFixed(2);
                if (pos < 0) {
                    return 0;
                }
                return pos;
            }(course);
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
        $.getJSON('http://localhost:8080/course/TimeOfCourse/?school=NCHU&degree=' + this.user.career + '&day=' + day + '&time=' + hour, (codes) => {
            for (let c of codes) {
                this.getCourse(window.searchbar.addResult.bind(window.searchbar), 'code', c)
            }
        });
        window.searchbar.show();
    }

    delCourse(course) {
        let target = this.target;
        let major = this.user['major'].split(" ")[0];

        if (course.obligatory_tf == true && course.for_dept == major) {
            toastr.warning(this.language == "zh_TW" ? "此為必修課，若要復原請點擊課表空格" : "This is a required course, if you want to undo, please click the \"plus\" symbol", {
                timeOut: 2500
            });
        }

        $.each(this.parseCourseTime(course.time), function(_, iv) {
            $.each(iv.time, function(_, jv) {
                var $td = target.find('tr[data-hour=' + jv + '] td:eq(' + (iv.day - 1) + ')');
                //td:eq()為搜尋td的陣列索引值，找到課程的時間    iv.day為星期，但因為td為陣列所以iv.day要減一    find()是找class!!
                $td.html($('<i class="fa fa-plus-square fa-5x"></i>').bind('click', window.timetable.addCourseListener.bind(window.timetable)));
            })
        })

        this.minusCredit(course.credits);
        this.selected.splice(this.selected.indexOf(course.code), 1);
        this.delSelected(course.code);
    }

    addMajorCourses(courses) {
        for (let code of courses['obligatory']['ClassA'][this.user.grade]) {
            this.getCourse(this.addCourse.bind(this), 'code', code)
        }
    }

    addMajorOptionalCourses(courses) {
        for (let grade in courses['optional']['ClassA']) {
            for (let code of courses['optional']['ClassA'][grade]) {
                this.getCourse(window.searchbar.addResult.bind(window.searchbar), 'code', code);
            }

        }
    }
}
