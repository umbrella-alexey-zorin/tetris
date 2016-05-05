<?php if($data) { ?>
    <div class="shadow_query"></div>
    <div class="require">
        <span></span>
    </div>
    <div class="wrapper">

        <div class="loginWrap forgot">
            <h1>ВВЕДИТЕ НОВЫЙ ПАРОЛЬ</h1>

            <form method="post" action="/login/newPassword/">
                <input type="password" name="password" placeholder="Новый пароль"><br>
                <input type="password" name="confirm" placeholder="Повторите пароль"><br>
                <button type="submit">Применить</button>
                <br><br>
            </form>
            <hr>
        </div>


    </div>
<?php } else { ?>
    <p>Запрос на восстановление пароля не действителен.</p>
<?php } ?>
