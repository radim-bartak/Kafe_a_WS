CREATE DATABASE kafe_ws;
USE kafe_ws;

CREATE TABLE coffee (
   id INT PRIMARY KEY AUTO_INCREMENT,
   name VARCHAR(20) NOT NULL
);

CREATE TABLE user (
   id INT PRIMARY KEY AUTO_INCREMENT,
   username VARCHAR(20) NOT NULL UNIQUE,
   password VARCHAR(20) NOT NULL
);

CREATE TABLE task (
   id INT PRIMARY KEY AUTO_INCREMENT,
   title VARCHAR(64) NOT NULL
);

CREATE TABLE coffee_log (
   id INT PRIMARY KEY AUTO_INCREMENT,
   user_id INT NOT NULL,
   coffee_id INT NOT NULL,
   count INT DEFAULT 1,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (user_id) REFERENCES user(id),
   FOREIGN KEY (coffee_id) REFERENCES coffee(id)
);

CREATE TABLE task_log (
   id INT PRIMARY KEY AUTO_INCREMENT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   created_by INT NOT NULL,
   assigned_to INT,
   task_id INT NOT NULL,
   is_completed BOOLEAN DEFAULT FALSE,
   FOREIGN KEY (created_by) REFERENCES user(id),
   FOREIGN KEY (assigned_to) REFERENCES user(id),
   FOREIGN KEY (task_id) REFERENCES task(id)
);
