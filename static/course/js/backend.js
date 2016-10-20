$(document).ready(function(){
    /********提交user的json檔*********/
    $('#saveAsJson').click(function(){
        window.user['user_name']=$('#user_name').val();
        window.user['user_dept']=$('#user_dept').val();
        var filename = $('#user_name').val();
        var json_string =  JSON.stringify(window.user);
        var blob = new Blob([json_string], {type: "application/json"});//這是存檔的物件
        saveAs(blob, filename+".json");
    })
    /*************post to server*************/
    $('.post_for_course').click(function(){
        $(window).unbind('beforeunload');
        //還沒有加上檢查使用者姓名和部門是不是有填了，目前覺得這些資訊是不用放到localstorage裡
        var postdata=$.extend({},window.user);
        postdata['csrfmiddlewaretoken']=getCookie('csrftoken');
        postdata['time_table']=JSON.stringify(window.user['time_table']);
        postdata['idList']=JSON.stringify(window.user['idList']);
        postdata['returnarr']=JSON.stringify(window.user['returnarr']);
        //post Method一定要驗證csrf token, or post會被禁止forbidden
        $.post( ".", postdata)
        .done(function() {
            toastr.success('恭喜您成功上傳課表囉~');
            window.already_post = true;
            redirect_loc = "/course/course_zh_TW/?name="+postdata['user_name'];
            document.location.href=redirect_loc;//重導向頁面到get的網址，這樣django template才能把使用者的書單丟進{% for %}
        })
        .fail(function() {
            toastr.error('抱歉，上傳錯誤，請重新再試');
        })
        .always(function() {
            console.log( "finished" );
        });               
    })
    $(window).bind('beforeunload', function (e) {
        if(window.already_post==false){
            return '請記得按上傳課表喔~';
        }
    })
    $('#book_of_course').click(function(){
        var postdata={}
        postdata['csrfmiddlewaretoken']=getCookie('csrftoken');
        postdata['courseID']=$('#courseID').val();
        id=postdata['courseID'];
        postdata['name']=window.courses[id][0]['title_parsed']['zh_TW'];
        postdata['book']=$('#book').val();
        if(descide_post(postdata['courseID']) && descide_post(postdata['book'])){
            $.post( "/course/book_of_course/", postdata)
            .done(function() {
                toastr.success('感謝您告訴我們這門課的書籍喔~');
                window.already_post=true;
                document.location.reload();
            })
            .fail(function() {
                toastr.error('抱歉，上傳錯誤，請重新再試');
            })
            .always(function() {
                console.log( "finished" );
            });               
        }
    })
})
var load_timetable = function(local){
    reset();
    //把來自django的資料填進課表
    $.each(local,function(ik,iv){
        add_course($('#time-table'), iv, language);
    })
}
var load_json_for_user = function(degree,time_table_from_django){
    var path = "/static/course/json/" + degree + ".json";
    /**************************************************************
    the if Clause means :
        if this part of json, eq:U.json has already been loaded in, dont load it again.
        And pass time_table_from_django (user's timetable info) argument to get_json methond
    **************************************************************/
    if(haveloadin[degree]==false){
        get_json_when_change_degree(path,time_table_from_django);
        haveloadin[degree]=true;
    }
}
var redirect_for_booklist = function(){
    redirect_loc = "/course/course_zh_TW/?name="+$('#user_name').val();
    document.location.href=redirect_loc;//重導向頁面到get的網址，這樣django template才能把使用者的書單丟進{% for %}
}