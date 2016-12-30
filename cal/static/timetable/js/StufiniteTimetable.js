class StufiniteTimetable {
  constructor(school, lang, user) {
    this.target = $("#time-table");
    this.language = lang;
    this.credits = 0;

    this.user = user;
    user.deptId = ["U56", "U66"]

    this.obligatory = {};
    this.optional = {};
    this.secondObligatory = {};
    this.secondOptional = {};

    // Initialize timetable with square plus buttons
    $("#time-table td").html($('<i class="fa fa-plus-square fa-5x"></i>').on("click", this.addCourseToSearchbar.bind(this)));

    this.getCourseByMajor((jsonOfCode) => {
      this.InitializeByMajor(jsonOfCode);
      delMask();
    });
  }

  InitializeByMajor(jsonOfCode) {
    this.buildMajorObligatoryIndex(jsonOfCode);
    if (this.user.selected.length == 0) {
      this.addMajorCourses();
      this.addMajorOptionalCourses();
    } else {
      for (let i in this.user.selected) {
        this.getCourseByCode(this.addCourse.bind(this), this.user.selected[i]);
      }
      this.addMajorOptionalCourses();
    }
    if (this.user.deptId.length > 1) {
      this.InitializeBySecondMajor();
    }
  }

  InitializeBySecondMajor() {
    this.getCourseBySecondMajor((jsonOfCode) => {
      this.buildSecondMajorObligatoryIndex(jsonOfCode);
      this.addSecondMajorCourses();
      this.addSecondMajorOptionalCourses();
    });
  }

  buildMajorObligatoryIndex(json) {
    for (let i in json['obligatory']['ClassA']) {
      this.obligatory[i] = json['obligatory']['ClassA'][i];
    }
    for (let i in json['optional']['ClassA']) {
      this.optional[i] = json['optional']['ClassA'][i];
    }
  }

  buildSecondMajorObligatoryIndex(json) {
    for (let i in json['obligatory']['ClassA']) {
      this.secondObligatory[i] = json['obligatory']['ClassA'][i];
    }
    for (let i in json['optional']['ClassA']) {
      this.secondOptional[i] = json['optional']['ClassA'][i];
    }
  }

  addMajorCourses() {
    for (let code of this.obligatory[this.user.grade]) {
      this.getCourseByCode(this.addCourse.bind(this), code);
    }
  }

  addMajorOptionalCourses() {
    for (let grade in this.optional) {
      for (let code of this.optional[grade]) {
        this.getCourseByCode(window.searchbar.addResult.bind(window.searchbar), code);
      }
    }
  }

  addSecondMajorCourses() {
    for (let grade in this.secondObligatory) {
      for (let code of this.secondObligatory[grade]) {
        this.getCourseByCode(window.searchbar.addResult.bind(window.searchbar), code);
      }
    }
  }

  addSecondMajorOptionalCourses() {
    for (let grade in this.secondOptional) {
      for (let code of this.secondOptional[grade]) {
        this.getCourseByCode(window.searchbar.addResult.bind(window.searchbar), code);
      }
    }
  }

  getCourseByMajor(method) {
    $.getJSON('/course/CourseOfDept/?dept=' + this.user.deptId[0] + '&school=NCHU', method);
  }

  getCourseBySecondMajor(method) {
    $.getJSON('/course/CourseOfDept/?dept=' + this.user.deptId[1] + '&school=NCHU', method);
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

  getCourseByCode(method, key) {
    $.getJSON('/api/get/course/code/' + key, (course) => {
      method(course[0]);
    });
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
      let t = timesByDay.split('-')
      formattedTime['day'] = t.shift()
      while (t.length != 0) {
        formattedTime['time'].push(t.shift())
      }
      result.push(formattedTime)
    }

    return result
  }

  isCourseObligatory(code) {
    for (let i in this.obligatory) {
      for (let j in this.obligatory[i]) {
        if (this.obligatory[i][j] == code) {
          return true;
        }
      }
    }
    return false;
  }

  isCourseOptional(code) {
    for (let i in this.optional) {
      for (let j in this.optional[i]) {
        if (this.optional[i][j] == code) {
          return true;
        }
      }
    }
    return false;
  }

  isCourseSecondObligatory(code) {
    for (let i in this.secondObligatory) {
      for (let j in this.secondObligatory[i]) {
        if (this.secondObligatory[i][j] == code) {
          return true;
        }
      }
    }
    return false;
  }

  isCourseSecondOptional(code) {
    for (let i in this.secondOptional) {
      for (let j in this.secondOptional[i]) {
        if (this.secondOptional[i][j] == code) {
          return true;
        }
      }
    }
    return false;
  }

  getCourseType(course) {
    if (this.isCourseObligatory(course.code)) {
      return '.obligatory';
    } else if (this.isCourseOptional(course.code)) {
      return '.optional';
    } else if (this.isCourseSecondObligatory(course.code)) {
      return '.second-obligatory';
    } else if (this.isCourseSecondOptional(course.code)) {
      return '.second-optional';
    } else {
      return this.getGeneralCourseType(course);
    }
  }

  getGeneralCourseType(course) {
    if (course.discipline != undefined && course.discipline != "") {
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
      return course.discipline in types
        ? types[course.discipline]
        : '.others';
    } else {
      let types = {
        "語言中心": ".english",
        "夜共同科": ".english",
        "夜外文": ".english",
        "通識教育中心": ".chinese",
        "夜中文": ".chinese",
        "體育室": ".PE",
        "教官室": ".military-post",
        "師資培育中心": ".teacher-post"
      };
      return course.department in types
        ? types[course.department]
        : ".others";
    }
  }

  isSelected(code) {
    for (let i in this.user.selected) {
      if (this.user.selected == code) {
        return true;
      }
    }
    return false;
  }

  delSelected(code) {
    this.user.selected.splice(this.user.selected.indexOf(code), 1);
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

  addSelected(code) {
    if (this.isSelected(code)) {
      return;
    }

    this.user.selected.push(code);
    $.ajax({
      url: "/api/put/selected",
      method: "POST",
      data: {
        text: code,
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
          toastr.error(language == "zh_TW"
            ? "衝堂喔!請手動刪除衝堂的課程"
            : "Conflict! please drop some course manually.", {timeOut: 2500});
          return;
        }
      });
      if (flag == true) {
        return;
      }
    });
    return flag;
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
    $("#time-table").find("i[code=" + course.code + "]").parent().parent().css("background-color", "#DEDEDE").css("color", "white")

    $("#course-detail").children().remove()
    let $detail = $(`
          <li>指導教授： <span class='detail-professor'></span></li>
          <li>課程代碼： <span class='detail-code'></span></li>
          <li>選修學分： <span class='detail-credits'></span></li>
          <li>上課地點： <a href='#' title='點擊開啟地圖'><span class='detail-location'></span></a></li>
          <li>先修科目： <span class='detail-prerequisite'></span></li>
          <li>課程備註： <span class='detail-note'></span></li>
          `).find(".detail-professor").text(course.professor).end().find(".detail-code").text(course.code).end().find(".detail-credits").text(course.credits).end().find(".detail-location").text(course.location).end().find(".detail-prerequisite").text(course.prerequisite == undefined || course.prerequisite == ""
      ? "無"
      : course.prerequisite).end().find(".detail-note").text(course.note == undefined || course.note == ""
      ? "無"
      : course.note).end()
    $("#course-detail").append($detail)
  }

  addCourseToSearchbar(e) {
    let day = $(e.target).closest("td").attr("data-day");
    let hour = $(e.target).closest("tr").attr("data-hour");

    $.getJSON('/course/TimeOfCourse/?school=NCHU&degree=' + this.user.career + '&day=' + day + '&time=' + hour, (codes) => {
      window.searchbar.clear();
      for (let c of codes) {
        this.getCourseByCode(window.searchbar.addResult.bind(window.searchbar), c);
      }
      window.searchbar.show();
    });
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
        $cell.find('.remove').attr('code', course.code).bind('click', (function(e) {
          let code = $(e.target).attr('code');
          this.getCourseByCode(this.delCourse.bind(this), code)
          this.clearDetail(code);
        }).bind(this)).end().find('.title').text(course.title[language]).end().find('input').val(course.code).end().find('.professor').text(course.professor).end().find('.location').end()
        $td.html($cell);

        $cell.parent().bind("dblclick", (e) => {
          this.addDetail(course);
        });
      }
    }

    this.addCredit(course.credits);
    this.addSelected(course.code);
  }

  delCourse(course) {
    let target = this.target;
    let major = this.user['major'].split(" ")[0];

    if (this.isCourseObligatory(course.code)) {
      toastr.warning(this.language == "zh_TW"
        ? "此為必修課，若要復原請點擊課表空格"
        : "This is a required course, if you want to undo, please click the \"plus\" symbol", {timeOut: 2500});
    }

    $.each(this.parseCourseTime(course.time), (_, iv) => {
      $.each(iv.time, (_, jv) => {
        var $td = target.find('tr[data-hour=' + jv + '] td:eq(' + (iv.day - 1) + ')');
        //td:eq()為搜尋td的陣列索引值，找到課程的時間    iv.day為星期，但因為td為陣列所以iv.day要減一    find()是找class!!
        $td.html($('<i class="fa fa-plus-square fa-5x"></i>').bind('click', this.addCourseToSearchbar.bind(this)));
      })
    })

    this.minusCredit(course.credits);
    this.delSelected(course.code);
  }
}
