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
    var dataActive = null;
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
                socket.emit('getData','jabbim');
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
                socket.emit('getData','telegram');
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
            console.log('kirimkan data jabbim');
            socket.emit('addJabbim', data);
        }
        if (method == 'PUT') {
            socket.emit('updateJabbim', data);
        }
    })
    socket.on('resAddJabbim',(data) => {
        loading(formJabbim,false);
        modaljabbim.modal('hide');
        socket.emit('getData','jabbim');
    })
    socket.on('resUpdatejabbim',(status) => {
        loading(formJabbim,false);
        modaljabbim.modal('hide');
        socket.emit('getData','jabbim');
    })
    
    socket.on('jabbimConnect', data => {
        var target = $(`.listContack[data-username="${data.username}"], .list-chat-area[data-username="${data.username}"]`);
        var status = 'Offline';
        var color = 'text-muted'
        if (data.status) {
            status = 'Online';
            color = 'text-success';
        }
        target.removeClass('simmer')
                .find('.account-status')
                .removeClass('text-muted')
                .removeClass('text-danger')
                .removeClass('text-success')
                .addClass(color)
                .html(`<i class="fas fa-circle"></i> ${status}`);
    })
    // end pengaturan jabbim

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
        var target = $(`.listContack[data-username="${data.username}"]`);
        var areachat = $(`.list-chat-area[data-username="${data.username}"]`);
        if (data.destroy) {
            target.remove();
            areachat.hide();
            dataNullArea.show();
        }else{
            target.removeClass('simmer')
            .find('.account-status')
            .removeClass('text-danger')
            .removeClass('text-success')
            .addClass('text-muted')
            .html(`<i class="fas fa-circle"></i> Offline`);
            areachat.removeClass('simmer')
            .find('.account-status')
            .removeClass('text-danger')
            .removeClass('text-success')
            .addClass('text-muted')
            .html(`<i class="fas fa-circle"></i> Offline`);
        }
    })
    $('#btnCancelwhatsapp').click(function () { 
        socket.emit('cancelScan',true);
        modalWhatsapp.modal('hide');
    })
    
    formWhatsapp.submit(function (e) {
        e.preventDefault();
        loading(formWhatsapp,true);
        var data = {};
        $( this ).serializeArray().forEach((el,i) => {
            data[el.name] = el.value;
        });
        data['id'] = $(this).attr('data-id');
        socket.emit('updateWhatsapp', data);
    })
    socket.on('resUpdateWhatsapp',(status)=> {
        loading(formWhatsapp,false);
        modalWhatsapp.modal('hide');
        socket.emit('getData','whatsapp');
    })
    // end pengaturan whatsapp

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
            socket.emit('addTelegram', data);
        }
        if (method == 'PUT') {
            data['id'] = $(this).attr('data-id');
            socket.emit('updateTelegram', data);
        }
    })

    socket.on('resAddTelegram',(status) => {
        if (status) {
            loading(formTelegram,false);
            modalTelegram.modal('hide');
            socket.emit('getData','telegram');
        }
    })

    socket.on('resUpdateTelegram',(status) => {
        loading(formTelegram,false);
        modalTelegram.modal('hide');
        socket.emit('getData','telegram');
    })
    

    // untk respon pengambilan data
    socket.on('resGetData', (res) => {
        var type = sessionStorage.getItem('menu-active');
        dataActive = res;
        if (res.status == type) {
            accountArea.find('.listContack').remove();
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

    // ambil responnya setelah chat di ambil
    socket.on('resGetChat', data => {
        var datax = data.data;
        var color = datax.status_text == 'Online' ? 'text-success' : 'text-muted';
        dataNullArea.hide();
        chatArea.show().attr('data-username',datax.username);
        chatArea.find('.account-label').text(datax.label);
        chatArea.find('.account-status').attr('class',`${color} text-small font-600-bold account-status`).html(`<i class="fas fa-circle"></i> ${datax.status_text}`);
        chatArea.find('.dropdown-item').attr('data-username',datax.username).attr('data-type',datax.type == 3 ? 'jabbim' : (datax.type == 5 ? 'whatsapp' : 'telegram'));
        chatArea.find('.chat-content').children().remove();
        if (datax.inboxes) {
            datax.inboxes.forEach(element => {
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

    

    // untuk memunculkan action account
    $('body').on('contextmenu','.listContack', (e) => {
        var username = $(e.currentTarget).data('username');
        var type = $(e.currentTarget).data('type');
        var id = $(e.currentTarget).data('id');

        actionAccount.css({
            display: "block",
            left: e.pageX,
            top: e.pageY
        }).find('a').attr('data-username',username).attr('data-type',type).attr('data-id',id);
        return false;
    })

    // untuk menghilangkan action account
    $('html').click(function() {
        actionAccount.hide();
    });

    // untuk update account
    $('.update').click(function() {
        var username=$(this).attr('data-username'),
            type=$(this).attr('data-type'),
            id=$(this).attr('data-id');
        console.log(dataActive);
        if (dataActive.status == type) {
            var datax = dataActive.data.find(e => e.id == id);
            if (datax) {
                if (type == 'jabbim') {
                    formJabbim.trigger('reset').attr('method','PUT');
                    formJabbim.find('[name="id"]').val(datax.id);
                    formJabbim.find('[name="label"]').val(datax.label);
                    formJabbim.find('[name="username"]').val(datax.username);
                    formJabbim.find('[name="password"]').attr('required',false);
                    formJabbim.find('[name="resource"]').val(datax.resource);
                    formJabbim.find('[name="startup"]').prop('checked',datax.startup_login);
                    modaljabbim.modal('show');
                    modaljabbim.find('.modal-title').text('Update jabbim account '+datax.label);
                }
                if (type == 'whatsapp') {
                    formWhatsapp.trigger('reset').attr('data-id',datax.id);
                    formWhatsapp.find('[name="label"]').val(datax.label);
                    formWhatsapp.show();
                    $('#qrCodeaArea').hide();
                    $('#btnCancelwhatsapp').hide();
                    $('#btnfromWhatsapp').show();
                    modalWhatsapp.find('.modal-title').text('Update whatsapp account '+datax.label);
                    modalWhatsapp.modal('show');
                }
                if (type == 'telegram') {
                    formTelegram.trigger('reset').attr('method','PUT').attr('data-id',datax.id);
                    formTelegram.find('[name="label"]').val(datax.label);
                    formTelegram.find('[name="startup"]').prop('checked',datax.startup_login);
                    formTelegram.find('[name="username"]').val(datax.username);
                    formTelegram.show();
                    $('#qrCodeaArea').hide();
                    $('#btnCancelwhatsapp').hide();
                    $('#btnfromWhatsapp').show();
                    modalTelegram.find('.modal-title').text('Update telegram account '+datax.username);
                    modalTelegram.modal('show');
                }
            }
        }
    })

    // untuk delete contack
    $('.delete').click(function () {
        var username = $(this).attr('data-username');
        var type = $(this).attr('data-type');
        var id = $(this).attr('data-id');
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
                    type:type,
                    id:id
                });
            }
        });
    })
    socket.on('resDeleteAccount', (data) => {
        var index = dataActive.data.findIndex(e => e.username == data.username);
        if (index > -1) {
            dataActive.data.splice(index, 1);
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
                <li class="media m-0 p-0 py-2 pl-3 align-items-center listContack ${data.simmer ? 'simmer' : ''}" data-username="${data.username}" data-type="${data.type}" data-id="${data.id}">
                    <img alt="image" class="mr-3 rounded-circle" width="50" src="img/avatar/avatar-1.png">
                    <div class="media-body">
                        <div class="mt-0 mb-1 font-weight-bold text-capitalize text-truncate account-label">${data.label}</div>
                        <div class="${data.color} text-small font-600-bold account-status"><i class="fas fa-circle"></i> ${data.status}</div>
                    </div>
                </li>
        `);
    }
})