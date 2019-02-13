module.exports = {
    "GET_LIST":
        "SELECT ns_identifier,ns_name,ns_description,count(ns_identifier) over () total FROM name_space limit ?,?",
    "GET_DETAIL":
        "SELECT ns_identifier,ns_name,ns_description FROM name_space WHERE ns_identifier = ?",
    "POST":
        "INSERT INTO name_space (ns_identifier,ns_name,ns_description) VALUES (?,?,?)",
    "PUT":
        "UPDATE name_space SET ns_name = ?,ns_description = ? where ns_identifier = ?",
    "DELETE":
        "DELETE FROM name_space where ns_identifier in (?)"
}