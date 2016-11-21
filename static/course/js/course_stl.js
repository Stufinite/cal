var add_doublemajor = function(major, level) {
    reset_for_time_request();
    getCourse("major", major, level);
}


/****把有abcd班別的必修課做判斷，讓使用這自己選擇**********/
var return_optional_obligatory_course_name = function(course) {
    var len = course.title_parsed["zh_TW"].length;
    if (isChar(course.title_parsed["zh_TW"][len - 1]) == true) {
        //check whether the last char is 'abcd' or not.
        //if so, return the title without char.
        return course.title_parsed["zh_TW"].substring(0, len - 1);
    } else {
        return course.title_parsed["zh_TW"];
    }

}

/*********確認系上必修有無重名*********/
var check_optional_obligatory = function(course) {
    //用來確認這個系有幾堂必修課是同名的
    course.title_short = return_optional_obligatory_course_name(course); //will make a new key called title_short, that contains a chinese title which dont contain a character at the end.(like 英文作文(二)a -> 英文作文(二))
    //title_short是會自動宣告的區域變數，存沒有英文的課名

    if (typeof(window.name_of_optional_obligatory[course.title_short]) == 'undefined') { //如果這一列(列的名稱為索引值key)是空的也就是undefined，那就對他進行初始化，{}物件裡面可以放任意的東西，在下面會把很多陣列塞進這個物件裡面
        window.name_of_optional_obligatory[course.title_short] = 1;
    } else {
        window.name_of_optional_obligatory[course.title_short]++;
    }
    //console.log(course.title_short+' '+window.name_of_optional_obligatory[course.title_short]);
}

/*********處理課名*********/
var show_optional_obligatory = function(course) {
    var trun_title = return_optional_obligatory_course_name(course);
    //cause the character at the end of title is truncate, so named it trun_title
    if (window.name_of_optional_obligatory[trun_title] > 1) {
        bulletin_post($("#obligatory-post"), course, language);
    }
}

/********確認此系有沒有分AB班(選修用)********/
var check_if_two_class = function(level) { //為了讓我確認他是不是有分AB班，這個是用在選修課的填入判斷上
    level = level.split("");
    return (level); //可以從回傳的長度判斷是否有兩個班
}

/********確定有無分AB班********/
var check_which_class = function(major, level) { //確定他是不是有分A、B班
    if (major == "獸醫學系學士班 A" || major == "獸醫學系學士班 B" || major == "應用數學系學士班 A" || major == "應用數學系學士班 B" || major == "機械工程學系學士班 A" || major == "機械工程學系學士班 B" || major == "土木工程學系學士班 A" || major == "土木工程學系學士班 B" || major == "電機工程學系學士班 A" || major == "電機工程學系學士班 B") {
        var subclass = major.split(" "); //A班或B班
        subclass = subclass[1];
        var level = level; //取到年級
        level = (level + subclass);
        return level;
    } else {
        return (level); //取到年級
    }
}

var isChar = function(input) {
    //input is the last character of short title.
    var code = input.charCodeAt(0);
    if (((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122))) {
        // it is a letter
        return true;
    } else {
        return false;
    }
}
