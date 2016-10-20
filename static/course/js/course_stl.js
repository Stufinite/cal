$(document).ready(function(){
    window.user=return_init_user_json();
    window.week = ["一", "二", "三", "四", "五"];
})
var return_init_user_json = function(){
    return {
        "user_name":"",
        "user_dept":"",
        "time_table":[],
        "idList":{},
        "returnarr":{'degree':'','level':'',"major":"",'d_major':'','d_level':''},
    }
}
/************這是用來把課程放到左邊的欄位**************/
var bulletin_post = function($target, course, language){
    if( $.type(course.title_parsed)!=="object" )            //判斷課程名稱是不是物件
        throw 'title_parsed error';
    if( language=="zh_TW" ){
        course.title_short = course.title_parsed["zh_TW"];      //title_short是會自動宣告的區域變數，存沒有英文的課名
    }
    else{
        course.title_short = course.title_parsed["en_US"];
    }
    var time=build_bulletin_time(course);//會回傳屬於那個課程的客製化時間title
    $option = return_bulletin_option(course);//it will determine which color should $option be. And return a jQuery object which has html tag.
    $option.find('span.title').text(course.title_short);   //將對應的課程內容寫入cell的html語法中
    $option.find('span.time').text(time);
    $option.find('span.location').text(fill_loction(course));
    $option.find('span.professor').text(course.professor);
    $option.find('button').val(course.code);                
    //把現在找到的這門選修課課程代碼儲存到這個option，並用value表示       
    var url=window.url_base+course.url;     
    $option.find('a.feedback').attr('href',url);
    $option.find('a.syllabus').attr('href',"http://feedback.nchusg.org/search/?q="+course.title_short);
    $target.append($option);        //顯示課程，把$option放到elective-post，append是追加在後面                
};
var add_course = function($target, course, language){      //假設target為time-table的參數，course為courses的某一個課程
    if( !$.isArray(course.time_parsed) )
        throw 'time_parsed error';      //判斷time-parsed是不是陣列
    if( $.type(course.title_parsed)!=="object" )            //判斷課程名稱是不是物件
        throw 'title_parsed error';
    if(language == "zh_TW"){
        var tmpCh = course.title_parsed["zh_TW"].split(' ');        //(這是中文課名)切割課程名稱，遇到空格就切開
        course.title_short = tmpCh[0];      //title_short是會自動宣告的區域變數，存沒有英文的課名
    }
    else{
        var tmpEn = course.title_parsed["en_US"];
        course.title_short = tmpEn;
    }
    var check_conflict = false; //他用來判斷是否衝堂，如果有則下面的if就會讓最外圈的each停止
    $.each(course.time_parsed,function(ik, iv){
        $.each(iv.time,function(jk, jv){
            var $td = $target.find('tr[data-hour=' + jv + '] td:eq(' + (iv.day-1) + ')');
            if($td.text()!=""){ //用來判斷td裡面是不已經有放過課程了，但若先在裡面放個按鈕那.text()回傳回來的也是空字串
                check_conflict = true;
                if(window.language=="zh_TW"){
                    toastr.error("衝堂喔!請手動刪除衝堂的課程", {timeOut: 2500});
                }else{
                    toastr.error("Conflict! please drop some course manually.", {timeOut: 2500});
                }
                return false;   //傳回false就是跳離迴圈
            }
        });
        if(check_conflict==true){
            return false;
        }
    });
    if(check_conflict==false){
        $.each(course.time_parsed, function(ik, iv){
            $.each(iv.time, function(jk, jv){       //同上，iv.    time為"time"的陣列{3,4}，jk為0~1、jv為3~4(節數)
                var $td = $target.find('tr[data-hour=' + jv + '] td:eq(' + (iv.day-1) + ')');
                var $cell = return_add_course_option();
                //把上面的html格式匯入找到的td type中(  parseHtml把後面的包裝成dom，再用一個$包裝成jQuery物件)
                $cell.find('.title').text(course.title_short).end()
                $cell.find('input').val(course.code).end()      //將對應的課程內容寫入cell的html語法中，.title就是class="title"
                        .find('.professor').text(course.professor).end()   //text()   會把東西填入找到的class那裡，end()會回到var $cell那一行
                        .find('.location').text(fill_loction(course));
                $td.html($cell.html());     //顯示課程，把cell.html()塞到<td>tag裡面，就算裡面原本有按鈕也會直接被蓋掉，$.html()會取div裡面的東西                    
            });
        });
        add_credits(course);                    
        window.user['time_table'].push(course);//here means once i add this course in my timetable, i will also record this object in a json format, to save this time_table for users. 
        window.user['idList'][course.code]=courses[course.code][0]['title_parsed']['zh_TW'];//建立一個以課程代號為key課程名稱為值的字典
        build_toastr_time(course,window.language);
    }
    window.already_post=false;
    /*
    if it has add at least one course, 
    make this boolean val false and it will trigger "beforeunload" event to prevent user accidently close tab.*/
    /*******Don't write below this line********/
    if(check_conflict==false){
        return("available");    //沒衝堂，可以變色
    }
    else{
        return("conflict")  //衝堂，不要變色
    }                 
};
/*******嘗試函式化選修填入課程的功能！！*******/
var add_major = function(major, level){
    console.log(major+" "+level);
    console.log(course_of_majors[major][level]);
    $.each(course_of_majors[major][level], function(ik, iv){ 
    //先這一年級的必修課全部跑過一次，計算重複課名的數量
        $.each(courses[iv],function(jk, jv){
            if(jv.obligatory_tf==true&&jv.for_dept==major&&jv.class==level){//這樣就可以保證我計算到的必修數量一定是該科系該年級該班級了
                check_optional_obligatory(jv);
                return false;
            }
        })
    });                       
    $.each(course_of_majors[major][level], function(ik, iv){//知道那些課程會重複之後，再決定那些課程要填入課表
        $.each(courses[iv],function(jk, jv){
            if(jv.for_dept==major&&jv.class==level){
                var title_short=return_optional_obligatory_course_name(jv);
                if(window.name_of_optional_obligatory[title_short]==1){//只有必修課會被函式計算數量，所以就不用再判斷是否為必修了，一定是
                    if(jv.time_parsed==0){//表示應該為實習課，所以無時間,他沒有正課時間和實習時間，反正就是都沒有時間，神奇的是[]在boolean判斷式中居然會被當作0
                        bulletin_post($(".optional"), jv, language);   
                    }
                    else{
                        add_course($('#time-table'), jv, language);
                        //如果這個課名只有出現過一次，就可以自動填入 
                    }                  
                }
                else{//當出現不止一次的時候就丟到bulletin，但是只丟屬於這個班級的                    
                    if(jv.obligatory_tf==true){
                        show_optional_obligatory(jv);//若重複出現，則讓使用者自己決定
                    }
                }
            }
        })
    });
    $.each(course_of_majors[major], function(ik, iv){//系上所有的選修課都先填入bulletin
        if(check_if_two_class(level).length==1){//代表只有一個班
            $.each(iv,function(jk, jv){
                $.each(courses[jv], function(kk, kv){
                    if(kv.obligatory_tf==false&&kv.for_dept==major && kv.class == level){
                        /************************************************************
                        kv.class == level limits only optional class for that grade will show!!!!
                        ************************************************************/
                        check_which_bulletin(kv);//由fuction決定該貼到哪個年級的欄位
                    }
                })
            })
        }                            
        else{//代表有兩個班                                
            var class_EN=level.split("")[1];//班級的A或B，就是最後那個代碼
            if(ik.split("")[1]==class_EN){
                $.each(iv,function(jk, jv){
                    $.each(courses[jv], function(kk, kv){
                        if(kv.obligatory_tf==false&&kv.for_dept==major&&kv.class.split("")[1]==class_EN&&kv.class.split("")[0]==ik.split("")[0]){
                            //console.log(kv);
                            check_which_bulletin(kv);//由fuction決定該貼到哪個年級的欄位
                            return false;
                        }
                    })
                })
            }
        }
    })                
};
var add_doublemajor = function(major, level){
    reset_for_time_request();
    department_course_for_specific_search(major,level);
}
/**********這個函式是用來刪除一整門課程的**********/
var delete_course = function($target, course) {
//假設target為time-table的參數，course為courses的某一個課程
    if(course.for_dept == window.user['returnarr']['d_major']){
        var color_str = "available2"//the option of double major.
    }
    else{
        var color_str = "available"
    }
    $.each(course.time_parsed, function(ik, iv){
    //each是for迴圈 time-parsed[{...}, {...}]，以微積分為例:一個{"day"+"time"}就是陣列的一格，所以ik為0~1(兩次)
        $.each(iv.time, function(jk, jv){       //同上，iv.time為"time"的陣列{3,4}，jk為0~1、jv為3~4(節數)
            var $td = $target.find('tr[data-hour=' + jv + '] td:eq(' + (iv.day-1) + ')');
            //td:eq()為搜尋td的陣列索引值，找到課程的時間    iv.day為星期，但因為td為陣列所以iv.day要減一    find()是找class!!
            $td.empty();    //顯示課程，把cell.html()塞到<td>tag裡面
            $td.html('<span class="fa fa-plus-circle fa-5x"></span>');
        })
    })
    minus_credits(course);
    change_color($("button[value="+course.code+"]"), color_str);
    $.each(window.user['time_table'],function(ik,iv){
        //this for loop is to see which element in this array is the one i want to delete.
        if(iv.code==course.code){
            window.user['time_table'].splice(ik,1);
            //splice can delete the ik'th value and 1 means one only want to delete one value, you can use 3 to delete more value.
            return false;
        }
    })
};
/****************增加學分****************/
var add_credits = function(course){
    window.credits+=parseInt(course.credits);//要先把字串型態的學分轉成int才能做加減
    $("#class_credit").text(window.credits);
};
var minus_credits = function(course){
    window.credits-=parseInt(course.credits);
    $("#class_credit").text(window.credits);
};
/**************改變側欄課程顏色**************/
var change_color=function($target,command){ //一旦添加了課程，則側欄的課名改了顏色
    if(command=="available"){
            $target.parents('tr').find('td').eq(0).css("color","black");
    }
    else if(command=="used"){
        $target.parents('tr').find('td').eq(0).css("color","red");
    }
    else if(command=="available2"){
        $target.parents('tr').find('td').eq(0).css("color","#B53074");
    }
    else{
        alert("遇到不可預期的錯誤，請聯絡開發小組XD");
    }
}
/****把有abcd班別的必修課做判斷，讓使用這自己選擇**********/
var return_optional_obligatory_course_name=function(course){
    var len=course.title_parsed["zh_TW"].length;
    if(isChar(course.title_parsed["zh_TW"][len-1])==true){
        //check whether the last char is 'abcd' or not.
        //if so, return the title without char.
        return course.title_parsed["zh_TW"].substring(0,len-1);
    }
    else{
        return course.title_parsed["zh_TW"];
    }

}
/*********確認系上必修有無重名*********/
var check_optional_obligatory=function(course){ 
//用來確認這個系有幾堂必修課是同名的
    course.title_short = return_optional_obligatory_course_name(course);//will make a new key called title_short, that contains a chinese title which dont contain a character at the end.(like 英文作文(二)a -> 英文作文(二))
    //title_short是會自動宣告的區域變數，存沒有英文的課名

    if(typeof(window.name_of_optional_obligatory[course.title_short]) == 'undefined'){  //如果這一列(列的名稱為索引值key)是空的也就是undefined，那就對他進行初始化，{}物件裡面可以放任意的東西，在下面會把很多陣列塞進這個物件裡面
        window.name_of_optional_obligatory[course.title_short] = 1;
    }
    else{
        window.name_of_optional_obligatory[course.title_short]++;
    }
    //console.log(course.title_short+' '+window.name_of_optional_obligatory[course.title_short]);
}
/*********處理課名*********/
var show_optional_obligatory=function(course){
    var trun_title=return_optional_obligatory_course_name(course);
    //cause the character at the end of title is truncate, so named it trun_title
    if(window.name_of_optional_obligatory[trun_title]>1){
        bulletin_post($("#obligatory-post"), course, language);
    }
}
/********確認此系有沒有分AB班(選修用)********/
var check_if_two_class=function(level){//為了讓我確認他是不是有分AB班，這個是用在選修課的填入判斷上
    level=level.split("");
    return(level);//可以從回傳的長度判斷是否有兩個班
}
/********確定有無分AB班********/
var check_which_class=function(major,level){    //確定他是不是有分A、B班
    if(major=="獸醫學系學士班 A"||major=="獸醫學系學士班 B"||major=="應用數學系學士班 A"||major=="應用數學系學士班 B"||major=="機械工程學系學士班 A"||major=="機械工程學系學士班 B"||major=="土木工程學系學士班 A"||major=="土木工程學系學士班 B"||major=="電機工程學系學士班 A"||major=="電機工程學系學士班 B"){
        var subclass=major.split(" ");  //A班或B班
        subclass=subclass[1];
        var level = level;    //取到年級
        level=(level+subclass);
        return level;
    }
    else{
        return (level);    //取到年級
    }
}
/*********判斷課程放入哪個欄位*********/
var check_which_bulletin=function(course){  //為了判斷A、B班以及不分班的科系開被放到哪個bulletin
    if(course.class=="1"||course.class=="1A"||course.class=="1B"){
        bulletin_post($(".optional"),course, language);
    }
    else if(course.class=="2"||course.class=="2A"||course.class=="2B"){
        bulletin_post($(".optional"),course, language);
    }
    else if(course.class=="3"||course.class=="3A"||course.class=="3B"){
        bulletin_post($(".optional"),course, language);
    }
    else if(course.class=="4"||course.class=="4A"||course.class=="4B"){
        bulletin_post($(".optional"),course, language);
    }
    else if(course.class=="5"||course.class=="5A"||course.class=="5B"){
        bulletin_post($(".optional"),course, language);
    }
    else if(course.class=="6"||course.class=="6A"||course.class=="6B"){
        //6、7年級是放碩博班的課
        bulletin_post($(".optional"),course, language);
    }
    else if(course.class=="7"||course.class=="7A"||course.class=="7B"){
        bulletin_post($(".optional"),course, language);
    }
    else if(course.class=="8"||course.class=="8A"||course.class=="8B"){
        bulletin_post($(".optional"),course, language);
    }
    else if(course.class=="9"||course.class=="9A"||course.class=="9B"){
        bulletin_post($(".optional"),course, language);
    }
    else if(course.class=="0"){
        bulletin_post($(".optional"),course, language);
    }       
    else{
        alert("check_which_bulletin ERROR,麻煩您到粉專通知開發人員喔");
    }         
}
/******判斷非必選修之課程的正確欄位******/
var check_which_bulletin_required=function(course){
    var EN={"語言中心":"","夜共同科":"","夜外文":""};
    var CH={"通識教育中心":"","夜中文":""};
    if(course.discipline!=undefined&&course.discipline!=""){
        //通識課有細分不同領域
        check_general(course);
    }
    else if(course.department in EN){
        bulletin_post($("#english"),course, language);
    }
    else if(course.department in CH){
        bulletin_post($("#chinese"),course, language);
    }
    else if(course.department == "體育室" ||                 course.department=="夜共同科"){
        bulletin_post($(".PE"),course, language);
    }
    else if(course.department == "師資培育中心"){
        bulletin_post($("#teacher-post"),course, language);
    }
    else{
        bulletin_post($("#obligatory-post"),course, language); //因為我把同一時段的課程塞進陣列裡，所以要用index去取
    }
}
/*********搜尋用*********/
var department_course_for_specific_search=function(major,level){
    $.each(course_of_majors[major][level], function(ik, iv){//因為這種輔系的課一定是交給使用者自己選，所以就不自動填入
        console.log(iv)
        $.each(courses[iv],function(jk,jv){
            console.log(jv)
            if(jv.for_dept==major){//這個判斷是為了像景觀學程那種專門上別的科系的課的系而設計的
                if(jv.obligatory_tf==true&&jv.class==level){
                    bulletin_post($(".optional"),jv, language);
                    return false;
                }
                if(jv.obligatory_tf==false&&jv.class==level){//因為輔系的查詢只能查一個年級，所以就可以只判斷是否為level
                    check_which_bulletin(jv);
                    return false;
                }
            }
        })
    });
}
/*****確認此通識課之領域*****/
var check_general=function(course){
    var disciplineH={"文學學群":"","歷史學群":"","哲學學群":"","藝術學群":"","文化學群":""};
    var disciplineS={"公民與社會學群":"","法律與政治學群":"","商業與管理學群":"","心理與教育學群":"","資訊與傳播學群":""};
    var disciplineN={"生命科學學群":"","環境科學學群":"","物質科學學群":"","數學統計學群":"","工程科技學群":""};                
    if(course.discipline in disciplineH){
        bulletin_post($(".human"), course, language)
    }
    else if(course.discipline in disciplineS){
        bulletin_post($(".society"), course, language)
    }
    else if(course.discipline in disciplineN){
        bulletin_post($(".nature"), course, language)
    }
    else{
        alert("有通識課程無法顯示，煩請記下點擊的結束為何並告知開發小組\nFB搜尋：選課小幫手\nhttps://www.facebook.com/CoursePickingHelper")
    }                
};
/*********細分綜合課程*********/
var check_which_common_subject = function(course){
    if(course.department=="師資培育中心"){
        bulletin_post($("#teacher-post"),course, language);
    }
    else if(course.department=="教官室"){
        bulletin_post($("#military-post"),course, language);
    }
    else if(course.department=="語言中心"){
        bulletin_post($("#foreign-post"),course, language);
    }
    else{ 
        bulletin_post($("#non-graded-optional-post"),course, language);
    }
}
/********建立側欄所有課程的資訊(放入title中)********/
var build_bulletin_time=function(course){
    var EN_CH={"語言中心":"","夜共同科":"","夜外文":"","通識中心":"","夜中文":""};
    var time = [];  //time設定為空陣列
    $.each(course.time_parsed, function(ik, iv){
        time.push("("+week[iv.day-1]+")"+iv.time); //push是把裡面的元素變成陣列的一格
    })
    if(course.intern_time!=""&&course.intern_time!=undefined){//不是每一堂課都會有實習時間
        time.push("實習時間:"+course.intern_time);
    }
    // if(course.discipline!=""&&course.discipline!=undefined){//代表他是通識課
    //     time.push(" "+course.discipline);
    // }
    else{
    }                
    time = time.join(' ');  //把多個陣列用" "分隔並合併指派給time，此為字串型態，若是將字串split('')，則會回傳一個陣列型態
    return time;
}
/*****建立 選擇課程後跳出toastr的資訊*****/
var build_toastr_time=function(course, language){
    var EN_CH={"語言中心":"","夜共同科":"","夜外文":"","通識中心":"","夜中文":""};   
    var toast_mg=[];
    var toastr1;
    var toastr2;
    if(language=='zh_TW'){
        toastr1="代碼:";
        toastr2="剩餘名額:";                
        toast_mg.push('課名:'+course.title_parsed[window.language]);
    }
    else if(language=='en_US'){
        toastr1="Course ID:";
        toastr2="Remaining Seat:";
        toast_mg.push('Title:'+course.title_parsed[window.language]);
    }
    toast_mg.push(toastr1+course.code);
    toast_mg.push(toastr2+(course.number-course.enrolled_num));    

    if(course.discipline!=""&&course.discipline!=undefined){//代表他是通識課
        if(language=='zh_TW'){
            toastr1="學群:";
        }
        else if(language=='en_US'){
            toastr1="Discipline:";
        }                   
        toast_mg.push(toastr1+course.discipline);
        var possibility = cal_possibility(course);// a fuction that return the possibility of enrolling that course successfully.
        //toast_mg.push("中籤率:" + possibility + "%");
    }                
    if(course.note!=""){
        if(language=='zh_TW'){
            toastr1="備註:";
        }
        else if(language=='en_US'){
            toastr1="Note:";
        } 
        toast_mg.push(toastr1+course.note);
    }  
    if(course.prerequisite!=""){
        //prerequisite means you need to enroll that course before enroll this course
        if(language=='zh_TW'){
            toastr1="先修科目:";
        }
        else if(language=='en_US'){
            toastr1="Prerequisite:";
        }
        toast_mg.push(toastr1+course.prerequisite);
    }              
    toast_mg = toast_mg.join('<br/>');
    toastr.info(toast_mg);
}
var credits_filter=function(){
    var credits=$("#credits").val();
    if(credits!=""){return credits;}
    else{return true;}//到時候把整個credits_filter當成參數傳入搜尋的函式
    //參數會return東西到if判斷式，如果沒有輸入學分，就return TRUE就不會有任何影響了
}
/*******課程代碼搜尋*******/
var code_search=function(code){
    if(code!=""){
        bulletin_post($(".optional"),courses[code][0], language);
    }
}
/********課程名稱搜尋********/
var title_search=function(class_title){
    var posted_code = [];
    if(class_title!=""){    //class_title is 課程名稱搜尋的字串
        $.each(name_of_course, function(ik, iv){
            if(ik.search(class_title)!=-1){
                $.each(iv,function(jk, jv){
                    if(posted_code.indexOf(jv.code)==-1){
                        //indexOf will find whether jv.code is in posted_code this array. 
                        // if it already exist, then i wont post this course into bulletin.
                        bulletin_post($(".optional"),jv, language);
                        console.log(jv)
                        posted_code.push(jv.code);
                    }                            
                });
            }
        })
    }
}
/********授課教授搜尋*********/
var teach_search=function(teacher){
    if(teacher!=""){//teacher is 老師名稱搜尋的字串
        $.each(teacher_course[teacher], function(ik, iv){
            bulletin_post($(".optional"),iv, language);
        });
    }
}
/*********教室資訊**********/
var fill_loction=function(course){//回傳教室資訊，型態為string
//course是課程物件
    var location="";
    if(course.location!=[""]&&course.location!=undefined){
        //要確保真的有location這個key才可以進if，不然undefined進到each迴圈
        // 就會跳 [Uncaught TypeError: Cannot read property 'length' of undefined]這個error
        $.each(course.location,function(ik,iv){
            location=location+" "+iv;
        })
    }
    if(course.intern_location!=[""]&&course.intern_location!=undefined){
        $.each(course.intern_location,function(ik,iv){
            location=location+" "+iv;
        })
    }
    return location;//回傳字串
}
/*******獲得使用者選擇的主修資訊與年級*******/
var get_major_and_level = function(){
    //這會回傳一個major和level的陣列，供全域呼叫使用
    var arr = $('form').serializeArray();//this is a jQuery function
    // will select all form of this html Document, and build and array of object
    window.user['returnarr']['degree']=arr[0]['value'];
    var temp;
    temp=arr[1]['value'].split('-')[1];
    // window.user['returnarr']['level']=check_which_class(temp,arr[2]['value']);
    // window.user['returnarr']['major']=temp.split(' ')[0];
    temp=arr[1]['value'].split('-')[1];
    window.user['returnarr']['d_level']=check_which_class(temp,arr[2]['value']);
    window.user['returnarr']['d_major']=temp.split(' ')[0];
}    
/******************************************************
把django回傳的使用者系所年級、修改成小幫手能使用的
******************************************************/
var return_major_and_level = function(major, level){
    var temp;
    var returnarr=[];
    temp=major.split('-')[1];
    returnarr.push(check_which_class(temp,level));
    returnarr.push(temp.split(' ')[0]);
    return returnarr;
}    

