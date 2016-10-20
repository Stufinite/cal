$(document).ready(function(){
    window.credits=0//一開始的學分數是0
    window.courses = {};//宣告一個空的物件
    window.course_of_majors = {};//宣告一個空的物件
    window.course_of_day = {};  //這是宣告日期的陣列
    window.teacher_course = {}; //這是以老師姓名為index的陣列
    window.name_of_course = {}; //這是以課程名稱為index的陣列
    window.name_of_optional_obligatory = [] //這是用來存系上的必修課，檢查有沒有課名是重複的，若有就讓使用者自行決定要上哪堂
    $("#class_credit").text(0);
    window.language="zh_TW";//固定顯示語言為中文           
    window.url_base="";//used to be the url that link to the syllabus of that course.
    window.haveloadin={D:false,G:false,N:false,O:false,U:false,W:false};//used to checked whether that json of specific degree has been loaded in or not, if it did, the value turn to ture.
    window.lastupdatetime="";//show the update time on server.
    window.department_name={};
    window.already_post = true;//check whether post of not.
    /*****************************************************************
    Search content from Semantic Ui 
    *****************************************************************/
    window.content = [];
    $("#time-table td").html('<span class="fa fa-plus-circle fa-5x"></span>');
    //////////////////////////////////////////////////////////////////
})
var build_department_arr = function(depJson){//depJson 是傳入的department json檔名
    $.each(depJson,function(ik,iv){
        if(typeof(window.department_name[iv.degree])=='undefined'){
            window.department_name[iv.degree]={};
        }
        //console.log(iv.degree)
        $.each(iv.department,function(jk,jv){
            if(typeof(window.department_name[iv.degree][jv.zh_TW]) == 'undefined'){
                window.department_name[iv.degree][jv.zh_TW]={};
            }
            var option="";
            option+=jv.value+'-'+jv["zh_TW"];
            window.department_name[iv.degree][jv.zh_TW]["zh_TW"]=option;
            var option="";
            option+=jv.value+'-'+jv["en_US"];
            window.department_name[iv.degree][jv.zh_TW]["en_US"]=option;
        })
    }) 
}
var return_degree_text = function(){
    if($('#m_career').val()=='0'){
        return window.user['returnarr']['degree']
    }
    else{
        return $('#m_career').val();
    }
}
var generate_major_level_option = function(){
//用先前產生出來的department_name名單，動態產出系所的選單按鈕
    $("#major").empty();
    $("#d_major").empty();                
    var degree=return_degree_text();
    //console.log(window.department_name[degree]);
    $.each(window.department_name[degree],function(ik,iv){
        var newOption=return_department_option_html(degree,ik);
        $("#major").append(newOption);
        var newOption=return_department_option_html(degree,ik);
        $('#d_major').append(newOption);
        //append all the department option into major field!!
    })  
    if(degree=='G'||degree=='D'||degree=='W'||degree=='R'){
        $('#level').empty();
        $('#d_level').empty();
        var option_array=return_two_grade_arr(degree, window.language);
        $('#level').append(option_array[0]).append(option_array[1]);  
        option_array=return_two_grade_arr(degree, window.language);
        $('#d_level').append(option_array[0]).append(option_array[1]);                  
    }
    else{                        
        $('#level').empty();
        $('#d_level').empty();
        var target_array=['#level', '#d_level'];
        var option_array=return_five_grade_arr(window.language);
        var newGrade;
        $.each(target_array,function(ik,iv){// use for loop use automatically append the option into the right position.
            $.each(option_array,function(jk,jv){
                newGrade=$.parseHTML(jv);
                $(iv).append(newGrade)
            })
        })                        
    }     
}
var return_department_option_html = function(degree, department){
    option = '<option value="'+window.department_name[degree][department]['zh_TW']+'">'+window.department_name[degree][department][window.language]+'</option>'//因為course of majors這個陣列的key全部都是中文，所以選單按鈕的value一定要是中文，而按鈕的文字則是按這是什麼語言版本的頁面
    return option;
}
var return_two_grade_arr = function(degree, language){
    var freshman_value="6",sophomore_value="7";//take graduate's value as default.
    if(degree=='D'){
        freshman_value="8";
        sophomore_value="9";
    }
    if(language=='zh_TW'){
        var newGrade=$.parseHTML('<option value='+freshman_value+'>一年級</option>');
        var newGrade2=$.parseHTML('<option value='+sophomore_value+'>二年級</option>'); 
    }else if(language=='en_US'){
        var newGrade=$.parseHTML('<option value='+freshman_value+'>freshman</option>');
        var newGrade2=$.parseHTML('<option value='+sophomore_value+'>sophomore</option>');
    }
    else{
        alert("language error,請通知開發人員 感謝~");
    }
    return [newGrade, newGrade2]; 
}
var return_five_grade_arr = function(language){
    if(language=='zh_TW'){
        return ['<option value="0">無年級</option>','<option value="1">一年級</option>','<option value="2">二年級</option>','<option value="3">三年級</option>','<option value="4">四年級</option>','<option value="5">五年級</option>'];
    }
    else if(language=='en_US'){
        return ['<option value="0">non-graded</option>','<option value="1">freshman</option>','<option value="2">sophomore</option>','<option value="3">junior</option>','<option value="4">senior</option>','<option value="5">fifth-grade</option>']
    }
    else{
        alert('five grade error, 請通知開發人員 感謝~');
    }
}