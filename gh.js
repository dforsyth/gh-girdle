// ==UserScript==
// @name           gh-girdle
// @namespace      gh-girdle
// @include        https://github.com/
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// ==/UserScript==

function gh_news() {
    $('.news').each(function(index) {
        var compressed = {};
    	// $(this).css('border', '5px solid red');
        $('.alert', this).each(function(index) {
            // $(this).css('border', '5px solid blue');
            var alert_type = $(this).attr('class')
            var title_elems = $('.title', this).find('a')
            var repo = '';
            
            if (alert_type == 'alert create') {
                var key = $(title_elems).get(2);
                if (created_repo == undefined) {
                    key = $(title_elems).get(0);
                }
                repo = $(key).text();
            } else if (alert_type == 'alert issues_opened' ||
                alert_type == 'alert issues_closed' ||
                alert_type == 'alert issues_reopened') {
                repo = $($(title_elems).get(2)).text();
            } else if (alert_type == 'alert push' ||
                alert_type == 'alert commit_comment' ||
                alert_type == 'alert download' ||
                alert_type == 'alert delete' ||
                alert_type == 'alert gollum' ||
                alert_type == 'alert fork' ||
                alert_type == 'alert watch_started') {
                repo = $($(title_elems).get(1)).text();
            } else if (alert_type == 'alert issues_comment') {
                var repo_elem = $(title_elems).get(2);
                if (repo_elem == undefined) {
                    // comment on a repo
                    repo_elem = $(title_elems).get(1);
                }
                repo = $(repo_elem).text();
            } else {
                console.log('unknown: ' + alert_type);
                repo = 'unknown';
            }
            if (!compressed[repo]) {
                compressed[repo] = [];
            }
            compressed[repo].push($(this));
            $(this).remove();
        });

        for (kk in compressed) {
            (function(k) {
                var $gh_alert = $('<div class="alert"></div>');

                var $body = $('<div class="body"></div>');

                $gh_alert.append($body);

                var title = '<div class="title"></div>';
                var $title = $(title);

                $body.append($title);

                var $name = $('<a href="' + k + '">' + k + '</a>');

                $title.append($name);
                var event_str = ' had ' + compressed[k].length + ' event';
                if (compressed[k].length > 1 ) {
                    event_str += 's';
                }
                $title.append(event_str);

                var $second_title = $(title);
                $body.append($second_title);

                $(compressed[k]).each(function(i, value) {
                    var $icon = $('.mini-icon', value).clone();
                    $icon.css({'position': 'relative', 'margin-right': '5px', 'margin-top': '5px'});
                    $icon.attr('title', $.trim($('.title', value).text()));
                    $second_title.append($icon);
                });

                var $expand = $('<a id="' + k + '" class="button">expand</a>');
                $expand.css('float', 'right');

                $expand.click(function() {
                    var t = $expand.text();
                    $(compressed[k]).each(function(i, value) {
                        if (t == 'expand') {
                            $(value).appendTo($body);
                        } else {
                            $(value).remove()
                        }
                    });
                    if (t == 'expand') {
                        $second_title.remove();
                        $expand.text('compress');
                    } else {
                        $body.append($second_title);
                        $expand.text('expand');
                    }
                });

                $title.append($expand);

                $('.news').prepend($gh_alert);
            })(kk);
        }
    });
    // no one cares about page > 1
    $('.pagination').remove();
}

$(document).ready(gh_news);