var cal_possibility = function(course){
    var pos = (course.number-course.enrolled_num)/course.number*100;
    pos = new Number(pos);
    pos = pos.toFixed(2);
    if(pos<0){
        return 0;
    }           
    return pos;     
}            
var isChar = function(input){
    //input is the last character of short title.
    var code = input.charCodeAt(0);
    if ( ((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122)) ) {
        // it is a letter
        return true;
    }
    else{                    
        return false;
    }
}
var return_bulletin_option = function(course){
    // var $option = $($.parseHTML('<div><button type="button" class="btn btn-link" data-toggle="tooltip" data-placement="top" style="color:#3074B5;" title="" value=""></button><a class="btn" href="" target="_blank"><span class="fa fa-comment"></span></a></div>'));
    var $option = $($.parseHTML('<tr  class="text-center"><th><h5 class=""><button type="button" class="btn btn-link" data-toggle="tooltip" data-placement="top" style="color:#B53074;" title="" value=""><img src="https://maxcdn.icons8.com/iOS7/PNG/25/Very_Basic/plus-25.png" title="Plus" title="Exit" width="25"></button></h5></th><td><a class="syllabus" href="" target="_blank"><span class="title"></span></a></td><td ><span class="time"></span></td><td ><span class="professor"></span></td><td><a class="feedback" href="" target="_blank"><span class="fa fa-pencil-square-o"></span></a></td></tr>'));  //把option做成dom，再把dom做成jQuery物件
    return $option;
}

var return_add_course_option = function(){
    /*fa fa-book this hyper link is for user to supply book information to our sys*/
    return $($.parseHTML('<div><div style="height: 21px;"><button type="button" class="close delete" data-dismiss="alert" aria-label="Close" style="color:red;"><span aria-hidden="true"  style="color:red;">&times;</span><input type="hidden" name="code-of-course" value=""></button><a href="/course/supply_book_info/"></a></div><div class="title"></div><div class=""><div class="professor "></div><div class="location "></div>'));
}