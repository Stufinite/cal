class StufiniteTimetable {
    constructor(school, lang) {
        this.language = lang;
        this.target = $("#time-table");
        this.credits = 0;
        this.selected = {}

        // Initialize timetable with square plus buttons
        $("#time-table td").html(
            $('<i class="fa fa-plus-square fa-5x"></i>').on("click", this.addCourseListener)
        );
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
                        .bind('click', function(e) {
                            let code = $(e.target).attr('code');
                            window.timetable.delCourse(code);
                        }).end()
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

    addCourseListener() {
        let day = $(this).closest("td").attr("data-day");
        let hour = $(this).closest("tr").attr("data-hour");

        window.searchbar.clear();
        for (let course of window.course_of_day[day][hour]) {
            window.searchbar.addResult($(getCourseType(course)), course, window.timetable.language)
        }
        window.searchbar.show();
    }

    delCourse(code) {
        let target = this.target;
        let major = window.user['returnarr']['major'];

        for (let course of courses[code]) {
            if (course.obligatory_tf == true && course.for_dept == major) {
                toastr.warning(this.language == "zh_TW" ? "此為必修課，若要復原請點擊課表空格" : "This is a required course, if you want to undo, please click the \"plus\" symbol", {
                    timeOut: 2500
                });
            }

            $.each(course.time_parsed, function(_, iv) {
                $.each(iv.time, function(_, jv) {
                    var $td = target.find('tr[data-hour=' + jv + '] td:eq(' + (iv.day - 1) + ')');
                    //td:eq()為搜尋td的陣列索引值，找到課程的時間    iv.day為星期，但因為td為陣列所以iv.day要減一    find()是找class!!
                    $td.html($('<i class="fa fa-plus-square fa-5x"></i>').bind('click', window.timetable.addCourseListener));
                })
            })
            this.minusCredit(course.credits);
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
