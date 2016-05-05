<?php
class Controller_Login extends Controller {

    public function action_index() {
        $this->check_auth();
        $this->view->render('template_common.php', 'view_login.php');
    }

    public function action_signin() {
        $this->check_auth();
        if(!isset($_POST['username']) || !isset($_POST['password'])) {
            header("Location: /login/");
            exit();
        }
        $this->model = new Model_Login(array('username' => $_POST['username'], 'password' => $_POST['password']));
        $this->view->render('view_msg.php', null, $this->model->login());
    }
    
    public function action_signout() {
        if(!isset($_SESSION['user_id'])) {
            header("Location: /login/");
            exit();
        }
        $_SESSION = array();

        // сбросить куки, к которой привязана сессия
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }

        // уничтожить сессию
        session_destroy();
        header("Location: /login/");
    }

    public function action_registration() {
        $this->check_auth();
        if(!isset($_POST['username']) || !isset($_POST['password']) || !isset($_POST['confirm']) || !isset($_POST['email'])) {
            header("Location: /login/");
            exit();
        }
        $this->model = new Model_Login(array('username' => $_POST['username'], 'password' => $_POST['password'], 'confirm_password' => $_POST['confirm'], 'email' => $_POST['email']));
        $this->view->render('view_msg.php', null, $this->model->registration());
    }

    public function action_activation() {
        $this->check_auth();
        if(!isset($_GET['username']) || !isset($_GET['code'])) {
            header("Location: /login/");
        }
        $this->model = new Model_Login(array('username' => $_GET['username'], 'reg_code' => $_GET['code']));
        $this->model->activation();
        header("Location: /login/");
        exit();
    }

    public function action_resendEmail() {
        $this->check_auth();
        if(!isset($_POST['email'])) {
            header("Location: /login/");
            exit();
        }
        $this->model = new Model_Login(array('email' => $_POST['email']));
        $this->view->render('view_msg.php', null, $this->model->resendEmail());
    }

    public function action_sendPasswordRecovery() {
        $this->check_auth();
        if(!isset($_POST['email'])) {
            header("Location: /login/");
            exit();
        }
        $this->model = new Model_Login(array('email' => $_POST['email']));
        $this->view->render('view_msg.php', null, $this->model->sendPasswordRecovery());
    }

    public function action_setPasswordRecovery() {
        $this->check_auth();
        if(!isset($_GET['username']) && !isset($_GET['code'])) {
            header("Location: /login/");
            exit();
        }
        $this->model = new Model_Login(array('username' => $_GET['username'], 'pass_recovery_code' => $_GET['code']));
        $this->view->render('template_common.php', 'view_password_recovery.php', $this->model->setPasswordRecovery());
    }

    public function action_newPassword() {
        $this->check_auth();
        if(!isset($_POST['password']) || !isset($_POST['confirm'])) {
            header("Location: /login/");
            exit();
        }
        $this->model = new Model_Login(array('password' => $_POST['password'], 'confirm_password' => $_POST['confirm']));
        $this->view->render('view_msg.php', null, $this->model->newPassword());
    }

    private function check_auth() {
        if(isset($_SESSION['user_id'])) {
            header("Location: /");
            exit();
        }
    }
}
?>