var bulletin_post = function($target, course, language) {
    console.log('bulletin_post');
    searchbar.addResult($target, course, language);
};


var get_json_when_change_degree = function(path) {
    $.when($.getJSON(path, function(json) { //getJSON會用function(X)傳回X的物件或陣列
        //console.log(json);
        $.each(json.course, function(ik, iv) {
            if (typeof(window.course_of_majors[iv.for_dept]) == 'undefined') //如果這一列(列的名稱為索引值key)是空的也就是undefined，那就對他進行初始化，{}物件裡面可以放任意的東西，在下面會把很多陣列塞進這個物件裡面
                window.course_of_majors[iv.for_dept] = {};
            if (typeof(window.course_of_majors[iv.for_dept][iv.class]) == 'undefined') {
                window.course_of_majors[iv.for_dept][iv.class] = []; //如果這一行(列的名稱為索引值key)是空的也就是undefined，那就對他進行初始化，[]裡面的是放陣列
            }
            window.course_of_majors[iv.for_dept][iv.class].push(iv.code); //把東西推進這個陣列裡，概念跟stack一樣
            if (typeof(window.courses[iv.code]) == 'undefined') {
                window.courses[iv.code] = [];
            }
            window.courses[iv.code].push(iv); //這邊可以直接把選課號當作索引值key，裡面的值為object
            window.content.push({
                title: iv.code
            });
            $.each(iv.time_parsed, function(jk, jv) { //建立日期的陣列
                $.each(jv.time, function(mk, mv) {
                    if (typeof(window.course_of_day[jv.day]) == 'undefined') {
                        window.course_of_day[jv.day] = {};
                    }
                    if (typeof(window.course_of_day[jv.day][mv]) == 'undefined') {
                        window.course_of_day[jv.day][mv] = [];
                    }
                    window.course_of_day[jv.day][mv].push(iv);
                })
            })
            if (typeof(window.teacher_course[iv.professor]) == 'undefined') { //建立老師名稱的陣列
                window.teacher_course[iv.professor] = [];
                window.content.push({
                    title: iv.professor
                });
            }
            window.teacher_course[iv.professor].push(iv);
            if (typeof(window.name_of_course[iv.title_parsed.zh_TW]) == 'undefined') { //中文課名陣列
                window.name_of_course[iv.title_parsed.zh_TW] = [];
                /**************************************************
                Window.content.push(the Chinese title of this class)
                will build a search index for Semantic Ui search bar
                可以自動補全文字
                **************************************************/
                window.content.push({
                    title: iv.title_parsed.zh_TW
                });
            }
            window.name_of_course[iv.title_parsed.zh_TW].push(iv);
            if (typeof(window.name_of_course[iv.title_parsed.en_US]) == 'undefined') { //英文課名陣列
                window.name_of_course[iv.title_parsed.en_US] = [];
                window.content.push({
                    title: iv.title_parsed.en_US
                });
            }
            window.name_of_course[iv.title_parsed.en_US].push(iv);
        });
    }))
}
