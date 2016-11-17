class StufiniteSearchbar {
    constructor() {
        this.isVisible = false;
        this.type = ['optional', 'human', 'society', 'nature', 'PE']
    }

    show() {
        $(".stufinite-app-searchbar-toggle").attr("data-toggle", "true")
        $(".stufinite-app-searchbar-container").animate({
            right: 0
        }, 200);
        this.isVisible = true;
    }

    hide() {
        $(".stufinite-app-searchbar-toggle").attr("data-toggle", "false")
        $(".stufinite-app-searchbar-container").animate({
            right: "-300px"
        }, 200);
        this.isVisible = false;
    }

    addResult(target, result) {
        target.append(target, result);
    }

    clear() {
        var i, type = ['optional', 'human', 'society', 'nature', 'PE'];
        for (i in type) {
            $('.' + type[i]).empty()
        }
    }
}
