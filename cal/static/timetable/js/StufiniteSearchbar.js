class StufiniteSearchbar {
  constructor() {
    this.isVisible = false;
    this.type = ['optional', 'human', 'society', 'nature', 'PE']
    this.tabs = ['deptObl', 'deptOpt', 'general', 'PE', 'others', 'search'];
    this.currentTab = 'deptObl';

    let tab = $('.stufinite-searchbar-tab');
    for (let t of this.tabs) {
      tab.find('span.tab-' + t).bind('click', this.displayTab.bind(this));
      $('.' + t + '-container').hide();
    }
    $('.tab-deptObl').css("background-color", "#DEDEDE").css("color", "white")
    $('.deptObl-container').show();
  }

  displayTab(e) {
    let className = $(e.target).attr('class');
    this.displayTabByName(className.split('-')[1]);
  }

  displayTabByName(tabName) {
    this.currentTab = tabName;
    for (let t of this.tabs) {
      $('.tab-' + t).css("background-color", "white").css("color", "#403F3F")
      $('.' + t + '-container').hide();
    }
    $('.tab-' + tabName).css("background-color", "#DEDEDE").css("color", "white")
    $('.' + tabName + '-container').show();
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
      $('.stufinite-searchbar-placeholder').text("此標籤頁無搜尋結果，請查看其他標籤頁，或點擊空堂時段或使用關鍵字搜尋").show();
    }
  }

  addResult(course, search=undefined, grade=undefined) {
    let targetName = window.timetable.getCourseType(course)
    if (search != undefined) {
      targetName += '-search';
    } else if (grade != undefined) {
      targetName += '-' + grade;
    }
    let target = $(targetName);
    let language = window.timetable.language

    let result = $(
      `<div class="stufinite-searchbar-result-item">
              <h4 class='title'></h4>
              <span class='info'></span>
              <span class='grade'></span>
              <div class="action-btn">
                <button class='join'>加入</button>
                <button class='detail'>詳細資料</button>
              </div>
            </div>`);

    result
      .find('h4.title').text(language == "zh_TW" ? course.title["zh_TW"] : course.title["en_US"]).end()
      .find('span.info').text(window.timetable.getCourseTime(course.time) + ' | ' + course.professor).end()
      .find('span.grade').text(grade != undefined ? grade + '年級' : '').end()
      .find('button.join').attr('code', course.code).bind('click', (e) => {
        let code = $(e.target).attr('code');
        window.timetable.getCourseByCode(window.timetable.addCourse.bind(window.timetable), code);
        this.hide();
      }).end()
      .find('button.detail').bind('click', () => {
        window.timetable.addDetail(course)
      }).end()

    target.append(target, result);

    target.parent().find('.stufinite-searchbar-result-title').show();
    target.parent().parent().find('.stufinite-searchbar-placeholder').hide();
    if (targetName.startsWith('.obligatory') || targetName.startsWith('.optional')) {
      target.parent().parent().find('.stufinite-searchbar-result-title').show();
      target.parent().parent().parent().find('.stufinite-searchbar-placeholder').hide();
    }

    if (search != undefined) {
      this.currentTab = 'search';
      this.displayTabByName(this.currentTab)
    } else if (this.currentTab == 'search') {
        this.currentTab = 'general';
        this.displayTabByName(this.currentTab);
    }
  }
}
