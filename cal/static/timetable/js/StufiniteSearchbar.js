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
        $('.stufinite-searchbar-placeholder').show();
        $('.stufinite-searchbar-result-list').empty();
        $('.stufinite-searchbar-result-title').hide();
        if (placeholder != undefined) {
            $(".stufinite-searchbar-placeholder").text(placeholder).show()
        } else {
            $('.stufinite-searchbar-placeholder').text("請點擊空堂時段或使用關鍵字搜尋").show();
        }
    }

    addResult(course) {
        let target = $(window.timetable.getCourseType(course));
        let language = window.timetable.language

        if ($('.stufinite-searchbar-placeholder').is(':visible')) {
            $('.stufinite-searchbar-placeholder').hide();
        }

        let result = $(
            `<div class="stufinite-searchbar-result-item">
              <h4 class='title'></h4>
              <span class='info'></span>
              <div class="action-btn">
                <button class='join'>加入</button>
                <button class='detail'>詳細資料</button>
              </div>
            </div>`);

        result
            .find('h4.title').text(language == "zh_TW" ? course.title["zh_TW"] : course.title["en_US"]).end()
            .find('span.info').text(window.timetable.getCourseTime(course.time) + ' | ' + course.professor).end()
            .find('button.join').attr('code', course.code).bind('click', (e) => {
                let code = $(e.target).attr('code');
                console.log(code)
                window.timetable.getCourseByCode(window.timetable.addCourse.bind(window.timetable), code);
                this.hide();
            }).end()
            .find('button.detail').bind('click', () => {
                window.timetable.addDetail(course)
            }).end()

        target.parent().find('.stufinite-searchbar-result-title').show();
        target.append(target, result);
    }
}
