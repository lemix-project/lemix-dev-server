module.exports = {
    "GET": "SELECT ns_identifier,ns_name,ns_description FROM name_space",
    "POST": "INSERT INTO name_space (ns_identifier,ns_name,ns_description) VALUES ('#ns_identifier','#ns_name','#ns_description')",
    "PUT": "UPDATE name_space SET ns_name = '#ns_name',ns_description = '#ns_description' where ns_identifier = '#ns_identifier'",
    "DELETE": "DELETE FROM name_space where ns_identifier = '#ns_identifier'"
}