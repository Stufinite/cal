function StufiniteTimetable() {
}

StufiniteTimetable.prototype.init = function(school, lang) {
    // Initialize timetable with square plus buttons
    $("#time-table td").html(
        $('<i class="fa fa-plus-square fa-5x"></i>').on("click", function() {
            if ($(this).text() == "") {
                var major = window.user['returnarr']['major'];
                var level = window.user['returnarr']['level'];
                var d_major = window.user['returnarr']['d_major'];
                var d_level = window.user['returnarr']['d_level'];
                var day = $(this).closest("td").attr("data-day"); //因為我把同一時段的課程塞進陣列裡，所以要用index去取
                var hour = $(this).closest("tr").attr("data-hour");
                StufiniteSearchbar.prototype.clear();
                // console.log(major + ' = ' + d_major + ' = ' + d_level);
                // console.log(day + ' ' + hour);
                $.each(window.course_of_day[day][hour], function(ik, iv) {
                    if (iv.for_dept == major || ((iv.for_dept == d_major) && (iv.class == d_level)) || iv.for_dept == "全校共同" || iv.for_dept == "共同學科(進修學士班)") {
                        //判斷如果是主系的課就不分年級全部都會顯示出來，如果是輔系的就只顯示該年級的課；如果for_dept==undefined就代表是通識課；如果為全校共同或共同學科(進修學士班)就會是體育、國防、服務學習、全校英外語 or general education, chinese and english.
                        // console.log(iv)
                        if (iv.obligatory_tf == false && iv.for_dept != major && iv.for_dept != d_major) {
                            //代表是教務處綜合課程查詢裡面的所有課、國防、師培、全校選修、全校英外語  (obligatory of 師培 can be true or false!!!)
                            check_which_common_subject(iv);
                        } else if (iv.obligatory_tf == true) {
                            //判斷為國英文或是必修課和通識課!!!，包含體育 (obligatory of 師培 can be true or false!!!)
                            check_which_bulletin_required(iv);
                        } else if (iv.obligatory_tf == false) {
                            //決定選修課該貼到哪個年級的欄位
                            check_which_bulletin(iv);
                        }
                    }
                });
                StufiniteSearchbar.prototype.show();
            }
        })
    );
}

StufiniteTimetable.prototype.downloadJson = function() {
    window.user['user_name'] = $('#user_name').val();
    window.user['user_dept'] = $('#user_dept').val();
    var filename = $('#user_name').val();
    var json_string = JSON.stringify(window.user);
    var blob = new Blob([json_string], {
        type: "application/json"
    }); //這是存檔的物件
    saveAs(blob, filename + ".json");
}

StufiniteTimetable.prototype.save = function() {
    var postdata = $.extend({}, window.user);
    postdata['csrfmiddlewaretoken'] = getCookie('csrftoken');
    postdata['time_table'] = JSON.stringify(window.user['time_table']);
    postdata['idList'] = JSON.stringify(window.user['idList']);
    postdata['returnarr'] = JSON.stringify(window.user['returnarr']);
    //post Method一定要驗證csrf token, or post會被禁止forbidden
    $.post(".", postdata)
        .done(function() {
            toastr.success('恭喜您成功上傳課表囉~');
            window.already_post = true;
            redirect_loc = "/course/course_zh_TW/?name=" + postdata['user_name'];
            document.location.href = redirect_loc; //重導向頁面到get的網址，這樣django template才能把使用者的書單丟進{% for %}
        })
        .fail(function() {
            toastr.error('抱歉，上傳錯誤，請重新再試');
        })
        .always(function() {
            console.log("finished");
        });
}

