module.exports = {
    "GET_DETAIL":
        "SELECT P1.mm_identifier, P1.mmv_identifier, P1.description, P1.entrance, P1.package_time, P1.version_tag, P2.bundle_identifier, P2.mm_name, P1.author FROM mix_module_version P1 INNER JOIN mix_module P2 ON P1.mm_identifier = P2.mm_identifier WHERE P1.mmv_identifier = ?",
    "GET_LIST":
        "SELECT P1.mm_identifier, P1.mmv_identifier, P1.description, P1.entrance, P1.package_time, P1.version_tag, P2.bundle_identifier, P2.mm_name, P1.author,count(P1.mmv_identifier) over () total FROM mix_module_version P1 INNER JOIN mix_module P2 ON P1.mm_identifier = P2.mm_identifier WHERE P2.mm_identifier = ? LIMIT ?,?",
    "POST":
        "INSERT INTO mix_module_version ( mm_identifier, mmv_identifier, description, entrance, package_time, version_tag, single_flag,author ) SELECT ? mm_identifier, ? mmv_identifier, ? description, ? entrance, ? package_time, ? version_tag, concat(bundle_identifier ,?) single_flag,? author FROM mix_module WHERE mm_identifier = ?",
    "PUT":
        "UPDATE mix_module_version SET description = ?,entrance = ?,version_tag = ? where mmv_identifier = ?",
    "DELETE":
        "DELETE FROM mix_module_version where mmv_identifier in (?)",
    "UPLOAD":
        `INSERT INTO mix_module_version (
            mm_identifier,
            mmv_identifier,
            description,
            entrance,
            package_time,
            version_tag,
            single_flag,
            author
        ) SELECT
            mm_identifier,
            ? mmv_identifier,
            ? description,
            ? entrance,
            ? package_time,
            ? version_tag,
            ? single_flag,
            ? author
        FROM
            mix_module
        WHERE
            bundle_identifier = ?
            ON DUPLICATE KEY UPDATE description = ?,entrance=?,package_time=?,author=?`,
    "GET_ID": "select mm_identifier,mmv_identifier from mix_module_version where single_flag=?"
}