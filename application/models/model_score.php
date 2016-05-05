<?php
class Model_Score extends model {

    public function __construct($param) {
        parent:: __construct();
        $this->table = "score";
        $this->username = $param['username'];
        $this->user_id = $param['user_id'];
        if(isset($param['score'])) {
            $this->score = trim($param['score']);
        }
    }

    public function getMyScore() {
        $param = array(
            "WHERE" => array(
                "name = :name" => $this->username
            )
        );
        $stmt = $this->getSelect($param);
        $arr = array();
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $arr[] = array('name' => $this->username,
                'score' => $row['score'],
                'date' => $row['date']);
        }
        return json_encode($arr);
    }

    public function saveMyScore() {
        $param = array(
            "name" => $this->username,
            "score" => $this->score,
            "date" => date('Y-m-d H:i:s', time())
        );
        $this->save($param);
    }

    public function getTopScore() {
        $query = "SELECT name, score FROM {$this->table} ORDER BY score DESC LIMIT 10";
        try{
            $stmt = $this->db->prepare($query);
            $stmt->execute();
        } catch(PDOException $e) {
            exit("Ошибка данных в БД");
        }

        $arr = array();
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $arr[] = array('name' => $row['name'], 'score' => $row['score']);
        }
        return json_encode($arr);
    }
}
?>