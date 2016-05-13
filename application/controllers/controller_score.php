<?php
class Controller_Score extends Controller {

    private function check_auth() {
        if(!isset($_SESSION['user_id']) || !isset($_SESSION['username'])) {
            header("Location: /login/");
            exit();
        }
    }

    public function action_index(){
        $this->check_auth();
        header("Location: /");
        exit();
    }

    public function action_getMyScore() {
        $this->check_auth();
        $data =  file_get_contents('php://input');
        if(!empty($data)) {
            $data = json_decode($data);
            $this->model = new Model_Score(array('username' => $_SESSION['username'], 'user_id' => $_SESSION['user_id'], 'score' => $data->score));
            $this->view->render('view_msg.php', null, $this->model->saveMyScore());
        } else {
            $this->model = new Model_Score(array('username' => $_SESSION['username'], 'user_id' => $_SESSION['user_id']));
            $this->view->render('view_msg.php', null, $this->model->getMyScore());
        }

    }

    public function action_getTopScore() {
        $this->check_auth();
        $this->model = new Model_Score(array('username' => $_SESSION['username'], 'user_id' => $_SESSION['user_id']));
        $this->view->render('view_msg.php', null, $this->model->getTopScore());
    }

    
}
?>