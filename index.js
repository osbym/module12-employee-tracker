var express = require("express");
var exphbs = require("express-handlebars");
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "employee_trackerDB"
});

connection.connect(function(err) {
    if (err) {
      console.error("error connecting: " + err.stack);
      return;
    }
  
    console.log("connected as id " + connection.threadId);
    start();
  });

function start() {
    inquirer
      .prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update employee role",
          "Exit"
        ]
      })
    .then(function(answer) {
        if (answer.action === 'View all departments') {
            viewDepartments();
        } else if (answer.action === 'View all roles') {
            viewRoles();
        } else if (answer.action === 'View all employees') {
            viewEmployees();
        } else if (answer.action === 'Add a department') {
            addDepartment();
        } else if (answer.action === 'Add a role') {
            addRole();
        } else if (answer.action === 'Add an employee') {
            addEmployee();
        } else if (answer.action === 'Update employee role') {
            updateRole();
        }
        else if (answer.action === 'Exit') {
            connection.end();
        }
    });
}


function viewDepartments() {
    var query = "SELECT * FROM department";
      connection.query(query, function(err, res) {
          if(err) throw (err);
        res.forEach(department => {
            console.table(`ID: ${department.id} | Name: ${department.name}`)
        });
        connection.end();
    });
};

function viewRoles() {
    var query = "SELECT * FROM role";
        connection.query(query, function(err, res) {
            if(err) throw (err);
            // console.log(`ROLES:`)
        res.forEach(role => {
            console.table(`ID: ${role.id} | Title: ${role.title} | Salary: ${role.salary} | Department ID: ${role.department_id}`);
        });
        });
        connection.end();
    };

    function viewEmployees() {
        var query = "SELECT * FROM employee";
            connection.query(query, function(err, res) {
                if(err) throw (err);
                console.log(`EMPLOYEES:`)
            res.forEach(employee => {
                console.table(`ID: ${employee.id} | Name: ${employee.first_name} ${employee.last_name} | Role ID: ${employee.role_id} | Manager ID: ${employee.manager_id}`);
            })
            });
            connection.end();
        };
    
    function addDepartment() {
        inquirer
            .prompt({
                name: "department",
                type: "input",
                message: "What is the name of the new department?",
              })
            .then(function(answer) {
            var query = "INSERT INTO department (name) VALUES ( ? )";
            connection.query(query, answer.department, function(err, res) {
                console.log(`You have added this department: ${(answer.department).toUpperCase()}.`)
            })
            viewDepartments();
            })
            
    }
    
    
    function addRole() {
        connection.query('SELECT * FROM department', function(err, res) {
            if (err) throw (err);
            inquirer
                .prompt([{
                    name: "title",
                    type: "input",
                    message: "What is the title of the new role?",
                }, 
                {
                    name: "salary",
                    type: "input",
                    message: "What is the salary of the new role?",
                },
                {
                    name: "departmentName",
                    type: "list",
                    message: "Which department does this role fall under?",
                    choices: function() {
                        let choicesArray = [];
                        res.forEach(res => {
                            choicesArray.push(res.name);
                        })
                        return choicesArray;
                    }
                }
            ]) 
        
    // in order to get the id here, i need a way to grab it from the departments table 
            .then(function(answer) {
                const department = answer.departmentName;
                connection.query('SELECT * FROM department', function(err, res) {
                
                    if (err) throw (err);
                    let filteredDept = res.filter(function(res) {
                        return res.name == department;
                    })
    
                    let id = filteredDept[0].id;
                    let query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
                    let values = [answer.title, parseInt(answer.salary), id]
                    console.log(values);
                    
                    // viewRoles();
    
    
                connection.query(query, values, function(err, res) {
                    let rolesArr = [];
                    if (err) throw (err);
                    // res.forEach(role => {
                    //     rolesArr.push(role.values);
                    // })
                    console.log(`You have added this role: ${(values[0])}.`)
                })
                viewRoles();
                })
            })
        })
    };
    
    function addEmployee() {
        connection.query('SELECT * FROM role', function(err, result) {
            if (err) throw (err);
        inquirer
            .prompt([{
                name: "firstName",
                type: "input",
                message: "What is the employee's first name?",
              }, 
              {
                name: "lastName",
                type: "input",
                message: "What is the employee's last name?",
              },
              {
                name: "roleName",
                type: "list",
                message: "What role does the employee have?",
                choices: function() {
                 let rolesArray = [];
                    result.forEach(result => {