StufiniteTimetable.prototype.delCourse = function(code) {
    var major = window.user['returnarr']['major'];
    var level = window.user['returnarr']['level'];
    $.each(courses[code], function(ik, iv) {
        if (iv.obligatory_tf == true && iv.for_dept == major) {
            if (window.language == "zh_TW") {
                toastr.warning("此為必修課，若要復原請點擊課表空格", {
                    timeOut: 2500
                });
            } else {
                toastr.warning("This is a required course, if you want to undo, please click the \"plus\" symbol", {
                    timeOut: 2500
                });
            }
            delete_course($('#time-table'), iv); //就跟add_course一樣，只是把填東西改成刪掉
            return false;
        } else {
            delete_course($('#time-table'), iv) //就跟add_course一樣，只是把填東西改成刪掉
            return false;
        }
    })
}

StufiniteTimetable.prototype.addCourse = function($target, course, language) {

    if (!$.isArray(course.time_parsed))
        throw 'time_parsed error'; //判斷time-parsed是不是陣列
    if ($.type(course.title_parsed) !== "object") //判斷課程名稱是不是物件
        throw 'title_parsed error';

    if (language == "zh_TW") {
        var tmpCh = course.title_parsed["zh_TW"].split(' '); //(這是中文課名)切割課程名稱，遇到空格就切開
        course.title_short = tmpCh[0]; //title_short是會自動宣告的區域變數，存沒有英文的課名
    } else {
        var tmpEn = course.title_parsed["en_US"];
        course.title_short = tmpEn;
    }

    var check_conflict = false; //他用來判斷是否衝堂，如果有則下面的if就會讓最外圈的each停止
    $.each(course.time_parsed, function(ik, iv) {
        $.each(iv.time, function(jk, jv) {
            var $td = $target.find('tr[data-hour=' + jv + '] td:eq(' + (iv.day - 1) + ')');
            if ($td.text() != "") { //用來判斷td裡面是不已經有放過課程了，但若先在裡面放個按鈕那.text()回傳回來的也是空字串
                check_conflict = true;
                toastr.error(window.language == "zh_TW" ? "衝堂喔!請手動刪除衝堂的課程" : "Conflict! please drop some course manually.", {
                    timeOut: 2500
                });
                return false; //傳回false就是跳離迴圈
            }
        });
        if (check_conflict == true) {
            return false;
        }
    });

    if (check_conflict == false) {
        $.each(course.time_parsed, function(ik, iv) {
            $.each(iv.time, function(jk, jv) { //同上，iv.    time為"time"的陣列{3,4}，jk為0~1、jv為3~4(節數)
                var $td = $target.find('tr[data-hour="' + jv + '"] td:eq(' + (iv.day - 1) + ')');
                var $cell = $(`
                  <i class="remove fa fa-trash" aria-hidden="true"></i>
                  <div class="course">
                      <span class="title">範例課程1</span>
                      <span class="professor">黃四郎</span>
                      <span class="location">S1001</span>
                  </div>`)
                console.log($cell.find('.remove'))
                $cell.find('.remove')
                    .attr('code', course.code)
                    .bind('click', function(e) {
                        console.log('adad')
                        var code = $(e.target).attr('code');
                        this.delCourse(code);
                    })
                    .end()
                    .find('.title')
                    .text(course.title_short)
                    .end()
                    .find('input')
                    .val(course.code)
                    .end()
                    .find('.professor')
                    .text(course.professor)
                    .end()
                    .find('.location')


                $td.html($cell); //顯示課程，把cell.html()塞到<td>tag裡面，就算裡面原本有按鈕也會直接被蓋掉，$.html()會取div裡面的東西
            });
        });
        add_credits(course);
        window.user['time_table'].push(course); //here means once i add this course in my timetable, i will also record this object in a json format, to save this time_table for users.
        window.user['idList'][course.code] = courses[course.code][0]['title_parsed']['zh_TW']; //建立一個以課程代號為key課程名稱為值的字典
        build_toastr_time(course, window.language);
    }
    window.already_post = false;
    /*
    if it has add at least one course,
    make this boolean val false and it will trigger "beforeunload" event to prevent user accidently close tab.*/
    /*******Don't write below this line********/
    if (check_conflict == false) {
        return ("available"); //沒衝堂，可以變色
    } else {
        return ("conflict") //衝堂，不要變色
    }
}
