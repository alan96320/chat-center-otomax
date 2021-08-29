$(document).ready( async () =>{ 
    $('.code-container').niceScroll();
    const socket = io("http://localhost:8000");
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
    
    await socket.on('dataAccount',(data) => {
        data.jabbim = $.map(data.jabbim, function (el, i) {
            el.status = 'Offline';
            el.color = 'text-muted';
            return el;
        });
        data.whatsapp = $.map(data.whatsapp, function (el, i) {
            el.status = 'Offline';
            el.color = 'text-muted';
            return el;
        });
        data.telegram = $.map(data.telegram, function (el, i) {
            el.status = 'Offline';
            el.color = 'text-muted';
            return el;
        });
        dataAccount = data;
        showMenu(sessionStorage.getItem('menu-active'));
    })

    if (sessionStorage.getItem('menu-active')) {
        showMenu(sessionStorage.getItem('menu-active'));
    }
    
    socket.on('message', (msg) => {
        $('#log').append($('<li>').text(msg));
        // $('.code-container').getNiceScroll(0).doScrollTop($('.code-container').height());
        $('.code-container').scrollTop($('.code-container').get(0).scrollHeight, -1);
    });

    socket.on('qr', function(src) {
        $('#qrcode').attr('src', src);
        $('#qrcode').show();
    });

    socket.on('ready', function(data) {
        $('#qrcode').hide();
    });

    socket.on('authenticated', function(data) {
        $('#qrcode').hide();
    });
    
    $('#testing').click(function (e) { 
        socket.emit('logoutJabbim', 'main001');
    })

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
            modalWhatsapp.modal('show');
            formWhatsapp.trigger('reset').attr('method','POST');
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
        if (link == 'log') {
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
                            $(this).addClass('active');
                            getChat({
                                type:'jabbim',
                                username:username
                            });
                        })
                        accountArea.append(html);
                    });
                    if (sessionStorage.getItem('accountActive') && dataAccount.jabbim.length > 0) {
                        $(`.listContack[data-username="${sessionStorage.getItem('accountActive')}"]`).addClass('active');
                        getChat({
                            username:sessionStorage.getItem('accountActive'),
                            type:sessionStorage.getItem('menu-active')
                        });
                    }
                }
            }
            if (link == 'whatsapp') {
                icon.removeAttr('class').addClass('fab fa-whatsapp mr-3 logo-chat');
                iconText.text('whatsapp');
                btnAddAccount.attr('data-type','whatsapp');
            }
            if (link == 'telegram') {
                icon.removeAttr('class').addClass('fab fa-telegram mr-3 logo-chat');
                iconText.text('telegram');
                btnAddAccount.attr('data-type','telegram');
            }
            
        }
        $('.sidebar-menu').find('.nav-item').removeClass('active');
        $(`[data-link="${link}"]`).closest('.nav-item').addClass('active');
        sessionStorage.setItem('menu-active',link);
    }

    // untuk menyimpan data akun jabbim
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
            socket.emit('jabbimUpdate', data);
        }
    })
    socket.on('resAccountAdd', data => {
        data.color = 'text-muted';
        data.status = 'Connecting...';
        var html = profileAccount({
            simmer:true,
            username:data.username,
            label:data.label,
            color:data.color,
            status:data.status
        });
        accountArea.append(html);
        if (data.type == 3) {
            loading(formJabbim,false);
            modaljabbim.modal('hide');
            dataAccount.jabbim.push(data);
            socket.emit('jabbimConn', data);
        }
    })

    socket.on('resAccountUpdate', data => {
        if (data != null) {
            if (data.type == 3) {
                var index = dataAccount.jabbim.findIndex(e => e.username === data.username);
                dataAccount.jabbim[index].color = 'text-muted';
                dataAccount.jabbim[index].status = 'Connecting...';
                loading(formJabbim,false);
                modaljabbim.modal('hide');
                socket.emit('jabbimConn', data);
            }
            $(`.listContack[data-username="${data.username}"]`).find('.account-label').text(data.label);
            $(`.listContack[data-username="${data.username}"]`).addClass('simmer')
                                                            .find('.account-status')
                                                            .removeClass('text-success')
                                                            .removeClass('text-danger')
                                                            .addClass('text-muted')
                                                            .html('<i class="fas fa-circle"></i> Connecting...');
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
        console.log(data);
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
        console.log(data);
    })

    // jika contack di klik maka ambil data chat nya
    $('.listContack').click(function(){
        sessionStorage.setItem('accountActive',$(this).attr('data-username'));
        $(this).addClass('active');
        getChat({
            username:$(this).attr('data-username'),
            type:$(this).attr('data-type')
        });
    })

    function getChat(data) {
        socket.emit('getChat',data);
    }

    // ambil responnya setelah chat di ambil
    socket.on('resGetChat', data => {
        const datax = dataAccount[data.type].find(e => e.username === data.username);
        dataNullArea.hide();
        chatArea.show().attr('data-username',datax.username);
        chatArea.find('.account-label').text(datax.username);
        chatArea.find('.account-status').attr('class',`${datax.color} text-small font-600-bold account-status`).html(`<i class="fas fa-circle"></i> ${datax.status}`);
        chatArea.find('.dropdown-item').attr('data-username',datax.username).attr('data-type',datax.type == 3 ? 'jabbim' : (datax.type == 4 ? 'whatsapp' : 'telegram'));
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
        console.log('tes');
        updateAccount({
            username:$(this).attr('data-username'),
            type:$(this).attr('data-type')
        })
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
            loading.remove();
        }
    }

    function profileAccount(data) {
        return $(`
                <li class="media m-0 p-0 py-2 pl-3 align-items-center listContack ${data.simmer ? 'simmer' : ''}" data-username="${data.username}" data-type="${data.type}">
                    <img alt="image" class="mr-3 rounded-circle" width="50" src="img/avatar/avatar-1.png">
                    <div class="media-body">
                        <div class="mt-0 mb-1 font-weight-bold text-capitalize text-truncate account-label">${data.label}</div>
                        <div class="${data.color} text-small font-600-bold account-status"><i class="fas fa-circle"></i> ${data.status}</div>
                    </div>
                </li>
        `);
    }
})