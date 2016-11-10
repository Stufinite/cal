function StufiniteSearchbar() {
    this.isVisible = false;
}

StufiniteSearchbar.prototype.show = function() {
    $(".stufinite-app-searchbar-toggle").attr("data-toggle", "true")
    $(".stufinite-app-searchbar-container").animate({
        right: 0
    }, 200);
    this.isVisible = true;
};

StufiniteSearchbar.prototype.hide = function() {
    $(".stufinite-app-searchbar-toggle").attr("data-toggle", "false")
    $(".stufinite-app-searchbar-container").animate({
        right: "-300px"
    }, 200);
    this.isVisible = false;
};

StufiniteSearchbar.prototype.addResult = function(target, course) {
    var $result = $($.parseHTML(`<div class="stufinite-searchbar-result-item">
      <h4 class='title'></h4>
      <span class='info'></span>
      <div class="action-btn">
        <button><a class='join'>加入</a></button>
        <button><a class='review'>心得</a></button>
        <button><a class='detail'>詳細資料</a></button>
      </div>
    </div>`));
    $result.find('h4.title').text(course.title);
    $result.find('span.info').text(course.time + ' | ' + course.professor)
    // $result.find('a.join').attr('href', )
    $result.find('a.review').attr('href', course.review_url)
    $result.find('a.detail').attr('href', course.detail_url)
    target.append($result);
}


var searchbar = new StufiniteSearchbar();

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
