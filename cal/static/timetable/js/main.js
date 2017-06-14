(function main() {
  $.ajax({ // Get user from userpool
    url: loginURL + '/fb/user',
    dataType: 'json',
    xhrFields: {
      withCredentials: true
    },
    crossDomain: true,
    success: (res) => {
      window.userId = res.id
      window.userName = res.name
      window.userVerify = res.verify

      if (res.profile == null) { // User is registered but never used cal
        editUser();
      } else { // Load user data normally
        loadUser(res);
      }
      // Change status of Facebook button
      $('#fb-login-btn').html('<i class="fa fa-facebook-square" aria-hidden="true"></i> 登出').attr('href', loginURL + '/fb/logout?redirect_service=www')
    },
    error: (res) => { // User is not logged in
      guest();
    }
  });

  addEventListenerToDOM();
})();

function init() {
  window.timetable = new StufiniteTimetable();
  window.searchbar = new StufiniteSearchbar();
  window.searchbar.show();
}

function guest() {
  promptUserprofile(() => {
    init();
  });
}

function editUser() {
  $("#user-profile-cancel-btn").show()

  promptUserprofile(() => {
    $.ajax({
      url: '/api/user/edit',
      method: 'POST',
      data: {
        csrfmiddlewaretoken: getCookie('csrftoken'),
        key: window.userVerify,
        id: window.userId,
        school: cpUser.school,
        career: cpUser.career,
        major: cpUser.major,
        grade: cpUser.grade
      },
      success: (res) => {
        window.cpUser.id = window.userId;
        window.cpUser.name = window.userName;

        $.ajax({
          url: "/api/get/selected_course",
          method: "POST",
          data: {
            csrfmiddlewaretoken: getCookie('csrftoken'),
            id: window.userId,
            semester: '1061'
          },
          dataType: "text",
          success: (res) => {
            window.cpUser.selected = JSON.parse(res)
            init();
          },
          error: (res) => {
            console.log(res);
          }
        });
      },
      error: (res) => {
        console.log(res)
      }
    });
  });
}

function loadUser(user) {
  $.ajax({
    url: "/api/get/selected_course",
    method: "POST",
    data: {
      csrfmiddlewaretoken: getCookie('csrftoken'),
      id: user.id,
      semester: '1061'
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
      init();
    },
    error: (res) => {
      window.cpUser = {
        id: user.id,
        username: user.name,
        selected: [],
        school: user.profile.school,
        career: user.profile.career,
        grade: user.profile.grade,
        major: user.profile.major
      }
      init();
      // console.log(res);
    }
  });
}
