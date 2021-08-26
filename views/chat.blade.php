@extends('layouts.master')
@section('title',$nama)

@section('style')
<link rel="stylesheet" href="{{mix('css/chat.css')}}">
@endsection
@section('content')
<section class="section h-100">
    <div class="section-body m-0 h-100">
        <div class="row align-items-center justify-content-center h-100 area">
            <div class="col-3 p-0 area-contack h-100">
                <div class="card h-100 m-0">
                    <div class="card-header flex-column p-0">
                        <div class="media w-100 justify-content-between align-items-center border-bottom px-3 py-2">
                            <div class="d-flex align-items-center">
                                <i class="{{$icon}} mr-3 logo-chat"></i>
                                <div class="font-weight-bold logo-text text-capitalize">{{$nama}}</div>
                            </div>
                            <a href="javascript:void(0);" class="btn btn-icon" id="addContack" title="Tambah Kontak" data-toggle="tooltip" data-type="{{$nama}}">
                                <i class="ion-android-add" style="font-size: 25px;"></i>
                            </a>
                        </div>
                        <div class="input-group search">
                            <div class="input-group-prepend">
                              <div class="input-group-text">
                                <i class="ion-android-search"></i>
                              </div>
                            </div>
                            <input type="text" class="form-control" id="search-contack" placeholder="Cari atau mulai chat baru.">
                        </div>
                    </div>
                    <div class="card-body p-0">
                      <ul class="list-unstyled list-unstyled-border">
                        @foreach ($data as $item)
                            <li class="media m-0 p-0 py-2 pl-3 align-items-center {{$item->id == $chat->id ? 'active' : ''}} listContack" data-id="{{$item->id}}">
                                <img alt="image" class="mr-3 rounded-circle" width="50" src="/img/avatar/avatar-1.png">
                                <div class="media-body">
                                    <div class="mt-0 mb-1 font-weight-bold text-capitalize text-truncate">{{$item->username}}</div>
                                    <div class="text-small font-600-bold text-truncate lastChat">{{$item->lastChat}}</div>
                                </div>
                            </li>
                        @endforeach
                      </ul>
                    </div>
                </div>
            </div>
            <div class="col-9 p-0 area-chat h-100">
                @if ($chat != null)
                    <div class="card h-100 m-0">
                        <div class="card-header p-0 px-3 justify-content-between align-items-center border-bottom border-left">
                            <div class="d-flex align-items-center">
                                <img alt="image" class="mr-3 rounded-circle" width="40" src="/img/avatar/avatar-1.png">
                                <div class="media-body">
                                    <div class="font-weight-bold text-capitalize text-small">{{$chat->username}}</div>
                                    <div class="text-small font-600-bold">{{$chat->pengirim}}</div>
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-icon" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="ion-android-more-vertical" style="font-size: 25px;"></i>
                                </button>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a href="javascript:void(0);" class="dropdown-item has-icon" id="updateContack" data-id="{{$chat->id}}" data-type="{{$nama}}">
                                    <i class="ion-android-create"></i> Update Contact
                                    </a>
                                    <a href="javascript:void(0);" class="dropdown-item has-icon" id="hapusContack" data-id="{{$chat->id}}">
                                    <i class="ion-android-delete"></i> Delete Contact
                                    </a>
                                    <a href="javascript:void(0);" class="dropdown-item has-icon" id="clearChat" data-id="{{$chat->id}}">
                                    <i class="ion-android-textsms"></i> Clear Chat
                                    </a>
                                </div>
                            </div>

                        </div>
                        <div class="card-body d-flex flex-column chat-content">
                            @foreach ($chat->inboxFilter as $value)
                                @php
                                    $tgl = $value[0]->tgl_entri;
                                    $infoTgl = date('d-m-Y',strtotime($tgl));
                                    $selisih = date_diff(date_create($tgl), date_create());
                                    if ($selisih->d == 0) {
                                        $infoTgl = 'hari ini';
                                    } elseif ($selisih->d == 1) {
                                        $infoTgl = 'kemarin';
                                    } elseif ($selisih->d > 1 && $selisih->d < 7) {
                                        $infoTgl = Helpers::hariIndo(date('D', strtotime($tgl)));
                                    }
                                @endphp
                                <div class="chat-badge text-uppercase text-small">{{$infoTgl}}</div>
                                @foreach ($chat->inbox as $i => $item)
                                    <div class="chat-item chat-right">
                                        <div class="chat-text">{{$item->pesan}}</div>
                                        <div class="chat-time">{{date('h:i',strtotime($item->tgl_entri))}}</div>
                                    </div>
                                    @foreach ($item->outbox as $val)
                                        <div class="chat-item chat-left">
                                            <div class="chat-text">{{$val->pesan}}</div>
                                            <div class="chat-time">{{date('h:i',strtotime($val->tgl_entri))}}</div>
                                        </div>
                                    @endforeach
                                @endforeach
                            @endforeach
                        </div>
                        <div class="card-footer chat-form">
                            <form id="chat-form" style="margin-block-end: 0" data-id="{{$chat->id}}">
                                <div class="input-group">
                                    <input type="text" class="form-control" placeholder="Ketik pesan">
                                    <div class="input-group-append">
                                        <button class="input-group-text">
                                            <i class="far fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                @else
                    <div class="card h-100 m-0 border-left data-null">
                        <div class="card-body d-flex align-items-center justify-content-center flex-column">
                            <p class="m-0">Untuk memulai chat silahkan pilih salah satu kontak di samping.</p>
                            <p class="m-0">Jika tidak ada kontak, silahkan tambahkan kontaknya.</p>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </div>
