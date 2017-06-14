function addMask() {
  $("body").append($("<div id='page-mask'>"));
}

function delMask() {
  $("body").find("#page-mask").remove();
}

function addEventListenerToDOM() {
  window.unsaved = false;
  window.onbeforeunload = unloadPage;

  // Login button
  var redirectURL = loginURL + "/fb?redirect_service=www";
  var fbURL = "https://www.facebook.com/v2.9/dialog/oauth?client_id=199021993947051&redirect_uri=" + redirectURL
  $('#fb-login-btn').attr('href', fbURL);
  $('#user-login-btn').attr('href', fbURL);


  // Initialize user profile setting buttons
  $("#user-profile-setting-btn").bind("click", (e) => {
    editUser();
  });
  $("#user-login-cancel-btn").bind("click", (e) => {
    closePrompt();
  });

  // Initialize course info close button
  $(".stufinite-course-info-close").unbind().bind("click", (e) => {
    $('.stufinite-course-info-container').hide();
  });
}


function unloadPage() {
  if (window.unsaved) {
    return "You have unsaved changes on this page. Do you want to leave this page and discard your changes or stay on this page?";
  }
}

function closePrompt() {
  $('#prompt-login').hide();
  $('#stufinite-create-user-profile').hide();
  delMask();
}

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
