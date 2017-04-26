(function main() {
  addMask();

  createUserProfile((user) => {
    window.searchbar = new StufiniteSearchbar("NCHU", "zh_TW", user)
    window.timetable = new StufiniteTimetable("NCHU", "zh_TW", user)

    document.querySelector(".stufinite-app-searchbar-toggle").addEventListener("click", (e) => {
      if (window.searchbar.isVisible) {
        window.searchbar.hide();
      } else {
        window.searchbar.show();
      }
    });

    document.querySelector(".stufinite-course-info-close").addEventListener("click", (e) => {
      $('.stufinite-course-info-container').hide();
    });

    InitializeSearchForm();
  });
})()

function createUserProfile(func) {
  let careerMap = {
    'U': '學士學位',
    'G': '碩士學位',
    'D': '博士學位',
    'R': '在職專班',
    'W': '在職專班',
    'N': '進修學士學位'
  };
  let departmentList = {};
  $.getJSON('/static/timetable/json/NCHU/Department.json', (response) => {
    for (let career of response) {
      departmentList[career.degree] = career.department;
      $('#user-profile-career').append(
        $('<option>').val(career.degree).text(careerMap[career.degree])
      );
    }
    for (let department of departmentList[$('#user-profile-career').val()]) {
      $('#user-profile-department').append(
        $('<option>').val(department.value).text(department.zh_TW)
      );
    }
  });

  $('#user-profile-career').bind('change', () => {
    $('#user-profile-department').empty();
    for (let department of departmentList[$('#user-profile-career').val()]) {
      $('#user-profile-department').append(
        $('<option>').val(department.value).text(department.zh_TW)
      );
    }
  });

  $('#user-profile-btn').bind('click', () => {
    let user = {
      "second_major": "",
      "career": $('#user-profile-career').val(),
      "grade": $('#user-profile-department').val(),
      "major": $('#user-profile-department:selected').text(),
      "selected": [],
      "username": "Guest",
      "dept_id": [$('#user-profile-department').val()]
    }
    func(user);
    $('#stufinite-create-user-profile').hide();
  });
}

function addMask() {
  $("body").append($("<div id='page-mask'>"));
}

function delMask() {
  $("body").find("#page-mask").remove();
}

function InitializeSearchForm() {
  // Initialize search-form behavior
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

function getCookie(name) {
  //name should be 'csrftoken', as an argument to be sent into getCookie()
  var cookieValue = null;
  if (document.cookie && document.cookie != '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = jQuery.trim(cookies[i]);
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) == (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
