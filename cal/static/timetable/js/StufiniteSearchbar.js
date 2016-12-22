class StufiniteSearchbar {
    constructor() {
        this.isVisible = false;
        this.type = ['optional', 'human', 'society', 'nature', 'PE']
    }

    show() {
        $(".stufinite-app-searchbar-toggle").attr("data-toggle", "true")
        $(".stufinite-app-searchbar-container").animate({
            right: 0
        }, 200);
        this.isVisible = true;
    }

    hide() {
        $(".stufinite-app-searchbar-toggle").attr("data-toggle", "false")
        $(".stufinite-app-searchbar-container").animate({
            right: "-300px"
        }, 200);
        this.isVisible = false;
    }

    clear(placeholder) {
        $('.stufinite-searchbar-result-list').empty();
        $('.stufinite-searchbar-placeholder').text("請點擊空堂時段或使用關鍵字搜尋").hide();
        $('.stufinite-searchbar-result-title').hide();
        if (placeholder != undefined) {
            $(".stufinite-searchbar-placeholder").text(placeholder).show()
        }
    }

    addResult(target, course, language) {
        if ($('.stufinite-searchbar-placeholder').is(':visible')) {
            $('.stufinite-searchbar-placeholder').hide();
        }

        let result = $(
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
            .find('span.info').text(window.timetable.getCourseTime(course) + ' | ' + course.professor).end()
            .find('a.join').attr('code', course.code).bind('click', (function(e) {
                let code = $(e.target).attr('code');
                course = window.timetable.getCourse('code', code)[0];
                window.timetable.addCourse(course);
                window.timetable.addDetail(course);
                this.hide();
            }).bind(this)).end()
            .find('a.review').attr('href', 'http://feedback.nchusg.org/search/?q=' + course.title_parsed["zh_TW"]).end()
            .find('a.detail').bind('click', () => {
                window.timetable.addDetail(course)
            }).end()

        target.parent().find('.stufinite-searchbar-result-title').show();
        target.append(target, result);
    }
}
