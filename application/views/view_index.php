<div class="wrapEndWindow">
    <div class="endWindow">
        <div class="close">X</div>
        <h1>Ваш результат</h1>
        <span></span>
    </div>
</div>


<div class="header">
    <div class="center">
        <div class="menu"><a href="#startgame">Играть!</a><a href="#myscore">Мои достижения</a><a href="#topscore">TOP 10</a></div>
        <div class="userCase"><span class="hello">Hi, <?php echo $_SESSION['username'] ?></span><a class="hello" href="/login/signout/">Выход</a></div>
    </div>
</div>
<div class="content">
    <div id="playGround">
        <div class="tableWrap"></div>
        <div class="rightColumn">
            <div class="preview">
                <p>Next</p>
                <div></div>
            </div>
            <div class="scoreBoard">
                <p class="playerName"><?php echo $_SESSION['username'] ?></p>
                <p class="points">0</p>
            </div>
            <div class="level">
                <p>Level</p>
                <p>1</p>
            </div>
            <div class="control">
                <button class="pause">Пауза</button>
                <button class="startgame">Новая игра</button>
            </div>
        </div>
    </div>
    <div class="infomodel"></div>
</div>
<script src="/js/core.js"></script>
