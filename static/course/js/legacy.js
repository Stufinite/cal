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
            window.timetable.addCourse(course);
        }).end()
        .find('a.review').attr('href', 'http://feedback.nchusg.org/search/?q=' + course.title_short).end()
        .find('a.detail').attr('href', course.url).end()

    searchbar.addResult($target, result);
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
