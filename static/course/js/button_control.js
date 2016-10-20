$(document).ready(function(){
	/*******    ↓製作隱藏側欄的功能↓   *******/
	$("#whole-school-head").click(function(){
	    $("#whole-school-head").find("span").toggle();
	    $("#whole-school").find("button").toggle("slow");
	});
	// $('.human_title').hide();
	// $('.society_title').hide();
	// $('.nature_title').hide();
	// $('.PE_title').hide();

	/*******   ↑製作隱藏側欄的功能↑   *******/
	
	/*******       ↓雙主修選擇↓       *******/
	$("#checkbox").click(function(){
		$('#degree_div').toggle("slow");
		$('#major_div').toggle("slow");
		$('#level_div').toggle("slow");    
		$("#d_major_group").toggle("slow");
		$("#d_level_group").toggle("slow");
		$("#textForDM").toggle("slow");
	});
	$('#storecheck').click(function(){
		if($(this).val()=='post'){
			$(this).val('get');
			$('#postform').toggle('slow');
			$('#alotbutton').toggle('slow');
			$('#footer_btn').toggle('slow');
			$('#get_form').toggle('slow');
		}
		else{
			$(this).val('post');
			$('#postform').toggle('slow');
			$('#alotbutton').toggle('slow');
			$('#footer_btn').toggle('slow');
			$('#get_form').toggle('slow');

		}
	})
	/*******       ↑雙主修選擇↑       *******/
	/**********用來把夜校的欄位隱藏起來***********/
	$("#toggleTable").click(function(){             
	    if($("#toggleTable").val()=="moon")
	    {
	        $("tr:gt(0)").toggle("slow");
	        $("tr:gt(9)").toggle("slow");
	        $(this).val("all");
	        $("#sun-span").toggle("slow");
	    }
	    else if($("#toggleTable").val()=="all"){
	        $("tr:gt(9)").toggle("slow");
	        $(this).val("sun");
	        $("#moon-span").toggle("slow");
	    }
	    else
	    {
	        $("tr:gt(0)").toggle("slow");
	        $(this).val("moon");
	        $(this).find("span").toggle("slow");
	    }
	});
});
var group_of_reset = function(){
    $(".optional").empty();//以下是要清掉選修課程、指定時間搜尋等課程
    $(".human").empty();
    $(".society").empty();
    $(".nature").empty();
    $(".PE").empty();
}
/***********清除***********/
var reset=function(){
    $('#time-table td').empty(); //把目前的time-table清空，好讓下個年級的課程能夠乾淨的顯示
    $("td").html('<span class="fa fa-plus-circle fa-5x"></span>');  //再把加號的按鈕填上去
    group_of_reset();
    $(".optional").empty();
    window.credits=0;
    $("#class_credit").text(window.credits);
    window.name_of_optional_obligatory=[];  //把數過的課程清空                
    window.user=return_init_user_json();
}
/********用+字號功能時，清空側欄********/
var reset_for_time_request=function(){  //這個function是在你的td的時候，會把該時段的課程顯示，但是要先把顯示欄位清空
    group_of_reset();
}
/*側邊欄toggle*/
var toggle_bulletin=function(){
	//如果沒有該類別的課程出現 就不顯示那個欄位的標題好節省空間
	if($('.human').text().trim()!=''){
		$('.human_title').show("slow");}
	else{
		$('.human_title').hide("slow");
	}
	if($('.society').text().trim()!=''){$('.society_title').show("slow");}
	else{
		$('.society_title').hide("slow");
	}
	if($('.nature').text().trim()!=''){$('.nature_title').show("slow");}
	else{
		$('.nature_title').hide("slow");
	}
	if($('.PE').text().trim()!=''){$('.PE_title').show("slow");}
	else{
		$('.PE_title').hide("slow");
	}
}