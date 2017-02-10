class StufiniteTimetable {
  constructor(school, lang, user) {
    this.target = $("#time-table");
    this.school = school
    this.language = lang;
    this.credits = 0;

    this.user = user;

    this.obligatory = {};
    this.optional = {};
    this.secondObligatory = {};
    this.secondOptional = {};

    this.classroom = {};

    // Initialize timetable with square plus buttons
    $("#time-table td")
      .html($('<i class="fa fa-plus-square fa-5x"></i>')
      .on("mousedown", (e) => {
        $(e.target).css("color", "black")
      })
      .on("mouseup", (e) => {
        $(e.target).removeAttr("style")
      })
      .on("click", this.addCourseToSearchbar.bind(this)));

    $.getJSON('/static/timetable/json/NCHU/Classroom.json', (json) => {
      this.classroom = json;
    });

    this.getCourseByMajor((jsonOfCode) => {
      this.InitializeByMajor(jsonOfCode);
      delMask();
    });
  }

  InitializeByMajor(jsonOfCode) {
    this.buildObligatoryIndex(jsonOfCode, 'obligatory', 'optional');
    if (this.user.selected.length == 0) {
      this.addMajorCourses();
    } else {
      for (let i in this.user.selected) {
        this.getCourseByCode(this.addCourse.bind(this), this.user.selected[i]);
      }
    }

    this.addMajorCoursesToSearchbar('obligatory', 'optional');
    if (this.user.dept_id.length > 1) {
      this.InitializeBySecondMajor();
    }
  }

  InitializeBySecondMajor() {
    this.getCourseBySecondMajor((jsonOfCode) => {
      this.buildObligatoryIndex(jsonOfCode, 'secondObligatory', 'secondOptional');
      this.addMajorCoursesToSearchbar('secondObligatory', 'secondOptional');
    });
  }

  buildObligatoryIndex(json, obligatory, optional) {
    for (let i in json[obligatory]) {
      this[obligatory][i] = json['obligatory'][i];
    }
    for (let i in json['optional']) {
      this[optional][i] = json['optional'][i];
    }
  }

  addMajorCourses() {
    for (let code in this['obligatory'][this.user.grade]) {
      this.getCourseByCode(this.addCourse.bind(this), this['obligatory'][this.user.grade][code]);
    }
  }

  addMajorCoursesToSearchbar(obligatory, optional) {
    /* Obligatory part */
    for (let grade in this[obligatory]) {
      for (let code in this[obligatory][grade]) {
        let g = grade;
        this.getCourseByCode((course) => {
          window.searchbar.addResult(course, undefined, g);
        }, this[obligatory][grade][code]);
      }
    }

    /* Optioanl part */
    for (let grade in this[optional]) {
      for (let code in this[optional][grade]) {
        let g = grade;
        this.getCourseByCode((course) => {
          window.searchbar.addResult(course, undefined, g);
        }, this[optional][grade][code]);
      }
    }
  }

  getCourseByMajor(method) {
    $.getJSON('/course/CourseOfDept/?dept=' + this.user.dept_id[0] + '&school=' + this.school, method);
  }

  getCourseBySecondMajor(method) {
    $.getJSON('/course/CourseOfDept/?dept=' + this.user.dept_id[1] + '&school=' + this.school, method);
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

  getCourseLocation(location) {
    if (location != "") {
      for (let c in this.classroom) {
        let index = 0;
        for (let i = 0; i < location.length; i++) {
          // Find code of the building
          if (!isNaN(location.charAt(i))) {
            index = i;
            break;
          }
        }
        if (location.slice(0, index) == c) {
          return this.classroom[c] + location.slice(index, location.length)
        }
      }
    }
    return location;
  }

  getCourseTime(time) {
    if (time == "" || time == undefined) {
      return "無上課時間";
    }
    time = this.parseCourseTime(time);
    let dayChar = ['一', '二', '三', '四', '五', '六', '日'];
    let result = ''
    for (let d of time) {
      result += dayChar[parseInt(d.day, 10) - 1] + ' ';
      for (let h of d.time) {
        result += h + ' '
      }
      result += ', '
    }
    return result.slice(0, -3);
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
      return course.discipline in types ?
        types[course.discipline] :
        '.others';
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
      return course.department in types ?
        types[course.department] :
        ".others";
    }
  }

  isSelected(code) {
    for (let i in this.user.selected) {
      if (this.user.selected[i] == code) {
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
          toastr.error(language == "zh_TW" ?
            "衝堂喔!請手動刪除衝堂的課程" :
            "Conflict! please drop some course manually.", {
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

  clearDetail(code) {
    if ($(".detail-code").text() != new String(code)) {
      return;
    }
    $("#time-table").find("td").css("background-color", "white").css("color", "#403F3F")
    $("#course-detail").children().remove().end().html("<li>點擊圖示顯示課程詳細資訊</li>")
  }

  addDetail(course) {
    if ($(".detail-code").text() == new String(course.code)) {
      this.clearDetail(course.code)
      return;
    }

    $("#time-table").find("td").css("background-color", "white").css("color", "#403F3F")
    $("#time-table").find(".course[code=" + course.code + "]").parent().css("background-color", "#DEDEDE").css("color", "white")

    $("#course-detail").children().remove()
    let $detail = $(`
          <li>開設系所： <span class='detail-department'></span></li>
          <li>指導教授： <span class='detail-professor'></span></li>
          <li>課程代碼： <span class='detail-code'></span></li>
          <li>選修學分： <span class='detail-credits'></span></li>
          <li>上課地點： <a href='#' title=''><span class='detail-location'></span></a></li>
          <li>先修科目： <span class='detail-prerequisite'></span></li>
          <li>課程備註： <span class='detail-note'></span></li>
          `)
      .find(".detail-department").text(course.department).end()
      .find(".detail-professor").text(course.professor).end()
      .find(".detail-code").text(course.code).end()
      .find(".detail-credits").text(course.credits).end()
      .find(".detail-location").text(this.getCourseLocation(course.location)).end()
      .find(".detail-prerequisite")
      .text(course.prerequisite == undefined || course.prerequisite == "" ? "無" : course.prerequisite).end()
      .find(".detail-note")
      .text(course.note == undefined || course.note == "" ? "無" : course.note).end()
    $("#course-detail").append($detail)
  }

  addCourseToSearchbar(e) {
    let day = $(e.target).closest("td").attr("data-day");
    let hour = $(e.target).closest("tr").attr("data-hour");

    $.getJSON('/course/TimeOfCourse/?school=' + this.school + '&degree=O+' + this.user.career + '&day=' + day + '&time=' + hour + '&dept=C00+' + this.user.dept_id[0], (codes) => {
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
                        <i class="detail fa fa-book" aria-hidden="true"></i>
                        <i class="remove fa fa-trash" aria-hidden="true"></i>
                        <span class="title"></span>
                        <span class="professor"></span>
                        <span class="location"></span>
                    </div>`)
        let $td = target.find('tr[data-hour="' + courseByTime + '"] td:eq(' + (courseByDay.day - 1) + ')');

        $cell
          .find('.detail').bind('click', (e) => {
            this.addDetail(course)
          }).end()
          .find('.remove').bind('click', (e) => {
            this.delCourse(course)
            this.clearDetail(course.code);
          }).end()
          .find('.title').text(course.title[language]).end()
          .find('input').val(course.code).end()
          .find('.professor').text(course.professor).end().find('.location').end()
          .attr('code', course.code)

        $td.html($cell);
      }
    }

    this.addCredit(course.credits);
    this.addSelected(course.code);
  }

  delCourse(course) {
    let target = this.target;
    let major = this.user['major'].split(" ")[0];

    if (this.isCourseObligatory(course.code)) {
      toastr.warning(this.language == "zh_TW" ?
        "此為必修課，若要復原請點擊課表空格" :
        "This is a required course, if you want to undo, please click the \"plus\" symbol", {
          timeOut: 2500
        });
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
