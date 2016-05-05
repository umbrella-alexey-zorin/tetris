<div class="activation_msg">
    <?php
    if(isset($_SESSION['msg_error'])) {
        echo "<div class='activation_msg_error'>" . $_SESSION['msg_error'] . "</div>";
        unset($_SESSION['msg_error']);
    }
    if(isset($_SESSION['msg_success'])) {
        echo "<div class='activation_msg_success'>" . $_SESSION['msg_success'] . "</div>";
        unset($_SESSION['msg_success']);
    }
    ?>
</div>
<div class="shadow_query"></div>
<div class="require">
    <span></span>
</div>
<div class="wrapper">
    <div class="loginWrap registration hide" style="display: none">
        <h1>РЕГИСТРАЦИЯ</h1>
        <form method="post" action="/login/registration/">
            <input type="text" name="username" placeholder="Логин"><br>
            <input type="text" name="email" placeholder="E-mail"><br>
            <input type="password" name="password" placeholder="Пароль"><br>
            <input type="password" name="confirm" placeholder="Подтверждение пароля"><br>
            <button type="submit">Зарегистрироваться</button><br><br>
        </form>
        <a href="" data-selector=".loginWrap.email" class="service">Если не пришло письмо</a>
        <hr>
        <a href="" data-selector=".loginWrap.login">Вход</a>
    </div>

    <div class="loginWrap login">
        <h1>ВХОД</h1>
        <form  method="post" action="/login/signin/">
            <input type="text" name="username" placeholder="Логин"><br>
            <input type="password" name="password" placeholder="Пароль"><br>
            <button type="submit">Войти</button><br><br>
        </form>
        <a href="" data-selector=".loginWrap.password" class="service">Не помню пароль</a>
        <hr>
        <a href="" data-selector=".loginWrap.registration">Регистрация</a>
    </div>

    <div class="loginWrap email hide" style="display: none">
        <h1>МНЕ НЕ ПРИШЛО ПИСЬМО</h1>
        <form method="post" action="/login/resendEmail/">
            <input type="text" name="email" placeholder="E-mail"><br>
            <button type="submit">Пришлете еще?</button><br>
        </form>
        <hr>
        <a href="" data-selector=".loginWrap.login">Вход</a>
    </div>

    <div class="loginWrap password hide" style="display: none">
        <h1>Я забыл пароль</h1>
        <form method="post" action="/login/sendPasswordRecovery/">
            <input type="text" name="email" placeholder="E-mail"><br>
            <button type="submit">Восстановить</button><br>
        </form>
        <hr>
        <a href="" data-selector=".loginWrap.login">Вход</a>
    </div>
</div>