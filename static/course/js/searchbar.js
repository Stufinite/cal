function StufiniteSearchbar() {
    this.isVisible = false;
    this.type = ['optional', 'human', 'society', 'nature', 'PE']
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

StufiniteSearchbar.prototype.addResult = function(target, result) {
    target.append(target, result);
}

StufiniteSearchbar.prototype.clear = function() {
  var i, type = ['optional', 'human', 'society', 'nature', 'PE'];
  for (i in type) {
    $('.' + type[i]).empty()
  }
}
