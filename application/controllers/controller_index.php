<?php
class Controller_Index extends Controller {

    private function check_auth() {
        if(!isset($_SESSION['user_id']) || !isset($_SESSION['username'])) {
            header("Location: /login/");
            exit();
        }
    }

    public function action_index(){
        $this->check_auth();
        $this->view->render('template_common.php', 'view_index.php');
    }

}
?>