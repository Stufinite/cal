var bulletin_post = function($target, course, language) {
    var result = $(
        `<div class="stufinite-searchbar-result-item">
            <h4 class='title'></h4>
            <span class='info'></span>
            <div class="action-btn">
              <button><a class='join'>加入</a></button>
              <button><a class='review'>心得</a></button>
              <button><a class='detail'>詳細資料</a></button>
            </div>
          </div>`);

    result
        .find('h4.title').text(language == "zh_TW" ? course.title_parsed["zh_TW"] : course.title_parsed["en_US"]).end()
        .find('span.info').text(build_bulletin_time(course) + ' | ' + course.professor).end()
        .find('a.join').attr('code', course.code).bind('click', function() {
            var code = $(this).attr('code');
            course = courses[code][0];
            StufiniteTimetable.prototype.addCourse($('#time-table'), course, language);
        }).end()
        .find('a.review').attr('href', 'http://feedback.nchusg.org/search/?q=' + course.title_short).end()
        .find('a.detail').attr('href', course.url).end()

    StufiniteSearchbar.prototype.addResult($target, result);
};

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

/**********這個函式是用來刪除一整門課程的**********/
var delete_course = function($target, course) {
    //假設target為time-table的參數，course為courses的某一個課程
    if (course.for_dept == window.user['returnarr']['d_major']) {
        var color_str = "available2" //the option of double major.
    } else {
        var color_str = "available"
    }
    $.each(course.time_parsed, function(ik, iv) {
        //each是for迴圈 time-parsed[{...}, {...}]，以微積分為例:一個{"day"+"time"}就是陣列的一格，所以ik為0~1(兩次)
        $.each(iv.time, function(jk, jv) { //同上，iv.time為"time"的陣列{3,4}，jk為0~1、jv為3~4(節數)
            var $td = $target.find('tr[data-hour=' + jv + '] td:eq(' + (iv.day - 1) + ')');
            //td:eq()為搜尋td的陣列索引值，找到課程的時間    iv.day為星期，但因為td為陣列所以iv.day要減一    find()是找class!!
            $td.empty(); //顯示課程，把cell.html()塞到<td>tag裡面
            $td.html('<span class="fa fa-plus-square fa-5x"></span>');
        })
    })
    minus_credits(course);
    change_color($("button[value=" + course.code + "]"), color_str);
    $.each(window.user['time_table'], function(ik, iv) {
        //this for loop is to see which element in this array is the one i want to delete.
        if (iv.code == course.code) {
            window.user['time_table'].splice(ik, 1);
            //splice can delete the ik'th value and 1 means one only want to delete one value, you can use 3 to delete more value.
            return false;
        }
    })
};
