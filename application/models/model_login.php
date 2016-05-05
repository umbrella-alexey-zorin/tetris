<?php
class Model_Login extends Model {

    public function __construct($param) {
        parent:: __construct();
        $this->table = "users";
        $this->mail = new mail();
        if(isset($param['username'])) {
            $this->username = trim($param['username']);
        }
        if(isset($param['password'])) {
            $this->password = trim($param['password']);
        }
        if(isset($param['confirm_password'])) {
            $this->confirm_password = trim($param['confirm_password']);
        }
        if(isset($param['email'])) {
            $this->email = trim($param['email']);
        }
        if(isset($param['reg_code'])) {
            $this->reg_code = trim($param['reg_code']);
        }
        if(isset($param['pass_recovery_code'])) {
            $this->pass_recovery_code = trim($param['pass_recovery_code']);
        }
    }

    private function check_login() {
        if(strlen($this->username) < 3 || strlen($this->username) > 15) {
            return json_encode(array("Логин должен соджержать более 2х символов, но не больше 15", "error"));
        }
        if(!preg_match( '/^[a-zA-Z][a-zA-Z0-9-_\.]+$/', $this->username)) {
            return json_encode(array("Неверный формат!!!", "error"));
        }
        return false;
    }
    //Проверка пароля и шифрование.
    private function check_password() {
       if(strlen($this->password) < 4 || strlen($this->password) > 15) {
            return json_encode(array("Пароль должен содержать более 3 символов, но не больше 15", "error"));
        }
        if(!preg_match( '/^[a-zA-Z0-9]+$/', $this->password)) {
            return json_encode(array("Пароль можеь содержать только символы латинского алфавита и цифры", "error"));
        }
        return false;
    }

    private function check_confirm_password() {
        if($this->password != $this->confirm_password) {
            return json_encode(array("Пароли должны совпадать", "error"));
        }
        return false;
    }

    private function check_email() {
        if(!preg_match( '/^[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}$/', $this->email)) {
            return json_encode(array("Неверный формат E-mail", "error"));
        }
        return false;
    }

    
    public function login() {
        if($msg = $this->check_login()) {
            return $msg;
        }
        if($msg = $this->check_password()) {
            return $msg;
        }
        $this->password = md5($this->password . 'abc1347');

        $param = array(
            "WHERE" => array(
                    "username = :username" => $this->username,
                    "password = :password" => $this->password,
                    )
            );
        $stmt = $this->getSelect($param);
        $row = $stmt->fetch();

        if($row) {
            if($row['activate'] == 0) {
                return json_encode(array("Аккаунт не активирован", "error"));
            } else {
                $_SESSION['user_id'] = $row['user_id'];
                $_SESSION['username'] = $row['username'];
                return json_encode(array("Добро пожаловать", "access"));
            }
        } else {
            return json_encode(array("Неверные имя пользователя или пароль", "error"));
        }
    }


    public function registration() {
        if($msg = $this->check_login()) {
            return $msg;
        }
        if($msg = $this->check_email()) {
            return $msg;
        }
        if($msg = $this->check_password()) {
            return $msg;
        }
        if($msg = $this->check_confirm_password()) {
            return $msg;
        }

        $param = array(
            "WHERE" => array(
                    "username = :username" => $this->username
                    )
            );
        $stmt = $this->getSelect($param);
        $row = $stmt->fetch();
        if($row) {
            return json_encode(array("Такое имя уже существует", "error"));
        }
        $param = array(
            "WHERE" => array(
                    "email = :email" => $this->email
                    )
            );
        $stmt = $this->getSelect($param);
        $row = $stmt->fetch();
        if($row) {
            return json_encode(array("Такой email уже существует", "error"));
        }
        $this->password = md5($this->password . 'abc1347');
        $this->reg_code = md5(time() . $this->username . 'abc1347');
        $param = array(
            "username" => $this->username,
            "password" => $this->password,
            "email" => $this->email,
            "reg_code" => $this->reg_code,
            "date_reg" => date('Y-m-d H:i:s', time())
            );
        $this->save($param);
        $this->mail->sendActivate($this->email, $this->reg_code, $this->username);
        return json_encode(array("Спасибо за регистрацию. Вам выслано письмо с инструкцией для активации аккаунта", "success"));
    }

    public function activation() {
        if(!preg_match( '/[a-zA-Z0-9]/', $this->reg_code) || !preg_match( '/^[a-zA-Z][a-zA-Z0-9-_\.]+$/', $this->username)) {
            exit("Видимо, Вы попали сюда случайно");
        }
        $param = array(
            "WHERE" => array(
                    "username = :username" => $this->username,
                    "reg_code = :password" => $this->reg_code,
                    )
            );
        $stmt = $this->getSelect($param); 
        $row = $stmt->fetch();
        if($row) {
            if($row['activate'] == '1') {
                $_SESSION['msg_success'] = "Ваш аккаунт уже был активирован ранее";
                return;
            }
            $param = array(
                array("activate" => 1),
                array("username" => $this->username)
                );
            $this->update($param);
            $_SESSION['msg_success'] = "Аккаунт активирован, теперь Вы можете войти";
            return;
        } else {
            $_SESSION['msg_error'] = "Неверный код активации или пользователь, скорее всего, был удален";
            return;
        }
    }

