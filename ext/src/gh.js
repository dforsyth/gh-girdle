// ==UserScript==
// @name           gh-girdle
// @namespace      gh-girdle
// @include        https://github.com/
// ==/UserScript==

function gh_news() {
    var containers = {};

    var repo_template = _.template('' +
        '<div class="alert" style="padding-left: 0px;" data-girdled="<%- name %>">' +
            '<div class="body">' +
                '<div class="title" style="padding-left: 5px;">' +
                    '<a href="<%- name %>"><%- name %></a> ' +
                    '<span data-length="<%- name %>"></span>' +
                    '<a data-expander="<%- name %>" class="button" style="float: right;">expand</a>' +
                '</div>' +
                '<div data-compressed="<%- name %>" style="padding-left: 5px; margin-top: 5px;">' +
                '</div>' +
                '<div data-original="<%- name %>" style="clear: left; display: none; margin-top: 20px;">' +
                    '<div data-dropzone="<%- name %>"></div>' +
                '</div>' +
            '</div>' +
        '</div>'
    );

    var icon_template = _.template('<span class="octicon <%- icon %>" style="margin-right: 5px;" title="<%- title %>"></span>');

    function engirdle(root) {
        var compressed = {};
        var $root = $(root);
        var this_user = $.trim($('.name', '#user-links').text());
        $('.alert', $root).each(function(i, e) {
            var $e = $(e);
            if ($e.attr("data-girdled")) {
                return;
            }
            var alert_classes = $e.attr('class').split(' ');
            var alert_type = _.first(_.reject(alert_classes, function(v){ return !v || v === 'simple' || v === 'alert'; }));
            
            var $title = $('.title', $e);
            var $title_links = $('a', $title);

            var repo = '';

            switch (alert_type) {
                case 'create':
                case 'push':
                case 'follow':
                    var $key = $(_.last($title_links));
                    repo = $key.text();
                    break;
                case 'gist':
                    var $key = $(_.first($title_links));
                    repo = $key.text();
                    break;
                case 'download':
                case 'delete':
                case 'gollum':
                case 'fork':
                case 'watch_started':
                    repo = $($title_links.get(1)).text();
                    break;
                case 'issues_opened':
                case 'issues_comment':
                case 'issues_closed':
                case 'issues_reopened': 
                    var $repo_elem = $(_.last($title_links));
                    repo = _.first($repo_elem.text().split("#"));
                    break;
                case 'commit_comment':
                    var $repo_elem = $(_.last($title_links));
                    repo = _.first($repo_elem.text().split("@"));
                    break;
                default:
                    console.log('unknown: ' + alert_type);
                    repo = 'unknown';
                    break;
            }
            if (_.isUndefined(compressed[repo])) {
                compressed[repo] = [];
            }
            compressed[repo].push($e.attr('data-girdled', repo).remove());
        });

        _.each(compressed, function(actions, repo) {
            var $html;
            if (_.isUndefined(containers[repo])) {
                $html = $(repo_template({name:repo}));

                $root.prepend($html);

                containers[repo] = $html;

                var $expander = $('[data-expander]', $html);
                var $original = $('[data-original]', $html);

                $expander.click(function() {
                    var t = $expander.text();
                    if (t == 'expand') {
                        $compressed.hide();
                        $original.show();
                        $expander.text('compress');
                    } else {
                        $compressed.show();
                        $original.hide();
                        $expander.text('expand');
                    }
                });
            } else {
                $html = containers[repo];
            }
            var $dropzone = $("[data-dropzone='"+repo+"']", $html);
            var $compressed = $("[data-compressed='"+repo+"']", $html);
            _.each(actions, function(e) {
                $dropzone.append(e);
                var octicons = $('.octicon, .mega-octicon', e).attr('class').split(' ');
                var icon_type = _.first(_.reject(octicons, function(v){ return !v || v === 'octicon' || v === 'mega-octicon'; }));
                var title = $.trim($('.title', e).text());
                $compressed.append($(icon_template({icon:icon_type, title: title})));
            });
            var l = $('.alert', $dropzone).length;
            var t = (l == 1) ? "had 1 event" : "had " + l + " events";
            $('[data-length]', $html).text(t);
        });
    }

    var run = function() {
      $(".news").each(function(i, e) {
        engirdle(e);
      });
    };

    run();

    window.addEventListener("message", function(event) {
        if (event.source != window) { return; }
        if (event.data.type && (event.data.type == "GH_GIRDLE")) {
            run();
        }
    }, false);
}

function binder() {
    //Intercept the pageUpdate function and have it call engirdle
    var pageUpdate = $.fn.pageUpdate;
    $.fn.pageUpdate = function (a) {
        pageUpdate.call(this, a);
        window.postMessage({type: "GH_GIRDLE", text: "#YOLO"}, "*");
    }
}

function inject(func) {
    var text, el;

    el = document.createElement("script");
    el.setAttribute("type", "text/javascript");

    text = document.createTextNode('('+func+')()');
    el.appendChild(text);

    return document.body.appendChild(el);
}

gh_news();
inject(binder);
