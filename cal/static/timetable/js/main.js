// var loginUrl = 'https://login.campass.com.tw';
var loginUrl = 'http://test.localhost.login.campass.com.tw:8080';

(function main() {
  $.ajax({
    url: loginUrl + '/fb/user',
    dataType: 'json',
    xhrFields: {
      withCredentials: true
    },
    success: (res) => {
      window.userVerify = res.verify
      window.userId = res.id
      window.userName = res.name
      if (res.profile == null) {
        // User is registered but never used cal
        editUser();
      } else {
        // Load user data normally
        loadUser(res);
      }
      // Change status of Facebook button
      $('#fb-login-btn').html('<i class="fa fa-facebook-square" aria-hidden="true"></i> 登出').attr('href', loginUrl + '/fb/logout?redirect_service=www')
    },
    error: (res) => {
      // User is not logged in
      guest();
    }
  });
})();

function promptUserLogin() {
  addMask();
  $('#prompt-login').show();
}

function promptUserprofile(func) {
  addMask();
  $('#stufinite-create-user-profile').show();

  // Retrieve department list
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

  // Update deaprtment list after career change
  $('#user-profile-career').bind('change', () => {
    $('#user-profile-department').empty();
    for (let department of departmentList[$('#user-profile-career').val()]) {
      $('#user-profile-department').append(
        $('<option>').val(department.value).text(department.zh_TW)
      );
    }
  });

  // Close prompt and update global user info
  $('#user-profile-btn').bind('click', () => {
    window.cpUser = {
      "id": "",
      "name": "Guest",
      "selected": [],
      "school": $("#user-profile-school").val(),
      "career": $('#user-profile-career').val(),
      "grade": $('#user-profile-grade').val(),
      "major": $('#user-profile-department').val()
    }

    func();
    delMask();
    $('#stufinite-create-user-profile').hide();
    $("#user-profile-cancel-btn").hide()
  });

  // Close prompt
  $('#user-profile-cancel-btn').bind('click', () => {
    delMask();
    $('#stufinite-create-user-profile').hide();
    $("#user-profile-cancel-btn").hide()
  });
}

function guest() {
  promptUserprofile(() => {
    window.timetable = new StufiniteTimetable();
    window.searchbar = new StufiniteSearchbar();
  });
}

function editUser() {
  $("#user-profile-cancel-btn").show()
  promptUserprofile(() => {
    $.ajax({
      url: "/api/get/selected_course",
      method: "POST",
      data: {
        id: window.userId,
        semester: '2017',
        csrfmiddlewaretoken: getCookie('csrftoken')
      },
      dataType: "text",
      success: (res) => {
        window.cpUser.id = window.userId;
        window.cpUser.selected = JSON.parse(res)
        $.ajax({
          url: '/api/user/edit',
          method: 'POST',
          data: {
            key: window.userVerify,
            id: cpUser.id,
            school: cpUser.school,
            career: cpUser.career,
            major: cpUser.major,
            grade: cpUser.grade,
            csrfmiddlewaretoken: getCookie('csrftoken')
          },
          success: (res) => {
            window.timetable = new StufiniteTimetable();
            window.searchbar = new StufiniteSearchbar();
          },
          error: (res) => {
            console.log(res)
          }
        });
      },
      error: (res) => {
        console.log(res);
      }
    });
  });
}

function loadUser(user) {
  $.ajax({
    url: "/api/get/selected_course",
    method: "POST",
    data: {
      id: user.id,
      semester: '2017',
      csrfmiddlewaretoken: getCookie('csrftoken')
    },
    dataType: "text",
    success: (res) => {
      window.cpUser = {
        id: user.id,
        username: user.name,
        selected: JSON.parse(res),
        school: user.profile.school,
        career: user.profile.career,
        grade: user.profile.grade,
        major: user.profile.major
      }
      window.timetable = new StufiniteTimetable();
      window.searchbar = new StufiniteSearchbar();
    },
    error: (res) => {
      console.log(res);
    }
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
