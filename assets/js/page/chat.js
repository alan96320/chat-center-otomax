// "use strict";

// var form = $('#formAdd');
// var ketBot = $('#ketBot');
// var ketbotArea = $('#ketbotArea');
// var ketTelegram = $('#ketTelegram');
// var ketWhatsapp = $('#ketWhatsapp');

// $('#search-contack').focusin(function() {
//     $(this).closest('.search').css('background','#fff');
// }).focusout(function() {
//     $(this).closest('.search').css('background','#f6f6f6');
// })

// $('#addContack').click(function(){
//     var type = $(this).data('type');
//     form.trigger('reset');
//     form.attr('action','addContack');
//     form.find('[name="role"]').val(type);
//     form.find('[name="_method"]').val('POST');
//     if (type == 'jabbim') {
//         ketBot.hide();
//         ketbotArea.hide();
//         ketbotArea.find('input').attr('required', false);
//     }else{
//         if (type == 'whatsapp') {
//             ketTelegram.hide();
//             ketWhatsapp.show();
//             ketbotArea.show();
//             ketbotArea.find('input').attr('required', true);
//         }else{
//             ketTelegram.show();
//             ketWhatsapp.hide();
//             ketbotArea.hide();
//             ketbotArea.find('input').attr('required', false);
//         }
//     }
//     $('#modalForm').find('.modal-title').text('tambah kontak '+type);
//     $('#modalForm').modal('show');
// })

// form.submit(function() {
//     if (this.checkValidity() === true) {
//         loading(form,true);
//     }
// });

// // jika contack di klik maka
// $('.listContack').click(function () {
//     var id = $(this).data('id');
//     window.location.href = window.location.origin+window.location.pathname+'?id='+id;
// })

// // untuk mengirim chat
// $("#chat-form").submit(function() {
//     var me = $(this),
//         id = me.data('id'),
//         text = me.find('input').val();
//     if(text.trim().length > 0) {
//         controlChat({
//             target:$('.chat-content'),
//             position:'right',
//             text:text
//         });
//         savechat({
//             id:id,
//             text:text
//         });
//         me.find('input').val('');
//         $.each($('.listContack'), function (index, value) {
//             if ($(value).data('id') == id) {
//                 $(value).find('.lastChat').text(text);
//             }
//         });
//     }
//     return false;
// });

// // untuk menambahkan chat
// function controlChat(params) {
//     var time = moment(new Date().toISOString()).format('HH:mm');
//     var html = $(`
//         <div class="chat-item chat-${params.position}">
//             <div class="chat-text">${params.text}</div>
//             <div class="chat-time">${time}</div>
//         </div>
//     `);
//     params.target.append(html);
//     setTimeout(() => {
//         $('.chat-content').getNiceScroll(0).doScrollTop($('.chat-content').height());
//     }, 100);
// }

// $.ajaxSetup({
//     headers: {
//         'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
//     }
// });

// // untuk menyimpan chat baru
// function savechat(data) {
//     $.ajax({
//         type: "POST",
//         url: "/chat",
//         data: data,
//         dataType: "json",
//         success: function (res) {
//             stream(res.kode,data.id);
//         }
//     });
// }

// // menunggu balasan setelah mengirim chat
// function stream(id,idcontack) {
//     let stream = new EventSource(`/chat/${id}/${idcontack}`,{ withCredentials: true });

//     stream.addEventListener(id, event => {
//         var data = JSON.parse(event.data);
//         if (data.status) {
//             stream.close();
//             controlChat({
//                 target:$('.chat-content'),
//                 position:'left',
//                 text:data.data.pesan
//             });
//             $.each($('.listContack'), function (index, value) {
//                 if ($(value).data('id') == idcontack) {
//                     $(value).find('.lastChat').text(data.data.pesan);
//                 }
//             });
//             console.log("EventStream is closed");
//         }
//     });
//     setTimeout(() => {
//         stream.close();
//     }, 60000);
// }

// $('#updateContack').click(function(){
//     var id = $(this).data('id');
//     var type = $(this).data('type');
//     getContack(id).then(function(data){
//         console.log(data);
//         form.trigger('reset');
//         form.attr('action','/updateContack/'+data.id);
//         form.find('[name="role"]').val(type);
//         form.find('[name="_method"]').val('PUT');
//         form.find('[name="nama"]').val(data.username);
//         form.find('[name="pengirim"]').val(data.pengirim);
//         form.find('[name="kode_reseller"]').val(data.kode_reseller);
//         if (type == 'jabbim') {
//             ketBot.hide();
//             ketbotArea.hide();
//             ketbotArea.find('input').attr('required', false);
//         }else{
//             if (type == 'whatsapp') {
//                 ketTelegram.hide();
//                 ketWhatsapp.show();
//                 ketbotArea.show();
//                 ketbotArea.find('input').attr('required', true).val(data.keybot);
//             }else{
//                 ketTelegram.show();
//                 ketWhatsapp.hide();
//                 ketbotArea.hide();
//                 ketbotArea.find('input').attr('required', false);
//             }
//         }
//         $('#modalForm').find('.modal-title').text('update kontak '+type);
//         $('#modalForm').modal('show');
//     });
// })
// // untuk mengambil detail data kontak
// async function getContack(id) {
//     var result;
//     await $.ajax({
//         type: "get",
//         url: `/contack/${id}`,
//         dataType: "json",
//         success: function (res) {
//             result = res;
//         }
//     });
//     return result;
// }

// // untuk hapus contack
// $('#hapusContack').click(function(){
//     var id = $(this).data('id');
//     swal({
//         title: 'Apakah anda yakin?',
//         text: 'Setelah dihapus, Anda tidak akan dapat memulihkan data ini lagi!',
//         icon: 'warning',
//         buttons: true,
//         dangerMode: true,
//     }).then((willDelete) => {
//         if (willDelete) {
//             window.location.href = '/deleteContack/'+id;
//         }
//     });
// })

// // untuk clear chat
// $('#clearChat').click(function(){
//     var id = $(this).data('id');
//     swal({
//         title: 'Apakah anda yakin?',
//         text: 'Setelah dihapus, Anda tidak akan dapat memulihkan data ini lagi!',
//         icon: 'warning',
//         buttons: true,
//         dangerMode: true,
//     }).then((willDelete) => {
//         if (willDelete) {
//             window.location.href = '/clearChat/'+id;
//         }
//     });
// })





// function resizechatbox() {
//     setTimeout(() => {
//         var nav = document.querySelector('.main-navbar');
//         var foo = document.querySelector('.main-footer');
//         var bd = document.querySelector('body');
//         var h = bd.offsetHeight - (nav.offsetHeight+foo.offsetHeight);
//         $('.chat-box').height(h);
//         $(".chat-content").getNiceScroll().resize();
//         $('.chat-content').scrollTop($('.chat-content').get(0).scrollHeight, -1);
//     }, 500);
// }

// resizechatbox();
// window.onresize = resizechatbox;