</section>
<div class="modal fade" tabindex="-1" role="dialog" id="modalForm" data-backdrop="static">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-capitalize">Modal title</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <form id="formAdd" action="addContack" method="POST" class="needs-validation" novalidate>
            <div class="modal-body pb-0">
                @csrf
                @method('PUT')
                <div id="ketBot" style="font-size: 12px; text-align: justify;">
                    <div id="ketTelegram">
                        <p class="m-0">Pastikan nomor/id anda sudah di aktivasi di <b>@CallMeBot_txtbot</b>
                        <p class="mb-0">Cara Aktivasi:</p>
                        <ol>
                            <li>Silahkan cari dan tambahkan <b>@CallMeBot_txtbot</b> ke kontak telegram anda.</li>
                            <li>Lalu kirim pesan <b>/start</b></li>
                            <li>Tunggu beberapa saat, boot akan memverifikasi nomor anda.</li>
                        </ol>
                    </div>
                    <div id="ketWhatsapp">
                        <p class="m-0">Untuk mendapatkan <b>Key Boot</b>:</p>
                        <ol>
                            <li>Tambahkan nomor telepon <b>+34 644 56 55 18</b> ke dalam Kontak Telepon Anda. (Beri nama CallMeBot API)</li>
                            <li>Kirimkan pesan <b><i>I allow callmebot to send me messages</i></b> ke nomor <b>CallMeBot API</b></li>
                            <li>Tunggu hingga Anda menerima pesan <b><i>API Activated for your phone number. Your APIKEY is 123123</i></b> dari bot. Karena ini masih dalam pengujian beta, aktivasi dapat memakan waktu hingga 2 menit</li>
                        </ol>
                    </div>
                </div>
                <div class="form-group">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <div class="input-group-text">
                                <i class="ion-at"></i>
                            </div>
                        </div>
                        <input type="text" class="form-control" placeholder="Nama" name="nama" required>
                        <div class="invalid-feedback">
                            Nama tidak boleh kosong.
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <div class="input-group-text">
                                <i class="ion-card"></i>
                            </div>
                        </div>
                        <input type="text" class="form-control" placeholder="Nomor/ID Pengirim" name="pengirim" required>
                        <div class="invalid-feedback">
                            Nomor/ID Pengirim tidak boleh kosong.
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <div class="input-group-text">
                                <i class="ion-lock-combination"></i>
                            </div>
                        </div>
                        <input type="text" class="form-control" placeholder="Kode Reseller" name="kode_reseller" required>
                        <div class="invalid-feedback">
                            Kode Reseller tidak boleh kosong.
                        </div>
                    </div>
                </div>
                <div class="form-group" id="ketbotArea">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <div class="input-group-text">
                                <i class="ion-key"></i>
                            </div>
                        </div>
                        <input type="text" class="form-control" placeholder="Key Boot" name="keybot" required>
                        <div class="invalid-feedback">
                            Key Boot tidak boleh kosong.
                        </div>
                    </div>
                </div>
                <input type="hidden" name="role">
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-primary">Save</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
        </form>
      </div>
    </div>
</div>
@endsection
@section('script')
<script src="{{mix('js/page/chat.js')}}"></script>
@endsection
