(function main() {
    legacyInit();

    var searchbar = new StufiniteSearchbar()
    window.timetable = new StufiniteTimetable("NCHU", "zh_TW")

    $("#search-form").bind("focus", function() {
        searchbar.show();
    });

    $(".stufinite-app-searchbar-toggle").bind("click", function(e) {
        if (searchbar.isVisible) {
            searchbar.hide();
        } else {
            searchbar.show();
        }
    });
})()

function legacyInit() {
  window.user = return_init_user_json();
  window.week = ["一", "二", "三", "四", "五"];

  window.credits = 0 //一開始的學分數是0
  window.courses = {}; //宣告一個空的物件
  window.course_of_majors = {}; //宣告一個空的物件
  window.course_of_day = {}; //這是宣告日期的陣列
  window.teacher_course = {}; //這是以老師姓名為index的陣列
  window.name_of_course = {}; //這是以課程名稱為index的陣列
  window.name_of_optional_obligatory = [] //這是用來存系上的必修課，檢查有沒有課名是重複的，若有就讓使用者自行決定要上哪堂
  $("#class_credit").text(0);
  window.language = "zh_TW"; //固定顯示語言為中文
  window.url_base = ""; //used to be the url that link to the syllabus of that course.
  window.haveloadin = {
      D: false,
      G: false,
      N: false,
      O: false,
      U: false,
      W: false
  }; //used to checked whether that json of specific degree has been loaded in or not, if it did, the value turn to ture.
  window.lastupdatetime = ""; //show the update time on server.
  window.department_name = {};
  window.already_post = true; //check whether post of not.
  window.content = []

  $.when(get_json_when_change_degree("/static/course/json/O.json", null), $.getJSON("/static/course/json/new_department.json", function(depJson) {
      build_department_arr(depJson);
      return_url_and_time_base();
  })).then(function() {
      //when的功能註解就是下面這兩條
      //1. couse O.json is suitable for all kind of degree, so it will be loaded in automatically.
      //2. 當文件準備好的時候，讀入department的json檔, 因為這是顯示系所，沒多大就全部都載進來
      get_from_django();
  });
}
