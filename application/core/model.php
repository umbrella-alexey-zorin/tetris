<?php
class Model {
    public $user_id;
    public $username;
    public $passsword;
    public $confirm_password;
    public $email;
    public $reg_code;
    public $date_reg;
    public $activate;
    public $db;
    public $table;

    function __construct() {
        global $dbh;
        $this->db = $dbh;
    }
    
    /*
        # $param = array(
            "WHERE" => array(
                "param1 = :param1" => $this->param1,
                "param2 = :param2" => $this->param2
            ),
            "ORDER BY" => "column <param ...DESC..LIMIT ...etc.>"

        )
    */

    function getSelect($param) {
        $query = "SELECT * FROM {$this->table} ";
        $arr = array();
        foreach ($param as $key => $val) {
            if($key == "WHERE") {
                $query .= " WHERE ";
                $count = 0;
                foreach ($val as $val_key => $val_val) {
                    if($count > 0) $query .= " AND ";
                    $count++;
                    $query .= $val_key;
                    preg_match('/:.*/', $val_key, $str_key);
                    $arr[$str_key[0]] = $val_val;
                }
            }
        }
        try{
           $stmt = $this->db->prepare($query);
            $stmt->execute($arr);
            return $stmt;     
        } catch(PDOException $e) {
            exit("Ошибка данных в БД");
        }
    }

    /**
     * 
     * Сохраняет данные в БД. Принимает в качестве аргумента массив пар 
     * ключ (поле таблицы БД) => значение (значение поля БД).
     * 
     * @param array $param
     */
    function save($param) {
        $query = "INSERT INTO {$this->table} (";
        $values = "VALUES (";
        $keys = array_keys($param);
        $count = 0;
        foreach ($keys as $key => $value) {
            if($count > 0) {
                $query .= ", ";
                $values .= ", ";
            }
            $count++;
            $query .= $value;
            $values .= ":" . $value;
            
        }
        $query .= ")";
        $values .= ")";
        $query .= " " . $values; 
        try{
           $stmt = $this->db->prepare($query);
           $stmt->execute($param);
        } catch(PDOException $e) {
           exit("Ошибка данных в БД");
        }
    }


    /**
     * 
     * Обновляет данные в БД. Принимает в качестве агрумента массив, состоящий из 2х массивов;
     * Первый массив содержит ключ(изменяемое поле таблицы) => значение(новое значение поля таблицы);
     * Второй массив содержит условие WHERE ключ(поле таблицы) => значение(значение поля таблицы);
     * Оба массива принимают от 1го и более пар ключ-значение.
     * 
     * @param array $param
    */
    function update($param) {
        $query = "UPDATE {$this->table} SET ";
        $values = array_values($param);
        $count = 0;
        foreach ($param[0] as $key => $value) {
            if($count > 0) $query .= ", ";
            $count++;
            $query .= $key . " = " . $value;
        }
        $query .= " WHERE ";
        $count = 0;
        foreach ($param[1] as $key => $value) {
            if($count > 0) $query .= " AND ";
            $count++;
            $query .= $key . " = :" . $key;
        }
        //return $query;
        try{
           $stmt = $this->db->prepare($query);
           $stmt->execute($values[1]);
        } catch(PDOException $e) {
           exit("Ошибка данных в БД " . $e->getMessage());
        }
    }

}
?>