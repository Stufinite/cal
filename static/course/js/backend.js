$(document).ready(function() {
    /*************post to server*************/
    $(window).bind('beforeunload', function(e) {
        if (window.already_post == false) {
            return '請記得按上傳課表喔~';
        }
    })
})
var load_timetable = function(local) {
    reset();
    //把來自django的資料填進課表
    $.each(local, function(ik, iv) {
        add_course($('#time-table'), iv, language);
    })
}
var load_json_for_user = function(degree, time_table_from_django) {
    var path = "/static/course/json/" + degree + ".json";
    /**************************************************************
    the if Clause means :
        if this part of json, eq:U.json has already been loaded in, dont load it again.
        And pass time_table_from_django (user's timetable info) argument to get_json methond
    **************************************************************/
    if (haveloadin[degree] == false) {
        get_json_when_change_degree(path, time_table_from_django);
        haveloadin[degree] = true;
    }
}
