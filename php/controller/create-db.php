<?php

require_once (__DIR__ . "/../model/config.php");
require_once(__DIR__ . "/../controller/login-verify.php");
    
     if(!authenticateUser()) {
         header("Location: " . $path . "index.php");
         die();
    }

$query =  $_SESSION["connection"]->query("CREATE TABLE posts ("
        . "id int(11) NOT NULL AUTO_INCREMENT,"
        . "title varchar(255) NOT NULL,"
        . "post text NOT NULL,"
        . "PRIMARY KEY (id))");

if ($query) {
    echo "<p>Succesfully created table: post</p>";
} else {
    echo "<p>" . $_SESSION["connection"]->error . "</p>";
}

    $query = $_SESSION["connection"]->query("CREATE TABLE users ("
        . "id int(11) NOT NULL AUTO_INCREMENT,"
        . "username varchar(30) NOT NULL,"
        . "email varchar(50) NOT NULL,"
        . "password char(128) NOT NULL,"
        . "salt char(128) NOT NULL,"
        . "PRIMARY KEY (id))");
    
    if ($query) {
    echo "<p>Succesfully created table: users</p>";
} else {
    echo "<p>" . $_SESSION["connection"]->error . "</p>";
}