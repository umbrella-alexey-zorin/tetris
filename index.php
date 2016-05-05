<?php
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Moscow');
session_start();

try {
    $dbh = new PDO('mysql:host=localhost;dbname=tetris','root', '123');
    $dbh->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
    $dbh->setAttribute( PDO::ATTR_EMULATE_PREPARES, false );
} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "<br/>";
    die();
}
//d
require_once 'application/core/bootstrap.php';

?>