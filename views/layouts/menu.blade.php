<ul class="sidebar-menu">
    <li class="nav-item {{$nama == 'jabbim' ? 'active' : ''}}">
        <a href="/" class="nav-link">
            <i class="fas fa-fire"></i><span>Jabbim</span>
        </a>
    </li>
    <li class="nav-item {{$nama == 'whatsapp' ? 'active' : ''}}">
        <a href="wa" class="nav-link">
            <i class="fab fa-whatsapp"></i><span>Whatsapp</span>
        </a>
    </li>
    <li class="nav-item {{$nama == 'telegram' ? 'active' : ''}}">
        <a href="tele" class="nav-link">
            <i class="fab fa-telegram"></i><span>Telegram</span>
        </a>
    </li>
</ul>

{{-- <div class="mt-4 mb-4 p-3 hide-sidebar-mini">
    <a href="/page/https://getstisla.com/docs" class="btn btn-primary btn-lg btn-block btn-icon-split">
        <i class="fas fa-rocket"></i> Documentation
    </a>
</div> --}}