    public function resendEmail() {
        if(!preg_match( '/^[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}$/', $this->email)) {
            return json_encode(array("Неверный формат Email", "error"));
        }
        $this->update_bd_from_time();
        $param = array(
            "WHERE" => array(
                    "email = :email" => $this->email
                    )
            );
        $stmt = $this->getSelect($param);
        $row = $stmt->fetch();
        if($row) {
            if($row['activate']) return json_encode(array("Ваш аккаунт уже активирован", "error"));
            if($row['resend_state']) return json_encode(array("Вам уже отправлено сообщение. Следующее письмо можно будет отправить через 10 минут.", "error"));
            $this->mail->sendActivate($this->email, $row['reg_code'], $row['username']);
            $param = array(
                array("resend_state" => 1, "resend_date" => 'NOW()'),
                array("email" => $this->email)
            );
            $this->update($param);
             return json_encode(array("Вам отправлено письмо с инструкцией для активации аккаунта", "success"));
        } else {
            return json_encode(array("Аккаунт с таким email не найден", "error"));
        }
    }

    public function sendPasswordRecovery() {
        if($msg = $this->check_email()) {
            return $msg;
        }
        $this->update_bd_from_time();
        $param = array(
            "WHERE" => array(
                    "email = :email" => $this->email
                    )
            );
        $stmt = $this->getSelect($param);
        $row = $stmt->fetch();
        if($row) {
            if($row['pass_recovery_state']) return json_encode(array("Ранее уже было запрошено восстановление пароля. Проверьте почту. Следующий запрос возможен через 1 час", "error"));
            $code = md5(time() . $row['password'] . 'abc1347');
            $param = array(
                array("pass_recovery_state" => 1, "pass_recovery_date" => 'NOW()', "pass_recovery_code" => "'" . $code . "'"),
                array("email" => $this->email)
                );
            $this->update($param);
            $this->mail->sendPassword($this->email, $code, $row['username']);
            return json_encode(array("Вам на почту отправлено письмо с инструкцией для восстановления пароля", "success"));
        } else {
            return json_encode(array("Аккаунт с таким email не найден", "error"));
        }
    }

    public function setPasswordRecovery() {
        $this->update_bd_from_time();
        $param = array(
            "WHERE" => array(
                "username = :username" => $this->username,
                "pass_recovery_code = :pass_recovery_code" => $this->pass_recovery_code,
            )
        );
        $stmt = $this->getSelect($param);
        $row = $stmt->fetch();
        if($row && $row['pass_recovery_state']) {
            $_SESSION['user'] = $this->username;
            $_SESSION['code'] = $this->pass_recovery_code;
            return true;
        } else {
            unset($_SESSION['user']);
            unset($_SESSION['code']);
            return false;
        }
    }

    public function newPassword() {
        if($msg = $this->check_password()) {
            return $msg;
        }
        if($msg = $this->check_confirm_password()) {
            return $msg;
        }
        $this->update_bd_from_time();
        if(!isset($_SESSION['user']) || !isset($_SESSION['code'])) return json_encode(array("Запрос на восстановление пароля отклонен", "error"));
        $param = array(
            "WHERE" => array(
                "username = :username" => $_SESSION['user'],
                "pass_recovery_code = :pass_recovery_code" => $_SESSION['code'],
            )
        );
        $stmt = $this->getSelect($param);
        $row = $stmt->fetch();
        if($row && $row['pass_recovery_state']) {
            $this->password = md5($this->password . 'abc1347');
            $param = array(
                array("pass_recovery_state" => 0, "password" => "'" . $this->password . "'"),
                array("username" => $_SESSION['user'], "pass_recovery_code" => $_SESSION['code'])
            );
            $this->update($param);
            unset($_SESSION['user']);
            unset($_SESSION['code']);
            return json_encode(array("Пароль успешно изменен", "success"));
        }
        unset($_SESSION['user']);
        unset($_SESSION['code']);
        return json_encode(array("Запрос на восстановление пароля отклонен", "error"));
    }

    private function update_bd_from_time() {
        $stmt = $this->db->prepare("UPDATE {$this->table} SET pass_recovery_state = 0 WHERE UNIX_TIMESTAMP() - UNIX_TIMESTAMP(pass_recovery_date) > 120");
        $stmt->execute();
        $stmt = $this->db->prepare("UPDATE {$this->table} SET resend_state = 0 WHERE UNIX_TIMESTAMP() - UNIX_TIMESTAMP(resend_date) > 120");
        $stmt->execute();
    }
}
?>