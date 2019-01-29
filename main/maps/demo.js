module.exports = {
    "GET": "SELECT id,name,age FROM person WHERE id = #id",
    "POST": "INSERT INTO person (name,id,age) VALUES ('#name','#id',#age)",
    "PUT": "UPDATE person SET name = '#name',age = #age where id = '#id'",
    "DELETE": "DELETE FROM person where id = '#id'"
}