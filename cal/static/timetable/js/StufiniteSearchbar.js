class StufiniteSearchbar {
  constructor() {
    this.user = window.cpUser;
    this.language = "zh_TW"
    this.type = ['optional', 'human', 'society', 'nature', 'PE']
    this.tabs = ['deptObl', 'deptOpt', 'general', 'PE', 'others', 'search'];
    this.currentTab = 'deptObl';

    this.clear();
    this.InitializeSearchForm();

    let tab = $('.stufinite-searchbar-tab');
    for (let t of this.tabs) {
      tab.find('span.tab-' + t).bind('click', this.displayTab.bind(this));
      $('.' + t + '-container').hide();
    }
    $('.tab-deptObl').css("background-color", "#DEDEDE").css("color", "white")
    $('.deptObl-container').show();

    $.getJSON('/api/get/dept', (json) => {
      $('.stufinite-searchbar-department-select').children().remove();
      for (let dept of json[this.user.career]) {
        let opt = $('<option>');
        opt.val(dept.code);
        opt.text(dept.title[this.language])
        $('.stufinite-searchbar-department-select').append(opt)
      }
      $('.stufinite-searchbar-department-select').val(this.user.major);
    });
    $('.stufinite-searchbar-department-button').bind("click", () => {
      this.clear();
      let dept = $('.stufinite-searchbar-department-select').val();

      $.getJSON('/course/CourseOfDept/?dept=' + dept + '&school=' + this.user.school, (json) => {
        for (let grade in json['obligatory']) {
          for (let index in json['obligatory'][grade]) {
            window.timetable.getCourseByCode((course) => {
              this.addResult(course, undefined, grade, true);
            }, json['obligatory'][grade][index]);
          }
        }

        for (let grade in json['optional']) {
          for (let index in json['optional'][grade]) {
            window.timetable.getCourseByCode((course) => {
              this.addResult(course, undefined, grade, false);
            }, json['optional'][grade][index]);
          }
        }
      });

      this.currentTab = 'deptObl';
      this.displayTabByName(this.currentTab);
    });
  }


  InitializeSearchForm() {
    // Initialize search-form behavior
    document.querySelector(".stufinite-app-searchbar-toggle").addEventListener("click", (e) => {
        window.searchbar.hide();
    });
    document.querySelector("#search-form").addEventListener("focus", () => {
      searchbar.show();
    });
    document.querySelector("#search-form").addEventListener("change", (e) => {
      let raw_key = $(e.target).val();
      if (raw_key.length < 2) {
        window.searchbar.clear();
        return;
      }
      window.searchbar.clear("搜尋中...")

      let key = '';
      for (let char of raw_key.split(' ')) {
        key += char + '+';
      }
      key = key.slice(0, -1);

      $.getJSON("/search/?keyword=" + key + "&school=NCHU", (c_by_key) => {
        if (c_by_key.length == 0) {
          window.searchbar.clear("找不到與\"" + key + "\"相關的課程")
          return;
        }
        window.searchbar.clear()
        for (let i of c_by_key) {
          window.timetable.getCourseByCode((course) => {
            window.searchbar.addResult(course, true);
          }, i)
        }
      });
    });
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
    $(".stufinite-app-searchbar-container").show("slide", {
      direction: "right"
    }, 300);
  }

  hide() {
    $(".stufinite-app-searchbar-toggle").attr("data-toggle", "false")
    $(".stufinite-app-searchbar-container").hide("slide", {
      direction: "right"
    }, 300);
  }

  clear(placeholder) {
    $('.stufinite-searchbar-placeholder').show();
    $('.stufinite-searchbar-result-list').empty();
    $('.stufinite-searchbar-dept-list').children().empty();
    $('.stufinite-searchbar-result-title').hide();
    if (placeholder != undefined) {
      $(".stufinite-searchbar-placeholder").text(placeholder).show()
    } else {
      $('.stufinite-searchbar-placeholder').text("此標籤頁無搜尋結果，請查看其他標籤頁，或點擊空堂時段或使用關鍵字搜尋").show();
    }
  }

  addResult(course, search = undefined, grade = undefined, obligatory = undefined) {
    let targetName = window.timetable.getCourseType(course)
    if (obligatory != undefined) {
      if (obligatory) {
        targetName = '.obligatory';
      } else {
        targetName = '.optional';
      }
    }

    if (search != undefined) {
      targetName += '-search';
    } else if (grade != undefined) {
      targetName += '-' + grade;
    }
    let target = $(targetName);

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
      .find('h4.title').text(course.title[this.language]).end()
      .find('span.info').text(window.timetable.getCourseTimeString(course) + ' | ' + course.professor).end()
      .find('span.grade').text(grade != undefined ? grade + '年級' : '').end()
      .find('button.join').attr('code', course.code).bind('click', (e) => {
        let code = $(e.target).attr('code');
        window.timetable.getCourseByCode(window.timetable.addCourse.bind(window.timetable), code);
        this.hide();
      }).end()
      .find('button.detail').bind('click', () => {
        window.timetable.addCourseToDetail(course)
      }).end()

    target.append(result);

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
