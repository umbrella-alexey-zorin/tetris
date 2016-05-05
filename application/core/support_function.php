<?php
class mail {
	function sendActivate($email, $msg, $username) {
    	$newmsg = 'Перейдите по ссылке для активации аккаунта http://tetris.loc/login/activation/?username=' . $username . "&code=" . $msg;
    	mail($email, 'ACTIVATION CODE', $newmsg) or die(json_encode(array("Письмо не отправлено!", "error")));
	}

	function sendPassword($email, $msg, $username) {
		$newmsg = "Здравствуйте, " . $username . "Вы или кто то другой запросили восстановление пароля для игры Тетрис. Если Вы этого не делали, просто проигнорируйте данное письмо.
		Для восстановления пароля перейдите по ссылке http://tetris.loc/login/setpasswordrecovery/?username=" . $username . "&code=" . $msg;
		mail($email, 'ACTIVATION CODE', $newmsg) or die(json_encode(array("Письмо не отправлено!", "error")));
	}
}
?>