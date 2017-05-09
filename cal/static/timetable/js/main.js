(function main() {
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      //已登入-可取得UserId和accessToken
      var uid = response.authResponse.userID;
      var accessToken = response.authResponse.accessToken;
    } else if (response.status === 'not_authorized') {
      //尚未通過第一階段授權
    } else {
      createUserProfile(() => {
        window.timetable = new StufiniteTimetable()
        window.searchbar = new StufiniteSearchbar()
      });
    }
  });
})();

function createUserProfile(func) {
  addMask();
  $('#stufinite-create-user-profile').show();

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
    window.cpUser = {
      "school": $("#user-profile-school").val(),
      "second_major": "",
      "career": $('#user-profile-career').val(),
      "grade": $('#user-profile-department').val(),
      "major": $('#user-profile-department:selected').text(),
      "selected": [],
      "username": "Guest",
      "dept_id": [$('#user-profile-department').val()]
    }

    func();
    delMask();
    $('#stufinite-create-user-profile').hide();
  });
}

function addMask() {
  $("body").append($("<div id='page-mask'>"));
}

function delMask() {
  $("body").find("#page-mask").remove();
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
