$(document).ready( async () =>{ 
    $('.code-container').niceScroll();
    const socket = io("http://localhost:8000/");
    var log = $('.log-area'),
        dataAccount = null,
        content = $('.content-area'),
        icon = $('.logo-chat'),
        iconText = $('.logo-text'),
        btnAddAccount = $('#addAccount'),
        modaljabbim = $('#modalJabbim'),
        modalWhatsapp = $('#modalWhatsapp'),
        modalTelegram = $('#modalTelegram'),
        formJabbim = modaljabbim.find('form'),
        formWhatsapp = modalWhatsapp.find('form'),
        formTelegram = modalTelegram.find('form'),
        accountArea = $('#accountArea'),
        actionAccount = $('#actionAccount'),
        dataNullArea = $('.data-null'),
        chatArea = $('.list-chat-area');
    
    // await socket.on('dataAccount',(data) => {
    //     data.jabbim = $.map(data.jabbim, function (el, i) {
    //         el.status = 'Offline';
    //         el.color = 'text-muted';
    //         return el;
    //     });
    //     data.whatsapp = $.map(data.whatsapp, function (el, i) {
    //         el.status = 'Connecting...';
    //         el.color = 'text-muted';
    //         return el;
    //     });
    //     data.telegram = $.map(data.telegram, function (el, i) {
    //         el.status = 'Connecting...';
    //         el.color = 'text-muted';
    //         return el;
    //     });
    //     dataAccount = data;
    //     showMenu(sessionStorage.getItem('menu-active'));
    // })
    
    socket.on('message', (msg) => {
        $('#log').append($('<li>').text(msg));
        // $('.code-container').getNiceScroll(0).doScrollTop($('.code-container').height());
        $('.code-container').scrollTop($('.code-container').get(0).scrollHeight, -1);
    });

    $('.menu').click(function (e) { 
        e.preventDefault();
        var link = $(this).data('link');
        showMenu(link);
    })

    btnAddAccount.click(function () { 
        var type = $(this).attr('data-type');
        if (type == 'jabbim') {
            modaljabbim.find('.modal-title').text('Add Jabbim');
            modaljabbim.modal('show');
            formJabbim.trigger('reset').attr('method','POST');
            formJabbim.find('[name="password"]').attr('required',true);
        }
        if (type == 'whatsapp') {
            modalWhatsapp.find('.modal-title').text('Add whatsapp');
            modalWhatsapp.find('form').hide();
            modalWhatsapp.find('.loading').remove();
            $('#btnfromWhatsapp').hide();
            $('#qrCodeaArea').show();
            $('#qrCodeaArea').find('label').text('');
            $('#qrCodeaArea').find('img').hide();
            $('#btnCancelwhatsapp').show();
            modalWhatsapp.modal('show');
            loading($('#qrCodeaArea'),true);
            socket.emit('addWhatsapp',{add:true});
        }
        if (type == 'telegram') {
            modalTelegram.find('.modal-title').text('Add Telegram');
            modalTelegram.modal('show');
            formTelegram.trigger('reset').attr('method','POST');
        }
    })

    function showMenu(link) {
        accountArea.children().remove();
        dataNullArea.show();
        chatArea.hide();
        if (link == 'log' || link == null) {
            log.show();
            content.hide();
        }else{
            log.hide();
            content.show();
            if (link == 'jabbim') {
                icon.removeAttr('class').addClass('fas fa-fire mr-3 logo-chat');
                iconText.text('jabbim');
                btnAddAccount.attr('data-type','jabbim');
                if (dataAccount != null) {
                    dataAccount.jabbim.forEach(el => {
                        var html = profileAccount({
                            simmer:false,
                            username:el.username,
                            label:el.label,
                            color:el.color,
                            status:el.status,
                            type:'jabbim'
                        });
                        html.click(function () { 
                            var username = $(this).attr('data-username');
                            sessionStorage.setItem('accountActive',username);
                            accountArea.find('.listContack').removeClass('active');
                            $(this).addClass('active');
                            $(this).removeClass('notif-on');
                            getChat({
                                username:username,
                                type:link,
                            });
                        })
                        accountArea.append(html);
                    });
                    if (sessionStorage.getItem('accountActive') && dataAccount.jabbim.length > 0) {
                        $(`.listContack[data-username="${sessionStorage.getItem('accountActive')}"]`).addClass('active');
                        getChat({
                            username:sessionStorage.getItem('accountActive'),
                            type:link
                        });
                    }
                }
            }
            if (link == 'whatsapp') {
                icon.removeAttr('class').addClass('fab fa-whatsapp mr-3 logo-chat');
                iconText.text('whatsapp');
                btnAddAccount.attr('data-type','whatsapp');
                socket.emit('getData','whatsapp');
            }
            if (link == 'telegram') {
                icon.removeAttr('class').addClass('fab fa-telegram mr-3 logo-chat');
                iconText.text('telegram');
                btnAddAccount.attr('data-type','telegram');
                if (dataAccount != null) {
                    dataAccount.telegram.forEach(el => {
                        var html = profileAccount({
                            simmer:false,
                            username:el.username,
                            label:el.label,
                            color:el.color,
                            status:el.status,
                            type:'telegram'
                        });
                        html.click(function () { 
                            var username = $(this).attr('data-username');
                            sessionStorage.setItem('accountActive',username);
                            accountArea.find('.listContack').removeClass('active');
                            $(this).addClass('active');
                            $(this).removeClass('notif-on');
                            getChat({
                                username:username,
                                type:link,
                            });
                        })
                        accountArea.append(html);
                    });
                    if (sessionStorage.getItem('accountActive') && dataAccount.telegram.length > 0) {
                        $(`.listContack[data-username="${sessionStorage.getItem('accountActive')}"]`).addClass('active');
                        getChat({
                            username:sessionStorage.getItem('accountActive'),
                            type:link
                        });
                    }
                }
            }
        }

        if (link != null) {
            $('.sidebar-menu').find('.nav-item').removeClass('active');
            $(`[data-link="${link}"]`).closest('.nav-item').addClass('active');
            sessionStorage.setItem('menu-active',link);
        }
    }

    // untuk pengaturan akun jabbim
    formJabbim.submit(function (e) { 
        e.preventDefault();
        loading(formJabbim,true);
        var method = $(this).attr('method');
        var data = {};
        $( this ).serializeArray().forEach((el,i) => {
            data[el.name] = el.value;
        });
        if (method == 'POST') {
            socket.emit('AccountAdd', data);
        }
        if (method == 'PUT') {
            data['id'] = $(this).attr('data-id');
            socket.emit('AccountUpdate', data);
        }
    })
    
    socket.on('resJabbimConn', data => {
        if (data.status) {
            $(`.listContack[data-username="${data.username}"], .list-chat-area[data-username="${data.username}"]`).removeClass('simmer')
                                                               .find('.account-status')
                                                               .removeClass('text-muted')
                                                               .removeClass('text-danger')
                                                               .addClass('text-success')
                                                               .html('<i class="fas fa-circle"></i> Online');
            if (dataAccount != null) {
                dataAccount.jabbim.forEach((element,index) => {
                    if (dataAccount.jabbim[index].username == data.username) {
                        dataAccount.jabbim[index].status = 'Online';
                        dataAccount.jabbim[index].color = 'text-success';
                    }
                });
            }
        }else{
            $(`.listContack[data-username="${data.username}"], .list-chat-area[data-username="${data.username}"]`).removeClass('simmer')
                                                               .find('.account-status')
                                                               .removeClass('text-muted')
                                                               .removeClass('text-success')
                                                               .addClass('text-danger')
                                                               .html('<i class="fas fa-circle"></i> Error Connecting...');
            if (dataAccount != null) {
                dataAccount.jabbim.forEach((element,index) => {
                    if (dataAccount.jabbim[index].username == data.username) {
                        dataAccount.jabbim[index].status = 'Error Connecting...';
                        dataAccount.jabbim[index].color = 'text-danger';
                        
                    }
                });
            }
        }
    })

    // untuk pengaturan whatsapp
    socket.on('qrWhatsapp', (data) => {
        $('#qrCodeaArea').find('label').text(data.message).show();
        $('#qrCodeaArea').find('img').attr('src',data.url).show();
        loading($('#qrCodeaArea'),false);
    })
    socket.on('resAddwhatsapp', (status) => {
        modalWhatsapp.modal('hide');
        socket.emit('getData','whatsapp');
    })
    socket.on('timeOutScan', (message) => {
        $('#qrCodeaArea').find('label').text(message);
        $('#qrCodeaArea').find('img').hide();
        loading($('#qrCodeaArea'),false);
    })
    socket.on('disconedWhatsapp',(data) => {
        $(`.listContack[data-username="${data.username}"]`).remove();
        $(`.list-chat-area[data-username="${data.username}"]`).hide();
        dataNullArea.show();
    })
    $('#btnCancelwhatsapp').click(function () { 
        socket.emit('cancelScan',true);
        modalWhatsapp.modal('hide');
    })

    // untuk update whatsapp
    formWhatsapp.submit(function (e) {
        e.preventDefault();
        loading(formWhatsapp,true);
        var data = {};
        $( this ).serializeArray().forEach((el,i) => {
            data[el.name] = el.value;
        });
        data['id'] = $(this).attr('data-id');
        socket.emit('AccountUpdate', data);
    })

    // untuk pengaturan telegram
    formTelegram.submit(function (e) {
        e.preventDefault();
        loading(formTelegram,true);
        var method = $(this).attr('method');
        var data = {};
        $( this ).serializeArray().forEach((el,i) => {
            data[el.name] = el.value;
        });
        if (method == 'POST') {
            socket.emit('AccountAdd', data);
        }
        if (method == 'PUT') {
            data['id'] = $(this).attr('data-id');
            socket.emit('AccountUpdate', data);
        }
    })
    socket.on('errorAuthTelegram',(err) => {
        loading(formTelegram,false);
        var alert = $(`
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>${err}</strong> please check token...
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);
        formTelegram.find('.modal-body').prepend(alert);
        setTimeout(() => {
            alert.remove();
        }, 10000);
    })
    socket.on('TelegramReady',(data) => {
        var target = $(`.listContack[data-username="${data.username}"], .list-chat-area[data-username="${data.username}"]`);
        target.removeClass('simmer')
            .find('.account-status')
            .removeClass('text-muted')
            .removeClass('text-danger')
            .addClass('text-success')
            .html('<i class="fas fa-circle"></i> Online');
        if (dataAccount != null) {
            dataAccount.telegram.forEach((element,index) => {
                if (element.username == data.username) {
                    dataAccount.telegram[index].status = 'Online';
                    dataAccount.telegram[index].color = 'text-success';
                }
            });
        }
    })


    // untk respon pengambilan data
    socket.on('resGetData', (res) => {
        var type = sessionStorage.getItem('menu-active');
        if (res.status == type) {
            res.data.forEach(value => {
                var html = profileAccount({
                    username:value.username,
                    label:value.label,
                    color:value.status_text == 'Online' ? 'text-success' : 'text-muted',
                    status:value.status_text,
                    type:type,
                    id:value.id
                });
                html.click(function () { 
                    var username = $(this).attr('data-username');
                    sessionStorage.setItem('accountActive',username);
                    accountArea.find('.listContack').removeClass('active');
                    $(this).addClass('active');
                    $(this).removeClass('notif-on');
                    socket.emit('getChat',{
                        username:username,
                        id: value.id,
                    })
                })
                accountArea.append(html);
            });
        }
    })


    socket.on('resAccountAdd', data => {
        var simmer = true;
        data.color = 'text-muted';
        data.status = 'Connecting...';
        var type = data.type == 3 ? 'jabbim' : (data.type == 4 ? 'telegram' : 'whatsapp');
        if (type == 'jabbim') {
            loading(formJabbim,false);
            modaljabbim.modal('hide');
            dataAccount.jabbim.push(data);
            socket.emit('jabbimConn', data);
        }
        if (type == 'whatsapp') {
            var cek = dataAccount.whatsapp.findIndex(e => e.username = data.username);
            modalWhatsapp.modal('hide');
            if (cek == -1) {
                dataAccount.whatsapp.push(data);
            }
            simmer = false;
            data.color = 'text-success';
            data.status = 'Online';
        }
        if (type == 'telegram') {
            modalTelegram.modal('hide');
            dataAccount.telegram.push(data);
            simmer = false;
            data.color = 'text-success';
            data.status = 'Online';
        }

        if (type == sessionStorage.getItem('menu-active')) {
            var html = profileAccount({
                simmer:simmer,
                username:data.username,
                label:data.label,
                color:data.color,
                status:data.status,
                type:type
            });
            html.click(function () { 
                var username = $(this).attr('data-username');
                sessionStorage.setItem('accountActive',username);
                accountArea.find('.listContack').removeClass('active');
                $(this).addClass('active');
                $(this).removeClass('notif-on');
                getChat({
                    username:username,
                    type: type,
                });
            })
            accountArea.append(html);
        }
    })

    socket.on('resAccountUpdate', data => {
        if (data != null) {
            var target = $(`.listContack[data-username="${data.username}"], .list-chat-area[data-username="${data.username}"]`);
            var newData = data;
            // untuk untuk jabbim
            if (data.type == 3) {
                var index = dataAccount.jabbim.findIndex(e => e.username === data.username);
                newData.color = 'text-muted';
                newData.status = 'Connecting...';
                dataAccount.jabbim[index] = newData;
                loading(formJabbim,false);
                modaljabbim.modal('hide');
                socket.emit('jabbimConn', data);
                target.addClass('simmer')
                    .find('.account-status')
                    .removeClass('text-success')
                    .removeClass('text-danger')
                    .addClass('text-muted')
                    .html('<i class="fas fa-circle"></i> Connecting...');
            }

            // data untuk whatsapp
            if (data.type == 5) {
                var index = dataAccount.whatsapp.findIndex(e => e.username === data.username);
                dataAccount.whatsapp[index] = newData;
                loading(formWhatsapp,false);
                modalWhatsapp.modal('hide');
            }

            //data untuk telegram
            if (data.type == 4) {
                var index = dataAccount.telegram.findIndex(e => e.username === data.username);
                newData.color = 'text-success';
                newData.status = 'Online';
                dataAccount.telegram[index] = newData;
                loading(formTelegram,false);
                modalTelegram.modal('hide');
                target.removeClass('simmer')
                    .find('.account-status')
                    .removeClass('text-muted')
                    .removeClass('text-danger')
                    .addClass('text-success')
                    .html('<i class="fas fa-circle"></i> Online');
            }

            target.find('.account-label').text(data.label);
        }
    })


    // jika ada chat masuk
    socket.on('chatIn', data => {
        // notif-on
        var target = $(`.listContack[data-username="${data.username}"]`);
        if (target) {
            if (target.hasClass('active')) {
                chatArea.find('.chat-content').append($(`
                    <div class="chat-item chat-left">
                        <div class="chat-text">${data.pesan}</div>
                        <div class="chat-time">${moment(data.tgl_entri).format('HH:mm')}</div>
                    </div>
                `));
                $('.chat-content').scrollTop($('.chat-content').get(0).scrollHeight, -1);
            }else{
                target.addClass('notif-on');
            }
        }
    })

    // jika ada chat keluar
    socket.on('chatOut', data => {
        var target = $(`.listContack[data-username="${data.username}"]`);
        if (target) {
            if (target.hasClass('active')) {
                chatArea.find('.chat-content').append($(`
                    <div class="chat-item chat-right">
                        <div class="chat-text">${data.pesan}</div>
                        <div class="chat-time">${moment(data.tgl_entri).format('HH:mm')}</div>
                    </div>
                `));
                $('.chat-content').scrollTop($('.chat-content').get(0).scrollHeight, -1);
            }else{
                target.addClass('notif-on');
            }
        }
    })

    // ambil responnya setelah chat di ambil
    socket.on('resGetChat', data => {
        const datax = dataAccount[data.type].find(e => e.username === data.username);
        if (datax) {
            dataNullArea.hide();
            chatArea.show().attr('data-username',datax.username);
            chatArea.find('.account-label').text(datax.label);
            chatArea.find('.account-status').attr('class',`${datax.color} text-small font-600-bold account-status`).html(`<i class="fas fa-circle"></i> ${datax.status}`);
            chatArea.find('.dropdown-item').attr('data-username',datax.username).attr('data-type',datax.type == 3 ? 'jabbim' : (datax.type == 5 ? 'whatsapp' : 'telegram'));
            chatArea.find('.chat-content').children().remove();
            data.message.forEach(element => {
                var outbox = element.outbox;
                // <div class="chat-badge text-uppercase text-small">kemarin</div>
                chatArea.find('.chat-content').append($(`
                    <div class="chat-item chat-left">
                        <div class="chat-text">${element.pesan}</div>
                        <div class="chat-time">${moment(element.tgl_entri).format('HH:mm')}</div>
                    </div>
                `));
                if (outbox) {
                    chatArea.find('.chat-content').append($(`
                        <div class="chat-item chat-right">
                            <div class="chat-text">${outbox.pesan}</div>
                            <div class="chat-time">${moment(outbox.tgl_entri).format('HH:mm')}</div>
                        </div>
                    `));
                }
            });
            $('.chat-content').scrollTop($('.chat-content').get(0).scrollHeight, -1);
        }
    })

    // untuk memunculkan action account
    $('body').on('contextmenu','.listContack', (e) => {
        var username = $(e.currentTarget).data('username');
        var type = $(e.currentTarget).data('type');
        
        actionAccount.css({
            display: "block",
            left: e.pageX,
            top: e.pageY
        }).find('a').attr('data-username',username).attr('data-type',type);
        return false;
    })

    // untuk menghilangkan action account
    $('html').click(function() {
        actionAccount.hide();
    });

    // untuk update account
    $('.update').click(function() {
        updateAccount({
            username:$(this).attr('data-username'),
            type:$(this).attr('data-type')
        })
    })

    // untuk delete contack
    $('.delete').click(function () {
        var username = $(this).attr('data-username');
        var type = $(this).attr('data-type');
        swal({
            title: 'Are you sure?',
            text: 'Once deleted contack, you will not be able to recover this contack!',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                socket.emit('deleteAccount',{
                    username: username,
                    type:type
                });
            }
        });
    })
    socket.on('resDeleteAccount', (data) => {
        var index = dataAccount[data.type].findIndex(e => e.username == data.username);
        if (index > -1) {
            dataAccount[data.type].splice(index, 1);
        }
        $(`.listContack[data-username="${data.username}"]`).remove();
        if ($(`.list-chat-area[data-username="${data.username}"]`)) {
            $(`.list-chat-area[data-username="${data.username}"]`).hide();
            dataNullArea.show();
        }
    })

    // untuk clear chat
    $('.clear').click(function () {
        var username = $(this).attr('data-username');
        swal({
            title: 'Are you sure?',
            text: 'Once clear chat, you will not be able to recover this chat!',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                socket.emit('clearChat',{
                    username: username
                });
            }
        });
    })
    socket.on('resClearAccount', (data) => {
        var target = $(`.list-chat-area[data-username="${data.username}"]`);
        if (target) {
            target.find('.chat-item').remove();
        }
    })

    function updateAccount(datax) {
        var username = datax.username;
        if (datax.type == 'jabbim') {
            var data = dataAccount.jabbim.find(e => e.username === username);
            formJabbim.trigger('reset').attr('method','PUT').attr('data-id',data.id);
            formJabbim.find('[name="label"]').val(data.label);
            formJabbim.find('[name="username"]').val(data.username);
            formJabbim.find('[name="password"]').attr('required',false);
            formJabbim.find('[name="resource"]').val(data.resource);
            formJabbim.find('[name="startup"]').prop('checked',data.startup_login);
            modaljabbim.find('.modal-title').text('Update jabbim account '+data.username);
            modaljabbim.modal('show');
        }
        if (datax.type == 'whatsapp') {
            var data = dataAccount.whatsapp.find(e => e.username === username);
            formWhatsapp.trigger('reset').attr('data-id',data.id);
            formWhatsapp.find('[name="label"]').val(data.label);
            formWhatsapp.show();
            $('#qrCodeaArea').hide();
            $('#btnCancelwhatsapp').hide();
            $('#btnfromWhatsapp').show();
            modalWhatsapp.find('.modal-title').text('Update whatsapp account '+data.username);
            modalWhatsapp.modal('show');
        }
        if (datax.type == 'telegram') {
            var data = dataAccount.telegram.find(e => e.username === username);
            formTelegram.trigger('reset').attr('method','PUT').attr('data-id',data.id);
            formTelegram.find('[name="label"]').val(data.label);
            formTelegram.find('[name="startup"]').prop('checked',data.startup_login);
            formTelegram.find('[name="username"]').val(data.username);
            formTelegram.show();
            $('#qrCodeaArea').hide();
            $('#btnCancelwhatsapp').hide();
            $('#btnfromWhatsapp').show();
            modalTelegram.find('.modal-title').text('Update telegram account '+data.username);
            modalTelegram.modal('show');
        }
    }

    function loading(target,show) {
        var loading = $(`
            <div class="loading position-absolute w-100 h-100 d-flex justify-content-center align-items-center">
                <i class="ion-loop fa-spin"></i>
            </div>
        `);
        if (show) {
            target.prepend(loading);
        }else{
            target.find('.loading').remove();
        }
    }

    function profileAccount(data) {
        return $(`
                <li class="media m-0 p-0 py-2 pl-3 align-items-center listContack ${data.simmer ? 'simmer' : ''}" data-username="${data.username}" data-type="${data.type}" data.id="${data.id}">
                    <img alt="image" class="mr-3 rounded-circle" width="50" src="img/avatar/avatar-1.png">
                    <div class="media-body">
                        <div class="mt-0 mb-1 font-weight-bold text-capitalize text-truncate account-label">${data.label}</div>
                        <div class="${data.color} text-small font-600-bold account-status"><i class="fas fa-circle"></i> ${data.status}</div>
                    </div>
                </li>
        `);
    }
})