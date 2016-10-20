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
function getcrsftoken(){
	return getCookie('csrftoken');//呼叫getCookie函數來取得csfttoken
}