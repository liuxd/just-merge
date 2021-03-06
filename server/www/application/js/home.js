(function() {
    var socket = io();
    var channel = 'cli';
    var terminal = $('#code-output');

    $("#branch").focus(function(){
        $(this).val("");
    });

    // Show repository list.
    $.get('/list', function(data, status) {
        if (status === 'success') {
            var repos = data.split("\n");
            var repo_container = $('#repo_list');

            for (i in repos) {
                if (repos[i].length === 0) continue;
                var repo = repos[i];
                var html = "<span><label class='checkbox-inline repo'><input name='repo' type='checkbox' value='" + repo + "'>" + repo + "</label></span>";
                $(html).appendTo(repo_container);
            }
        }
    });

    // Send command message.
    $('#merge').click(function() {
        var tag = $('#tag').val();

        if (!tag) {
            alert("What's your tag?");
            return false;
        }
        
        var r = confirm("Are you sure?\nMaybe it is a hotfix...")

        if (!r) {
            return r;
        }
        
        var repos = [];
        $("input[name='repo']:checked:checked").each(function() {
            repos.push($(this).val());
        });

        if (repos.length > 0) {
            var repolist = repos.join(' ');
            socket.emit(channel, {repolist: repolist, tag: tag});
            $("#merge").prop("disabled", "disabled");
        } else {
            alert('Choose your repositories!');
        }

        return false;
    });

    // Use socket.
    socket.on(channel, function(msg) {
        var classname = '';

        if (msg.msg === 'Merging failed') {
            classname = 'msg_warning';
        }

        if (msg.msg === 'Finished!') {
            classname = 'msg_success';
        }

        var tmp = msg.msg.split(' ');

        if (tmp.length > 0) {
            var tmp2 = tmp[0].split('/');

            if (tmp2.length > 0) {
                if (tmp2.pop() === 'git') {
                    tmp[0] = 'git';
                    msg.msg = tmp.join(' ');
                    classname = 'msg_git';
                }
            }
        }

        $('<div class="' + classname + '" >' + msg.msg + '</div>').appendTo(terminal);
        terminal.scrollTop(terminal[0].scrollHeight);
    });
})();
